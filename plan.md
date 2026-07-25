# plan.md v2 — 文章視覺風格系統重構（決策已定案、規格已驗證）

> **v2 說明**：v1 是調查後的提案，含 5 個開放問題。本版已納入使用者的決策，並把 v1 中
> **5 個經實測發現是錯的技術主張**修正掉（每項都標了 🔴 修正 並附驗證方式）。這份文件現在
> 是**可直接執行的規格**，不再是提案。
>
> 執行前狀態：`main` 分支，working tree 只有本檔與 `scripts/__refactor-guard*` 為未追蹤新增。

---

## 0. 已定案決策

| # | 議題 | 決策 |
|---|---|---|
| 1 | 風格命名 | **`editorial-card`**。front matter 寫 `style: editorial-card`；class 為 `.post-style-editorial-card`；檔案為 `assets/post-styles/editorial-card.css` |
| 2 | `food`/`spot`/`gallery`/`triage`/`emergency` 5 個未使用 DSL 家族 | **直接刪除**（含其孤兒 CSS，見 Phase 2） |
| 3 | `.style-b-post`／`.style-c-post` 死 CSS | **直接刪除** |
| 4 | 07-16 現有內容 | **這次一併遷移** |
| 5 | 多篇文章共用同一份風格 | **要支援**，且需把「共用的前提條件」寫進文件（見 §2.3） |
| 6 | `template_posts/` 受影響草稿 | **一併刪除**（4 個檔案，見 Phase 2） |

---

## 1. 設計原則（不變，v1 此節結論正確）

> **結構（DSL 輸出的 HTML／class）永遠只有一份 canonical 版本；風格差異全部收斂到 CSS。**

新增一篇風格不同的文章時：作者照 `doc/card_dsl.md` 既有語法寫 fence → front matter 加
`style: <名稱>` → 新增一份 scoped 在 `.post-style-<名稱>` 的 CSS → **完全不寫新 JS、不動
`markdown-cards.js`、不手寫 `<div>` 包版型**。

（v1 §2「不要換 Vue」的結論維持不變，理由見 git history 的 v1；此處不重複。）

---

## 2. 機制規格

### 2.1 Front matter `style` 欄位

`scripts/generate-posts-metadata.js` 的 front matter 解析是通用 key-value 迴圈，**不需改解析
邏輯**。只需在 `posts.push({...})` 物件裡、緊鄰 `background: metadata.background || '',`
那行之後新增：

```js
style: metadata.style || '',
```

### 2.2 `posts/detail.html` 掛 class

`posts/detail.html` 第 160–172 行附近，`marked.parse()` 寫入 `innerHTML` 之後（`contentContainer`
變數已存在），新增：

```js
if (post.style) {
  contentContainer.classList.add(`post-style-${post.style}`);
}
```

不會有 FOUC：class 與內容在同一個 tick 內套用。

### 2.3 CSS 檔案組織

新目錄 `assets/post-styles/`，每份檔案整組 scoped 在 `.post-style-<name>` 之下，由
`assets/tailwind.css` 用 `@import` 匯入，最終仍打包成**單一** CSS bundle。

🔴 **修正 1 — `@import` 必須放在 `assets/tailwind.css` 的「最末行」，不是 v1 說的第 119 行元件區。**

- 實測（`npx vite build` 後檢查 `dist/assets/*.css` 內的 byte offset）：
  - `@import` 放在第 119 行 → 風格規則落在 offset **42356**，排在 `.prose` 與多數元件 CSS **之前**。
  - `@import` 放在檔尾 → 落在 offset **101782**（全檔最末），排在 `.style-a-post`(82057) 之後。
- 風格檔的職責就是覆寫，來源順序必須最後。放第 119 行會產生「風格覆寫不到元件基礎樣式」的
  cascade bug，而且是靜默的、build 不會報錯。
- 兩種位置 Tailwind v4 都能編譯、`@apply` 都能解析（已實測），所以**沒有 build 錯誤可以提醒你放錯**。

**為何仍打包成單一 bundle、不做動態 `<link>`**（v1 此段推理正確，且我補到一個更硬的理由）：
- `vite.config.js` 的 `swPrecachePlugin` 用 `files.find(f => f.endsWith('.css'))` **只抓第一個
  CSS 檔**寫進 sw precache 清單。多 CSS 輸出會直接讓 PWA 預快取抓錯檔案。單一 bundle 不只是
  「比較簡單」，是現行 plugin 程式碼的硬性前提。
- 元件 CSS 刻意不放 `@layer`（`tailwind.css` 第 119 行註解），風格 CSS 同理必須留在未分層區域。
- 目前風格檔僅 76 行，體積無感。真的大到需要分離時再升級（YAGNI）。

### 2.4 跨文章共用風格的前提（決策 5）

`.post-style-<name>` scoping 天生支援多篇 front matter 填同一個值。但**有一個 v1 沒講的真實限制
必須寫進文件**：

`editorial-card.css` 的選擇器是 `.food-item` / `.spot-title` / `.food-list-title` /
`.sub-option-list` 等，**它與 `eat`／`stop`／`eatarea`／`quickjump` 這組 DSL 家族綁定**。
第二篇想套 `style: editorial-card` 的文章，必須使用同一組家族才會生效。

因此 `doc/card_dsl.md` 新增的規範需明確寫出：
1. 風格檔只能 scope 在 `.post-style-<name>` 下，**不得**出現文章專屬的 id 選擇器（現有 CSS
   已符合，實測無任何 `#` 選擇器）。
2. 風格檔必須註明「本風格依賴哪些 DSL 家族」。
3. 只能使用 `@theme` 既有 Token（見 `doc/style.md` A4），不得發明新色票。

---

## 3. 執行 Checklist

> **每個 Phase 結束都要跑**：`npm run build && node scripts/__refactor-guard.mjs`
>
> `scripts/__refactor-guard.mjs` 是本次任務專用的守護腳本（已寫好、基準已建立於
> `scripts/__refactor-guard-baseline.json`，記錄了目前 56 個元件 class）。它做三件事：
> ① 渲染 `src/posts/` 全部文章，比對元件 class 集合是否與重構前一致（唯一容許消失的是
> `style-a-post`）；② 檢查文章用到的每個 class 在 `dist` CSS 裡都還有規則（**抓誤刪**）；
> ③ 列出應刪而未刪的 class（第 3 項現在會列出 40 個，任務完成時應為空）。
> 腳本本身在 Phase 5 刪除。

### Phase 0：文件 debt

- [ ] `doc/project.md` 第 5 行、第 255 行：移除對已刪除的 `./markdown_decorations_design.md`
      的連結（該檔在 commit `480acf7` 被刪）。改指向 `doc/card_dsl.md`。
- [ ] 🔴 **修正 2 — v1 漏了一處**：`doc/doc_style.md` 第 6 行同樣連到這個死檔案，一併處理。
- [ ] `doc/project.md` 第 499 行也提到該檔，但那是**更新歷史記載**，屬於史實，**不要動**。

### Phase 1：機制骨架（不改變任何現有渲染結果）

- [ ] `scripts/generate-posts-metadata.js`：加 `style: metadata.style || '',`（見 §2.1）。
- [ ] `posts/detail.html`：加掛 class 邏輯（見 §2.2）。
- [ ] 建立 `assets/post-styles/` 目錄（目前已存在但為空）。
- [ ] `npm run build:metadata` 確認 `public/data/posts.json` 每篇多出 `style` 欄位且無報錯。

### Phase 2：刪除死代碼

**2a — DSL renderer**
- [ ] `assets/markdown-cards.js`：刪除 `renderFood`、`renderSpot`、`renderGallery`、
      `renderTriage`、`renderEmergency` 五個函式，以及 `CARD_LANGS` 字串與 `RENDERERS`
      物件裡對應的項目。
- [ ] 同檔第 1–4 行的檔頭 JSDoc 列舉了 `food`/`spot`/`gallery`/`triage`/`emergency`，一併更新。

**2b — 孤兒 CSS（`assets/tailwind.css`）**

⚠️ 🔴 **修正 3 — v1 大幅低估了範圍，且漏講最危險的部分。** v1 只說要刪 style-b/c 那 137 行。
實際上刪掉 5 個 renderer 會孤兒化 **~65 處選擇器**。而且**有 5 個 class 是共用的，刪了會炸掉
線上文章**。

**必須刪除**（皆已實測確認：渲染三篇線上文章後完全不出現）：

| 區塊 | 大約行號 | class |
|---|---|---|
| gallery | 739–787 | `.gallery-timeline` / `-day-group` / `-day-header` / `-day-label` / `-day-date` / `-day-items` / `-timeline-item` / `-timeline-node` / `-timeline-content` / `-spot-header` / `-spot-num` / `-spot-name` / `-spot-desc` |
| spot | 800–822 | `.spot-card` `.day-label` `.friendly-badge`(+`.flat`/`.slope`/`.steps`) `.area-desc` `.info-subcard` `.info-subcard-title` `.spot-walk-link` |
| food | 833–861 | `.food-item-meta-row` `.food-diet-row` `.food-item-title-row` `.food-item-name` `.food-chip` `.food-item-body` `.food-item-row`(含 `:nth-of-type` 1/2/3) `.action-btn` `.btn-naver` `.btn-kakao` `.btn-ref` |
| triage | 903–913 | `.triage-list` `.triage-item` `.triage-num` `.triage-body` |
| emergency | 916–922 | `.emergency-card`（含 `h3`/`p`/`p:last-child`） |
| 另一組 food-diet | 960–964 | `.food-diet-row` `.diet-chip`(+`.is-warn`) |

**絕對不可刪除**（`eat`/`stop`/`accordion` 等保留家族仍在用，已實測確認出現在渲染結果中）：

- `.food-item`（第 829 行，`eat` 家族也輸出）
- `.food-actions`（第 854 行，`eat` 家族也輸出）
- `.spot-title`（第 806 行基礎規則，`stop` 家族也輸出）
- `.em-tag`、`.stars`
- `.emergency-cta`(794)、`.emergency-group`(935)、第 926 行起的分類色條 — **先確認**是否仍被
  保留家族使用再決定；守護腳本的檢查 ② 會抓到誤刪。

- [ ] 刪除 `.style-b-post` 整段（第 1072 行 `/* --- Option B ... */` 註解起 至 1135 行）。
- [ ] 刪除 `.style-c-post` 整段（第 1137 行註解起 至檔案結尾 1210 行）。
- [ ] 第 982–984 行的 `NEW STYLES FOR SEPARATE LAYOUT EXPERIMENTS (A, B, C)` banner 註解已
      不合時宜（B/C 沒了、A 要搬走），一併移除。

> 🔴 **修正 4 — v1 行號小偏差**：`.style-a-post` 區塊含註解實際從 **982**（banner）／**986**
> （Option A 註解）開始，不是 v1 寫的 994。另外 `.style-a-post h3` 這條規則**已經不存在**了
> （2026-07-21 被刪，見 `project.md` 第一部分第 20 點），要搬的是 996–1071 共 76 行純元件覆寫。

**2c — card_dsl.md**
- [ ] 移除總表第 33–37 行那 5 列。
- [ ] 第 12、17–20 行「`food`/`spot` 與 `eat`/`stop` 是兩組不同家族、不可互換」的警語：對照
      對象已不存在，改寫或刪除。
- [ ] 第 137 行「`food` 三列順序依賴 `.food-item-row:nth-of-type`」的既有限制段落一併刪除。
- [ ] 第 40–41 行 `eat`/`eatarea` 的說明裡寫著「07-16 style-a-post」，改成 `editorial-card`。

**2d — template_posts（🔴 修正 5 — v1 完全沒提到這批檔案）**

v1 稱這 5 個家族「從頭到尾沒被任何文章用過」——這只對 `src/posts/` 成立。`template_posts/`
裡實際用了 **60 次 `food`、14 次 `spot`、2 次 `gallery`**，且 `_style_b.md`/`_style_c.md` 正是
`.style-b-post`/`.style-c-post` 的唯一引用者。這批檔案 git 有追蹤，但**不在建置流程內**
（`POSTS_DIR` 只讀 `src/posts`，全 repo 無任何程式碼 reference `template_posts`）。

依決策 6，刪除以下 4 個（已逐檔稽核確認就是這 4 個，其餘 10 個 template 不受影響）：
- [ ] `template_posts/2026-07-13-韓國首爾旅行.md`（food/spot/gallery）
- [ ] `template_posts/2026-07-16-韓國首爾旅行.md`（food/spot/gallery）
- [ ] `template_posts/2026-07-16-韓國首爾旅行_style_b.md`（style-b-post）
- [ ] `template_posts/2026-07-16-韓國首爾旅行_style_c.md`（style-c-post）

### Phase 3：遷移 07-16

- [ ] 備份原檔到 scratchpad（給下面的渲染 diff 用）。
- [ ] 把 `assets/tailwind.css` 第 996–1071 行的 `.style-a-post` 區塊（連同第 986–995 行的
      Option A 說明註解，改寫成 editorial-card 的說明）搬到
      **`assets/post-styles/editorial-card.css`**，選擇器全部改名
      `.style-a-post` → `.post-style-editorial-card`。
- [ ] 在 `assets/tailwind.css` **最末行**加上（見 §2.3 修正 1）：
      ```css
      /* 文章專屬視覺風格：必須置於檔案最末，確保來源順序最後、能覆寫上方元件樣式。 */
      @import "./post-styles/editorial-card.css";
      ```
- [ ] `src/posts/2026-07-16-首爾秋日漫遊手帳.md`：
      - 刪除第 11 行 `<div class="style-a-post">`（連同其後的空行）與第 532 行結尾的 `</div>`。
      - front matter 新增 `style: editorial-card`。

**驗證方式** 🔴 **修正 6 — 不要用 `verify-card-dsl.mjs`，它驗不了這次改動。**

v1 checklist 叫人跑 `node scripts/verify-card-dsl.mjs <備份> <新檔>`。該腳本第 62 行是
`plainMarked.parse(origContent)`——「改寫前」刻意**不掛卡片擴充**，因為它是為「手寫 HTML →
DSL fence」那次遷移設計的。這次備份檔本身已是 DSL 版，用 plainMarked 渲染會把 ` ```eat `
變成 `<pre><code>`，**保證 diff、必定紅字**。

改用直接對照渲染輸出。預期結果（我已實測）：**唯一差異就是那層 wrapper，共 34 個字元**：
```
1,2d0
< <div class="style-a-post">
628c626
< </div></div>   →   > </div>
```
- [ ] 用備份檔與新檔各自以 `registerCardExtensions` 渲染後 diff，確認差異僅止於上述 wrapper。
- [ ] `node scripts/__refactor-guard.mjs` 通過。

🔴 **修正 7 — v1 的驗收標準「逐像素一致」是錯的，有一個預期內的視覺變化。**

`dist` CSS 內有 `.prose :where(.prose>:first-child){margin-top:0}`。目前 `:first-child` 是
wrapper div（本身無 margin，所以裡面的 `<h2>總覽</h2>` 保有正常上緣間距）；拿掉 wrapper 後
`:first-child` 變成該 `<h2>`，**首個標題的 margin-top 會被歸零**。

- 僅桌機可見（手機版 `initTOC` 會在 `#post-content` 最前面 prepend 大綱框，`:first-child`
  本來就不是 h2）。
- 這讓 07-16 與 07-13／07-20 的開頭間距**一致**，屬於改善而非退步 — 但要知道它會變，別誤判成 bug。
- [ ] 瀏覽器實測：`npm run dev` 開 07-16，確認 `#post-content` 上有
      `post-style-editorial-card` class、卡片樣式正常、僅首標題上緣間距縮小。

- [ ] `public/sw.js`：`CACHE_NAME` `clean-blog-v54` → `clean-blog-v55`。

### Phase 4：註解與文件

🔴 **修正 8 — v1 漏掉這些寫死了舊架構前提的程式碼註解。**

- [ ] `assets/scripts.js` 第 463–465 行 `initTOC` 的註解寫著「style-a/b/c 等版型會把整篇內容
      包一層 `<div class="style-x-post">`，此時標題會是孫節點，因此也放行」。遷移後這個前提
      消失，必須改寫。
      **程式邏輯本身不用改** — 已實測：07-16 的 TOC 成員數不變（13 個標題，深度由 1 變 0，
      過濾條件 `parent === contentContainer || parent.parentElement === contentContainer`
      兩種深度都放行）。07-13 仍有 depth=1 的 `.alert-box-title` 需要這條放行規則，**不可
      把放行條件收緊**。
- [ ] `assets/markdown-cards.js` 第 498 行 `renderEatarea` 的 JSDoc 提到「07-16 style-a-post」，改名。
- [ ] `doc/card_dsl.md`：新增一節，寫明 `style` front matter 用法、`assets/post-styles/` 慣例、
      §2.4 的三條共用前提，以及「風格差異只寫 CSS，不要為了換皮再造一組 DSL 家族」這條守則。
- [ ] `doc/style.md` B 節：補上風格檔規格（scope、Token、@import 位置）。

### Phase 5：文件同步（CLAUDE.md 強制）

- [ ] `doc/project.md`「更新歷史」新增一筆帶日期（2026-07-25）的完整記錄；把現在排第二新的
      記錄壓縮成一行摘要。
- [ ] `doc/project.md` 第一部分：新增「文章視覺風格系統」設計決策點（比照現有第 9–24 點寫法），
      重點記下 §2.3 的 `@import` 位置陷阱與 §2.4 的共用前提。
- [ ] `doc/project.md` 第 405 行的待辦事項提到 style-a/b/c 版型，內容已過時，更新或移除。
      第 258/259/304/350/422/482 行提到 `.style-a-post` 者多為**更新歷史/史實記載**，保留不動。
- [ ] `README.md`：本次不涉及安裝/建置/部署步驟變化，預期不需改；確認後略過。
- [ ] 刪除 `scripts/__refactor-guard.mjs` 與 `scripts/__refactor-guard-baseline.json`。
- [ ] 刪除 `plan.md`（或依使用者指示保留）。

---

## 4. 已知陷阱

- **CSS cascade layers**：風格 CSS 位於未分層區域，若宣告了 `display`/`position`/`color` 這類
  Tailwind utility 也會設的屬性，會壓過 `xl:hidden` 之類 JS 加上的 responsive utility
  （`project.md` 第一部分第 21 點，`.toc-fab` 桌機外洩實例）。
- **`@import` 位置**：見 §2.3 修正 1。放錯位置 build 不會報錯，是靜默失敗。
- **`:last-of-type`/`:first-of-type` 對無 wrapper 的相鄰卡片失效**：`apps`/`eat` 這類直接輸出
  多個相鄰 `<div>` 的家族要用 `.foo + .foo`（`project.md` 第 9、24 點）。
- **PWA 快取**：忘記 bump `CACHE_NAME` 是本專案最常見疏漏（2026-07-22 曾為此出線上事故）。
- **`manifest.json`／`sw.js` 的空 front matter（`---\n---`）不可移除。**

---

## 5. 完成驗收

1. `npm run build` 通過。
2. `node scripts/__refactor-guard.mjs` 三項檢查全綠（第 ③ 項應從目前的 40 個降到 0 個）。
3. 07-16 渲染輸出與遷移前的 diff 僅有那 34 個字元的 wrapper。
4. 瀏覽器實測 07-16 視覺正常，`#post-content` 帶 `post-style-editorial-card`。
5. `src/posts/*.md` 裡不再有任何用於「整篇視覺換皮」的手寫 `<div class="...">` wrapper。
6. `grep -rn "style-[abc]-post\|renderFood\|renderSpot\|renderGallery\|renderTriage\|renderEmergency"`
   在 `assets/`、`src/`、`template_posts/`、`doc/`（史實記載除外）應無殘留。
