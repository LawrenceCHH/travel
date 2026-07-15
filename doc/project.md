# 專案快照 (Vite + Tailwind CSS v4 純前端架構)

此專案已於 2026-07-11 從 Jekyll 遷移至基於 **Vite** 與 **Tailwind CSS v4** 的純前端 MPA（多頁面應用）靜態架構。所有頁面的共用 Layout 載入、文章目錄搜尋與篩選、以及 Markdown 文章解析渲染，皆直接於瀏覽器端完成，徹底擺脫了對 Ruby、Jekyll 與 Gem 的依賴。

安裝/建置/部署指令 → [`../README.md`](../README.md)。未完成任務、變更日誌、驗證指令 → [`./update.md`](./update.md)。全站視覺與互動風格的系統化分析（抽象設計準則＋具體元件規格）→ [`./style.md`](./style.md)。

## 技術棧

*   **建置工具**：Vite (v5)
*   **CSS 框架**：Tailwind CSS v4（CSS 優先配置，無 `tailwind.config.js`），使用 `@tailwindcss/vite` 插件打包，並以 `@plugin "@tailwindcss/typography"` 提供文章內文（`.prose`）排版
*   **Markdown 解析**：用戶端使用 `marked.js` CDN 解譯，後端 (Node) 建置時計算字數與閱讀時間
*   **PWA 支援**：`public/manifest.json` 與 `public/sw.js`，包含打包時自動更新雜湊資源快取的機制
*   **部署**：GitHub Actions → GitHub Pages (發布 `dist/` 目錄，監聽 `main` 分支)

---

## 如何在本地開發與建置

專案不再需要 Ruby 執行環境，僅需安裝 Node.js 即可。

> [!TIP]
> **開發者快速上手捷徑：**
> *   **首次複製專案**：執行 `npm install` 安裝套件。
> *   **日常寫文與預覽**：執行 `npm run dev` 啟動開發伺服器，直接在 `src/posts/` 底下寫文章，存檔後瀏覽器會自動同步。
> *   **打包正式版網頁**：執行 `npm run build` 即可。它會自動跑完文章索引重新生成，並在 `dist/` 資料夾輸出打包好的靜態網站成品。
> *   **測試 PWA 離線功能**：執行 `npm run preview` 可以預覽打包後的網站，並測試 Service Worker 快取。

### 1. 安裝依賴項目
在專案根目錄下執行：
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
打包編譯網站：
```bash
npm run build
```
打包後的靜態檔案將會輸出至 **`dist/`** 目列。打包完畢後可進行預覽（用以測試 PWA 與 Service Worker 快取）：
```bash
npm run preview
```

---

## 如何新增與編輯內容

### 1. 新增部落格文章
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
4. 存檔後，執行 `npm run build:metadata`（或直接重啟 `npm run dev`）來更新文章索引。

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

---

## 專案目錄結構對照表

```
.github/workflows/pages.yml   CI/CD 部署設定，使用 Node/Vite 環境建置，部署 dist 到 Pages
assets/
  tailwind.css                 Tailwind v4 CSS 原始碼（定義主題 Tokens 與自訂組件）
  scripts.js                   通用 JS，含雙頁面分頁 (initPagination)、文章大綱 (initTOC)、元件動態載入與 PWA 註冊
  markdown-cards.js            Card DSL：marked block 擴充 registerCardExtensions()，把 ```food/spot/compare/
                                gallery/prep/apps/triage/emergency 資料區塊逐字還原成卡片 HTML（純字串邏輯，可在
                                Node 與瀏覽器共用），由 scripts.js 最上方在 window.marked 上註冊
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

---

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
    *   **文章內文排版**：安裝 `@tailwindcss/typography` 處理 Markdown 元素樣式。詳細頁在渲染完成後以 JS 為 `<table>` 動態包覆 `overflow-x-auto` 容器，以防表格橫向溢出。
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
    *   **行動版（< 1280px）**：文章開頭插入 h2 靜態速覽。向下捲動後淡入右下角浮動按鈕，點擊開啟 Bottom Sheet 抽屜（高度自適應，最大 `80vh`，支援下滑、點 scrim、Esc 或點連結關閉）。清單採靠左對齊並保留階層色條縮排與目前章節高亮。
    *   **平滑捲動跳轉**：點擊 TOC 連結時攔截原生瞬間跳轉，改用 `scrollIntoView({ behavior: 'smooth' })` 平滑捲動（尊重減速動效設定），並以 `history.replaceState` 更新 hash 且不增加歷史堆疊。`scroll-margin-top` 改由 `updateScrollMargins()` 依斷點動態設定（見下方行動版章節分頁列說明），並放寬 2px 誤差以修正 active 章節誤判。
    *   **行動版章節分頁列（`<1280px`，`buildChapterBar`）**：既有行動版 TOC（頂部靜態速覽＋FAB＋Bottom Sheet）之外，另新增一條 `position: fixed` 貼於 navbar 正下方的常駐橫向捲動膠囊列（`.chapter-bar` / `.chapter-pill`），只顯示 H2 層級章節（`toc.filter(i => i.level === 2)`，少於 2 個不建立），短標籤由 H2 全文去除全形/半形括號附註＋取空白/｜ 分隔前第一段衍生而成。與側欄/抽屜共用同一份 `toc` 陣列、`smoothJump`、`activeUpdaters`，高亮邏輯會把 `computeCurrentId()` 回傳的 h3 id 往回對應到最近的前一個 H2 膠囊，並比照桌機側欄的 `offsetLeft`/`scrollLeft` 邏輯把 active 膠囊自動橫向捲入可見範圍。**分工**：頂部靜態速覽負責「一進文章就看到全貌」、FAB＋Bottom Sheet 負責「完整 h2+h3 清單＋一次性跳轉」、章節分頁列負責「捲動閱讀過程中持續可見的當前定位與快速換章」，三者互不取代、同時並存（z-index 40，低於 Bottom Sheet 的 50，高於一般內容）。**整合關鍵**：分頁列出現時，若標題只避開 navbar（原本寫死 `scroll-margin-top: 6rem`）會被「navbar＋分頁列」一起蓋住，故改由 `updateScrollMargins()` 依 `window.matchMedia('(min-width: 1280px)')` 動態計算：`>=1280px` 維持 `96px`（分頁列隱藏，只需避開 navbar）；`<1280px` 則取 `navEl.offsetHeight + chapterBar.offsetHeight + 12`（navbar 為非同步 fetch 注入，故用 `measure()` 搭配 `load`/`resize`/短延遲重算）。scroll-spy 判定用的 `NAV_OFFSET`（96）刻意維持不變、未隨分頁列高度調整，故剛點擊跳轉落地瞬間，分頁列高亮偶爾會短暫停留在前一章節（需再捲動約 30 多 px 才切換），是已知可接受的次要誤差。
9.  **文章內文組件系統（旅遊手帳卡片排版，`feature/travel-guide-style-match` 分支）**：
    為了讓特定風格的文章（如首爾旅遊指南）在「純 Markdown + 少量 HTML/class」的前提下也能有接近原生 App 的卡片化閱讀體驗，於 `assets/tailwind.css` 新增一組可重用的組件類別：`.gallery-grid`/`.gallery-card`（總覽導覽卡）、`.prep-pill-row`/`.prep-pill`/`.emergency-cta`、`.spot-card`/`.day-label`/`.friendly-badge`/`.stars`/`.info-subcard`/`.spot-walk-link`（景點卡）、`.food-item`/`.food-chip`/`.action-btn`（美食卡，含 Naver/Kakao/食記三色按鈕）、`.stepper`/`.step-item`/`.step-node`（時間軸）、`.app-card`（App 條列）、`.emergency-card`（聯絡資訊卡）、`.alert-box`（`[!NOTE]/[!WARNING]/[!IMPORTANT]` 提示框，取代先前僅顯示純文字 `[!WARNING]` 字樣的 blockquote）。色彩沿用本站既有 Token（ink/sand/primary/surface），不引入外部來源的獨立色票。所有互動維持純錨點跳轉（不含分頁 JS/底部快捷列），與既有 Navbar／TOC 側欄共存。
    *   **`not-prose` 使用限制**：這是 Typography 外掛提供的選擇器類（`.prose :where(...):not(:where([class~="not-prose"] *))`），只能直接寫在 HTML 的 class 屬性上，不能透過 `@apply not-prose` 在自訂 CSS 類別內使用。
    *   **flex 容器須避免「行內元素＋純文字節點」混排**：flex 容器的每個直接子節點（包含匿名文字節點）都會被視為獨立 flex item 橫向排列；若某類別內容是「`<strong>` 加後續純文字」這種預期同段落換行的內容，該容器不可設為 `display: flex`（例如 `.prep-pill` 因此改回區塊排版）。
    *   **`**粗體**` 語法陷阱**：marked/CommonMark 的定界符規則會拒絕在「結尾為標點符號且緊接非空白字元」的情況下收尾（如 `**嚴禁託運！**必須`），導致literal `**` 殘留不轉換；這類情況一律改用 `<strong>` 原生標籤，不依賴 `**` 語法。
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
    *   **保留為手寫 HTML、刻意不轉的家族**：`.stepper`/`.step-item`（機場通關步驟，內文為 freeform Markdown 清單/連結，無固定欄位結構）、`.alert-box`（`[!NOTE]`/`[!WARNING]`/`[!IMPORTANT]` 提示框，本來就是 blockquote 語法的展現）、`<details class="fold">`（摺疊區塊，內容為長篇 Markdown 清單）、`.emergency-group` 的 `<p>` 與 `.emergency-cta` 的 `<a>`（各自只有 1-3 個單一實例，非重複樣板）。這些維持原樣，理由是「內容 freeform 或只有單一實例」，硬凹成 DSL 欄位不會減少維護成本。
    *   **URL 不做 percent-encode**：`food` 的 `map`/`map_kakao`、`triage`/`emergency` 的 `href` 等欄位一律原樣輸出（不呼叫 `encodeURIComponent`），沿用原始檔案裡的 raw 韓文查詢字串，避免與改寫前的位元組序不同。

---

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
