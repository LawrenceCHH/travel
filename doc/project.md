<!-- 啟動專案看結果  npm run build && npm run preview -->

# 專案快照 (Vite + Tailwind CSS v4 純前端架構)

此專案已於 2026-07-11 從 Jekyll 遷移至基於 **Vite** 與 **Tailwind CSS v4** 的純前端 MPA（多頁面應用）靜態架構。所有頁面的共用 Layout 載入、文章目錄搜尋與篩選、以及 Markdown 文章解析渲染，皆直接於瀏覽器端完成，徹底擺脫了對 Ruby、Jekyll 與 Gem 的依賴。

本檔案分兩部分：**第一部分**是給 Agent／開發者的架構與參考資訊（技術棧、指令、目錄結構、功能對應程式碼、關鍵設計決策），**第二部分**是更新歷史與待辦事項。安裝/建置/部署指令另見 [`../README.md`](../README.md)；全站視覺與互動風格的系統化分析（抽象設計準則＋具體元件規格）見 [`./style.md`](./style.md)；卡片 DSL 語法參考（含 `style` front matter 用法）見 [`./card_dsl.md`](./card_dsl.md)；**只有在新增/編輯文章時**才需要參考的標題階層與 `---` 分隔線用法守則見 [`./doc_style.md`](./doc_style.md)；**新增「先寫架構、後填內容」類型的文章時**，先看 [`../doc_template/README.md`](../doc_template/README.md) 是否已有對應風格的模板可直接填空。

---

# 第一部分：架構與開發參考

## 技術棧

*   **建置工具**：Vite (v5)
*   **CSS 框架**：Tailwind CSS v4（CSS 優先配置，無 `tailwind.config.js`），使用 `@tailwindcss/vite` 插件打包，並以 `@plugin "@tailwindcss/typography"` 提供文章內文（`.prose`）排版
*   **Markdown 解析**：用戶端使用 `marked.js` CDN 解譯，後端 (Node) 建置時計算字數與閱讀時間
*   **PWA 支援**：`public/manifest.json` 與 `public/sw.js`，包含打包時自動更新雜湊資源快取的機制
*   **部署**：GitHub Actions → GitHub Pages (發布 `dist/` 目錄，監聽 `main` 分支)

## 如何在本地開發與建置

專案不再需要 Ruby 執行環境，僅需安裝 Node.js 即可。

> [!TIP]
> **開發者快速上手捷徑：**
> *   **首次複製專案**：執行 `npm install` 安裝套件。
> *   **日常寫文與預覽**：執行 `npm run dev` 啟動開發伺服器，直接在 `src/posts/` 底下寫文章，存檔後瀏覽器會自動同步。
> *   **打包正式版網頁**：執行 `npm run build` 即可。它會自動跑完文章索引重新生成，並在 `dist/` 資料夾輸出打包好的靜態網站成品。
> *   **測試 PWA 離線功能**：執行 `npm run preview` 可以預覽打包後的網站，並測試 Service Worker 快取。

### 1. 安裝依賴項目
```bash
npm install
```

### 2. 啟動本地開發伺服器
這會啟動 Vite 開發伺服器，並開啟熱重載（HMR）：
```bash
npm run dev
```
啟動後可使用瀏覽器訪問預設的 `http://localhost:5173/travel/`（由於設定了 `base: '/travel/'`，請務必加上 `/travel/` 子路徑）。

### 3. 生成文章元資料 (Metadata)
當您新增、修改或刪除文章時，需要重新生成文章索引檔：
```bash
npm run build:metadata
```
這會執行 `scripts/generate-posts-metadata.js` 腳本，直接解析 `src/posts/` 裡的 Front Matter 並計算閱讀時間，產生 `public/data/posts.json` 索引檔。
*(註：執行 `npm run build` 與 `npm run dev` 時會自動先執行此步驟。)*

### 4. 生產環境打包與預覽
```bash
npm run build
```
打包後的靜態檔案將會輸出至 **`dist/`** 目錄。打包完畢後可進行預覽（用以測試 PWA 與 Service Worker 快取）：
```bash
npm run preview
```

> [!NOTE]
> **樣式沒有獨立的 `build:css` 指令**：`assets/tailwind.css` 由 `@tailwindcss/vite` 外掛在
> `npm run dev`／`npm run build` 時即時編譯，沒有 `npm run build:css` 這個 script（`package.json`
> 僅有 `dev`/`build:metadata`/`build`/`preview`）。`assets/main.css` 是未被引用、已 gitignore
> 的舊檔案，不應編輯。驗證樣式變更請直接跑 `npm run build`。

### 5. 更新網站快取 (Service Worker & PWA)
當更新靜態資源、樣式、腳本或新增/編輯文章，欲強制訪客瀏覽器更新快取與畫面時：
1. **生成文章索引元資料檔**：若包含文章增刪改動，先執行 `npm run build:metadata` 產生最新的 `public/data/posts.json`（若直接跑 `npm run build` 會自動觸發）。
2. **建置正式資源與複製文章**：執行 `npm run build`。此步驟會自動執行 `build:metadata`、將文章原檔複製至 `dist/src/posts/`，並透過 `swPrecachePlugin` 將帶雜湊碼的最新 CSS/JS 與預快取清單寫入 `dist/sw.js`，同時依打包後的 CSS/JS 內容＋`public/img/` 全部圖片內容自動算出新的 `CACHE_NAME`（2026-07-26 起自動化，不再需要手動編輯 `public/sw.js` 遞增版本號，見第一部分「PWA 靜態資源預快取防刷」與更新歷史 S13）。
3. **客戶端除錯刷新**：開發或測試時，可開啟瀏覽器 DevTools (F12) → Application → Service Workers 勾選 *Update on reload* / 點擊 *Unregister*，或以 `Ctrl+F5` / `Cmd+Shift+R` 強制刷新。

## 如何新增與編輯內容

### 1. 新增部落格文章
> [!CAUTION]
> **請務必將原始文章存放在 `src/posts/` 而非 `dist/`！**
> `dist/` 資料夾是 Vite 打包產出的靜態成品區。每次執行 `npm run build` 時，Vite 預設會**徹底清空並刪除整個 `dist/` 資料夾**，再將 `src/posts/` 的內容重新複製過去。若誤將新文章建立在 `dist/` 或 `dist/src/posts/` 內，`npm run build` 時檔案將會被自動刪除！

1. 在 `src/posts/` 目錄中建立一個檔名格式為 `YYYY-MM-DD-slug.md` (或 `.html`) 的檔案。
2. 檔案最上方必須包含標準 Front Matter 區塊：
   ```yaml
   ---
   layout: post
   title: "文章標題"
   subtitle: "顯示於標題下方的一行副標題。"
   date: 2026-07-11 12:00:00 +0800
   background: '/img/posts/01.jpg'
   tags:
     - 標籤一
     - 標籤二
   ---
   ```
3. 正文內容置於結尾 `---` 下方，以 Markdown 或 HTML 撰寫。
4. **關鍵索引與快取更新步驟（若未執行新文章將不會顯示）**：
   - **開發模式**：若 `npm run dev` 運作中會自動監聽更新；否則請執行 `npm run build:metadata` 重新生成 `public/data/posts.json` 索引。
   - **生產環境與預覽**：新增文章後執行 `npm run build` 以同步更新 `dist/data/posts.json` 與 `dist/src/posts/` 文章資源即可；`data/posts.json` 走 Service Worker 的 network-first 策略（見 `public/sw.js` fetch handler），有網路時一律拿新資料，不需要再手動升級 `CACHE_NAME`（2026-07-26 起自動化，見第一部分「PWA 靜態資源預快取防刷」）。

### 2. 新增獨立頁面
如果要在網站中新增一個獨立的 HTML 頁面：
1. 在專案根目錄下建立 `my-page.html`。
2. 在 `vite.config.js` 的 `build.rollupOptions.input` 區塊中，將新頁面註冊為一個 Rollup 輸入點：
   ```javascript
   input: {
     main: resolve(__dirname, 'index.html'),
     // ...
     mypage: resolve(__dirname, 'my-page.html')
   }
   ```
3. 在 `my-page.html` 引入共用的樣式與腳本：
   ```html
   <link rel="stylesheet" href="/assets/tailwind.css">
   <script type="module" src="/assets/scripts.js"></script>
   ```
4. 若需要使用共用的導覽列與頁尾，在 HTML 檔案中加入預留的 placeholder 即可：
   ```html
   <div id="navbar-placeholder"></div>
   <!-- 您的頁面內容 -->
   <div id="footer-placeholder"></div>
   ```

### 3. 維護中文襯線字型（Noto Serif TC）subset

`--font-serif` 堆疊的中文襯線字型是自架的字集子集（見第一部分第 31 點），只涵蓋
2026-07-26 當下全站文章＋靜態頁標題實際用到的 469 個字，**不是**每次新增文章都要處理的
待辦——只有下面這個情境才需要重跑：

> 新增／編輯文章時，若標題（`h1`-`h3`）、`subtitle`、美食店名（`.food-item-name`／
> `.spot-title`）、引言（`blockquote`）等會落在 `font-serif` 情境的文字，用到現有字集
> **469 字以外**的中文字。

不處理也不會出錯——字集外的字會自動 fallback 到堆疊下一位（`Songti TC`/系統 serif），
只是該字暫時不是自架字型，跨裝置樣式可能不一致。若要讓新字也吃到自架字型，重跑流程：

1. 用 `assets/create-marked.js` 的 `createMarked()`（與 `scripts/verify-post-render.mjs`
   同一套渲染管線）把 `src/posts/` 全部文章渲染成 HTML，加上各篇 front matter 的
   `title`/`subtitle`，以及 `index.html`/`contact.html`/`404.html`/`posts/index.html`
   等靜態頁的 hero 標題，掃出所有 `font-serif` 標題情境（`h1`-`h3`、`h4.food-name`、
   `blockquote`、`.spot-title`、`.food-list-title`、`.alert-box-title`、
   `.fold > summary`）裡的文字，取聯集得到目前實際會用到的全部中文字＋標點。
2. 呼叫 `https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&text=<上一步的字集，需 URL-encode>`
   （帶現代瀏覽器 UA 才會拿到 woff2；400/700 兩個 `@font-face` 若指向同一個 `kit=` URL，
   代表是保留 `wght` 變化軸的可變字重字型，只需下載一份）。
3. 下載回傳的 woff2，覆蓋 `assets/fonts/noto-serif-tc-var.woff2`。
4. 用 Google 這次回傳的 `unicode-range` 覆蓋 `assets/tailwind.css` 裡**兩組**
   `@font-face`（`font-weight: 400` 與 `700`）的 `unicode-range` 值——`--font-serif`
   堆疊本身（`"Noto Serif TC"` 名稱）不需要改動。
5. 驗證：`npm run build` 通過、`node scripts/verify-post-render.mjs` 0 diff；依
   `CLAUDE.md` 規範在下方「更新歷史」補一筆記錄。

## 功能 → 程式碼速查

給 Agent 快速定位「要改這個功能該碰哪個檔案」：

| 功能 | 主要檔案 / 進入點 |
| --- | --- |
| 首頁／目錄頁前端分頁與標籤篩選、搜尋 | `assets/scripts.js` → `initPagination()`；資料來源 `public/data/posts.json` |
| 文章 metadata 產生（字數／閱讀時間，內部經 marked + card DSL 渲染後才剝標籤計數） | `scripts/generate-posts-metadata.js` → 產出 `public/data/posts.json` |
| 文章內頁渲染（Markdown/HTML 解析、上一篇/下一篇導航） | `posts/detail.html` + `assets/scripts.js` |
| 文章大綱 TOC（桌機側欄／手機 Bottom Sheet／已停用的行動版章節分頁列） | `assets/scripts.js` → `initTOC()`；`ENABLE_CHAPTER_BAR` 旗標控制分頁列是否顯示 |
| 卡片 fence DSL（```compare/prep/info/stepper/accordion/quickjump/stop 資料區塊，語法細節見 `doc/card_dsl.md`） | `assets/markdown-cards.js`（渲染邏輯）／`assets/create-marked.js`（`registerCardExtensions` 接線）／`scripts/verify-post-render.mjs`（Node 端渲染回歸驗證，用法：`node scripts/verify-post-render.mjs [基準git-ref] [檔名過濾字串]`，比對指定 ref 與工作目錄的渲染輸出是否 0 diff） |
| 純 Markdown 卡片形狀轉換層（`eat`／`apps` 家族改用形狀判斷取代 fence，語法見 `doc/card_dsl.md` §1） | `assets/markdown-sections.js`（`registerSectionExtensions`）／接線點與 `registerCardExtensions` 同一處：`assets/create-marked.js`（見下方 `Markdown 渲染器建立` 列） |
| Markdown 渲染器建立（單一 `Marked` 實例工廠，供 Node／瀏覽器共用，避免三處重複註冊） | `assets/create-marked.js` → `createMarked()`；呼叫端：`assets/scripts.js`（瀏覽器，同步掛回 `window.marked`）、`scripts/generate-posts-metadata.js`、`scripts/verify-post-render.mjs` |
| 文章專屬視覺風格（front matter `style` 欄位） | `scripts/generate-posts-metadata.js`（寫入 `posts.json`）／`posts/detail.html`（掛 `.post-style-<name>` class）／`assets/post-styles/<name>.css`（scoped 樣式，由 `assets/tailwind.css` 檔尾 `@import ... layer(post-styles)`） |
| 卡片視覺樣式（`.food-item`／`.spot-card`／`.compare-card`／`.info-card`／`.stepper`／`.app-card`／`.emergency-card`／`.alert-box` 等） | `assets/tailwind.css` 的 `@layer components` |
| 色彩／字型設計 Token | `assets/tailwind.css` 的 `@theme` |
| 導覽列／頁尾動態載入 | `assets/scripts.js` 尾端 fetch 邏輯 + `public/components/navbar.html`／`footer.html` |
| PWA 快取與雜湊防刷 | `public/sw.js`（`CACHE_NAME`，2026-07-26 起由 `vite.config.js` 的 `swPrecachePlugin` 於 build 時自動衍生，不再手動遞增；快取更新說明見第一部分 `### 5`） |
| 開發模式文章監聽熱重載 | `vite.config.js` 的 `watchPostsMetadataPlugin` |
| 建置/部署 CI | `.github/workflows/pages.yml` |
| 文章連結網址產生（統一由此決定 `posts/<id>.html` 這個網址形狀） | `assets/scripts.js` → `postUrl()`，掛 `window.postUrl` 供 `index.html`／`posts/index.html`／`posts/detail.html` 三處非 module inline script 呼叫 |
| 每篇文章的 OG／Twitter meta 靜態頁（`posts/<id>.html`，供社群爬蟲讀取） | `vite.config.js` → `generatePostPagesPlugin()`（build 後複製 `dist/posts/detail.html` 並注入該篇 meta／封面圖／`window.__PRESET_POST_ID__`） |
| `sitemap.xml`／`robots.txt` 產生 | `vite.config.js` → `generateSeoFilesPlugin()` |
| 自訂 404 頁（GitHub Pages 找不到路徑時的 fallback；文章 id 查無資料/缺 id 時也會前端導向此頁） | `404.html`（build 進入點）／`posts/detail.html` 的 `window.location.replace(base + '404.html')` |
| lint／格式化 | `eslint.config.js`（flat config）／`.prettierrc.json`／`.prettierignore`；`npm run lint`／`npm run format` |
| 前端錯誤監控（預設關閉） | `assets/scripts.js` 頂部 `ERROR_WEBHOOK_URL` 常數＋ `reportError()`，掛 `window.addEventListener('error'/'unhandledrejection', ...)` |
| 文章模板（先寫架構、後填內容，只放骨架＋佔位符，不含實際文字） | `doc_template/README.md`（使用流程與相關文件索引）／`doc_template/travel-itinerary-editorial-card.md`（`style: editorial-card` 風格骨架，抽取自 07-16 文章） |

## 專案目錄結構對照表

```
.github/workflows/pages.yml   CI/CD 部署設定，使用 Node/Vite 環境建置，部署 dist 到 Pages
assets/
  tailwind.css                 Tailwind v4 CSS 原始碼（定義主題 Tokens 與自訂組件）；檔首宣告
                                @layer theme, base, components, utilities, prose, post-styles，
                                真正的元件（.toc-fab 等）在 @layer components 內（utilities 之前，
                                讓 JS 掛的 xl:hidden 等能正常覆寫）；.prose 系列覆寫（標題/連結/
                                blockquote/表格樣式）獨立在 @layer prose（utilities 之後，才能贏過
                                @tailwindcss/typography 外掛自己在 utilities 裡的預設值）；post-styles
                                由檔尾 @import ... layer(post-styles) 掛入，全部覆寫關係由宣告順序
                                決定，不再依賴「誰沒分層誰贏」
  scripts.js                   通用 JS，含雙頁面分頁 (initPagination)、文章大綱 (initTOC)、元件動態載入與 PWA 註冊
  create-marked.js             建立單一 Marked 實例並註冊 registerCardExtensions／
                                registerSectionExtensions 的工廠函式 createMarked()，供
                                scripts.js（瀏覽器）／generate-posts-metadata.js／
                                verify-post-render.mjs 三處共用，取代原本各自重複的
                                「new Marked() + 兩次 register」樣板
  markdown-cards.js            Card fence DSL：marked block 擴充 registerCardExtensions()，把 ```compare/
                                prep/info/stepper/accordion/quickjump/stop 資料區塊逐字還原成卡片 HTML
                                （純字串邏輯，可在 Node 與瀏覽器共用）；語法細節見 doc/card_dsl.md
  markdown-sections.js         純 Markdown 結構轉換層：marked v12 hooks.processAllTokens()，在 token
                                陣列上依「內容形狀」（單一連結標題＋下一段只有 code span → 美食卡；
                                清單每項以單一英數字元粗體開頭 → App 清單）辨識並重組成與舊 fence 逐字
                                等價的 HTML，匯出 registerSectionExtensions()。作者不寫 fence、寫純
                                Markdown；與 markdown-cards.js 並存同時註冊，互不衝突。涵蓋 eat／apps
                                兩個家族，見 doc/card_dsl.md §1
  post-styles/                 文章專屬視覺風格 CSS，每個風格一份 <name>.css，scope 在 .post-style-<name>
                                下，由 tailwind.css 檔尾 @import ... layer(post-styles) 掛入
                                （見 doc/card_dsl.md「文章視覺風格系統」）
  fonts/                       自我託管的 Lora + Inter + Noto Serif TC 字型 (woff2，Noto Serif TC
                                為僅收錄實際標題字元的 subset 可變字重檔，見第一部分第 31 點)
public/
  components/                  共用佈局元件
    navbar.html                動態載入的導覽列（文字 wordmark Logo + 目錄連結）
    footer.html                動態載入的頁尾
  data/
    posts.json                 由 scripts 自動生成的文章索引元資料檔（每次 build 皆會重新產生；目前
                                為方便本機直接開發預覽而納入版控，內容不需手動維護）
  img/                         圖片資源（首頁背景、文章背景、PWA 圖示等）
  manifest.json                PWA 應用設定檔，設定 Base URL 為 /travel/
  sw.js                        PWA Service Worker 快取腳本，打包時由 Vite 插件填入雜湊資源檔名
src/
  posts/                       存放所有文章原始檔（.md 或 .html）的目錄，供前端 Fetch 讀取
archive/                       存放封存之歷史或非現役文章與規劃原始檔（不進 posts.json 索引）
doc_template/                 「先寫架構、後填內容」文章模板（只含骨架＋佔位符，不進 build，
                                供 Agent 填內容產出 src/posts/ 新文章），見 README.md 使用流程
scripts/
  generate-posts-metadata.js   Node.js 腳本，用以提取文章 Front matter、計算閱讀時間並產出 posts.json
  verify-post-render.mjs       Dev-only 渲染回歸驗證：兩邊都用「當前的 markdown-cards.js／
                                markdown-sections.js」渲染，比對指定 git ref 與工作目錄的文章 HTML
                                是否 0 diff。適用 renderer 重構／DSL 欄位語意調整／文章內容遷移等
                                所有情境。用法：node scripts/verify-post-render.mjs [ref] [檔名過濾字串]
vite.config.js                 Vite 整合與多入口 (MPA) 設定檔，含 swPrecachePlugin／
                                generatePostPagesPlugin／generateSeoFilesPlugin 三個自訂打包插件
                                （見第一部分第 29 點）
eslint.config.js               ESLint flat config（assets/*.js 用 browser globals，scripts/*.js／
                                vite.config.js 用 node globals，public/sw.js 用 serviceworker globals）
.prettierrc.json                Prettier 設定（singleQuote、printWidth 120）
.prettierignore                 排除 dist/、src/posts/、doc/archive/、assets/main.css 等不應被格式化的內容
index.html                     首頁
contact.html                   聯絡建議頁面，包含 Formspree 表單提交
404.html                       自訂 404 頁（build 進入點，輸出至 dist/404.html，符合 GitHub Pages 404
                                頁的慣例路徑）
posts/
  index.html                   文章目錄頁面（橫線列表，每列標題在上、日期+膠囊標籤同排 meta 帶在下，
                                分頁大小為 100；篩選列左側即時結果計數、右側標籤篩選+搜尋；
                                過濾為 0 筆時顯示空狀態提示列）
  detail.html                  通用文章內頁（動態 Fetch 文章、剔除 Front matter、利用 marked 渲染、桌機/手機文章大綱 TOC）
  <id>.html                    build 後由 generatePostPagesPlugin 為每篇文章產生的靜態頁，只存在於
                                dist/，不進版控（見第一部分第 29 點）
```

## 關鍵架構與設計決策

1.  **資料與視圖分離 (Metadata Generation)**：
    由於沒有後端編譯器在伺服器端將文章組裝成 HTML，因此在本地/CI 建置時，透過 Node.js 腳本將所有文章的 metadata（如標題、標籤、日期、預估閱讀時間）全部抽離並整合至一個小巧的 `posts.json` 檔案中。前端載入首頁與目錄時，只需請求此 JSON 檔案，即可完成渲染與分頁，不需要一次下載全部的文章內容，大幅減少頻寬與載入時間。
2.  **多入口多頁面打包 (Vite MPA)**：
    利用 Vite (Rollup) 的多入口編譯設定，將 `index.html`、`contact.html`、`posts/index.html` 與 `posts/detail.html` 定義為獨立的進入點，確保 Vite 能夠將 CSS/JS 最佳化拆分與打包。
3.  **前端動態佈局加載 (Dynamic Layout Loading)**：
    為了避免在每個獨立 HTML 頁面中複製重複的導覽列與頁尾，透過 `assets/scripts.js` 在網頁載入時動態 `fetch()` 共用的元件 HTML 並置換 placeholder，同時透過 URL 比對來動態將目前頁面選單項目標記為啟用狀態。
4.  **Markdown 動態編譯與 Front Matter 剝離**：
    `posts/detail.html` 作為唯一的通用文章內頁，在載入時透過 `marked.js` 對 Markdown 文章原始碼進行即時轉譯。在轉譯前，利用正則表達式剝離 Jekyll 遺留的 Front Matter 區塊，並支持原始 HTML 與 Markdown 文章格式的雙重相容。
5.  **視覺設計系統**：
    網站風格定位為「簡潔、乾淨、高雅」，採用使用者指定的四色色票（`#222831`/`#393E46`/`#948979`/`#DFD0B8`），設計 Token 全部定義於 `assets/tailwind.css` 的 `@theme` 區塊。
    *   **色彩 Token 設計（現行白底方案）**：
        色票拆分為兩個家族運用：`#222831`/`#393E46`（偏冷深灰）作為主要文字與標題字色，`#948979`/`#DFD0B8`（偏暖褐/米）作為強調色、邊框與標籤背景。
        *   `--color-paper` / `--color-surface`：`#FFFFFF`（頁面整體與元件卡片底色，靠邊框區隔層次）。
        *   `--color-ink`：`#222831`（主要文字與標題）。
        *   `--color-muted-text`：`#61656B`（次要與 Meta 文字，對白底通過 WCAG AA）。
        *   `--color-muted`：`#888B90`（Disabled 狀態文字）。
        *   `--color-sand`：`#948979`（邊框、分隔線、標籤與 hover 背景）。
        *   `--color-primary` / `-dark`：`#6F675B` / `#595249`（暖褐強調色，對白底通過 WCAG AA，同時滿足文字疊白底與白字疊強調底的可讀性）。
        *   `--color-hero-text`：`#F4ECDD`（Hero 區文字專用色，在深色遮罩下提供高對比）。
    *   **Hero 遮罩與文字對比**：`.masthead .overlay` 遮罩固定使用 `bg-ink`，不透明度設為 `0.78`，文字強制使用 `text-hero-text`（`#F4ECDD`）。此組合可確保不論背景圖明暗，標題與 Meta 文字皆能通過 WCAG AA 對比度規範。
    *   **字體分工**：展示型標題（Hero、文章標題、Nav wordmark）與 Hero 副標題使用 `Lora` 襯線字型，建立編輯雜誌感；UI 與內文字體升級為 `Inter` 無襯線變數字型以確保清晰。中文襯線字型自 2026-07-26 起自架 `Noto Serif TC`（見第一部分第 31 點），不再只靠系統優選字型。元資料（Meta）完全去除 CJK 漢字之斜體，收細至 `text-sm` 以拉開視覺層次。
    *   **文章內文排版**：安裝 `@tailwindcss/typography` 處理 Markdown 元素樣式。詳細頁在渲染完成後以 JS 為 `<table>` 動態包覆 `overflow-x-auto` 容器，以防表格橫向溢出。**此外** `.prose p`/`.prose li` 設 `overflow-wrap: anywhere`、`.prose td`/`.prose th` 設較保守的 `overflow-wrap: break-word`（2026-07-21）：純 Markdown 文章若把裸網址等無空格長字串直接當可見文字（未用 `[文字](url)` 包裝），預設不斷行會撐寬 `.prose` 一路撐寬到 `<article>`，使整頁在手機出現橫向捲動，連帶把 `position: fixed` 的 `.toc-fab` 圓點推出可視範圍外；td/th 刻意不用 `anywhere` 是因為它會縮小儲存格 min-content 寬度，容易讓匯率、日期等數字欄位被不必要地強制斷成兩行、破壞對齊。
    *   **Navbar**：Logo 改為純文字 wordmark「旅遊指南」之極簡二項目架構，Navbar 具毛玻璃特效（`bg-surface/90 backdrop-blur-sm`）。
6.  **目錄頁篩選/搜尋互動細節**：
    *   **標籤篩選下拉選單定位**：選單錨點採 `left-0`，搭配 `w-64 max-w-[calc(100vw-2.5rem)]` 與 `max-h-48`，確保窄螢幕下選單完整落在可視範圍內，並提供捲動提示。
    *   **篩選/搜尋不觸發畫面捲動**：搜尋與篩選操作時 `shouldScroll` 設為 `false`，避免搜尋框被捲出視窗；僅在分頁換頁與上一頁/下一頁時才捲動至清單頂端。
    *   **即時結果計數與空狀態**：新增結果計數更新機制，優化寬度計算防止小螢幕擠壓換行。當無搜尋結果時，動態注入空狀態提示列。
    *   **視覺細節收斂**：分頁器改用暖色 Token，日期改用 `tabular-nums` 並與標籤合併為單一橫排 Meta 帶以緊湊版面。加入鍵盤 `focus-visible` 焦點樣式，並以內聯 SVG 放大鏡取代 emoji。
7.  **PWA 靜態資源預快取防刷 (swPrecachePlugin)**：
    由於 Vite 打包後的 CSS/JS 檔名會帶有隨機雜湊碼，自訂 Vite 插件 `swPrecachePlugin`，在建置完成後，動態將帶有雜湊值的資源名稱取代並更新至 `dist/sw.js` 的預快取陣列中。
    *   **`CACHE_NAME` 自動化（2026-07-26，2026-09-25 擴充）**：`public/sw.js`
        原始碼裡的 `CACHE_NAME` 只是固定佔位值 `'clean-blog-dev'`（本機開發時 `scripts.js` 一律
        自動 unregister SW，不會讀到這個值），真正生效的版本號由 `swPrecachePlugin` 在
        `closeBundle()` 用 `crypto.createHash('md5')` 對「CSS/JS 檔名＋`public/img/` 全部檔案
        內容＋`src/posts/` 全部文章 Markdown 內容＋`public/data/posts.json` 內容」算出的 8 碼
        短雜湊決定，寫回 `dist/sw.js`。**雜湊來源涵蓋 `public/img/`、`src/posts/` 與 `posts.json`**：
        若僅修改文章內容或增減文章，CSS/JS 檔名不會變動；將文章與索引納入雜湊後，每次文章變動
        皆能觸發 `CACHE_NAME` 換版，讓瀏覽器自動觸發 Service Worker 更新並清除舊快取。同時前端
        在 fetch `data/posts.json` 與 `src/posts/*.md` 時帶有 `{ cache: 'no-cache' }`，避免
        GitHub Pages 預設的 `max-age=600` 讓瀏覽器在 10 分鐘內卡在本地磁碟快取。
8.  **文章大綱元件 (TOC)**：
    *   **Runtime 動態生成**：於文章渲染後動態走訪章節標題生成大綱，支援 Markdown 與手寫 HTML 格式。若標題無 `id` 則自動指派繁中安全 slug。**選擇器刻意用 `:scope > h2, :scope > h3`（僅直接子節點）而非 `querySelectorAll('h2, h3')`**：文章由 `marked.parse()` 注入 `#post-content`，Markdown 章節標題是其直接子節點，而卡片元件（`.emergency-card`／`.alert-box` 等）內部自帶的 `<h3>` 標題是巢狀子孫；若不限定直接子，像「緊急應變」這種一節含多張卡片時，救護車/警局/各醫院、WOWPASS 步驟、行李限重提醒等卡片標題會被灌進 TOC（首爾文章實測會多出 12 條雜訊）。
    *   **桌機版（>= 1280px）**：側欄以 `position: absolute` 隨頁面捲動貼在 Banner 下緣（避免初始就以 fixed 蓋住 Banner 文字），在 `assets/scripts.js` 的 `buildDesktopSidebar` 內由 `updatePinnedState()` 監聽 `scroll`/`resize`，一旦捲動超過休息位置即切換 `.is-pinned` class 改為 `position: fixed`（效果等同 `position: sticky`；因側欄掛載於 `document.body` 而非文章內文的 flow 子節點，無法直接套用原生 sticky，故以 JS 手動切換）。側欄本身以 `IntersectionObserver` 搭配捲動幾何計算進行精準的 Scroll Spy 章節高亮，並隱藏內部捲軸（`scrollbar-width: none` / `::-webkit-scrollbar { display: none }`，僅隱藏視覺捲軸，捲動功能不受影響）。
    *   **行動版（< 1280px）**：文章開頭插入 h2 靜態速覽。向下捲動後淡入右下角浮動按鈕，點擊開啟 Bottom Sheet 抽屜（高度自適應，最大 `80vh`，支援下滑、點 scrim、Esc 或點連結關閉）。清單採靠左對齊並保留階層色條縮排與目前章節高亮，開啟時會自動置中捲動到目前 active 的章節。
    *   **平滑捲動跳轉**：點擊 TOC 連結時攔截原生瞬間跳轉，改用 `scrollIntoView({ behavior: 'smooth' })` 平滑捲動（尊重減速動效設定），並以 `history.replaceState` 更新 hash 且不增加歷史堆疊。`scroll-margin-top` 改由 `updateScrollMargins()` 依斷點動態設定（見下方行動版章節分頁列說明），並放寬 2px 誤差以修正 active 章節誤判。
    *   **行動版章節分頁列（`<1280px`，`buildChapterBar`，2026-07-15 起以旗標停用）**：既有行動版 TOC（頂部靜態速覽＋FAB＋Bottom Sheet）之外，原本另有一條 `position: fixed` 貼於 navbar 正下方的常駐橫向捲動膠囊列（`.chapter-bar` / `.chapter-pill`），只顯示 H2 層級章節（`toc.filter(i => i.level === 2)`，少於 2 個不建立，且若任一個 H2 的原文以碼點計之字數大於 6 亦不建立以避免無意義標籤），短標籤由 H2 全文去除全形/半形括號附註＋取空白/｜ 分隔前第一段衍生而成。與側欄/抽屜共用同一份 `toc` 陣列、`smoothJump`、`activeUpdaters`，高亮邏輯會把 `computeCurrentId()` 回傳的 h3 id 往回對應到最近的前一個 H2 膠囊，並比照桌機側欄的 `offsetLeft`/`scrollLeft` 邏輯把 active 膠囊自動橫向捲入可見範圍。原本**分工**：頂部靜態速覽負責「一進文章就看到全貌」、FAB＋Bottom Sheet 負責「完整 h2+h3 清單＋一次性跳轉」、章節分頁列負責「捲動閱讀過程中持續可見的當前定位與快速換章」，三者互不取代、同時並存（z-index 40，低於 Bottom Sheet 的 50，高於一般內容）。**整合關鍵**：分頁列出現時，若標題只避開 navbar（原本寫死 `scroll-margin-top: 6rem`）會被「navbar＋分頁列」一起蓋住，故改由 `updateScrollMargins()` 依 `window.matchMedia('(min-width: 1280px)')` 動態計算：`>=1280px` 維持 `96px`（分頁列隱藏，只需避開 navbar）；`<1280px` 則取 `navEl.offsetHeight + chapterBar.offsetHeight + 12`（navbar 為非同步 fetch 注入，故用 `measure()` 搭配 `load`/`resize`/短延遲重算）。scroll-spy 判定用的 `NAV_OFFSET`（96）刻意維持不變、未隨分頁列高度調整，故剛點擊跳轉落地瞬間，分頁列高亮偶爾會短暫停留在前一章節（需再捲動約 30 多 px 才切換），是已知可接受的次要誤差。
        **現況（2026-07-15）**：使用者決定文章拆短後，行動版只靠頂部靜態速覽＋FAB＋Bottom Sheet 抽屜已足夠，全站不再顯示此分頁列。做法是 feature flag，不刪程式碼：`initTOC()` 頂部新增 `const ENABLE_CHAPTER_BAR = false;`（緊鄰 `NAV_OFFSET` 常數），`buildChapterBar(toc)` 函式最開頭加 `if (!ENABLE_CHAPTER_BAR) return null;` 早退（在 `chapterItems` 宣告之前），函式其餘邏輯（`shortLabel`、6 字門檻、`measure()`、高亮同步）完整保留未動。呼叫端 `stickyOffset()` 既有的 `if (isDesktop || !chapterBar) return NAV_OFFSET;` 分支自動接手 `chapterBar === null` 的情況，`updateScrollMargins()` 與 `computeCurrentId()` 均不需改動。CSS（`.chapter-bar`／`.chapter-pill` 等）維持不刪。**日後要恢復**：把 `ENABLE_CHAPTER_BAR` 改回 `true` 即可，無需其他改動。
9.  **文章內文組件系統（旅遊手帳卡片排版，`feature/travel-guide-style-match` 分支）**：
    為了讓特定風格的文章（如首爾旅遊指南）在「純 Markdown + 少量 HTML/class」的前提下也能有接近原生 App 的卡片化閱讀體驗，於 `assets/tailwind.css` 新增一組可重用的組件類別：`.gallery-grid`/`.gallery-card`（總覽導覽卡）、`.prep-pill-row`/`.prep-pill`/`.emergency-cta`、`.spot-card`/`.day-label`/`.friendly-badge`/`.stars`/`.info-subcard`/`.spot-walk-link`（景點卡）、`.food-item`/`.food-chip`/`.action-btn`（美食卡，含 Naver/Kakao/食記三色按鈕）、`.stepper`/`.step-item`/`.step-node`（時間軸）、`.app-card`（App 條列）、`.emergency-card`（聯絡資訊卡）、`.alert-box`（`[!NOTE]/[!WARNING]` 提示框，取代先前僅顯示純文字 `[!WARNING]` 字樣的 blockquote；中間層 `.alert-important` 已於 2026-07-15 收斂移除，見下方第 14 點）。色彩沿用本站既有 Token（ink/sand/primary/surface），不引入外部來源的獨立色票。所有互動維持純錨點跳轉（不含分頁 JS/底部快捷列），與既有 Navbar／TOC 側欄共存。
    *   **`not-prose` 使用限制**：這是 Typography 外掛提供的選擇器類（`.prose :where(...):not(:where([class~="not-prose"] *))`），只能直接寫在 HTML 的 class 屬性上，不能透過 `@apply not-prose` 在自訂 CSS 類別內使用。
    *   **flex 容器須避免「行內元素＋純文字節點」混排**：flex 容器的每個直接子節點（包含匿名文字節點）都會被視為獨立 flex item 橫向排列；若某類別內容是「`<strong>` 加後續純文字」這種預期同段落換行的內容，該容器不可設為 `display: flex`（例如 `.prep-pill` 因此改回區塊排版）。
    *   **`**粗體**` 語法陷阱**：marked/CommonMark 的定界符規則會拒絕在「結尾為標點符號且緊接非空白字元」的情況下收尾（如 `**嚴禁託運！**必須`），導致literal `**` 殘留不轉換；這類情況一律改用 `<strong>` 原生標籤，不依賴 `**` 語法。
    *   **`:last-of-type` 對「無共用 wrapper 的相鄰卡片」失效（bug，2026-07-16 修正）**：`apps` 家族的 `.app-card` 由 `renderApps` 直接輸出多個相鄰 `<div>`、無外層 wrapper（見下方第 12 點「兩個資料層級」），故其實際同層兄弟是整篇文章 flow 裡**所有**卡片家族的 `<div>`，而 CSS `:last-of-type` 只比對標籤名、不比對 class，永遠選不中真正最後一張 `.app-card`。凡是「多個實例相鄰輸出、無共用 wrapper」的卡片家族，去尾/去頭樣式一律改用相鄰選擇器（如 `.app-card + .app-card { border-top }`），不要用 `:first-of-type`/`:last-of-type`。
10. **文章內文組件系統擴充（手機閱讀體驗優化，`feature/travel-guide-style-match` 分支）**：
    在既有旅遊手帳卡片系統之上，為首爾文章新增 3 組手機優先的組件類別（同樣沿用既有色彩 Token，未引入新色票）：
    *   `.compare-card`/`.compare-card-head`/`.compare-card-name`/`.compare-tagline`/`.compare-row`：垂直堆疊比較卡，取代原本手機必然橫向捲動的多欄 Markdown 表格（機場接駁比較即為此用法：Klook 商務車／機場巴士 6701／AREX／現場計程車 4 張卡取代 5 欄表格）。
    *   `.food-diet-row`/`.diet-chip`（含警示變體 `.diet-chip.is-warn`）：置於 `.food-item-meta-row` 下方的「長輩友善屬性」晶片列（如 不辣／軟嫩好入口／無內臟／需排隊），供讀者掃描篩選，與既有餐別 `.food-chip` 視覺上明確區隔（`.diet-chip` 用 `bg-paper` 淺底 + `text-muted-text`，`.food-chip` 用各分類色底 + 對應深色文字）。
    *   `.fold`/`.fold > summary`：包裝原生 `<details>` 的摺疊細節樣式，`summary` 前綴 `▸`/展開後 `▾` 圖示（純 CSS `content`，無 JS），用於收摺條款類長文（如保險理賠細節、違禁品完整清單），預設只露結論標題。
    *   **`<details>` 內含 Markdown 清單時的空行規則**：與 `.alert-box`/`.stepper` 相同，`<details>` 開頭、結尾、以及清單前後都需要保留空行，marked.js 才會把裡面的 `*   ` 清單解析成 `<ul><li>`；若省略空行會整段被當成 `<details>` 內的純文字段落，`*` 字元不會被轉換成項目符號。
11. **文章內文組件系統再定調（「簡潔高雅」視覺重整，2026-07-15）**：
    針對首爾文章做的一次全面風格統整，方向定為「簡潔、高雅、一眼掃到重點」。分三塊，皆沿用既有色彩 Token，唯緊急應變區為功能性導引另引入 5 色語意色票：
    *   **美食／景點雜誌感卡片（純 CSS，不改 HTML）**：`.food-item` 由 `border-b` 清單改為 `rounded-lg` 邊框卡並設 `display:flex; flex-direction:column`，以 `order` 把「餐別 chip＋`.food-diet-row` 屬性」提到店名上方當 kicker；`.food-item-name`／`.spot-title` 放大為 `font-serif text-[22px]` 當雜誌主標。`.food-item-body` 亦為 flex，用 **`:nth-of-type` 重排既有三列**（價位帶=1／招牌菜=2／為何適合=3）為「招牌菜(hero，`--color-primary` 粗體)→價位(muted)→理由→按鈕」。**前提**：全 30 筆 `.food-item` 的 body 三列順序必須一致（已用腳本驗證），`:nth-of-type` 選取才穩定——未來新增美食卡務必維持「價位帶→招牌菜→為何適合」順序，否則重排會錯位。
    *   **出發前準備欄位化**：原多處 2–3 層 Markdown 巢狀清單（導致內容朝右壓縮、左邊留白）改寫為滿版 `.compare-card`＋`.compare-row`（複用機場接駁比較卡元件，未新增樣式）。涵蓋網路與漫遊、支付與匯率、免稅退稅、在地習俗四節。
    *   **緊急應變分類色碼系統**：新增 `.triage-list`/`.triage-item`/`.triage-num`（置頂情境速查，可點擊 `tel:`／錨點），以及 `.cat-medical|police|info|embassy|hospital`（左色條）＋`.badge-*`（號碼底色）＋`.em-tag`（分類 chip）。5 色語意色票（醫療 `#b23a3a`／警察 `#3f5e8c`／資訊 `#b07d1f`／代表處 `#4a7a55`／醫院 `#3f7676`）為去飽和深色版、文字對白底過 WCAG AA，**刻意只用於緊急應變區**（wayfinding 優先於全站暖褐單色）。`.emergency-card` 拆分為每類一卡並掛 `.cat-*` 上色。**cascade 陷阱**：`.cat-*` 的 `border-left-color` 與 `.emergency-card`/`.triage-item` 自身 `border` 同 specificity，必須在來源順序上置於後者之後（現置於緊急應變 CSS 區塊最末）才能生效；否則左色條會被預設暖褐/sand 壓過。
12. **卡片 DSL 重構（`assets/markdown-cards.js`，2026-07-15）**：
    首爾文章前述 8 個卡片家族（food/spot/compare/gallery/prep/apps/triage/emergency）共約 80 個實例原本全是手寫 `<div>` HTML，逐一維護容易漏改欄位或破壞既有 class 契約。新增 `assets/markdown-cards.js`，匯出 `registerCardExtensions(marked)`：註冊一個 marked block 級擴充（`name: 'cardBlock'`），tokenizer 用正規式比對 ` ```food ` ~ ` ```emergency ` 8 種語言的 fenced code block，renderer 依語言分派到對應的純字串模板函式，把精簡的 `key: value` / positional（` | ` 分隔）資料逐字組回**與改寫前手寫 HTML 完全相同**的標籤序列（含 class、`&nbsp;`、全形冒號、`target="_blank"` 等）。
    *   **接線點**：`assets/scripts.js` 檔案最上方 `import { registerCardExtensions } from './markdown-cards.js'; if (typeof window !== 'undefined' && window.marked) registerCardExtensions(window.marked);`——`scripts.js` 是 `posts/detail.html` 裡 `<script type="module">`，在 `<head>` CDN 載入的全域 `marked` 之後、DOMContentLoaded 內唯一的 `marked.parse()` 呼叫之前執行，故能在渲染前完成擴充註冊，是全站唯一需要接線的地方。
    *   **輸出逐字等價，非近似**：`scripts/verify-card-dsl.mjs` 分別用「純 marked」渲染改寫前備份、「marked + registerCardExtensions」渲染改寫後文章，正規化空白（去標籤間空白、連續空白壓一個、trim）後比對，要求 0 diff；`markdown-cards.js` 本身純字串邏輯不碰 DOM，可在 Node 直接跑此驗證，也預留了未來若要在建置時預渲染的可能性。
    *   **兩個資料層級**：`food`/`spot`/`compare`/`emergency` 是「一個 fenced block＝一張卡」（各自獨立、可增刪單卡不影響其他張）；`gallery`/`prep`/`apps`/`triage` 是「一個 fenced block＝一組多張卡」（整組共用同一個外層 wrapper `<div>`，`apps` 因原本就無 wrapper，區塊直接輸出多個相鄰 `.app-card`）。
    *   **`food` 的 `map_kakao` 例外**：原始資料裡有 5 筆店名的 Naver／Kakao 搜尋字串並非完全相同（Kakao 端多了一個全形空白，屬原始內容既有的不一致，非本次引入），因此 `food` 模板新增可省的 `map_kakao` 欄位，僅在該筆與 `map` 不同時填寫，用來逐字保留這個既有差異，其餘 25 筆共用單一 `map` 欄位。
    *   **`stepper` 家族（2026-07-16 起納入 DSL）**：`.stepper`/`.step-item`（機場通關步驟 5 步、WOWPASS 開卡與儲值 4 步）原本因「內文為 freeform Markdown 清單/連結」被歸為手寫 HTML；後於 R5 改用 ```stepper fence（見下方第 15 點），消除約 77 行 `<div>` 鷹架。`CARD_LANGS` 現含 `stepper`。與其他家族不同，`renderStepper(body, marked)` 需外部傳入的 `marked` 實例遞迴解析「多行清單型」步驟 body，故在 renderer 分派時特判、不走 `RENDERERS` 單參數路徑。
    *   **仍保留為手寫 HTML、刻意不轉的家族**：`.alert-box`（`[!NOTE]`/`[!WARNING]` 提示框，本來就是 blockquote 語法的展現）、`<details class="fold">`（摺疊區塊，內容為長篇 Markdown 清單）、`.emergency-group` 的 `<p>` 與 `.emergency-cta` 的 `<a>`（各自只有 1-3 個單一實例，非重複樣板）。這些維持原樣，理由是「內容 freeform 或只有單一實例」，硬凹成 DSL 欄位不會減少維護成本。
    *   **URL 不做 percent-encode**：`food` 的 `map`/`map_kakao`、`triage`/`emergency` 的 `href` 等欄位一律原樣輸出（不呼叫 `encodeURIComponent`），沿用原始檔案裡的 raw 韓文查詢字串，避免與改寫前的位元組序不同。
13. **新增 `info` 卡片家族，與 `compare` 語意分工（視覺重整第 1 輪，2026-07-15）**：
    `.compare-card` 原本身兼兩種語意——「幾個選項擇一比較」（如機場接駁 4 選項、網路漫遊 4 方案）與「單純結構化參考資訊」（如退稅方式、換匯重點）共用同一組視覺（左 `border-l-4 border-l-primary` 主色條），破壞了「有色條＝可選項」的視覺文法。拆分做法：
    *   **CSS**（`assets/tailwind.css`，緊接 `.compare-card` 區塊之後）：新增 `.info-card`/`.info-card-head`/`.info-card-name`/`.info-tagline`/`.info-row`，結構與 `.compare-card` 平行但**無左主色條**，改用完整 `border border-sand/60` 平框＋卡名下 `border-b border-sand/40` hairline 分隔，一眼與「可選項」的 compare-card 區隔。
    *   **DSL**（`assets/markdown-cards.js`）：`CARD_LANGS` 新增 `info`；`renderInfo(body)` 結構比照 `renderCompare`，支援 `name`/`tagline`/`row`（`label | value`）/`text` 四鍵，但**不支援 `stars`**（因為沒有「幾星」這種評比語意）、不輸出色條 class，並註冊進 `RENDERERS`。
    *   **語意分工定案**：`compare` = 「這是幾個選項裡的一個，你要擇一」（保留主色條）；`info` = 「這是要讀的參考資訊，不是選項」（無色條、平框＋分隔線）。
14. **提示框收斂為兩級（視覺重整第 3 輪，2026-07-15）**：`.alert-box` 原有 3 種 variant——`.alert-warning`（琥珀，禁止/限制/政策異動）、`.alert-important`（sand 中間層，語意最模糊、與一般卡幾乎無區別）、`.alert-note`（muted，補充說明）。中間層 `.alert-important` 語意含糊，故移除，收斂成「**warning（警告）/ note（補充）**」兩級。全 repo 確認 `.alert-important` CSS class 移除後無他處使用（其他文章的 `> [!IMPORTANT]` 為 GitHub blockquote 純文字語法、無轉換對應到該 class，不受影響）。
15. **`stepper` 納入卡片 DSL（`assets/markdown-cards.js`，2026-07-16）**：文章 2 個手寫 `<div class="stepper">…</div>`（機場通關 5 步、WOWPASS 4 步，共約 77 行鷹架）改用 ```stepper fence。
    *   **DSL 語法**：每個步驟以 `@ 標題` 行起始，之後到下一個 `@ `（或區塊結尾）之間所有行為該步驟 body（保留空行與縮排）。標題**不含**「Step N:」——編號由 `renderStepper` 自動補上，統一輸出全形冒號「`Step ${n}：${title}`」（冒號後不加空白）。
    *   **body 兩種處理（確保逐字 0-diff）**：`renderStepper` 刻意**不用** `bodyLines()`（會濾空行、破壞清單）；自行按 `@ ` 切分並保留原始空行。令 `b = stepBody.trim()`：`b` 不含換行（單行步驟）→ 原樣 inline 輸出（不跑 marked、不包 `<p>`，逐字保留 `<strong>`/`&le;` 等）；`b` 含換行（多行清單步驟）→ `marked.parse(b)` 遞迴解析成 `<ol>`/`<ul>`。
    *   **re-entrancy**：`renderStepper` 收 renderer 閉包裡的 `marked` 實例，在渲染整份文件的過程中再呼叫 `marked.parse(b)`。因 step body 不含任何卡片 fence（`cardBlock` tokenizer 的 `start` 找不到 ```' 直接回傳 undefined），不會遞迴進 `cardBlock`，故不會無限遞迴；marked 的 lex/parse 使用區域實例、無 Marked 級可變狀態被覆寫，實測 re-entrant 呼叫安全、輸出正確。
16. **Markdown 裝飾元件（Decorations）語意命名與重複使用指引**：
    本專案的 Markdown 裝飾元件（如 `prep`、`stepper`、`compare`、`info`、`apps`、`accordion` 等）已進行 UI/UX 元件化分析，並重新命名為更易於重複使用、語意清晰且對 Agent 友善的名稱（如 `quick-summary`、`milestone-stepper`、`feature-comparison-card`、`metadata-info-card`、`recommended-apps-list`、`interactive-faq-accordion`）。後續不論是新增文章、修改 UI，或是 AI Agent 自動寫文，皆應遵循此命名規範與設計定位。卡片 DSL 語法細節見 [`./card_dsl.md`](./card_dsl.md)（原設計分析文件
    `markdown_decorations_design.md` 已於 commit `480acf7` 移除，內容已併入該檔）。
17. **`.prose` 基礎排版內化 07-16 雜誌感（2026-07-21）**：把首爾旅遊文章手工打磨出的雜誌感標題階層、pull-quote、密集表格樣式收斂進 `.prose` 區塊的預設值（`assets/tailwind.css` L269 之後、`.toc-sidebar` 之前），讓 07-13/07-20 這類「純 Markdown、無自訂 class」的文章不用改一個字就自動套用，不必逐篇手動加 class。
    *   **新增規則**：`.prose h1`~`.prose h4` 襯線標題階層（h1 30/34px、h2 24~26/28px、h3 20/21px、h4 15px 無襯線）；`.prose blockquote` 改為 serif pull-quote（拿掉 italic，改左側 3px sand 色條），同步移除 `@layer base` 裡全站 `blockquote { font-style: italic }` 的殘留設定；`.prose thead th`/`.prose tbody tr`/`.prose td` 補上表頭底色、列分隔線與較小字級（14px，需 < body 18px 以免密集表格撐寬回歸手機橫向捲動）；`.prose input[type="checkbox"]` 套用 `--color-primary` 的 accent-color；`.prose hr` 加大留白。
    *   **CSS Cascade 陷阱與因應**：新規則刻意插入在既有 `.prose td/th overflow-wrap` 規則之後、`.toc-sidebar` 之前，讓 `.prose h3`/`.prose h4`（specificity 0,1,1）在來源順序上先於後方的 `.emergency-card h3`／`.app-info h4`（同為 0,1,1，靠來源順序決勝）出現，避免蓋掉這兩個既有卡片標題。但驗證中另外發現兩個「同 specificity 排序救不回」的隱性衝突（純 class 選擇器 specificity 只有 0,1,0，天生低於 0,1,1，不論插入順序都會被蓋掉）：07-13 `<h3 class="alert-box-title">`（提示框標題）與 07-16「7 大主題景點快速導覽」的 `<h4 class="text-xs uppercase ...">`（純 utility class 堆疊，非既有 CSS class 契約）。修法是額外新增 `.prose h3.alert-box-title` 與 `.prose .editorial-quick-jump h4` 兩條 2-class 選擇器（specificity 0,2,x，穩贏，與插入順序無關）明確恢復原始迷你標題外觀。`.spot-title`（07-16 h4）與 `.food-item-name`（DSL span，07-16 實際手寫版用的是同語意的 `.food-name` span）皆非此問題：前者被 `.style-a-post .spot-title`（0,2,0）保護，後者本來就不是 h1-h4 元素，不受影響。
    *   **唯一偏離規格書數值處**：07-16 的 `.style-a-post h3`（Day X 小節標題）固定 26px、不隨斷點縮放；規格書原定 `.prose h2` 手機版 24px，會讓母標題（總覽/景點漫遊/美食推薦）在 <768px 寬度視覺量體小於其下的子標題 Day X，故將 `.prose h2` 手機版基準值由 `1.5rem`（24px）微調為 `1.625rem`（26px，打平 Day X），`md:1.75rem`（28px）維持不變。其餘 h1/h3/h4/表格/blockquote 數值皆按規格書原值實作、未調整。
    *   **驗證**：以 Playwright 對三篇文章在 320/390/768/1280px 寬度量測 `document.body.scrollWidth` vs `window.innerWidth`，全數無新增橫向捲動；並以 computed style 逐一確認 `.emergency-card h3`（該 class 目前實際上未被任何文章使用，07-13 緊急應變區已改用 `<details class="fold">` 手風琴呈現，故此規則現階段是面向未來、非當前線上內容驗證對象）、`.app-info h4`（16px/800，未變）、`.alert-box-title`（16px serif，未變）、`.spot-title`（22px serif primary，未變）、`.editorial-quick-jump h4`（12px 大寫 muted，未變）均維持原樣；`npm run build` 通過。
18. **標題 `border-bottom` 收斂為「只有 h2 固定有底線」（2026-07-21，含一次被推翻的中間
    方案）**：延續第 17 點的 `.prose` 標題系統。第一版方案是條件式的：發現「大標題後面
    緊接著更小的標題、中間沒有段落」時（例如 `## 1.2 WOWPASS 完整介紹` 後直接接 `###
    是什麼`），h1/h2 的 `border-bottom` 分隔的其實是「標題 vs 另一個標題」而非「標題 vs
    內文」，故用 `.prose h1:has(+ h2)`／`.prose h2:has(+ h3)` 機械化拿掉底線，並經 Opus
    （資深 UI/UX 設計師視角）覆核核准上線。但實際套用後發現問題：07-20 一篇文章 6 個
    `## 1.x` 就有 4 個底線忽有忽無（觸發條件藏在肉眼看不到的 markup 結構裡），讀者完全
    抓不到規律。**第二輪推翻重議**：把這個現象回報給 Opus，Opus 反向承認第一版判斷錯誤
    ——語意論證沒錯，但套在 `h2` 這種高頻、讀者賴以建立掃描節奏的層級上，「不可預測」
    比「語意上稍嫌多餘」的代價更高。最終改採最簡單的固定規則：**只有 `h2` 帶
    `border-bottom`，無條件套用；`h1`/`h3`/`h4` 一律不加**，移除所有 `:has()` 條件邏輯
    （h1 原本的 `border-bottom` 也一併拿掉，靠字級/字重本身已夠大夠粗）。抽象準則寫入
    `doc/style.md`：A12（分隔線只在有東西可分隔時才出現，`---` 案例仍有效）與新增 A13
    （高頻節奏錨點層級：可預期的規律優先於消除次要的語意冗餘），B6 同步更新為最終規則。
    **驗證**：`npm run build` 通過。

19. **`h3` 維持純文字，不加任何視覺記號（2026-07-21）**：延續第 18 點。既然 `h3` 沒有底線，
    曾評估「要不要給它別的記號」——字符方案（◇ 之類）當場否決：◇ 已被 `.style-a-post
    .spot-title::before` 佔用，而那是更低的 h4 層級，重用同一個記號會抹平階層；字符也會吃掉
    約 1.5em，讓中文長標題在行動版多折一行、破壞左緣對齊；且若作者直接寫在 Markdown 裡，
    符號會跟著進側欄 TOC（`initTOC()` 用 `textContent` 取標題文字）。改試「左側 3px
    `--color-primary` 色條」（垂直軸，不與 h2 的水平底線混淆），並已處理 5 處
    specificity 滲漏（`.style-a/b/c-post h3`、`.emergency-card h3`、`.prose h3.alert-box-title`
    都沒宣告 `border-left`，會原樣繼承）——但套上 07-20（19 個 `h3`）後由使用者判定**更亂**，
    色條讓每個 h3 都成為視覺焦點，反而稀釋 `h2` 的錨點地位，故整組還原，`assets/tailwind.css`
    最終未留下任何改動。真正採用的解法是**減少標題數量**（見更新歷史）。抽象準則寫入
    `doc/style.md` A14（標題層級撐不住時先減標題數量，不要加裝飾），可套用的作者守則寫入
    `doc/doc_style.md` 第 3 節。

20. **`.style-a-post` 併回全站標題音階，不再自成一組（2026-07-21）**：`.style-a-post` 那組樣式
    原本是為「文章內最大的標題就是 `h3`」設計的獨立音階（`h3` 26 / `.spot-title` 22 /
    `.food-list-title` 20 / `.food-name` 18px）。07-16 這篇同時用了裸 `<h2>`，等於在上面又疊
    一階，於是產生三個缺陷：(1) `.style-a-post h3`（Day X）26px + 3px 底線，撞上 `.prose h2`
    行動版 26px + 2px 底線，母標題反而比子標題輕（先前的處置是把 h2 從規格的 24px 拉到 26px
    去「打平」，那只是止血——母標題不該只是「不弱於」子標題）；(2) 同屬 h2 之下第一層的
    「Day X」(26px) 與「◇ ○○區美食」(20px) 差 6px，讀者掃到後者會誤以為掉進更深的層級；
    (3) 階層倒置——孫層 `.spot-title` (22px) 大過叔層 `.food-list-title` (20px)。
    **解法**：整組併回 `.prose` 的音階，`h2` 26/28px 不動（改動面最小；子層降下來後 h2 已不需
    要再被拉大），`.style-a-post h3` 的覆寫**整條刪除**讓 Day X 回落到 `.prose h3`（20/21px，
    與 07-13/07-20 的 `###` 完全同款），`.food-list-title` 明確對齊同一組數值（20/21px、`mt-9`
    `mb-4`），`.spot-title` 22→18px 與 `.food-name` 打平。底線依 A13 只留給 `h2`，故 `h3` 的
    3px 與 `.food-list-title` 的 2px 底線一併移除。另把 Markdown 裡 6 個 `.food-list-title`
    文字開頭的字面 `◇ ` 刪掉——它是第 19 點所說「◇ 專屬 h4」原則的漏網之魚（同一記號同時出現
    在 h3 級與 h4 級會抹平階層）。**外溢範圍**：`style-a-post`/`spot-title`/`food-list-title`/
    `food-name` 只出現在 `2026-07-16-韓國首爾旅行.md`，07-13 與 07-20 零影響；`.prose` 完全
    未動。**驗證**：`npm run build` 通過，並自 `dist/assets/*.css` 複驗 `.style-a-post h3` 已
    不存在、`.food-list-title` 為 20px（`md` 21px）、`.spot-title` 為 18px。

21. **未分層的元件 CSS 會壓過 Tailwind utility（2026-07-21，`.toc-fab` 桌機外洩的根因）**：
    `assets/tailwind.css` 的元件區**刻意不放進 `@layer`**（見該檔 L118 註解：避免 JS 注入的
    class 在 Tailwind v4 被 purge）。CSS cascade layers 的規則是「**未分層的樣式優先序高於
    所有分層樣式**」，而 Tailwind utility 都在 `@layer utilities` 裡——於是未分層的
    `.toc-fab { display: flex }` 直接壓過 `.xl\:hidden { display: none }`，`scripts.js` 給 FAB
    掛的 `xl:hidden` 完全失效，桌機右下角一直冒出手機版的浮動圓鈕。**解法**：在 CSS 裡自己寫
    `@media (min-width: 80rem) { .toc-fab { display: none } }`，不依賴 utility。**通則**：只要
    未分層元件規則裡寫了 `display`／`position`／`color` 這類 utility 也會設的屬性，對應的
    utility 就會失效，新增 JS 注入的元件時必須留意。同期檢查過 `.chapter-bar` 與
    `.toc-sidebar`——它們自身沒宣告 `display`，故 `xl:hidden`／`hidden xl:block` 正常生效。
    **後續（2026-07-26）**：本點描述的「未分層優先於一切」問題已透過 cascade layer 重構
    根治，`.toc-fab` 的 `@media` hack 已移除，見第一部分第 27 點；本點保留作為問題成因與
    當時解法的歷史記錄。

22. **上/下一篇導覽不用按鈕，改為顯示標題的連結對（2026-07-21）**：原本是兩顆 `.btn-primary`，
    標題只藏在 `title` 屬性的 tooltip 裡。兩個問題：(1) `.btn-primary` 是全站唯一的主 CTA 重量級
    （實心底＋`extrabold`＋`uppercase`），文章結尾放兩顆等於同時給讀者兩個最高優先級行動點，
    但「上/下一篇」是低意圖的瀏覽動作，視覺重量與行為重要性倒掛；(2) 實心色塊裝不下不定長度
    的中文標題，8 字與 25 字會讓兩顆按鈕一大一小，原本靠 `justify-between` 建立的左右對稱直接
    崩掉。**解法**：`.post-nav-*` 無框連結對，眉標（`上一篇`／`下一篇`＋箭頭）用 sans 12px muted，
    標題用 **serif 15px/weight 500**——`.prose h1`-`h4` 全是 `var(--font-serif)`，讀者剛讀完一整篇
    襯線標題的文章，結尾再出現襯線標題才會被讀成「另一篇文章」而非「一個介面控制項」；字級刻意
    壓在內文（16-17px）之下一階，但不低到與 12px 眉標混層。**行動版也維持左右兩欄**（使用者要求）：
    堆疊成上下兩列會讓方向語意退化成單純先後順序，故窄欄由標題自行吸收折行（14px、`line-clamp: 3`；
    md 以上 15px、`line-clamp: 2`）。箭頭放在眉標行而非標題行，避免被 `line-clamp` 截掉。
23. **文章 banner 改用連結傳遞，避免切換文章時先閃一下錯誤圖片（2026-07-21）**：`posts/detail.html`
    是所有文章共用的通用模板，`<header id="post-header">` 寫死預設圖 `bg-post.jpg`，正確的
    `post.background` 要等 `DOMContentLoaded` 內 `fetch('data/posts.json')` 完成才會替換——切換
    文章時使用者會先看到一瞬間的錯誤 banner 才跳成正確圖片，網路較慢時尤其明顯。**解法**：
    `index.html`／`posts/index.html`／`detail.html` 自身的上/下一篇導覽，產生連結時把已經拿在手上
    的 `post.background` 一併塞進 `&bg=` query string；`detail.html` 在 `<header>` 之後立刻插入一段
    同步（非 `type="module"`、非 `DOMContentLoaded`）的 inline `<script>`，剖析 `bg` 參數並直接寫
    `header.style.backgroundImage`，搶在 `posts.json` fetch 之前完成，也搶在瀏覽器對預設
    `bg-post.jpg` 發出請求前把 style 換掉。`DOMContentLoaded` 內原本的覆寫邏輯保留不動，作為
    `bg` 參數缺漏時（直接貼網址、書籤、爬蟲）的 fallback，行為與改動前一致。用 Playwright 對
    `#post-header` 的 `backgroundImage` 每 30ms 取樣一次驗證，從第一筆（約 10ms）起就已經是正確
    圖片，全程未出現 `bg-post.jpg`。

24. **新增 `quickjump`/`stop`/`eat`/`eatarea` 卡片家族，07-16 手寫 HTML 改為 fenced block
    （2026-07-25）**：07-16 文章的「7 大主題景點快速導覽」`<div>`、7 個 `.spot-section`、
    6 個 `.food-list-title`、30 個 `.food-item` 原本全是手寫 HTML，改用新家族後消除約 460
    行鷹架。**未直接重用既有 `food`/`spot`/`gallery` 家族**：這三個是 2026-07-15 卡片 DSL
    初版時針對「單一風格」設計的產物，後續 07-16 改版為 style-a/b/c 三種視覺（見更早的更新
    `8176941`），style-a 勝出後定案的實際 HTML（`.food-header`/`.food-tag`/`.food-price`/
    `.food-body`/`.food-why`/`.spot-title`/`.sub-option-list` 等，全部 `.style-a-post` 作用域）
    與 `renderFood`/`renderSpot`/`renderGallery` 輸出的舊結構（`.food-item-title-row`/
    `.spot-card`/`.friendly-badge` 等）完全不同——這也是 `doc/card_dsl.md` 標註這三個家族
    「目前無文章使用」的原因。直接沿用會靜默改變 07-16 的實際版面，故新增一組平行家族，
    對應目前唯一在用的 style-a 結構；`food`/`spot`/`gallery` 三個舊家族原樣保留、未刪除
    （非本次變更範圍，是否清理留待未來評估——**後續**：連同 `triage`/`emergency` 一併於
    2026-07-25「文章視覺風格系統」重構時刪除，見下方第 25 點）。
    *   **`stop`（`.spot-section`）**：`level` 欄位（`diet`/`flat`/`slope`/`steps`）對應
        07-16 原始 4 種 h4 標籤 utility class 組合（逐字保留，非新設計）；`sub` 欄位為
        `子標題 | 內文`，內文可含原樣 HTML（`<br>`/`<em>`/`<a>`）。
    *   **`eat`（`.food-item`）**：`diet` 欄位逗號分隔；單一項目字尾加 `*` 觸發紅框警示樣式
        （`font-bold text-red-700 bg-red-50 border border-red-200`），用來逐字保留原始資料裡
        「需排隊!」在 30 筆中兩種並存寫法之一（多數是純 `.food-tag.diet` 樣式，僅
        London Bagel Museum 一筆是警示樣式）——這是原始內容既有的不一致，非本次引入。
        另新增可省的 `sigsep: half` 欄位：`<strong>招牌菜</strong>` 後的分隔符號 29 筆是全形
        「：」，僅 Osulloc Tea House 仁寺洞店一筆原始是半形「: 」，同樣逐字保留。
    *   **`quickjump`（`.editorial-quick-jump`）／`eatarea`（`.food-list-title`）**：分別對應
        07-16 僅出現 1 次與 6 次的簡單清單/標題列，欄位設計比照既有家族的 `key: value` 慣例。
    *   **`scripts/verify-card-dsl.mjs` 泛化**：原本硬編 07-13 的改寫前備份路徑（一個已不存在
        的 session 暫存檔，腳本其實已不可執行），改為吃 2 個必填 CLI 參數（備份路徑／文章
        路徑），本次與未來改寫其他文章皆可重複使用；本次驗證：`node scripts/verify-card-dsl.mjs
        <scratchpad 備份> src/posts/2026-07-16-韓國首爾旅行.md` 正規化後 0 diff，
        `npm run build` 通過。

25. **文章視覺風格系統：`style` front matter ＋ `assets/post-styles/`（2026-07-25）**：
    07-16 手寫的整篇 `<div class="style-a-post">` wrapper 是全站唯一一處「用 HTML 硬包版型」
    的做法，違反「結構只有一份 canonical 版本、風格差異只收斂到 CSS」的設計原則（見第 12 點）。
    新機制：front matter 加 `style: <名稱>` 欄位 → `scripts/generate-posts-metadata.js`
    原樣寫入 `posts.json` → `posts/detail.html` 在 `marked.parse()` 寫入 `innerHTML` 的同一個
    tick 內 `contentContainer.classList.add('post-style-' + post.style)`，無 FOUC、不用手寫
    wrapper。風格 CSS 放 `assets/post-styles/<名稱>.css`，整份 scope 在 `.post-style-<名稱>`
    下，由 `assets/tailwind.css` `@import` 進來。07-16 的 `.style-a-post` 整段改名搬進
    `assets/post-styles/editorial-card.css`，front matter 加 `style: editorial-card`。
    *   **`@import` 位置陷阱（2026-07-26 已解除）**：本點原文記錄的是「必須放
        `assets/tailwind.css` 檔案最末行，不可放元件區中間，否則風格規則排到元件 CSS
        之前、build 不會報錯但靜默覆寫失敗」的踩坑經驗。第一部分第 27 點的 cascade layer
        重構後，`@import "./post-styles/editorial-card.css" layer(post-styles);` 用
        `layer(post-styles)` 明確宣告所屬層，覆寫順序改由檔首的 `@layer` 順序宣告決定，
        與這行 `@import` **物理上寫在檔案哪個位置無關**——原本「唯一的踩坑點」已不成立，
        但仍維持放在檔尾的慣例以維持可讀性（風格覆寫本來就該讀在元件定義之後）。
    *   **為何仍是單一 CSS bundle、不做動態 `<link>` 分離**：`vite.config.js` 的
        `swPrecachePlugin` 用 `files.find(f => f.endsWith('.css'))` 只抓第一個 CSS 檔寫進
        PWA 預快取清單——多 CSS 輸出會讓預快取抓錯檔案，是現行 plugin 程式碼的硬性前提，
        不是「圖方便」的簡化選擇。
    *   **跨文章共用的前提**：`.post-style-<name>` scoping 天生支援多篇 front matter 填同一個
        值，但風格檔的選擇器綁定特定 DSL 家族（`editorial-card.css` 綁定 `quickjump`/`stop`/
        `eat`/`eatarea`，如 `.spot-title`/`.food-item`/`.food-list-title`）——第二篇想套用
        同一風格的文章，必須使用同一組家族的 class 結構才會生效，此限制已寫進
        `doc/card_dsl.md`「文章視覺風格系統」一節與 `doc/style.md` B8。
    *   **一併清理的死代碼**：`food`/`spot`/`gallery`/`triage`/`emergency` 5 個從未被
        `src/posts/` 任何文章使用的舊 DSL 家族（連同其約 65 處孤兒 CSS 選擇器）、
        `.style-b-post`/`.style-c-post` 死樣式、以及唯一還在引用它們的 4 個
        `template_posts/*.md` 草稿檔，一併移除；`.food-item`/`.food-actions`/`.spot-title`/
        `.stars`/`.em-tag`/`.badge-*`/`.cat-*` 因仍被 `eat`/`stop`/`accordion` 等保留家族
        使用，逐條核對後保留基礎規則。
    *   **`initTOC()` 過濾條件不變**：`assets/scripts.js` 裡「父層剛好是 contentContainer
        的直接子節點」這條深度放行規則，原本的註解把前提寫死成「style-a/b/c 會包一層
        wrapper」，遷移後這個 wrapper 已消失，但**過濾邏輯本身不能收緊**——07-13 的
        `<div class="alert-box"><h3 class="alert-box-title">` 仍需要同一條放行規則（h3 是
        孫節點）。只更新了註解說明，過濾條件的程式碼逐字未動。

26. **`eat`／`eatarea` 廢 fence 改純 Markdown，`stop`／`accordion`／`quickjump` 保留 fence
    （2026-07-26）**：延續第 24/25 點的卡片 DSL 路線再往前一步——原本規劃是「fence 留著，
    但欄位值支援 `parseInline()`」（`plan.md` 稱為讀法 A，即 2026-07-25 稽核工具鎖定的
    Phase 2–5 路線）；後改判讀法 B 才是使用者真正要的目標：`` ```eat `` 加 `key: value`
    這個寫法本身就不是 Markdown，欄位值能不能解析不是重點，**整個 fence DSL 才是格式不
    統一的根源**。完整分析與判準見 `plan.md`，此處只記錄程式碼落地的部分：
    *   **設計核心是「形狀判斷」取代「位置順序」**：一段內容是不是美食卡的 meta 標籤列，
        看它「是不是只由 code span 組成」，不看它是文章的第幾段——換順序不會錯位，也不需要
        每個欄位都寫齊。新增 `assets/markdown-sections.js`，用 marked v12 的
        `hooks.processAllTokens` 在 **token 陣列**（非渲染後 HTML）上重組，不受標籤巢狀/
        屬性引號影響，Node／瀏覽器共用（與 `markdown-cards.js` 同一套慣例）。
    *   **觸發條件（雙重，防誤判一般 h4）**：`####` 內容是單一連結，且緊接著的段落只由
        code span 組成，兩者同時成立才收合成美食卡；已用反向測試（一般 h4、h4 是連結但下段
        不是 code span）確認不會誤觸。
    *   **`eatarea` 完全不需要轉換層程式碼**——檢查才發現 `assets/post-styles/
        editorial-card.css:49-53` 早就把 `.food-list-title` 設計成與純 `<h3>` 同字級/留白/
        不加底線（2026-07-21 標題階層整併的既有決定），且 `initTOC()`（`assets/scripts.js:474`）
        的 TOC 篩選只看 DOM 深度不看 class，兩種寫法在 TOC 裡行為完全一致。07-16 現有 6 個
        `eatarea` 標題其實已有 5 個是純 `### [名稱](url)`，只剩 1 個仍是 fence——直接改寫
        內容即可，不必幫它另外設計形狀約定。
    *   **範圍收斂決策**：`stop`（4 種顏色徽章）、`accordion`（`<details>` 摺疊＋5 種分類色）、
        `quickjump`（全站僅 1 處的客製版型）三者都歸類為「帶顏色變體或只出現一次」，決策
        保留 fence，不追加形狀判斷——目標是「作者寫作時 95% 時間在寫純 Markdown」，不是
        「fence 歸零」。`compare`/`info`/`prep`/`apps`/`stepper`（07-13 使用）尚未逐一評估，
        留待下一階段。
    *   **真實資料暴露的成本**：07-16 的 30 個 `naver`/`kakao` 網址裡有 13 個含空格（韓文
        店名＋分店名），標準 Markdown 連結語法會在空格處斷掉。解法是 CommonMark 角括號語法
        `[文字](<含空格的網址>)`，`href` 輸出與 fence 版逐字相同（轉換層直接讀 token 原始
        `href`，不做 encode）。這是純 Markdown 路線的第一個真實成本，需要作者記住。
    *   **接線與遷移**：`registerSectionExtensions` 接進 `assets/scripts.js`／
        `scripts/generate-posts-metadata.js`／`scripts/verify-post-render.mjs` 三處（與
        `registerCardExtensions` 相同接線點，缺一處會出現「瀏覽器正常但閱讀時間算錯」或
        「驗證失真」）。07-16 全部 30 個 `eat` fence ＋ 1 個 `eatarea` fence 改寫為純
        Markdown。`node scripts/verify-post-render.mjs` 顯示 2 處已知差異，皆非本次引入的
        新問題：`eat.why` 裡 `O'sulloc` 的 `'`→`&#39;`（2026-07-25 稽核已知）、`eatarea`
        少了 `food-list-title`／`no-underline text-inherit` 兩個 class（視覺與 TOC 行為皆
        由上述 CSS／JS 分析證實不受影響）。headless Chromium 截圖複驗：30 張 `.food-item`
        正常渲染、無 console error、視覺與 TOC 一致。`CACHE_NAME` 升至 `clean-blog-v56`。

27. **Cascade layer 重構，`.toc-fab` 的 `@media` hack 走入歷史（`doc/archive/suggestion.md`
    R2/S2 第 2 步，2026-07-26）**：第一部分第 21 點記錄的「未分層樣式優先序恆高於任何
    `@layer`」問題，原本只在 `.toc-fab` 單點用 `@media` 手動關閉解決，未推廣成通則——
    `doc/archive/suggestion.md` 指出第 2 個風格檔遲早會再踩一次同樣的坑。
    *   **做法**：`assets/tailwind.css` 檔案最頂（`@import "tailwindcss"` 之前）新增
        `@layer theme, base, components, utilities, prose, post-styles;` 明確宣告全站層
        順序——CSS 規範裡「哪個 `@layer` 名稱先被提及」決定層優先序，不是宣告語句寫在
        檔案哪個位置，故必須搶在 Tailwind 自己內部的 `@layer theme, base, components,
        utilities;` 之前出現，才能讓 `prose`／`post-styles` 排在其後而非被忽略。原本大段
        未分層的「UI Components」區塊（約 758 行）整段包進 `@layer components { … }`；
        `assets/post-styles/editorial-card.css` 的 `@import` 改為
        `@import "..." layer(post-styles);`（細節見第一部分第 25 點該小節的更新）。
    *   **`.toc-fab` hack 移除**：`.toc-fab` 現在屬於 `@layer components`，排在
        `@layer utilities` 之前，`scripts.js` 掛的 `xl:hidden` utility 能正常靠層順序覆寫，
        不再需要額外寫 `@media (min-width: 80rem) { .toc-fab { display: none } }`——原本
        `doc/archive/suggestion.md` 就指出這是這次重構會連帶解掉的副作用。
    *   **驗證**：`npm run build` 通過；`node scripts/verify-post-render.mjs` 3 篇文章 0 diff
        （純 CSS 變更、不影響渲染出的 HTML）；額外用 playwright-core 起 headless Chromium
        對 `.toc-fab` 在 1400px／390px 兩種寬度量測 `getComputedStyle(...).display`，
        分別為 `none`／`flex`，確認拿掉手動 hack 後行為不變；07-16 三種地形徽章
        （`.food-tag.level-flat/slope/steps`）底色仍各自不同，未被此次重構重新吃掉；
        對首頁／文章目錄／關於／聯絡／三篇文章共 6 個頁面做 console error 掃描與
        `.btn-primary` 顏色抽查，全數正常、零 console error。使用者本人瀏覽器確認無誤後，
        已於 commit `a63d5a0` 提交。
    *   **後續發現的回歸與修法（同日稍後）**：使用者回報 07-16「### [聖水潮流區美食]」這種
        「純連結標題」重新出現底線＋超連結藍字樣式，這是本點重構漏考慮的真實 bug，不是
        誤報。根因：`assets/tailwind.css` 裡「07-21 雜誌感基礎排版」那段自訂的 `.prose`
        覆寫規則（`.prose h1 a`~`h4 a { text-decoration: none }`、`.prose blockquote`
        拿掉斜體、表格邊框等，見第一部分第 17 點）連同「UI Components」一起被包進
        `@layer components`；但 `@tailwindcss/typography` 外掛自己的 `.prose` 預設樣式
        （連結底線、blockquote 斜體等）是 Tailwind 產生的 utility，也落在 `@layer
        utilities` 裡——`components` 排在 `utilities` 之前，於是外掛自己的預設值反而
        贏過這批客製覆寫，且不報錯，用 `dist/assets/*.css` 的 `@layer` byte offset 複驗
        確認（`.prose h3 a` 的自訂覆寫在 offset 16980，屬 `components`；外掛的
        `.prose :where(a){text-decoration:underline}` 在 offset 38201，屬 `utilities`，
        後者順序在後故贏）。**修法**：新增第 5 個層 `prose`，排在 `utilities` 之後、
        `post-styles` 之前；把 `.prose { … }` 到 `.prose hr { … }` 這整段（原本
        「07-21 雜誌感基礎排版」＋後續累加的所有 `.prose` 覆寫）從 `@layer components`
        移到獨立的 `@layer prose { … }`，讓它們對外掛預設值保持「一定贏」，同時
        `.toc-fab` 等真正的元件仍留在 `@layer components`（在 `utilities` 之前，讓
        `xl:hidden` 等 JS 掛的 utility 能正常覆寫它們，不受影響）。修復後複驗：
        `.prose h3 a` 的 `text-decoration` 為 `none`、顏色與標題本文相同（不再是連結藍），
        `.prose h2` 底線仍在（2px solid），`.prose blockquote` 仍是 `font-style: normal`
        的 pull-quote，`node scripts/verify-post-render.mjs` 3 篇文章 0 diff，對 6 個頁面
        重新掃描 console error 與 `.toc-fab` 顯示/隱藏，全數正常。
28. **`marked` 改由 npm 打包，收斂三處重複註冊為 `assets/create-marked.js`（
    `doc/archive/suggestion.md` R10/R13/S3，2026-07-26）**：`posts/detail.html` 原本用
    `<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js">` 載入瀏覽器端
    `marked`（吃 CDN latest，版本不受控），與 Node 端建置腳本鎖定的 `marked@^12.0.0`
    可能分裂；離線 PWA 若 CDN 請求失敗，文章會整個降級成純文字。
    *   **做法**：刪除 `posts/detail.html` 的 CDN `<script>`；新增 `assets/create-marked.js`
        匯出 `createMarked()`（`new Marked()` ＋ `registerCardExtensions`／
        `registerSectionExtensions`），取代原本 `assets/scripts.js`／
        `scripts/generate-posts-metadata.js`／`scripts/verify-post-render.mjs` 三處
        各自重複的「`new Marked()` + 兩次 register」樣板。`assets/scripts.js` 呼叫
        `createMarked()` 後把實例掛回 `window.marked`——`posts/detail.html` 內解析文章的
        那段是非 `type="module"` 的 inline `<script>`，無法用 `import` 拿到同一份實例，只能
        靠全域變數；`<script type="module" src="/assets/scripts.js">` 依 HTML 規範以
        defer 語意在 `DOMContentLoaded` 前執行完畢，故該 inline script 的事件處理常式觸發時
        `window.marked` 必然已就緒，時序與改動前（CDN `<script>` 先執行）等價。
    *   **驗證**：`npm run build` 通過（`marked` 現已隨 `scripts-*.js` bundle 一起打包，不再
        是獨立的第三方 `<script>` 標籤）；`node scripts/verify-post-render.mjs` 3 篇文章
        0 diff；playwright-core headless Chromium 開 `posts/detail.html` 實際頁面確認
        `window.marked.parse` 可用、文章內容正常渲染、無 console error。

29. **OG meta／sitemap／robots.txt／自訂 404 頁：靜態爬蟲可見中繼資料方案（2026-07-26）**：
    延續架構審查待辦（見更新歷史），解決「社群分享看不到標題摘要封面圖」的問題。核心限制是
    GitHub Pages 只能靜態發檔，同一個 `detail.html` 不可能對不同 `?id=` query string 回傳不同
    `<head>`——爬蟲（LINE/FB/Twitter 不執行 JS）永遠只看到同一份預設空白值。
    *   **做法**：`vite.config.js` 新增 `generatePostPagesPlugin()`，在 build 的 `closeBundle`
        階段（此時 `dist/posts/detail.html` 已含 Vite 產生的雜湊化 CSS/JS 標籤）為每篇文章複製
        一份 `dist/posts/<id>.html`，並：(1) 注入該篇真實的 `<title>`／`<meta
        name="description">`／`og:*`／`twitter:card`／`<link rel="canonical">`；(2) 已知封面圖時
        直接改寫 header 的 `background-image` inline style（不必再等 `posts.json` fetch 完成）；
        (3) 在 `<body>` 開頭插入 `window.__PRESET_POST_ID__ = "<id>"`。`posts/detail.html` 原本
        讀 `?id=` 的邏輯改為 `params.get('id') || window.__PRESET_POST_ID__`，兩種入口共用完全
        相同的 client-side 渲染程式碼，行為零差異。
    *   **舊連結相容**：`detail.html?id=xxx` 完全沒被移除或改變行為，只是不再是「首選」連結格式
        （新增/內部連結一律改指向 `posts/<id>.html`，見下方 `postUrl()`）。
    *   **踩坑：字串比對目標抓錯建置後的產物**：第一版實作把 preset id 腳本插在
        `'<script type="module" src="/assets/scripts.js"></script>'` 這個「原始碼」字串後面，
        但 `generatePostPagesPlugin` 讀的是 **build 完成後** 的 `detail.html`，該標籤早被 Vite
        改寫成 `<script type="module" crossorigin src="/travel/assets/scripts-HASH.js">`，
        `String.replace` 找不到目標會靜默失敗（不報錯，只是什麼都沒插入）——實測結果是
        preset id 從未被寫入，`postId` 一律 `undefined`，文章頁 100% 導向 404。改成插在
        `<body>` 開頭（不依賴 Vite 產生的確切標籤字串）解決；`<title>` 與 header 的
        `background-image` 因為是純文字/內嵌樣式、不受 Vite 資產轉換影響，兩處字串比對本身沒問題。
    *   **文章連結網址統一收斂**：新增 `assets/scripts.js` → `postUrl(post, base)`，掛
        `window.postUrl` 供 `index.html`／`posts/index.html`／`posts/detail.html`（上下一篇導覽）
        三處原本各自手刻 `posts/detail.html?id=${post.id}&bg=...` 字串的地方改呼叫同一個函式，
        避免三處分別維護網址格式。
    *   **404**：新增根目錄 `404.html`（build 進入點，輸出至 `dist/404.html`，符合 GitHub Pages
        對自訂 404 頁的慣例路徑），套用現有 navbar/footer 與 `.btn-primary` 樣式。`detail.html`
        原本「缺 id／查無文章」時只在頁面內顯示紅字（HTTP 仍是 200）的行為，改為
        `window.location.replace(base + '404.html')`——**注意這仍是 client-side 導向，
        伺服器實際回應碼還是 200**，純靜態託管環境下無法做到真正的 HTTP 404 狀態碼，只能做到
        「使用者體感一致」。
    *   **sitemap／robots**：新增 `generateSeoFilesPlugin()`，build 後從 `dist/data/posts.json`
        讀取文章清單，產生 `dist/sitemap.xml`（首頁／文章目錄／聯絡頁＋每篇 `posts/<id>.html`）
        與 `dist/robots.txt`（`Allow: /` ＋指向 sitemap）。網域寫死為
        `https://lawrencechh.github.io/travel/`（兩個插件共用同一個 `SITE_URL` 常數）。
    *   **中文檔名／路徑需逐段 encode**：文章 id 與封面圖路徑常含中文（如
        `img/posts/三清洞.jpg`），`og:image` 等會被外部爬蟲的 HTTP client 讀取的 URL 一律逐段
        `encodeURIComponent`（保留 `/`）——瀏覽器對 CSS `url()` 內的未編碼中文較寬容，但不能
        假設所有爬蟲的 URL parser 一樣寬容。
    *   **驗證**：`npm run build` 通過；`node scripts/verify-post-render.mjs` 3 篇 0 diff；
        playwright-core 對 5 種情境（新版 `posts/<id>.html`、舊版
        `detail.html?id=`、缺 id、查無文章、直接開 `404.html`）逐一開真實頁面確認最終網址、
        `<title>`、`#post-title` 內容與 console error，首版因上述踩坑在「新版網址」情境誤導向
        404，修正後 5 種情境全數正確、零 console error；另外對首頁／文章目錄頁做過一次連結
        href 走查，確認清單連結已改指向新網址格式。

30. **lint／格式化工具與前端錯誤監控，兩者皆刻意做成低侵入（2026-07-26）**：
    *   **ESLint**：新增 `eslint.config.js`（flat config），`assets/**/*.js` 用
        `globals.browser`、`scripts/**/*.js` 與 `vite.config.js` 用 `globals.node`、
        `public/sw.js` 用 `globals.serviceworker`（Service Worker 全域變數 `self`/`caches`/
        `fetch` 與一般瀏覽器不同，需獨立宣告），並用 `eslint-config-prettier` 關掉會與
        Prettier 衝突的排版類規則。`.agents/`（gitignored 的工具目錄）與 `src/posts/`／
        `template_posts/`（文章內容非程式碼）排除在檢查範圍外。跑過一輪後修掉兩個真實的
        `no-unused-vars`（`generate-posts-metadata.js` 兩個 `catch (e)` 未使用 `e`，改用
        ES2019 optional catch binding `catch {}`），其餘全綠。
    *   **Prettier**：新增 `.prettierrc.json`（`singleQuote`／`printWidth: 120`）與
        `.prettierignore`。**刻意沒有對既有程式碼跑一次 `npm run format` 全庫格式化**——
        `prettier --check .` 顯示全站 25 個檔案風格不一致（含所有 `doc/` 文件與
        `doc/archive/`），一次性格式化改動面過大、且會直接違反 `CLAUDE.md` 對
        `doc/archive/` 的「凍結記錄、不可編輯」規則，故只加工具本身，全庫格式化留給日後
        自然發生（新增/編輯檔案時漸進套用）或使用者主動要求時再做。`.prettierignore` 已
        排除 `doc/archive/`／`assets/main.css`（未被引用的舊檔，`CLAUDE.md` 明列不應編輯）／
        `src/posts/`／`public/data`／`package-lock.json`。
    *   **前端錯誤監控**：`assets/scripts.js` 新增 `ERROR_WEBHOOK_URL` 常數（**預設空字串，
        不會發出任何網路請求**）與 `reportError()`，掛上 `window.addEventListener('error', …)`／
        `('unhandledrejection', …)`。留空的原因是 Sentry／自架 webhook 兩個選項都需要使用者
        自己申請帳號或準備接收端點（如仿照 `contact.html` 既有的 Google Apps Script 表單模式
        自建一個），無法在這次改動裡代為決定或建立；程式碼已就緒，之後只需把常數換成實際
        URL 即可啟用，格式為 POST 一個 JSON body（`type`／`message`／`source`／`lineno`／
        `colno`／`stack`／`url`／`ua`／`ts`）。
    *   **驗證**：`npm run lint` 全綠；`npm run build`／`node scripts/verify-post-render.mjs`
        3 篇 0 diff（僅新增程式碼路徑，未變更既有渲染邏輯）。

31. **中文襯線字體自架，解決跨裝置一致性（2026-07-26，待辦事項落地）**：
    *   **問題**：`--font-serif` 字型堆疊雖列了 `"Noto Serif TC"`，但站內從未提供對應
        `@font-face`，該名稱能生效全靠訪客裝置本身裝有系統內建中文襯線字型（macOS
        Songti TC、Windows 新細明體）；多數 Android 裝置無此類系統字型，會直接跳過落到
        堆疊末端的無襯線 fallback，導致「編輯雜誌感」標題只在部分裝置上生效。
    *   **做法**：不採常規流程（下載完整 Noto Serif TC 字型檔＋本機用 `fonttools`/
        `pyftsubset` 手動 subset），改用 Google Fonts CSS2 API 的 `&text=` 參數做**伺服器端**
        字元級 subsetting——事先寫一支一次性腳本，重用 `assets/create-marked.js` 的
        `createMarked()`（與 `scripts/verify-post-render.mjs` 同一套渲染管線）把
        `src/posts/` 全部文章渲染成 HTML，加上各篇 front matter 的 `title`/`subtitle`、
        以及 `index.html`/`contact.html`/`404.html`/`posts/index.html` 等靜態頁的
        hero 標題，掃出所有會落在 `font-serif` 標題情境（`h1`-`h3`、`h4.food-name`、
        `blockquote`、`.spot-title`、`.food-list-title`、`.alert-box-title`、
        `.fold > summary`）裡的文字，取聯集得到 469 個實際會用到的中文字+標點。以
        `https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&text=<這
        469 字>` 換回的 CSS 只含一組 `unicode-range`，且 400/700 兩個 `@font-face` 指向
        **同一個** `kit=` URL——證實 Google 回傳的是保留 `wght` 變化軸的可變字重字型（如
        Inter 現行做法），故只需下載一份 woff2（208KB）即可涵蓋两个字重，不必比照 Lora
        分兩個靜態檔案。下載後存為 `assets/fonts/noto-serif-tc-var.woff2`，在
        `assets/tailwind.css` 新增兩組 `@font-face`（`font-weight: 400`／`700`，皆帶上
        Google 回傳的 `unicode-range`），`--font-serif` 堆疊本身不需要改動（`"Noto Serif
        TC"` 名稱已經在裡面，先前只是缺對應字型檔生效不了）。字集外字元會自動 fallback
        到堆疊下一位（`Songti TC` / 系統 serif），未來新增文章用到字集外的字才需要重跑
        一次同樣流程（一次性腳本未進版控，操作步驟已整理成可重複執行的維護流程，見
        「如何新增與編輯內容」第 3 節）。
    *   **PWA 快取**：`sw.js` 的 precache 清單／`CACHE_NAME` 不需要手動改動——新字型檔會被
        Vite 打包進 `dist/assets/` 並帶內容雜湊，`sw.js` 的 `isStaticAsset` 本來就對
        `/assets/`／`/fonts/` 做 cache-first（見 `public/sw.js` fetch handler），而
        `swPrecachePlugin` 的 `CACHE_NAME` 雜湊來源包含 CSS 檔名（見第一部分第 29 點
        S13），新增字型會讓 `tailwind.css` 內容變動、連帶讓打包後 CSS 檔名雜湊改變，
        `CACHE_NAME` 自動跟著換版，訪客會拿到新字型，此點待辦原文提到的「更新 sw.js 的
        precache 清單」已因 S13 自動化而不需要手動處理。
    *   **驗證**：`npm run build` 通過，`dist/assets/noto-serif-tc-var-*.woff2`
        （208.46 kB）與更新後的 `CACHE_NAME` 皆正確產生；`node
        scripts/verify-post-render.mjs` 3 篇 0 diff（只新增字型與 CSS，未動渲染邏輯）；
        `npm run lint` 全綠。**未涵蓋**：實機跨裝置（尤其 Android）目視驗證留待使用者
        自行確認，此環境無法操作真實手機瀏覽器。

## GitHub Pages 部署設定指引

由於本專案採用自訂的 GitHub Actions 工作流（監聽 `main` 工作分支）來建置並部署至 GitHub Pages，若遇到 `Branch "main" is not allowed to deploy to github-pages due to environment protection rules` 錯誤，請前往 GitHub 儲存庫網頁端進行以下兩項設定：

### 1. 切換 Pages 部署來源為 GitHub Actions
1. 進入 GitHub 專案網頁，點選 **Settings** (設定) 頁籤。
2. 在左側選單點選 **Pages**。
3. 尋找 **Build and deployment** -> **Source**，將下拉選單從 `Deploy from a branch` 切換成 **`GitHub Actions`**。

### 2. 設定 Environment 允許非預設分支部署
當 GitHub 儲存庫的預設分支（Default branch）為 `master`，但您的開發/部署工作分支為 `main` 時，GitHub Pages 預設的環境保護規則會阻擋非預設分支的部署。
1. 在專案 **Settings** 頁面，點選左側選單的 **Environments**。
2. 點選進入 **`github-pages`** 環境設定。
3. 找到 **Deployment branches and tags** 區塊：
   * **選項 A（推薦）**：變更限制為 **All branches**，允許任何分支運行工作流進行部署。
   * **選項 B**：維持 **Selected branches**，但點選 **Add deployment branch rule**，手動輸入並新增 **`main`** 分支以授權其部署。

---

# 第二部分：更新歷史與待辦事項

> **維護規範**：每次修改程式碼後，在下方「更新歷史」新增一筆帶日期的記錄（維持「最新三筆完整記錄，其餘壓縮成一行」的格式——寫入新記錄時，把原本排第三新的那筆壓縮進下方清單，同時保留新記錄的完整說明）。若變更影響檔案結構或設計決策，也一併更新上方「第一部分」對應段落。完整規範見根目錄 `CLAUDE.md`。

## 待辦事項

### 架構審查待辦（2026-07-26 Agent 分析，SEO／可靠性）

以下是針對現有 Vite MPA 架構做的一次審查，非 `suggestion.md` 既有項目；不需要換框架，
皆可在現有架構內解決。SEO／社群分享中繼資料、`sitemap.xml`／`robots.txt`、自訂 404 頁、
lint/format 工具五項已完成（見第一部分第 29／30 點與下方更新歷史），以下只保留尚未動工的：

- [ ] **`innerHTML` 直接注入文章內容，未做 sanitize**（`posts/detail.html` 的
      `marked.parse()`／HTML 文章原樣注入）：目前內容皆為本人撰寫，風險為 0；但若未來
      任何非本人來源的內容（協作者、CMS、留言）要走同一條渲染路徑，需要先補
      `DOMPurify` 之類 sanitizer 再開放
- [ ] **無自動化單元測試**：`eslint`／`prettier` 已補上（見第一部分第 30 點），但仍只有
      `scripts/verify-post-render.mjs` 渲染回歸腳本（保護「渲染輸出沒有意外改變」，不保護
      一般邏輯正確性），無針對函式邏輯的單元測試。這個規模暫不需要上重量級測試框架
- [ ] **前端錯誤監控已埋點但預設關閉**：`assets/scripts.js` 的 `ERROR_WEBHOOK_URL` 常數留空，
      需要使用者自行決定並提供接收端點（Sentry DSN、Slack/Discord webhook，或仿
      `contact.html` 自建 Google Apps Script）才能真正啟用，見第一部分第 30 點

### `doc/archive/suggestion.md` 架構審查待辦（S1–S13）

以下摘自 `doc/archive/suggestion.md` 的 S1–S13，只登記追蹤；完整風險分析、程式碼位置與驗證
方式見該檔對應的 R／S 編號。S1、S2（兩步皆已完成，第 2 步的程式碼變更尚未 commit，待使用者
本人瀏覽器目視確認後自行提交）、S3、S4、S5、S6、S7 已完成，記錄見下方「更新歷史」，不再
重複列於待辦。

**觀察區，等特定時機再做**

- [ ] **S8（等第 2 個風格檔出現時）base／變體改用 CSS 變數**，取代目前「先歸零 base 再重畫」
      的寫法（`doc/archive/suggestion.md` R3/S8）
- [ ] **S9（等新增第 8 個 fence 家族／文章數 > 6／有第二位作者時）用單一容器語法**
      `:::name{key=value}` 收斂 7 個 fence 家族目前 4 種不同的內部語法
      （`doc/archive/suggestion.md` R9/S9）
- [ ] **S10 `verify-post-render.mjs` 改成 golden snapshot**：目前「只改 renderer 不改文章內容」
      時驗證是恆真的，測不出東西（`doc/archive/suggestion.md` R11/S10）
- [ ] **S11（實際踩到再做）給美食卡收合設一個保守邊界**：目前貪婪收到下一個 heading 為止，
      分區收尾段落可能被誤吸進「推薦理由」欄位（`doc/archive/suggestion.md` R7/S11）

## 更新歷史

最新三筆完整記錄如下；更早的記錄壓縮為一行摘要，列於其後。

### 2026-09-26 — 韓國支付教學文章新增 T-money 交通卡完整攻略區塊

* **範圍**：`src/posts/2026-07-20-韓國自由行支付教學.md` 新增「1.7 T-money 交通卡完整攻略」
  區塊與對應「2.5 關於 T-money 與 Apple Pay」Q&A，涵蓋：實體卡購買/價格/免證件、觀光客
  專用版本（M-pass／Korea Tour Card／Discover Seoul Pass）差異、儲值方式、WOWPASS 轉
  Tmoney 的「僅限本卡、無法代其他人的卡儲值」機制與 500 韓元手續費（2025-12-16起）、iOS
  Apple Pay Express Transit 搭車（2025-07-22 開通，需 iPhone Xs/XR+／iOS 17.2+）與虛擬卡
  加值路徑（Apple Wallet 內建加值僅認韓國現代卡；需改用 Mobile T-money App「外國人」入口
  以海外 Mastercard／Amex／UnionPay 加值，2026-03-19 起開放，Visa 尚不支援）、成本比較、
  信用卡選卡建議，文末附參考來源網址清單。
* **來源查證**：由一個 general-purpose 研究 agent 上網彙整初稿，本人（agent）再逐項用
  WebFetch 對關鍵事實（WOWPASS 僅限本卡機制、Apple Pay 開通日期與裝置需求、Apple Wallet
  現代卡限制、海外卡加值開放時間與支援卡別、信用卡回饋數字）做第一手覆核後才寫入文章，
  避免二手轉載失真；文中列出的來源網址均為實際查證過的頁面。
* **變更檔案**：`src/posts/2026-07-20-韓國自由行支付教學.md`、`doc/project.md`。
* **驗證**：`npm run build:metadata` 通過（純內容新增，未動渲染邏輯/DSL，不影響
  `verify-post-render.mjs` 涵蓋範圍）。

### 2026-09-25 — 重跑中文襯線字型 subset，修復新文章標題字型混搭

* **問題**：使用者回報文章詳情頁標題（如「首爾景點素材」）出現字型混搭外觀——同一標題內
  部分字元明顯與其他字元字重/字型不同。
* **根因**：`.post-heading h1` 走 `font-serif`，其自架 `Noto Serif TC` 是 2026-07-26 當下
  站內標題實際用字的 469 字 subset（見第一部分第 3 節）；`src/posts/2026-09-12-首爾景點
  素材.md` 標題「首爾景點**素材**」的「素」（U+7D20）「材」（U+6750）不在該字集內，這兩字
  即時 fallback 到字型堆疊下一位（系統 serif），與同標題其餘吃到自架字型的字元視覺不一致。
* **做法**：依第一部分第 3 節既定流程重跑——用 `createMarked()` 重新渲染 `src/posts/` 全部
  5 篇文章＋4 個靜態頁 hero 標題，掃出目前全部 `font-serif` 場景（`h1`-`h3`／`subtitle`／
  front matter `title`／`h4.food-name`／`h4.spot-title`／`blockquote`）實際用字，取聯集後
  得 571 字（469 字集之後新增的 3 篇文章用字），呼叫 Google Fonts CSS2 API 重新 subset，
  覆蓋 `assets/fonts/noto-serif-tc-var.woff2`（208KB→251KB）與 `assets/tailwind.css` 兩組
  `@font-face` 的 `unicode-range`。
* **驗證**：`npm run build` 通過（`swPrecachePlugin` 自動因字型檔雜湊改變而更新
  `CACHE_NAME`，無需手動 bump）；`node scripts/verify-post-render.mjs` 5 篇 0 diff（只換字型
  檔與 CSS，未動渲染邏輯或文章內容）。

### 2026-09-25 — 修正快取防刷與 Service Worker CACHE_NAME 雜湊範圍，並修復 dev server 文章路由轉發

* **範圍**：
  1. **快取防刷與 CACHE_NAME 自動化擴充**：修復 GitHub Pages 部署後因瀏覽器快取或 Service Worker 舊版本導致文章未及時更新的問題。原先 `vite.config.js` 的 `swPrecachePlugin` 僅雜湊 CSS/JS 與 `public/img/`，當僅修改 `src/posts/*.md` 或 `posts.json` 時 `CACHE_NAME` 不變；現將 `src/posts/` 與 `public/data/posts.json` 一併納入雜湊計算，並在 `index.html`、`posts/index.html`、`posts/detail.html` 的 fetch 加入 `{ cache: 'no-cache' }` 避免被 GitHub Pages 預設 `max-age=600` 攔截。
  2. **dev server 文章路由轉發**：修復 `npm run dev` 下點擊文章靜態連結被導回首頁的問題，於 `vite.config.js` 的 `generatePostPagesPlugin` 補上 `configureServer` 中間件將 `/posts/<id>.html` 轉發至 `posts/detail.html`，並支援由檔名自動補齊文章標題與日期。
* **變更檔案**：`vite.config.js`、`index.html`、`posts/index.html`、`posts/detail.html`、`doc/project.md`。
* **驗證**：`npm run build` 通過，`dist/sw.js` 正確產出新版 `CACHE_NAME (clean-blog-699fafa3)`；`npm run lint` 全綠；`node scripts/verify-post-render.mjs` 5 篇 0 diff。

### 2026-09-09 — 整合 5天4夜新首爾行程手帳，封存 07-16 舊計畫

* **範圍**：依據 `doc_template/travel-itinerary-editorial-card.md`（07-16 抽取架構），整合最新航班（真航空 LJ734 去、大韓航空 KE2027 回）與新首爾飯店 5天4夜行程（含鷺梁津水產市場、現代百貨/星空圖書館、汝矣島漢江夜遊、南怡島/小法國村/江村鐵道自行車近郊包車、首爾塔/弘大備選等），舊計畫未包含之行程與分區美食皆依指示留標題並註記「內容待補」。
* **變更檔案**：
  - `src/posts/2026-09-09-首爾秋日漫遊手帳.md`：建立 5天4夜新旅遊計畫文章。
  - `archive/2026-07-16-首爾秋日漫遊手帳.md`：建立 `archive/` 目錄並將舊 4天3夜文章歸檔封存。
  - `public/data/posts.json`：更新文章索引，將 09-09 新文章置頂並移除已封存之 07-16 文章。
* **驗證**：索引檔 `posts.json` 格式正確，現役文章數維持 3 篇；`archive/` 目錄與新文章皆完成版控追蹤。

### 更早的更新（壓縮摘要，新到舊）

- **2026-09-09（5天4夜新首爾行程手帳）**：整合最新航班與新首爾飯店 5天4夜行程，舊 4天3夜
  計畫封存至 `archive/`。
- **2026-07-26（`doc_template/` 模板）**：把 07-16 文章架構抽成 `doc_template/travel-itinerary-editorial-card.md`「先寫架構、後填內容」模板，只適合多天行程＋景點分段＋分區美食類遊記。
- **2026-07-26（中文襯線字體自架）**：以 Google Fonts CSS2 API subsetting（469 字，2026-09-25 已重跑擴增至 571 字）自架 Noto Serif TC 可變字重 woff2 字型，解決 Android/跨裝置中文襯線字體一致性；PWA 快取由 S13 自動化接手。
- **2026-07-26（S12/S13 落地與標題收斂）**：美食卡店名改為 `<h4>`（無障礙優化，新增
  `.prose h4.food-name` 解決 cascade layer 覆蓋問題）；`sw.js` 的 `CACHE_NAME` 改由 build
  時依 CSS/JS 雜湊＋`public/img/` 全量內容自動計算，終結手動 bump 快取版本需求；07-20
  「其他實用功能」泛稱標題併入「額度限制」，收斂 heading 階層。
- **2026-07-26**：修正 dev server 下 `index.html`／`posts/index.html`／`posts/detail.html`／
  `404.html`／`contact.html` 五個檔案的 manifest／icon 連結因原始碼已含 `/travel/` base
  前綴、又被 dev server 疊加一次 base，變成 `/travel/travel/...` 404（production build 不
  受影響）；改回不含前綴的 `/manifest.json` 等路徑，讓 Vite 統一套用 base 設定。
- **2026-07-26（SEO 架構審查落地）**：新增 OG meta／`sitemap.xml`／`robots.txt`／自訂 404
  頁（`generatePostPagesPlugin`／`generateSeoFilesPlugin`／`postUrl()`）、`eslint`／
  `prettier` 工具、`ERROR_WEBHOOK_URL` 前端錯誤監控埋點（預設關閉），完整設計決策見第一
  部分第 29／30 點。
- **2026-07-26（待辦清理）**：`package.json`／`package-lock.json` 元數據改為專案實際值
  （取代 Jekyll 主題殘留值）；移除未完成的孤兒頁面 `about.html` 及其建置進入點/圖片；移除
  `assets/scripts.js` 已無觸發來源的漢堡選單死程式碼 `toggleNav()`（`CACHE_NAME` 升至
  `clean-blog-v60`）。
- **2026-07-26**：修正 cascade layer 重構（S2 第 2 步，`a63d5a0`）的回歸——`.prose` 自訂覆寫
  規則誤收進 `@layer components`，被排序在後的 `@tailwindcss/typography` 外掛預設樣式蓋過，
  導致 07-16「純連結標題」重新出現底線＋藍字；新增獨立的 `@layer prose`（層順序
  `theme, base, components, utilities, prose, post-styles`）修復，完整根因見第一部分第 27
  點「後續發現的回歸與修法」。
- **2026-07-26（架構審查待辦 S1–S7 落地）**：S1 補齊 DSL base CSS＋S2-1 修 `stop` 徽章顏色
  bug、S2 cascade layer 重構（`@layer theme, base, components, utilities, post-styles`，
  移除 `.toc-fab` 的 `@media` hack；commit `a63d5a0` 後發現的回歸修法見上方完整記錄）、S3
  `marked` 改由 npm 打包取代 CDN、S4 `style` front matter 值加驗證、S5 CI 補
  `fetch-depth: 0`＋渲染回歸驗證步驟、S6 收緊 `appList` 觸發形狀、S7 修正 `style.md` 三處
  過期敘述；另外做了 07-16 行動版重複摘要區塊去重（非 S 編號）。同批也完成文件一致性整理
  （`plan.md`／`report.md`／`suggestion.md` 移入新增的 `doc/archive/`，S1–S13 摺成待辦
  清單）、待辦清單清理（移除已完成項目、發現 Formspree／manifest email 佔位字串兩項待辦
  其實是 `contact.html` 早改用 Google Apps Script 後的舊 code 殘留，一併移除）、新增 SEO／
  可靠性架構審查待辦清單（後於同日稍晚的完整記錄中落地五項）。
- **2026-07-25～07-26（卡片 DSL 全面 Markdown 化，CACHE_NAME v55→v59）**：`style` front
  matter＋`assets/post-styles/` 取代手寫 `.style-a-post` wrapper，刪除 5 個孤兒 DSL 家族
  （`food`/`spot`/`gallery`/`triage`/`emergency`）；`quickjump`/`stop`/`eat`/`eatarea` 四
  家族改用 fenced block 取代手寫 HTML，其中 `eat`/`eatarea`/`apps` 進一步廢除 fence、改依
  內容形狀用純 Markdown 判斷渲染（新增 `assets/markdown-sections.js`），`compare`/`info`/
  `prep`/`stepper` 因語意需要（二元色條判斷／與段落撞形狀／需要群組容器）決策保留 fence；
  `doc/card_dsl.md` 改寫為寫作手冊，移除孤兒 renderer 與失效稽核工具。
- **2026-07-21（標題系統定案）**：`.prose` 內化 07-16 雜誌感標題階層；`border-bottom` 規則
  歷經「條件式 `:has()`」（07-20 六個 `##` 有四個忽有忽無、讀者猜不到規律）被推翻，最終定案
  「只有 `h2` 固定底線、無條件套用」；`h3` 視覺記號（字符／左側色條）評估後皆否決，改採
  **減少標題數量**處理密集區，寫入 `doc/doc_style.md`（新增標題階層與 `---` 用法守則）與
  `style.md` A13/A14；`.style-a-post` 自成一格的標題音階併回全站 `.prose`（見第一部分第
  17–20 點）。同日另完成：文章 banner 改連結傳遞 `&bg=` query string 消除切換閃圖、TOC 側
  欄／桌機 FAB／上下篇導覽三處 UI 調整、`contact.html` 風格對齊全站、修正裸網址撐破手機版面
  （CACHE_NAME 升至 v53）。
- **2026-07-22～07-14**：07-22 修正首頁/聯絡頁背景圖換版未生效（漏 bump `CACHE_NAME`，
  v54）；07-17 修正 TOC 圓球未渲染與 Naver/Kakao 空格網址（v48）、style-a 美食分隔線定案
  （v47）；07-16 景點快速跳轉重構為時間軸面板、`stepper` 納入卡片 DSL（v33/v46）；07-15
  新增 `assets/markdown-cards.js`（8 家族卡片 DSL 取代手寫 HTML，v26）、`info-card` 家族、
  提示框收斂 warning/note 兩級、首爾文章拆分兩篇並視覺重整（v27–v32）；07-14 首爾文章移植
  `travel_guide` 卡片式排版並重構為「行程優先」結構、新增行動版章節分頁列、修正 TOC 誤收與
  桌機側欄捲動細節；07-13 修正 TOC 側欄初始遮擋 Banner 問題。
- **2026-07-11～07-12**：自 Jekyll 遷移至 Vite + Tailwind CSS v4 純前端 MPA 架構（方案
  A），介面中文化、字型與導覽列簡化、雙頁面 JS 前端分頁；隨後完成 TOC 元件初版（桌機側欄＋
  手機 Bottom Sheet scroll-spy）、目錄頁 RWD 重構、開發模式文章自動監聽插件。
- 2026-07-10：記錄 GitHub Pages 工作流，建置並推送重構版本 (e5be734)
