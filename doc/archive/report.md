# report.md — 文章視覺風格系統重構 完成報告（2026-07-25）

> ⛔ **凍結紀錄**：本檔為 2026-07-25 重構的歷史決策紀錄，已定案且不再更新。
> 現況一律以 [`doc/project.md`](doc/project.md) 為準；本檔只作為決策理由的引註來源。

> **一句話**：把「文章專屬視覺」從「要另造一整組 DSL renderer ＋ 在 Markdown 手寫 `<div>` 包版型」
> 改成「front matter 填一行 `style:` ＋ 寫一份 CSS」，並清掉這個舊做法留下的全部死代碼。
>
> 規格見 [`plan.md`](plan.md)（v2，決策已定案、技術主張均經實測）。

---

## 一、完成事項 Checklist

### Phase 0 — 文件 debt

- [x] `doc/project.md` 第 5 行、第 255 行：移除指向已刪除檔案 `markdown_decorations_design.md`
      的死連結，改指 `doc/card_dsl.md`
- [x] `doc/doc_style.md` 第 6 行：同一個死連結（原規劃 v1 漏掉的一處）
- [x] `doc/project.md` 更新歷史裡提及該檔的記載屬史實，**刻意保留未動**

### Phase 1 — 新機制骨架

- [x] `scripts/generate-posts-metadata.js`：`posts.push()` 加入 `style: metadata.style || ''`
      （front matter 解析是通用 key-value 迴圈，解析邏輯不需改）
- [x] `posts/detail.html:174-178`：`marked.parse()` 後，若 `post.style` 有值則
      `contentContainer.classList.add(\`post-style-${post.style}\`)`
- [x] 新增目錄 `assets/post-styles/`
- [x] `public/data/posts.json` 三篇文章都正確帶出 `style` 欄位（07-16 為 `editorial-card`，另兩篇為空字串）

### Phase 2 — 刪除死代碼

- [x] `assets/markdown-cards.js`：刪除 `renderFood`／`renderSpot`／`renderGallery`／
      `renderTriage`／`renderEmergency` 五個 renderer，以及 `CARD_LANGS` 與 `RENDERERS` 的對應註冊
      → DSL 家族由 **15 個減為 10 個**（`compare`/`prep`/`apps`/`info`/`stepper`/`accordion`/
      `quickjump`/`stop`/`eat`/`eatarea`）
- [x] `assets/tailwind.css`：刪除上述家族孤兒化的 **~65 處選擇器**
      （`.gallery-*` 13 組、`.spot-card`/`.day-label`/`.friendly-badge`/`.info-subcard`/
      `.spot-walk-link`/`.area-desc`、`.food-item-row`/`.food-chip`/`.food-item-name` 等 food 專屬、
      `.action-btn`/`.btn-naver`/`.btn-kakao`/`.btn-ref`、`.triage-*`、`.emergency-card`、
      `.diet-chip`、`.emergency-cta`、`.emergency-group`）
- [x] **共用 class 完整保留**（`eat`/`stop`/`accordion` 仍在用）：`.food-item`、`.food-actions`、
      `.spot-title`、`.em-tag`、`.stars`、`.badge-*`、`.cat-*`
- [x] `assets/tailwind.css`：刪除 `.style-b-post`（時間軸風格）與 `.style-c-post`（暖紙票券風格）
      兩組死 CSS，以及 `NEW STYLES FOR SEPARATE LAYOUT EXPERIMENTS (A, B, C)` 區塊註解
- [x] `doc/card_dsl.md`：總表移除 5 列、移除「`food`/`spot` 與 `eat`/`stop` 不可互換」的警語
      （對照對象已不存在）、移除 `.food-item-row:nth-of-type` 的既有限制段落
- [x] 刪除 `template_posts/` 下 4 個已無法渲染的草稿（`2026-07-13-韓國首爾旅行.md`、
      `2026-07-16-韓國首爾旅行.md`、`_style_b.md`、`_style_c.md`）——它們是 `food`/`spot`/
      `gallery` 與 `.style-b/c-post` 的唯一引用者，不在建置流程內

### Phase 3 — 07-16 遷移為 `editorial-card`

- [x] `.style-a-post` 76 行元件覆寫搬到 **`assets/post-styles/editorial-card.css`**（101 行），
      選擇器全數改名 `.style-a-post` → `.post-style-editorial-card`
- [x] `assets/tailwind.css` **最末行**（第 838 行／共 839 行）加入
      `@import "./post-styles/editorial-card.css";`
- [x] `src/posts/2026-07-16-首爾秋日漫遊手帳.md`：刪除第 11 行的
      `<div class="style-a-post">` 與檔尾 `</div>`；front matter 新增 `style: editorial-card`
- [x] `public/sw.js`：`CACHE_NAME` `clean-blog-v54` → `clean-blog-v55`

### Phase 4 — 註解與使用指南

- [x] `assets/scripts.js` `initTOC()` 註解改寫：原本寫死「style-a/b/c 版型會包一層 wrapper，
      標題是孫節點」，改為說明放行孫節點是 **07-13 `.alert-box-title` 所必需**，並註記不可收緊
      （**過濾邏輯本身一字未動**）
- [x] `assets/markdown-cards.js`：檔頭 JSDoc 與各 renderer 註解中提及已刪家族／`style-a-post`
      之處全部更新
- [x] `doc/card_dsl.md` 新增〈文章視覺風格系統〉一節（`style` front matter 用法、
      `assets/post-styles/` 慣例、跨文章共用的三條前提）
- [x] `doc/style.md` 新增 B8〈文章專屬視覺風格〉規格章節

### Phase 5 — 文件同步（CLAUDE.md 強制）

- [x] `doc/project.md` 更新歷史新增 2026-07-25 完整記錄；前一筆壓縮為一行摘要
- [x] `doc/project.md` 第一部分新增第 25 點「文章視覺風格系統」設計決策
- [x] `doc/project.md` 功能→程式碼速查表、目錄結構樹一併更新
- [x] `doc/project.md` 待辦事項第 10 條中過時的 style-a/b/c 表述更新為 `editorial-card`
- [x] `README.md` 確認不涉及安裝／建置／部署變動，無需修改
- [x] 移除任務專用的守護腳本 `scripts/__refactor-guard.mjs` 與其基準檔

---

## 二、驗證結果

| 驗證項 | 方法 | 結果 |
|---|---|---|
| 建置 | `npm run build` | ✅ 通過，無錯誤 |
| 渲染零回歸 | 渲染全部 3 篇線上文章，逐一比對 55 個元件 class 在 dist CSS 是否都還有規則 | ✅ 全數命中，無誤刪 |
| 07-16 內容零變動 | 對 `git HEAD` 版本做渲染輸出 diff | ✅ **差異恰為 34 字元，就是那層 wrapper `<div>`** |
| `@import` 位置 | 檢查 `tailwind.css` 行號 + dist CSS byte offset | ✅ 第 838/839 行；`editorial-card` 落在 offset 65592，排在 `.spot-title`(57384)、`.food-item`(57827) 之後 |
| 死 class 清除 | grep dist CSS | ✅ 12 個抽樣 class 全數消失 |
| TOC 邏輯未動 | `git diff assets/scripts.js` | ✅ 差異全為註解行 |

**附帶收益**：CSS bundle **105.42 kB → 75.23 kB（-28.6%）**，JS **28.47 kB → 24.29 kB（-14.7%）**。
程式碼淨減 **-3082 / +216 行**。

### ⚠️ 唯一待人工目視確認的項目

移除 wrapper 後，`.prose > :first-child { margin-top: 0 }` 的作用對象從那層 `<div>` 變成第一個
`<h2>總覽</h2>`，**首個標題的上緣間距會變窄**。僅桌機可見（手機版 `initTOC` 會在最前面
prepend 大綱框）。效果是讓 07-16 開頭與 07-13／07-20 對齊，屬預期內的改善，**不是 bug**。

若目視後覺得太緊，修法是在 `assets/post-styles/editorial-card.css` 補一條
`.post-style-editorial-card > h2:first-child { margin-top: ...; }`。

---

## 三、未來還會遇到的問題

### A. 這次刻意沒解決的（分層問題，不是 bug）

1. **風格檔仍與 DSL 家族綁定**
   `editorial-card.css` 的選擇器是 `.food-item` / `.spot-title` / `.food-list-title`，
   它依賴 `eat`／`stop`／`eatarea`／`quickjump` 這組家族。第二篇想套 `style: editorial-card`
   的文章**必須用同一組家族**才會生效。
   → 本次分離的是「風格」，**不是「內容語意」**。若新文章的內容結構與既有家族欄位不符
   （例如 `stop` 的 `level` 只有 4 種地形徽章、`eat` 只有餐別/口味/招牌菜），仍須擴充
   `markdown-cards.js`。這是不同層次的擴充點，不要混為一談。

2. **class 名稱本身帶內容語意**
   `.food-item`、`.spot-title` 這種命名讓風格檔必須知道「這篇在講美食/景點」。若未來想做到
   真正的皮膚/結構解耦，需要再抽一層語意中性的 class（如 `.card` / `.card-title` /
   `.card-meta`），讓風格檔只認結構角色。**現在還不值得做**（只有 1 個風格、3 篇文章），
   但這是下一次「第 3、第 4 個風格出現時」會撞到的天花板。

### B. 新機制自帶的陷阱（未來加第二個風格時務必注意）

3. **`@import` 位置錯了不會報錯**
   放在 `tailwind.css` 中段仍能編譯、`@apply` 仍能解析，但規則會落在 `.prose` 與元件 CSS
   **之前**，覆寫全部失效——**靜默失敗，build 全綠**。新增風格檔時，`@import` 一律追加在
   檔案最末（本次已在該處留了註解警告）。

4. **`style` 欄位打錯字無任何警告**
   front matter 寫成 `style: editorail-card` 會掛上 `.post-style-editorail-card`，
   沒有對應 CSS、沒有 console 警告、build 照樣通過，只會「樣式莫名沒生效」。
   → 值得在 `scripts/generate-posts-metadata.js` 加一道檢查：`style` 有值時，確認
   `assets/post-styles/<值>.css` 存在，否則 build 時印警告。**建議下次順手補上。**

5. **多風格檔並存時的來源順序**
   目前各風格 scope 互不重疊，`@import` 順序無所謂。但若未來走「共用 base + 變體覆寫」的
   設計（例如 `editorial-base.css` + `editorial-dark.css`），順序就會變成關鍵。

6. **單一 CSS bundle 是硬性前提，不只是偏好**
   `vite.config.js` 的 `swPrecachePlugin` 用 `files.find(f => f.endsWith('.css'))`
   **只抓第一個 CSS 檔**寫進 PWA precache 清單。將來若因風格檔變大而想拆成多個 CSS 產物
   （動態 `<link>`），必須連同改寫這個 plugin、處理 FOUC 與 Vite 多 entry——一整包工作，
   不是加個 `@import` 就好。

### C. 既有的脆弱點（本次沒動，但仍在）

7. **`initTOC()` 的深度啟發式是隱性契約**
   過濾條件放行「孫節點」標題，是為了 07-13 的 `<div class="alert-box"><h3 class="alert-box-title">`。
   代價是：**任何卡片家族若在頂層 card `<div>` 內直接放 h2/h3，就會被誤收進 TOC**。
   目前安全（`stop`/`quickjump` 只吐 h4，`eatarea` 的 h3 是裸標籤），但這件事沒有任何測試保護，
   新增家族時必須人工留意。

8. **`scripts/verify-card-dsl.mjs` 已幾乎失效**
   它的設計前提是「改寫前 = 手寫 HTML，用無擴充的 marked 渲染」。這個前提在全部文章卡片化後
   已不復存在——本次遷移就無法用它驗證（會必然紅字）。
   → 建議改寫成通用的「同一份渲染器，比對改動前後輸出」工具，或直接刪除以免誤導。

9. **`template_posts/` 剩下 10 個檔案仍是無主孤兒**
   不在 `POSTS_DIR`、不在 vite input、全 repo 無任何程式碼 reference。留著不會壞，
   但每次做全域 grep／重構都要多花心力判斷「這算不算使用中」——本次就差點誤判。
   → 建議擇日決定：整個目錄刪除，或改名為 `archive/` 並在 README 註明用途。

10. **PWA `CACHE_NAME` 仍靠人工 bump**
    這是本專案歷史上最常見的疏漏（2026-07-22 曾因此出線上事故）。
    → 可考慮在 `swPrecachePlugin` 裡改成用建置產物的 hash 自動生成 cache 名稱，
    從此不必記得手動加一。

11. **`doc/project.md` 已逼近 570 行**
    更新歷史持續累積。目前靠「保留最新兩筆全文、其餘壓成一行」的規則控制，但第一部分的
    設計決策已累積到第 25 點。未來可能需要把「設計決策」獨立成一份檔案。

### D. 尚未驗證的

12. **本次改動只做到 Node 層級的渲染 diff 與 dist CSS 複驗，未在瀏覽器目視。**
    除了上述首標題間距外，建議一併確認 07-16 的卡片、TOC 抽屜、行動版版型都正常。
    （`doc/project.md` 待辦事項第 18 條記錄的 2026-07-21 三項 UI 調整也仍待目視，可一次看完。）
