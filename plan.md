# plan.md — 卡片 DSL 欄位改用 Markdown 語法（消除內容裡的手寫 HTML）

> **上一階段**（文章視覺風格系統重構）已完成並 commit，成果與遺留風險見 [`report.md`](report.md)。
> 這份是**下一階段**的規劃，處理 report.md 第三節指出的核心問題：
> 「風格」已經解耦了，但**內容本身仍混著原始 HTML**。

---

## 1. 問題

上一階段移除的是整篇的 `<div class="style-a-post">` 外殼。但 fence **內部欄位值**裡的 HTML
一個字都沒動：

| | 07-13 | 07-16 | 07-20 |
|---|---|---|---|
| `<a href …>` | 13 | 11 | 4 |
| `<strong>` | 18 | 3 | 0 |
| `<br>` | 5 | 2 | 0 |
| `<em>` | 0 | 2 | 0 |
| 手寫 `class="…"` | 10 | **11** | 0 |

最糟的是 **Tailwind utility class 直接寫進內容**：

```
sub: 方案 B（…） | …參考：<a href="https://bobbytravel.tw/blog/post/darakhyu"
     target="_blank" class="text-primary underline">Darakhyu 膠囊旅館住宿心得 ↗</a>。
```

作者只是想放一個連結，卻得知道 `text-primary underline` 這組 class。

### 根因

DSL 欄位值是**原樣字串拼進 HTML 樣板**，沒跑 markdown 解析。全檔只有兩處呼叫 marked：
`assets/markdown-cards.js:159`（`stepper`）與 `:200`（`accordion`）。其餘 8 個家族的欄位值
都是死字串，作者要粗體／斜體／連結只能自己寫 HTML。

### 另一個獨立的洞

`alert-box`（7 條 CSS）與 `fold`（7 條 CSS）**有樣式但完全沒有對應的 DSL 家族**，
07-13 只能整段手寫 `<div class="alert-box alert-warning">`。

---

## 2. 設計

### 2.1 核心作法

把各 renderer 的**內容型欄位**丟進 `marked.parseInline()`，讓作者能寫
`[文字](url)`、`**粗體**`、`*斜體*`。

`parseInline` 不會包 `<p>`，適合塞進 `<span>`／`<strong>`／`<h4>` 這類既有樣板位置。

### 2.2 為什麼可行（已實測，見 §4）

1. **既有內容幾乎零變動**：437 個欄位值中，只有 **1 筆**經 `parseInline` 後會改變，
   且改的是 `'` → `&#39;`（瀏覽器顯示完全相同）。
2. **原始 HTML 會原樣通過**：`parseInline` 放行 inline HTML，所以
   `<a href="…" class="…">`、`<br>`、`<em>` 全部照舊輸出 → **可以漸進遷移**，
   不必一次改完所有文章。
3. **連結樣式會自動接上**：`assets/tailwind.css:216` 設了
   `--tw-prose-links: var(--color-primary)`，而 `.prose a` 給
   `color: var(--tw-prose-links); text-decoration: underline`
   —— 與手寫的 `class="text-primary underline"` **產出完全相同的視覺**，
   而且改用 Markdown 後還會經過 `registerCardExtensions` 既有的自訂 `link` renderer，
   自動獲得 `target="_blank" rel="noopener noreferrer"`（現有手寫版**缺** `rel`，是個小安全缺陷）。

### 2.3 欄位白名單（關鍵設計，不可一概而論）

有三類欄位**絕對不能**解析：

| 類別 | 欄位 | 原因 |
|---|---|---|
| URL | `url` `naver` `kakao` `ref` `href` | GFM autolink 會把裸 URL 轉成 `<a>`，破壞樣板 |
| 控制值 | `id` `cat` `level` `sigsep` | 會被拿去組 class／id，不是給人看的 |
| 特殊語法 | `eat.diet` | **以字尾 `*` 當警示標記**（`markdown-cards.js:310`），與 Markdown 強調語法直接衝突 |

逐家族的處理方式：

| 家族 | 解析 | 保持原樣 |
|---|---|---|
| `compare` | `tagline`、`row` 的 label/value、`text` | `name`、`stars` |
| `info` | `tagline`、`row` 的 label/value、`text` | `name` |
| `prep` | lead、rest | — |
| `apps` | `name`、body | icon（emoji/HTML） |
| `quickjump` | `title`、label、desc | href（`#錨點`） |
| `stop` | `title`、`tag`、`desc`、`sub` 的 subtitle/body | `id`、`url`、`level` |
| `eat` | `name`、`meal`、`price`、`signature`、`why`、diet 各標籤（**去尾 `*` 之後**） | `url`、`naver`、`kakao`、`ref`、`sigsep` |
| `eatarea` | `name` | `url` |
| `stepper` | （body 已經在解析，只需補 `title`） | — |
| `accordion` | （body 已經在解析，只需補 `summary`、`tag`） | `id`、`cat` |

**已知限制需寫進文件**：`stop.title` / `eatarea.name` / `eat.name` 的解析結果會被包進
既有的 `<a>` 裡，作者**不可**在這些欄位再放 Markdown 連結（會產生巢狀 `<a>`）。

### 2.4 順帶可清掉的冗餘

`renderStop:274` 與 `renderEatarea:290` 輸出的 `class="no-underline text-inherit"`
其實是多餘的——全站已有 `.prose h1 a, .prose h2 a, .prose h3 a, .prose h4 a
{ color:inherit; text-decoration:none }`，而這兩處的 `<a>` 正好都在 `h4`／`h3` 內。
（`renderEat:321` 的 `<a>` 在 `<span>` 內，**不在**該規則涵蓋範圍，那個 class 必須保留。）

---

## 3. 執行 Checklist

> 每個 Phase 結束跑：`npm run build && node scripts/verify-post-render.mjs`

### Phase 0 — 建立工具 ✅ 已完成

- [x] 新增 `scripts/audit-card-fields.mjs`：抽出所有 fence 欄位值，逐一過
      `parseInline()`，回報會變動的欄位並分類統計
- [x] 新增 `scripts/verify-post-render.mjs`：**取代已失效的 `verify-card-dsl.mjs`**
      （後者「改寫前」用無擴充 marked 渲染，是一次性工具，全文卡片化後驗任何改動都必然紅字）。
      新工具兩邊都用當前渲染器，比對 git ref 與工作目錄的渲染輸出
- [x] 雙向自我測試通過：`HEAD` vs 工作目錄 → 3 篇全 0 diff；
      `HEAD~1` vs 工作目錄 → 正確抓到上一個 commit 移除 wrapper 的 34 字元差異

### Phase 1 — 欄位風險稽核 ✅ 已完成

- [x] 全量掃描 437 個欄位值（已排除 `stepper`/`accordion` 的 body——它們本來就會遞迴解析，
      初版稽核誤把那 40 行當成欄位值，是誤報）
- [x] 結果：**僅 1 筆**會因 `parseInline` 改變 → `eat.why` 裡的 `O'sulloc`，
      `'` 被 escape 成 `&#39;`，渲染顯示完全相同
- [x] 確認 128 筆 URL 欄位會被 GFM autolink 影響 → 已全數列入「不解析」白名單
- [x] 確認 `eat.diet` 的字尾 `*` 標記與 Markdown 語法衝突 → 列入白名單，需特殊處理
- [x] 確認 `.prose a` 的顏色／底線與手寫 `class="text-primary underline"` 等價

### Phase 2 — 實作 inline 解析 ⬜ 未開始

- [ ] `registerCardExtensions` 的 `renderer(token)` 改為把 `marked` 實例傳給**所有** renderer
      （目前只有 `stepper`/`accordion` 拿得到，見 `markdown-cards.js:390-393`）
- [ ] 新增小工具 `inline(marked, str)`，並依 §2.3 白名單逐家族套用
- [ ] `eat.diet` 特殊處理：先以 `,` 切分、再判斷／剝除字尾 `*`、**最後**才對各標籤文字
      做 inline 解析
- [ ] 移除 §2.4 指出的兩處冗餘 class（`renderStop` / `renderEatarea`）
- [ ] `node scripts/verify-post-render.mjs` 必須是 0 diff
      —— **唯一容許的差異是 `O'sulloc` 那個 `&#39;`**。出現其他差異就是白名單漏了欄位

### Phase 3 — 遷移文章內容 ⬜ 未開始

逐篇把 HTML 改寫成 Markdown。因為原始 HTML 仍會原樣通過，可以一篇一篇來、隨時停手。

- [ ] 07-16：11 個 `<a>` → `[文字](url)`；2 個 `<em>` → `*文字*`；
      3 個 `<strong>` → `**文字**`；第 14 行 `<blockquote>` → `> `
- [ ] 07-13：13 個 `<a>`、18 個 `<strong>`、5 個 `<br>`
- [ ] 07-20：4 個 `<a>`
- [ ] `<br>` 沒有 Markdown 等價寫法（行尾雙空格在 fence 欄位裡不可靠）——
      **先評估**是改成兩個 `sub:`／兩段，還是保留 `<br>`。不要為了消滅 `<br>` 而讓語意變差
- [ ] 每篇改完立刻跑 `verify-post-render.mjs`，逐篇確認只有預期內差異

### Phase 4 — 補 `alert` 與 `fold` 家族 ⬜ 未開始

- [ ] `markdown-cards.js` 新增 `alert` renderer（對應 `.alert-box` / `.alert-note` /
      `.alert-warning` / `.alert-box-title`）
- [ ] 評估 `fold`：`accordion` 已輸出 `<details class="fold">`，先確認 07-13 那 2 個手寫
      `<div class="fold">` 是不是同一件事——**若是，直接改用 `accordion`，不要新增家族**
- [ ] 07-13 的 4 個手寫 `<div class="alert-box …">` 改用新 fence
- [ ] 注意 `.prose h3.alert-box-title` 這條 2-class 選擇器（`project.md` 第一部分第 19 點記載，
      是為了贏過 `.prose h3` 才特意加的），改動標題結構時不要打破它

### Phase 5 — 文件同步（CLAUDE.md 強制） ⬜ 未開始

- [ ] `doc/card_dsl.md`：改寫語法說明，示範 Markdown 寫法；明確標示哪些欄位**不**解析
      （§2.3 表格）與巢狀連結的限制（§2.3 末）
- [ ] `doc/project.md`：更新歷史新增一筆；第二新壓成一行；功能→程式碼速查表更新
- [ ] `doc/project.md`：把 `verify-card-dsl.mjs` 的說明改成 `verify-post-render.mjs`
- [ ] 刪除已失效的 `scripts/verify-card-dsl.mjs`
- [ ] 決定 `scripts/audit-card-fields.mjs` 去留（一次性稽核工具，建議 Phase 3 結束後刪）
- [ ] `public/sw.js` bump `CACHE_NAME`（v55 → v56）

---

## 4. 已執行部分的實測數據

```
$ node scripts/audit-card-fields.mjs --verbose
掃描 437 個欄位值，其中 129 個經 parseInline 後會改變

=== 依變動原因分類 ===
  Markdown 連結 ([]())       128 筆（其中 128 筆在「不解析」白名單內，無風險）
  其他                         1 筆

=== 真正需要處理的（不在白名單內）：1 筆 ===
[eat.why] 2026-07-16-首爾秋日漫遊手帳.md
  原始: …可改至斜對面的 O'sulloc 綠茶專專賣店…
  解析: …可改至斜對面的 O&#39;sulloc 綠茶專專賣店…
```

```
$ node scripts/verify-post-render.mjs
  ✅ 2026-07-13-…md —— 0 diff（21049 字元）
  ✅ 2026-07-16-…md —— 0 diff（43812 字元）
  ✅ 2026-07-20-…md —— 0 diff（10287 字元）
```

---

## 5. 風險

1. **白名單漏欄位 = 靜默破版**。漏掉某個 URL 欄位，GFM autolink 會把它變成 `<a>` 塞進
   `href="…"` 屬性裡，產出壞掉的 HTML。`verify-post-render.mjs` 的 0-diff 檢查是主要防線。
2. **`eat.diet` 的處理順序**若寫反（先解析再剝 `*`），30 筆美食卡的警示標籤會全部失效，
   而且不會報錯。
3. **Phase 3 是人工改寫，最容易出錯**。務必逐篇驗證，不要三篇一起改完才跑。
4. **`<br>` 沒有乾淨的 Markdown 對應**。不要為了「消滅所有 HTML」這個潔癖硬改，
   保留 `<br>` 是可接受的結果。
5. 本階段**不觸碰** report.md 第三節列出的其他遺留問題（class 命名帶內容語意、
   `style:` 打錯字無警告、`initTOC` 深度啟發式、`template_posts/` 孤兒目錄、
   `CACHE_NAME` 手動 bump）——那些是各自獨立的題目。
