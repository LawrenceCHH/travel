# 專案快照 (Vite + Tailwind CSS v4 純前端架構)

此專案已於 2026-07-11 從 Jekyll 遷移至基於 **Vite** 與 **Tailwind CSS v4** 的純前端 MPA（多頁面應用）靜態架構。所有頁面的共用 Layout 載入、文章目錄搜尋與篩選、以及 Markdown 文章解析渲染，皆直接於瀏覽器端完成，徹底擺脫了對 Ruby、Jekyll 與 Gem 的依賴。

本檔案分兩部分：**第一部分**是給 Agent／開發者的架構與參考資訊（技術棧、指令、目錄結構、功能對應程式碼、關鍵設計決策），**第二部分**是更新歷史與待辦事項。安裝/建置/部署指令另見 [`../README.md`](../README.md)；全站視覺與互動風格的系統化分析（抽象設計準則＋具體元件規格）見 [`./style.md`](./style.md)；Markdown 裝飾元件的語意化命名與重複使用指引見 [`./markdown_decorations_design.md`](./markdown_decorations_design.md)；**只有在新增/編輯文章時**才需要參考的標題階層與 `---` 分隔線用法守則見 [`./doc_style.md`](./doc_style.md)。

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
2. **升級 SW 快取名稱**：編輯 [`public/sw.js`](../public/sw.js)，將頂部的 `CACHE_NAME` 遞增版本（如 `'clean-blog-v49'` → `'clean-blog-v50'`），促使瀏覽器下載新 SW 並自動清理舊 Cache Storage。
3. **建置正式資源與複製文章**：執行 `npm run build`。此步驟會自動執行 `build:metadata`、將文章原檔複製至 `dist/src/posts/`，並透過 `swPrecachePlugin` 將帶雜湊碼的最新 CSS/JS 與預快取清單寫入 `dist/sw.js`。
4. **客戶端除錯刷新**：開發或測試時，可開啟瀏覽器 DevTools (F12) → Application → Service Workers 勾選 *Update on reload* / 點擊 *Unregister*，或以 `Ctrl+F5` / `Cmd+Shift+R` 強制刷新。

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
   - **生產環境與預覽**：新增文章後必須升級 `public/sw.js` 的 `CACHE_NAME`（如 `v50`），並執行 `npm run build` 以同步更新 `dist/data/posts.json` 與 `dist/src/posts/` 文章資源，否則瀏覽器會被 Service Worker 快取的舊索引擋住。

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

## 功能 → 程式碼速查

給 Agent 快速定位「要改這個功能該碰哪個檔案」：

| 功能 | 主要檔案 / 進入點 |
| --- | --- |
| 首頁／目錄頁前端分頁與標籤篩選、搜尋 | `assets/scripts.js` → `initPagination()`；資料來源 `public/data/posts.json` |
| 文章 metadata 產生（字數／閱讀時間） | `scripts/generate-posts-metadata.js` → 產出 `public/data/posts.json` |
| 文章內頁渲染（Markdown/HTML 解析、上一篇/下一篇導航） | `posts/detail.html` + `assets/scripts.js` |
| 文章大綱 TOC（桌機側欄／手機 Bottom Sheet／已停用的行動版章節分頁列） | `assets/scripts.js` → `initTOC()`；`ENABLE_CHAPTER_BAR` 旗標控制分頁列是否顯示 |
| 卡片 DSL（```food/spot/compare/info/gallery/prep/apps/triage/emergency/stepper 資料區塊） | `assets/markdown-cards.js`（渲染邏輯）／`assets/scripts.js` 檔頭（`registerCardExtensions` 接線）／`scripts/verify-card-dsl.mjs`（Node 端 0-diff 驗證腳本） |
| 卡片視覺樣式（`.food-item`／`.spot-card`／`.compare-card`／`.info-card`／`.stepper`／`.app-card`／`.emergency-card`／`.alert-box` 等） | `assets/tailwind.css` 的 `@layer components` |
| 色彩／字型設計 Token | `assets/tailwind.css` 的 `@theme` |
| 導覽列／頁尾動態載入 | `assets/scripts.js` 尾端 fetch 邏輯 + `public/components/navbar.html`／`footer.html` |
| PWA 快取與雜湊防刷 | `public/sw.js`（`CACHE_NAME`，每次改動快取資產需 +1）＋ `vite.config.js` 的 `swPrecachePlugin`（快取更新說明見第一部分 `### 5`） |
| 開發模式文章監聽熱重載 | `vite.config.js` 的 `watchPostsMetadataPlugin` |
| 建置/部署 CI | `.github/workflows/pages.yml` |

## 專案目錄結構對照表

```
.github/workflows/pages.yml   CI/CD 部署設定，使用 Node/Vite 環境建置，部署 dist 到 Pages
assets/
  tailwind.css                 Tailwind v4 CSS 原始碼（定義主題 Tokens 與自訂組件）
  scripts.js                   通用 JS，含雙頁面分頁 (initPagination)、文章大綱 (initTOC)、元件動態載入與 PWA 註冊
  markdown-cards.js            Card DSL：marked block 擴充 registerCardExtensions()，把 ```food/spot/compare/
                                info/gallery/prep/apps/triage/emergency/stepper 資料區塊逐字還原成卡片 HTML
                                （純字串邏輯，可在 Node 與瀏覽器共用），由 scripts.js 最上方在 window.marked 上註冊
  fonts/                       自我託管的 Lora + Open Sans 字型 (woff2)
public/
  components/                  共用佈局元件
    navbar.html                動態載入的導覽列（文字 wordmark Logo + 目錄連結）
    footer.html                動態載入的頁尾
  data/
    posts.json                 由 scripts 自動生成的文章索引元資料檔（已被 gitignore）
  img/                         圖片資源（首頁背景、文章背景、PWA 圖示等）
  manifest.json                PWA 應用設定檔，設定 Base URL 為 /travel/
  sw.js                        PWA Service Worker 快取腳本，打包時由 Vite 插件填入雜湊資源檔名
src/
  posts/                       存放所有文章原始檔（.md 或 .html）的目錄，供前端 Fetch 讀取
scripts/
  generate-posts-metadata.js   Node.js 腳本，用以提取文章 Front matter、計算閱讀時間並產出 posts.json
  verify-card-dsl.mjs          Dev-only 驗證腳本：分別以「純 marked」渲染改寫前備份、「marked + registerCardExtensions」
                                渲染改寫後文章，正規化空白後比對兩者 HTML 是否逐字相同（0 diff）
vite.config.js                 Vite 整合與多入口 (MPA) 設定檔，包含自訂 swPrecachePlugin 打包插件
index.html                     首頁
about.html                     關於我們頁面
contact.html                   聯絡建議頁面，包含 Formspree 表單提交
posts/
  index.html                   文章目錄頁面（橫線列表，每列標題在上、日期+膠囊標籤同排 meta 帶在下，
                                分頁大小為 100；篩選列左側即時結果計數、右側標籤篩選+搜尋；
                                過濾為 0 筆時顯示空狀態提示列）
  detail.html                  通用文章內頁（動態 Fetch 文章、剔除 Front matter、利用 marked 渲染、桌機/手機文章大綱 TOC）
```

## 關鍵架構與設計決策

1.  **資料與視圖分離 (Metadata Generation)**：
    由於沒有後端編譯器在伺服器端將文章組裝成 HTML，因此在本地/CI 建置時，透過 Node.js 腳本將所有文章的 metadata（如標題、標籤、日期、預估閱讀時間）全部抽離並整合至一個小巧的 `posts.json` 檔案中。前端載入首頁與目錄時，只需請求此 JSON 檔案，即可完成渲染與分頁，不需要一次下載全部的文章內容，大幅減少頻寬與載入時間。
2.  **多入口多頁面打包 (Vite MPA)**：
    利用 Vite (Rollup) 的多入口編譯設定，將 `index.html`、`about.html`、`contact.html`、`posts/index.html` 與 `posts/detail.html` 定義為獨立的進入點，確保 Vite 能夠將 CSS/JS 最佳化拆分與打包。
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
    *   **字體分工**：展示型標題（Hero、文章標題、Nav wordmark）與 Hero 副標題使用 `Lora` 襯線字型，建立編輯雜誌感；UI 與內文字體升級為 `Inter` 無襯線變數字型以確保清晰。中文字型維持系統優選。元資料（Meta）完全去除 CJK 漢字之斜體，收細至 `text-sm` 以拉開視覺層次。
    *   **文章內文排版**：安裝 `@tailwindcss/typography` 處理 Markdown 元素樣式。詳細頁在渲染完成後以 JS 為 `<table>` 動態包覆 `overflow-x-auto` 容器，以防表格橫向溢出。**此外** `.prose p`/`.prose li` 設 `overflow-wrap: anywhere`、`.prose td`/`.prose th` 設較保守的 `overflow-wrap: break-word`（2026-07-21）：純 Markdown 文章若把裸網址等無空格長字串直接當可見文字（未用 `[文字](url)` 包裝），預設不斷行會撐寬 `.prose` 一路撐寬到 `<article>`，使整頁在手機出現橫向捲動，連帶把 `position: fixed` 的 `.toc-fab` 圓點推出可視範圍外；td/th 刻意不用 `anywhere` 是因為它會縮小儲存格 min-content 寬度，容易讓匯率、日期等數字欄位被不必要地強制斷成兩行、破壞對齊。
    *   **Navbar**：Logo 改為純文字 wordmark「旅遊指南」之極簡二項目架構，Navbar 具毛玻璃特效（`bg-surface/90 backdrop-blur-sm`）。
6.  **目錄頁篩選/搜尋互動細節**：
    *   **標籤篩選下拉選單定位**：選單錨點採 `left-0`，搭配 `w-64 max-w-[calc(100vw-2.5rem)]` 與 `max-h-48`，確保窄螢幕下選單完整落在可視範圍內，並提供捲動提示。
    *   **篩選/搜尋不觸發畫面捲動**：搜尋與篩選操作時 `shouldScroll` 設為 `false`，避免搜尋框被捲出視窗；僅在分頁換頁與上一頁/下一頁時才捲動至清單頂端。
    *   **即時結果計數與空狀態**：新增結果計數更新機制，優化寬度計算防止小螢幕擠壓換行。當無搜尋結果時，動態注入空狀態提示列。
    *   **視覺細節收斂**：分頁器改用暖色 Token，日期改用 `tabular-nums` 並與標籤合併為單一橫排 Meta 帶以緊湊版面。加入鍵盤 `focus-visible` 焦點樣式，並以內聯 SVG 放大鏡取代 emoji。
7.  **PWA 靜態資源預快取防刷 (swPrecachePlugin)**：
    由於 Vite 打包後的 CSS/JS 檔名會帶有隨機雜湊碼，自訂 Vite 插件 `swPrecachePlugin`，在建置完成後，動態將帶有雜湊值的資源名稱取代並更新至 `dist/sw.js` 的預快取陣列中。
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
    本專案的 Markdown 裝飾元件（如 `prep`、`stepper`、`compare`、`info`、`apps`、`accordion` 等）已進行 UI/UX 元件化分析，並重新命名為更易於重複使用、語意清晰且對 Agent 友善的名稱（如 `quick-summary`、`milestone-stepper`、`feature-comparison-card`、`metadata-info-card`、`recommended-apps-list`、`interactive-faq-accordion`）。後續不論是新增文章、修改 UI，或是 AI Agent 自動寫文，皆應遵循此命名規範與設計定位。詳細分析與規範文件見 [`./markdown_decorations_design.md`](./markdown_decorations_design.md)。
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

> **維護規範**：每次修改程式碼後，在下方「更新歷史」新增一筆帶日期的記錄（維持「最新兩筆完整記錄，其餘壓縮成一行」的格式——寫入新記錄時，把原本排第二新的那筆壓縮進下方清單，同時保留新記錄的完整說明）。若變更影響檔案結構或設計決策，也一併更新上方「第一部分」對應段落。完整規範見根目錄 `CLAUDE.md`。

## 待辦事項

- [ ] 從 [formspree.io/forms](https://formspree.io/forms) 取得真實的 Formspree 表單 ID，並替換 `contact.html` 中的 `YOUR_FORM_ID`
- [ ] 更新 `package.json` 中的元數據描述與真實的專案儲存庫（目前保留原 Jekyll 主題的資訊）
- [ ] 將 `public/manifest.json` 與元件中預留的 `your-email@example.com` 替換為真實數值
- [ ] **中文襯線字體跨裝置一致性**：目前中文標題襯線僅在有系統內建中文襯線字型（macOS Songti、Windows 新細明體）的裝置上生效，多數 Android 裝置無內建中文襯線會退回無襯線字體。若未來要追求完全一致的跨裝置「編輯雜誌感」，需自行 subset 打包 Noto Serif TC 字型檔（僅收錄實際會用到的標題字元），並更新 `sw.js` 的 precache 清單
- [ ] **「關於」頁面目前沒有任何入口**：`about.html` 存在且已套用新樣式，但 Navbar 與 Footer 都沒有連結指向它。若要恢復這個入口，建議與「Navbar 手機版漢堡選單」一併評估
- [ ] **Navbar 手機版漢堡選單死程式碼**：`assets/scripts.js` 裡仍保留舊 Jekyll 主題遺留的 `toggleNav()` 漢堡選單邏輯（對應 `#navbarResponsive` 元素），但目前 `navbar.html` 只有 2 個導覽項目、單排橫向排列在小螢幕也不會擠壓，因此沒有實際啟用。若未來導覽項目增加需重新評估是否啟用，或直接移除死程式碼
- [ ] **07-20 `## 1.2 WOWPASS 完整介紹` 底下仍有 6 個 `###`**：是全文最密的一節（已依 `doc_style.md` 第 3 節收掉一個標籤型 `### 是什麼`）。若閱讀時仍覺得標題雜，可再依同一判準（讀者會不會拿這個標題來定位）收一輪；注意解法是減少標題，不是給 `###` 加視覺記號（見第一部分第 19 點與 `style.md` A14）
- [ ] **style-a 版型行動版開頭出現兩個重複的摘要／導覽區塊**：修正 `initTOC()` 抓不到 style-a/b/c 版型標題的 bug 後（見更新歷史），`buildMobileOutlineAndSheet()` 產生的自動大綱框「本文章節」（列出 總覽／景點漫遊／美食推薦）現在會插在 `#post-content` 最前面，緊接著又是 `.style-a-post` 內「總覽」小節裡手寫的「7 大主題景點快速導覽」格狀清單——兩者功能高度重疊，行動版一開頭連續出現兩個摘要區塊。需要決定去重方式：例如拿掉手寫的 quick-jump 區塊、或讓自動大綱偵測到頁面已有等價的手寫導覽時跳過渲染，或乾脆把兩者合併成一個元件。style-b／style-c 版型是否有同樣狀況也要一併確認。

- [ ] **本次 UI 調整待目視確認（2026-07-21）**：三項改動都只做到 `npm run build` 與 CSS 輸出複驗，未實際在瀏覽器目視。待確認 (a) TOC 側欄新密度是否仍嫌擠——若是，下一步是把 `.toc-sidebar` 寬度改成 `clamp(11rem, calc(50vw - 26rem), 14rem)` 讓大螢幕自動加寬（**不是再縮字**），代價是動到側欄與文章的 2rem 間隙；(b) `.post-nav-title` 在行動版 375px 下是否普遍撞到 `line-clamp: 3` 上限——若是，解法是收窄 `.post-nav` 的 `gap` 換欄寬
- [ ] **07-16 `.food-list-title` 是 `<div>` 不進 TOC**：2026-07-21 已把它的字級與「`### Day X`」對齊（同屬 `h2` 之下第一層），但 Day X 是 `<h3>`、它是 `<div>`，同一邏輯層級只有一半進得了側欄 TOC。若要一致，改成 `<h3 class="food-list-title">` 即可（`initTOC()` 收 h2/h3），代價是側欄多 6 條；先擱置待使用者決定

## 更新歷史

最新兩筆完整記錄如下；更早的記錄壓縮為一行摘要，列於其後。

### 2026-07-21 — 文章頁三處 UI/UX 調整：TOC 側欄密度、桌機誤現的 FAB、上/下一篇導覽

* **提問**：使用者以資深 UI/UX 設計師視角連問三題——(1) 桌機左側快速索引導覽列「版面有點太擠」，
  是否該縮小字體？(2) 「web 版不該出現右下角小圓點」；(3) 上/下一篇按鈕應該顯示標題讓使用者
  決定，字體要怎麼均衡融入、或乾脆不要用按鈕？
* **(1) TOC 側欄——結論是不縮字，問題不在字級在密度節奏**：側欄寬 `11rem`（扣 padding 約容 11
  個中文字），中文標題幾乎必然折行；而 `line-height: 1.4` 的行內間距只有 5.6px、項目上下 padding
  合計 8px，兩者幾乎相等 → 折行的條目與相鄰條目黏成一整塊文字牆（鄰近性原則被破壞）。**縮字
  只會讓折行更多、更糟**，且 14px 已是中文導覽的可讀地板。改法：`line-height` 1.4→1.55、padding
  `0.25rem 0 0.25rem 0.5rem`→`0.3rem 0 0.3rem 0.625rem`、`.toc-sidebar .toc-link` 補
  `margin-bottom: 0.25rem`（**刻意只掛在側欄**——手機抽屜 `.toc-sheet-list` 已用 flex `gap` 控制
  間距，掛在共用的 `.toc-link` 上會兩者疊加）、`[data-level="3"]` 加 `font-size: 0.8125rem` 建立
  層級對比（抽屜版原有的 `.toc-sheet .toc-link[data-level="3"]` 覆寫仍在，觸控尺寸不受影響）。
  另把 `scripts.js` 的「本文章節」標題 `mb-2`→`mb-3`。**未採用**：先前提議的 `clamp()` 加寬側欄
  （會改動側欄與文章的 2rem 間隙），待使用者看過密度後再定。
* **(2) 桌機 FAB 外洩——是 cascade layers 的優先序問題，不是 breakpoint 寫錯**：詳見第一部分
  第 21 點。`.toc-fab` 早就掛了 `xl:hidden`，但未分層的元件 CSS 優先序高於 `@layer utilities`，
  `display: flex` 直接壓過 `display: none`。解法是在 CSS 自己補
  `@media (min-width: 80rem) { .toc-fab { display: none } }`；`scripts.js` 的 `xl:hidden` 保留
  當意圖標註（無副作用）。
* **(3) 上/下一篇改為 `.post-nav-*` 連結對**：設計理由與字級決策見第一部分第 22 點。`detail.html`
  容器由 `flex justify-between` 改為 `<nav class="post-nav" aria-label="文章導覽">`（只有下一篇
  存在時，空的 prev `div` 仍佔住第一欄，右格自動留在原位）；兩段 `innerHTML` 字串改用
  `buildPostNavLink()` 以 DOM API 組裝、標題走 `textContent`，**順手修掉 `title="${post.title}"`
  未跳脫的既有 bug**（標題含 `"` 會破壞標記），並補上 `rel="prev"`／`rel="next"`。使用者追加
  要求「行動版標題太長時不要變成上下兩列」，故 `grid-template-columns: 1fr 1fr` 與
  `.post-nav-cell--next { text-align: right }` 改為所有寬度共用，行動版 `gap: 1rem`、md 以上
  `2rem`，並加 `align-items: start`（一邊 1 行、另一邊 3 行時兩欄仍從頂端對齊）、
  `overflow-wrap: anywhere`（無空白長字串不撐破窄欄）。
* **驗證**：`npm run build` 通過，並自 `dist/assets/*.css` 複驗
  `@media (min-width:80rem){.toc-fab{display:none}}`、`.post-nav{grid-template-columns:1fr 1fr}`、
  `.post-nav-title` 的 `line-clamp` 3→2 與 14→15px 皆已輸出。CSS 有變（打包雜湊碼隨之改變），
  依 `CLAUDE.md` 規範把 `public/sw.js` 的 `CACHE_NAME` 由 v52 升到 v53。
  **未做視覺確認**（專案無截圖工具鏈）——15px/`line-clamp` 的實際折行表現、以及行動版 375px 下
  兩欄是否夠寬，需使用者在 `npm run dev` 目視；若普遍撞到 3 行上限，下一步是收窄 `gap` 換欄寬，
  不是再縮字。

### 2026-07-21 — `contact.html` 套用其他版面既有設計，修正三處風格漂移

* **提問**：使用者要求把 `contact.html` 套用「目前其他版面的設計」，並在過程中補充「讓風格
  維持一致」。
* **盤點出三處漂移**：(1) 外層容器用 `max-w-xl`，而 `style.md` B3 明訂全站容器統一
  `mx-auto max-w-3xl px-5`（navbar／Hero／首頁／`about.html`／`posts/*.html` 皆同），
  `contact.html` 是全站唯一的例外；(2) 表單容器沒有 `about.html`／`posts/detail.html` 兩篇
  文字頁共用的 `py-10 my-4 bg-surface` 抬升卡片包裝；(3) 輸入框只有裸 `border border-sand`，
  缺少 `assets/scripts.js` 既有搜尋框（`posts/index.html` 篩選列）已經在用的
  `rounded bg-surface text-sm text-ink shadow-sm` 組合；送出結果的成功/失敗訊息用了色票外的
  `bg-green-50`/`bg-red-50` 色塊，而全站其餘頁面（`index.html`／`posts/index.html`／
  `posts/detail.html`）的錯誤訊息一律是裸文字 `text-red-500`，沒有色塊背景。
* **處理**：外層容器改回 `max-w-3xl px-5 py-10 my-4 bg-surface`（對齊 `about.html`），內層另包
  一層 `max-w-xl` 讓表單欄位本身維持可讀寬度，兩者不衝突；三個 input/textarea 補齊
  `rounded bg-surface text-sm text-ink shadow-sm`；成功訊息改用色票內的 `text-primary` 裸文字，
  失敗訊息改用與其他頁面一致的 `text-red-500` 裸文字，兩者皆拿掉色塊背景與非色票的
  green/red-50/800。
* **未動**：`.btn-primary`、Google Apps Script 送出邏輯、`bg-contact.jpg` 皆已符合規範，未變更。
  改動僅限 `contact.html` 的 class 與少量 innerHTML 字串，未動 `assets/tailwind.css`，故不需要
  bump `sw.js` 的 `CACHE_NAME`。
* **驗證**：`npm run build` 通過；用到的 class（`rounded`/`bg-surface`/`text-sm`/`shadow-sm`/
  `text-primary`/`text-red-500`）皆為既有頁面已使用過的既有樣式，無新增 CSS。

### 更早的更新（壓縮摘要，新到舊）

- 2026-07-21：修正 07-16 標題階層忽大忽小（`Day 1` 比母標題 `景點漫遊` 還大），`.style-a-post` 那組自成一格的音階（26/22/20/18）整組併回 `.prose`，`.style-a-post h3` 覆寫整條刪除、`.spot-title` 22→18px，底線依 A13 只留給 `h2`；外溢範圍僅 07-16 一篇，`.prose` 未動（設計決策見第一部分第 20 點）
- 2026-07-21：否決 `h3` 視覺記號（字符與左側色條皆試過後推翻），改以「收掉緊接 h2 後、內文
  三四行的標籤型 `###`」處理標題過密，`doc_style.md` 新增第 3 節、`style.md` 新增 A14
- 2026-07-21：推翻標題底線 `:has()` 規則（07-20 的 6 個 `##` 有 4 個底線忽有忽無、讀者猜不到規律），改為「只有 `h2` 固定有底線、無條件套用」，`h1` 底線一併移除；抽象準則寫入 `doc/style.md` A13

- 2026-07-21：新增 `doc/doc_style.md` 文章排版守則——標題階層與結構深度固定對應（`#`＝分卷／`##`＝小節／`###`＝細項／`####`＝元件標籤），且 `---` 只能出現在 `#` 前、絕不用於 `##`/`###`（標題自帶底線已負責分隔）
- 2026-07-21：執行 `doc_style.md` 規則清理 07-20 多餘 `---`；同日新增又推翻標題底線 `:has()` 規則（最終定案見上方完整記錄）
- 2026-07-21：把 07-16 首爾文章的雜誌感標題/表格/blockquote 樣式內化為 `.prose` 基礎預設值，讓 07-13/07-20 純 Markdown 文章免改內容自動套用（`.prose h1`~`h4`/blockquote/表格新規則，含 2-class cascade 覆寫保護既有卡片標題）
- 2026-07-21：修正 `2026-07-20-韓國自由行支付教學.md` 裸網址撐破手機版面、TOC 圓點跑出畫面外的問題（改寫為連結＋`.prose` 新增 `overflow-wrap` 防護網）
- 2026-07-20：於 doc/project.md 補充 `dist/` 打包清空警告與文章消失問題說明
- 2026-07-20：補充「新增文章未顯示」對應之索引與快取更新步驟 (clean-blog-v50)
- 2026-07-20：升級 PWA Service Worker 快取版本至 clean-blog-v49 並重新打包
- 2026-07-20：於 doc/project.md 新增網站快取 (Service Worker & PWA) 更新操作指引
- 2026-07-17：修正 style-a/b/c 版型 TOC 圓球未渲染問題與文章 Naver/Kakao 空格網址 (CACHE_NAME 升至 v48)
- 2026-07-17：style-a 美食項目分隔線經歷多輪評審最終定案為滿版極輕髮絲線 (CACHE_NAME 升至 v47)

- 2026-07-16：重構景點快速跳轉為極簡行事曆流線時間軸面板，按 `(Day N)` 動態分組 (CACHE_NAME 升至 v46)
- 2026-07-16：新增 Markdown 裝飾元件設計分析與語意命名指引（`doc/markdown_decorations_design.md`）
- 2026-07-16：修正 .app-card 尾端多餘分隔線，改用相鄰選擇器 (CACHE_NAME 升至 v34)

- 2026-07-16：stepper 納入卡片 DSL，以 ```stepper fence 取代手寫 HTML 鷹架，並實作 re-entrant 安全遞迴解析 (v33)
- 2026-07-15：WOWPASS 升級為獨立 `### WOWPASS 開卡與儲值` 小節，內容結構對齊機場通關步驟規格（v32）
- 2026-07-15：提示框收斂為 warning/note 兩級，移除語意模糊的 `.alert-important`（v31）
- 2026-07-15：統一「依序流程」皆用 `.stepper` 呈現，WOWPASS 步驟由巢狀清單改為時間軸（v30）
- 2026-07-15：新增 `.info-card`／`info` DSL 家族，與 `.compare-card` 語意分工（擇一比較 vs 純參考資訊）（v29）
- 2026-07-15：全站停用行動版頂部常駐章節分頁列（`buildChapterBar`），改用 `ENABLE_CHAPTER_BAR` 旗標，程式碼保留可隨時恢復（v28）
- 2026-07-15：首爾旅遊文章拆分為《首爾秋日漫遊手帳》與《首爾行前準備與安全應變手冊》兩篇，建立雙向引流連結
- 2026-07-15：行動版分頁列新增 H2 > 6 字門檻、Bottom Sheet 開啟自動置中捲動（v27）
- 2026-07-15：新增 `assets/markdown-cards.js` 卡片 DSL，8 家族約 81 個實例由手寫 HTML 改為 fenced block（v26，含 `scripts/verify-card-dsl.mjs` 0-diff 驗證）
- 2026-07-15：首爾文章「簡潔高雅」視覺重整——美食/景點雜誌感卡片、出發前準備欄位化、緊急應變 5 色分類色碼
- 2026-07-15：首爾文章「出發前準備」附錄重排，併入推薦 App／在地習俗與避雷小節
- 2026-07-14：首爾文章重構為「行程優先」結構，景點漫遊上移、作業性內容降級為附錄
- 2026-07-14：修正 TOC 誤收卡片內部標題（heading 選擇器改為 `:scope > h2, h3`）
- 2026-07-14：緊急應變改為情境速查導向，TOC 子索引由約 11 條收斂為 0
- 2026-07-14：新增行動版章節分頁列（chapter tab bar），並修正高亮半拍延遲（抽出共用 `stickyOffset()`）
- 2026-07-14：修正桌機版 TOC 側欄自動滾動聚焦與頁尾防破版遮擋機制
- 2026-07-14：首爾文章手機閱讀體驗優化（機場接駁卡片化、美食長輩友善晶片、`<details class="fold">` 摺疊、術語統一）
- 2026-07-14：首爾文章改版，移植 `travel_guide/index.html` 卡片式排版體驗（`feature/travel-guide-style-match` 分支起點）
- 2026-07-13：修正桌機版 TOC 側欄初始蓋住 Banner 的問題，並隱藏側欄捲軸
- 2026-07-12：新增開發模式文章自動監聽更新插件（`watchPostsMetadataPlugin`）
- 2026-07-12：視覺與字型排版演進——白底配色定案、升級 Inter 字型、優化中英文 Meta 排版
- 2026-07-12：文章大綱 (TOC) 元件初版開發（桌機側欄＋手機 Bottom Sheet，Scroll Spy 高亮）
- 2026-07-12：目錄頁視覺與 RWD 重構、下拉選單破版修復
- 2026-07-11：遷移至 Vite + Tailwind CSS v4 純前端 MPA 架構（自 Jekyll，方案 A）
- 2026-07-11：介面中文化、中文字型比例最佳化、導覽列簡化、雙頁面 JS 前端分頁實作
- 2026-07-10：記錄 GitHub Pages 工作流，建置並推送重構版本 (e5be734)
