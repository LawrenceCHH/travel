# 專案快照 (Vite + Tailwind CSS v4 純前端架構)

此專案已於 2026-07-11 從 Jekyll 遷移至基於 **Vite** 與 **Tailwind CSS v4** 的純前端 MPA（多頁面應用）靜態架構。所有頁面的共用 Layout 載入、文章目錄搜尋與篩選、以及 Markdown 文章解析渲染，皆直接於瀏覽器端完成，徹底擺脫了對 Ruby、Jekyll 與 Gem 的依賴。

安裝/建置/部署指令 → [`../README.md`](../README.md)。未完成任務、變更日誌、驗證指令 → [`./update.md`](./update.md)。

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
5.  **視覺設計系統（2026-07-12 初版；同日再改版為新色票，見下方「配色改版」）**：
    網站風格定位為「簡潔、乾淨、高雅」，設計 Token 全部定義於 `assets/tailwind.css` 的
    `@theme` 區塊：
    *   **色彩（已於同日「配色改版」取代，此段落保留供歷史對照，現行色票見下方）**：
        初版捨棄舊有青藍色主題色 `#0085a1`，改用中性沉穩色系——`--color-ink (#343434)`
        標題/主要文字、`--color-muted (#8E8B82)` 僅供邊框/分隔線/裝飾底色、
        `--color-muted-text (#6E6B62)` 內文級次要文字、`--color-sand (#E9DCBE)` 米色
        hover 底/標籤底、`--color-paper (#F3F3F3)` 頁面整體底色、`--color-primary
        (#6B4A34)` 咖啡色強調色。
    *   **配色改版（2026-07-12，現行色票）**：使用者提供四色色票
        `#222831`/`#393E46`/`#948979`/`#DFD0B8` 要求全站換色，並指定「灰色為主要代表色」。
        流程：Sonnet 盤點現有 token 用途 → Opus（資深 UI/UX 設計師角色）判斷「灰色主導」
        應落地為全站深色主題（因這組色票明度連續遞進，只有深色方案能讓深灰真正鋪滿主導
        畫面）並產出色碼規格 → Sonnet 依規格全站落地 → **使用者實際看過後推翻深色方向**，
        改指定「底色為白色，深色字體以灰色為主，偶爾搭其他顏色」→ Sonnet 直接用 Node
        手算 WCAG 對比（純算術驗證，不需要重跑一次開放式設計決策）重新分配 token。
        **現行（白底）token 值**：色票拆兩個家族運用——`#222831`/`#393E46` 這組偏冷深灰
        供「灰色為主」的文字使用，`#948979`/`#DFD0B8` 這組偏暖褐/米供「偶爾搭配的其他
        顏色」（強調色/邊框/標籤底）使用。`--color-paper`/`--color-surface` 均為
        `#FFFFFF`（頁面與卡片/導覽列同白，靠 `border-sand` 區隔層次）、`--color-ink:
        #222831`（主要文字/標題）、`--color-muted-text: #61656B`（由 `#393E46` 淺化衍生，
        對白底約 5.86:1 通過 AA）、`--color-muted: #888B90`（僅供 disabled 文字，常搭配
        `opacity-40`；曾誤用更淺的 `#B0B2B5` 但實測疊加後過於淡到近乎不可見，已改用與
        改版前 `#8E8B82` 相近的深淺度）、`--color-sand: #948979`（色票原色，邊框/分隔線/
        標籤底/hover 底）、`--color-primary/-dark: #6F675B / #595249`（由 `#948979`
        加深衍生，對白底雙向皆約 5.57:1 通過 AA，同時滿足「文字疊白底」與「白字疊強調色
        底」兩種方向）、新增 `--color-hero-text: #F4ECDD`（見下方 Hero 段落，與站內底色
        無關）。**關鍵陷阱**：Hero 遮罩色不可跟著 `--color-paper` 連動——深色主題階段
        `.masthead .overlay` 曾改綁 `bg-paper`（當時 paper 是深色），改回白底時若沒同步
        把遮罩改綁回 `bg-ink`（`--color-ink` 這次仍是深灰），遮罩會變成白色蓋在封面圖上，
        直接讓深色封面圖上的淺色標題文字失去對比，等於重新製造使用者最初詢問的問題；
        已修正為固定綁 `bg-ink`，與站內底色变化解耦。因為大部分元件（導覽列/頁尾/按鈕/
        分頁器/下拉選單/表單/TOC 抽屜）都是引用 token 而非寫死色碼，兩次改版（深色→白底）
        大多只需要動 `@theme` 區塊本身，不需要逐檔案重新掃過一遍。
    *   **字體分工**：大字級展示型標題（Hero、文章標題、Nav wordmark）與 Hero 副標題（`.subheading`）使用 Lora 襯線字體，建立統一且兼具編輯雜誌感的視覺風格；小字級高資訊密度的 UI（表格、按鈕、標籤、導覽次要連結）與內文中的英文及數字，皆升級為現代高解析度的 `Inter` 無襯線變數字型，以確保極致清晰度。中文字重僅使用 400/700（因自架字型檔只有這兩種字重），標題不加 `tracking-tight`/`tracking-wide` 等字距 utility——這類拉丁排版習慣套用在全形中文字上會造成擠字或鬆散，不符合 CJK 排版慣例。此外，元資料（Meta）排版部分全面去除 CJK 斜體（`italic`）屬性以避免瀏覽器強制傾斜產生的鋸齒歪斜與不對稱感，並收細尺寸至 `text-sm` 以拉開視覺排版層次。
    *   **已知限制（刻意取捨）**：中文標題目前仍會 fallback 到作業系統內建的中文襯線字型
        （macOS Songti/Windows 新細明體），多數 Android 裝置無內建中文襯線會退回無襯線字體，
        跨平台呈現不完全一致。這是為了維持 PWA 離線能力與零外部字型依賴（不引入 Google
        Fonts CDN）而做的刻意權衡，未來如需求更一致的跨裝置襯線效果，需自行 subset 打包
        Noto Serif TC 字型檔並承擔額外資源體積。
    *   **文章內文排版**：安裝 `@tailwindcss/typography` 外掛處理 Markdown 渲染出的標題、
        清單、表格、code block、blockquote 等元素樣式，透過官方 `--tw-prose-*` CSS 變數
        覆寫配色（見 `.prose` 區塊），而非手刻各元素選擇器，降低未來新文章格式若用到外掛
        涵蓋範圍的維護成本。`posts/detail.html` 在 Markdown/HTML 雙格式渲染完成後，額外用
        JS 為每個 `<table>` 動態包一層 `overflow-x-auto` 容器，避免窄螢幕表格撐破版面
        （typography 外掛本身不會自動處理表格橫向捲動）。
    *   **Navbar**：拿掉原本的房屋 SVG 圖示，改為純文字 wordmark「旅遊指南」（serif、
        `font-bold`），維持只有 2 個導覽項目（首頁 Logo + 目錄）的極簡資訊架構，sticky nav
        改用毛玻璃效果（class 現為 `bg-surface/90 backdrop-blur-sm`，`--color-surface`
        token 現行值即白色，效果等同原本的 `bg-white/90`，見上方「配色改版」段落）。
    *   **Hero 遮罩對比度（2026-07-12 修正；同日配色改版又調整一次不透明度與文字色，
        見上方「配色改版」段落）**：`.masthead .overlay` 由 `opacity-60` 調高為
        `opacity-70`。經 WCAG 對比度試算，60% 疊加在最壞情境（近純白背景圖）下白字對比僅
        約 3.68:1，大標題（大字門檻 3:1）過關但副標題/meta 等一般粗細文字（門檻 4.5:1）
        不通過；數學上需要 α ≥ 0.672 才達標，故調至 70%（對比約 4.9:1）。刻意不做「依圖片
        動態偵測明暗調整遮罩」——那需要 Canvas 像素取樣、有 CORS/效能成本，對此規模的部落格
        是過度工程，用「保守調高固定值覆蓋最壞情境」一次解決所有現有與未來背景圖的疑慮。
        **現行值**：配色改版後不透明度再調到 `0.78`、文字改用專屬的
        `--color-hero-text (#F4ECDD)` 而非 `--color-ink`，遮罩色固定綁 `bg-ink`（不可
        綁 `bg-paper`，因為 `--color-paper` 現在是白色），詳見上方「配色改版」段落。
        同時，修正了文章詳細頁 Hero section 內閱讀時間（`.reading-time`）因為全域繼承樣式而顯示為暗灰色的問題（改為強制使用 `text-hero-text`），
        並將 Hero 內的標籤（`#post-tags span`）重新設計為專屬的半透明 pill 樣式（`border-hero-text/30 bg-hero-text/10 text-hero-text text-xs`），
        兼顧視覺設計層次與高對比無障礙規格。
6.  **目錄頁篩選/搜尋互動細節（2026-07-12 修正）**：
    *   **標籤篩選下拉選單定位**：`assets/scripts.js` 的 `renderTagDropdown()` 選單錨點採
        `left-0`（而非 `right-0`）並搭配 `w-64 max-w-[calc(100vw-2.5rem)]`。原因是按鈕
        容器（`tag-filter-container`）在 `posts/index.html` 中只是 `flex-row justify-end`
        裡的 `w-1/2` 子元素，落在整列左半邊而非螢幕右緣，若選單用 `right-0` 往左展開，
        窄螢幕下會超出可視範圍左側；改為 `left-0` 往右展開並限制 `max-width`，可確保
        任何螢幕寬度下選單都落在視窗內。清單 `overflow-y-auto` 高度定為 `max-h-48`
        （約可見 6 筆），第 6 筆刻意露出一半作為「可捲動」視覺提示，其餘標籤靠捲動選取。
    *   **篩選/搜尋不觸發畫面捲動，僅分頁換頁才捲動**：`render(page, isFirstLoad, shouldScroll)`
        新增 `shouldScroll` 參數。`applyFilters()`（標籤確定/搜尋輸入觸發）呼叫時傳
        `false`，因為搜尋框位於列表容器上方，若自動捲動到列表頂端會把輸入框推出可視
        範圍；分頁按鈕點擊與瀏覽器上一頁/下一頁（`popstate`）維持預設 `true`，因為那是
        使用者主動的換頁操作，捲動到清單頂端提供正確的視覺錨點。
    *   **即時結果計數**（2026-07-12 新增）：`initPagination` 內新增 `updateResultCount()`
        helper，靠 DOM 探測 `#result-count` 是否存在（未改變 `initPagination` 對外呼叫
        簽名），存在才更新 `textContent = filteredItems.length`；在 `applyFilters()` 與
        `render()` 兩處呼叫，涵蓋首次載入、篩選、換頁全部情境。`posts/index.html` 篩選列
        由「單純右側兩控制元件、`justify-end`」改為「左側計數＋右側控制、`justify-between`」。
        **實作陷阱記錄**：右側控制元件的包裹 wrapper 若不給明確寬度（僅 `flex gap-3`），
        內部兩個子元素的 `w-1/2` 會相對於「不定寬度、shrink-to-fit 自動運算」的父層形成
        循環依賴，375px 手機寬度實測會造成計數文字擠壓換行、控制元件寬度不穩定；修正方式
        是 wrapper 加 `flex-1 min-w-0`，讓寬度改吃外層 flex 容器扣掉計數文字後的剩餘空間
        這個明確值，`w-1/2` 才有穩定基準可算，計數 `<span>` 另加 `shrink-0 whitespace-nowrap`
        防止換行。日後若再對這個篩選列做版面調整，注意任何「相對寬度子元素」都需要一個
        有明確（非 auto shrink-to-fit）寬度的父層才能正確運算。
    *   **空狀態**（2026-07-12 新增）：`filteredItems.length === 0` 時，`render()` 於
        `#archive-table-body`（即 `<tbody>`）注入一列 `.toc-empty-row` 提示（找不到符合的
        文章／試試調整標籤或清除搜尋關鍵字）；每次 `render()` 先移除舊的 `.toc-empty-row`
        再視情況重新注入避免累積。用獨立 class（非 `itemSelector` 的 `.archive-row`）確保
        不會混入 `allItems` 初始快照或干擾分頁/計數邏輯。
    *   **視覺細節收斂**（2026-07-12，資深 UI/UX 審查回饋）：分頁器一般頁碼/disabled/省略號
        由冷灰（`text-gray-*`）改暖色 Token（`text-ink`/`border-sand`/`hover:bg-sand/30`/
        `text-muted opacity-40`/`text-muted-text`），避免脫離全站暖色設計系統；列內日期由
        `font-mono`（`@theme` 未定義 mono Token，會 fallback 到冷硬等寬字）改
        `tabular-nums`（只固定數字寬度、不改字體家族）；日期與標籤合併為同一橫排 meta 帶
        （`flex items-center flex-wrap gap-2 mt-1`），列間距統一交給 `gap` 而非多處零散
        margin；`.tag-pill` 行高由 `leading-5` 收緊為 `leading-4`；下拉主鈕/清除鈕/確定鈕/
        checkbox 補上 `focus-visible:ring-1 focus-visible:ring-primary`（原本
        `focus:outline-none` 卻無替代焦點樣式，屬 a11y 缺口）；搜尋框 placeholder 的 emoji
        `🔍︎` 改為內聯 SVG 放大鏡圖示（`stroke="currentColor"`，與下拉箭頭風格一致），未
        引入任何外部圖示套件。
7.  **PWA 靜態資源預快取防刷 (swPrecachePlugin)**：
    由於 Vite 打包後的 CSS/JS 檔名會帶有隨機雜湊碼（例如 `tailwind-XyZ123.css`），為了讓 Service Worker (`sw.js`) 能夠精確預快取這些資源以供離線訪問，自訂了 Vite 插件 `swPrecachePlugin`，在 Vite 完成 Bundling 後，動態將帶有雜湊值的資源名稱取代並更新至 `dist/sw.js` 的預快取陣列中。
8.  **文章大綱元件 (TOC，2026-07-12 新增)**：
    設計流程為統籌者提規劃 → Opus（資深 UI/UX 設計師角色）拍板響應式行為 → Opus（資深
    前端工程師角色）依設計決策產出技術規格 → Sonnet 實作，三方分工存檔於本次任務的暫存
    規劃書中（未納入版控）。
    *   **完全 runtime 動態生成，不寫死 DOM**：`assets/scripts.js` 新增 `initTOC(contentContainer)`
        （掛為 `window.initTOC`），由 `posts/detail.html` 在文章內容注入、表格 RWD 修正
        （8b）完成後呼叫（8c）。因為標題只存在於「注入後」的 `#post-content` DOM（無論
        來源是 marked.js 解析的 Markdown 還是手寫 HTML 格式文章），TOC 必須走訪渲染後的
        `h2`/`h3` 元素才能同時支援兩種文章格式，與既有的 table `overflow-x-auto` 包裹邏輯
        同一套模式。只有 2 個以上 h2/h3 標題時才渲染整組功能；h4 以下層級一律忽略。
    *   **繁中安全 slug**：標題若無 `id` 才自動指派，slug 策略為保留 Unicode
        `\p{L}`/`\p{N}` 字元（含中日韓文字），非 ASCII-only 轉寫，並用 `Set` 去重確保
        全域唯一；已有 `id` 的手寫 HTML 文章尊重原值不覆寫。
    *   **桌機（`xl:` 1280px 以上）**：`position: fixed` 側欄浮於 `max-w-3xl` 文章卡片
        左側頁面留白區（文章卡片本身不位移），定位公式
        `left: max(1.5rem, calc(50vw - 37rem))`（依卡片 768px 寬 + 20px padding + 32px
        間距 + 176px 側欄寬反推）。Active 章節由 `IntersectionObserver` 觸發、但實際判斷
        邏輯是每次重新計算「目前捲動位置以上最後一個標題」的幾何位置（而非單純
        `isIntersecting`），避免短小節被跳過；另外掛一個被動 `scroll` 監聽同一份判斷邏輯
        當保險，避免大幅跳轉捲動時 IO 未即時觸發。1024–1279px（平板）刻意不做過渡樣式，
        直接沿用行動版模式，不留 TOC 消失的空窗。
    *   **手機/平板（< 1280px）**：文章開頭插入僅列 h2 的靜態速覽區塊（無巢狀、無
        scroll-spy，維持開頭簡潔）；使用者往下捲動、速覽區塊完全離開視窗後，右下角浮動
        圓鈕淡入，點擊開啟含 h2+h3 完整清單的 Bottom Sheet。scrim 為 `rgba(0,0,0,0.25)` +
        `backdrop-filter: blur(4px)` 毛玻璃遮罩。關閉方式三選一：點擊 scrim、下滑手勢
        （`touchmove` 簡易位移判斷，非物理引擎，且僅在清單已捲到頂端時才允許拖曳避免與
        內部捲動衝突）、點擊任一連結（自動關閉後交由原生 hash 錨點捲動），另加 Esc 鍵。
        **刻意不放 X 關閉按鈕**——頂端 grabber 拖曳條即關閉提示。
        **抽屜清單版面（2026-07-12 二次修正，UI/UX 審查回饋）**：初版曾將清單改為置中
        對齊、`min-height: 60vh` 強制撐開、移除桌機側欄用的左側色條縮排，理由是「置中版面
        更簡潔」；但使用者實際使用後回報「快速索引列設計不好看」。用 `ui-ux-pro-max` skill
        查詢導覽清單準則交叉比對後定位出三個問題並改回：(1) 置中對齊在標題長短不一時會讓
        清單左緣參差不齊、難以掃視——導覽類清單應靠左對齊，置中僅適合單行等長文字；
        (2) 移除左側色條縮排讓 h2/h3 階層線索只剩字級大小可辨，長清單容易搞不清楚 h3
        歸屬——改回沿用桌機側欄 `.toc-link` 基底（保留 `border-left` 色條），h3 用
        `margin-left` + 加大 `padding-left` 加強縮排；(3) 抽屜缺乏「目前章節」高亮，桌機
        側欄卻有——`assets/scripts.js` 的 `initTOC` 把 scroll-spy 計算邏輯
        （`computeCurrentId()`／IntersectionObserver／scroll listener）從
        `buildDesktopSidebar()` 內部提升到頂層共用，新增 `activeUpdaters` 陣列讓桌機側欄
        與手機抽屜的清單各自訂閱同一份「目前章節 id」廣播（避免重複掛兩份 IO/scroll
        listener），抽屜的 `.is-active` 額外加淡咖啡色底 tint 加強辨識度。**高度改為隨
        內容自然撐開**：移除 `min-height: 60vh` 與置中的 `justify-content: center`（標題
        少的文章會讓清單懸浮在大片空白中間，視覺上不像清單像單張卡片），僅保留
        `max-height: 80vh` 上限，並補 `padding-bottom: env(safe-area-inset-bottom)`
        處理 iOS 安全區域。
    *   **sticky navbar 遮擋處理**：所有標題統一加 `scroll-margin-top: 6rem`（對應 navbar
        實測高度），錨點跳轉與 scroll-spy 判斷線共用同一個 `NAV_OFFSET = 96` 常數，不需要
        在各個點擊處分別計算 offset。
        **實作陷阱記錄（2026-07-12）**：`computeCurrentId()` 判斷「目前章節」原本用嚴格的
        `top - NAV_OFFSET <= 0`；實測發現瀏覽器對 `scroll-margin-top` 錨點跳轉的定位計算
        有次像素捨入誤差（例如落在 `96.625px` 而非精確 `96px`），嚴格比較會讓剛跳轉抵達
        的目標標題被誤判為「還沒到」，導致反白停留在上一個標題（點擊 TOC 抽屜索引跳轉後
        重新開啟抽屜最容易看到）。已放寬為 2px 容忍值（`<= 2`）。這個計算是桌機側欄與
        手機抽屜共用的同一份邏輯，日後若再改動判斷式須注意保留這個容忍值。
    *   **未新增任何 npm 套件或 CDN script**：`IntersectionObserver` 與 `touch` 事件皆為
        瀏覽器原生 API，與本專案「純 vanilla JS、無元件庫」的既有慣例一致。
    *   **錨點跳轉平滑捲動（2026-07-12 新增）**：三處 TOC 連結（桌機側欄／手機頂部速覽／
        手機底部抽屜）皆掛上共用的 `smoothJump(e)` click handler，`preventDefault()`
        瀏覽器原生瞬間跳轉、改呼叫 `el.scrollIntoView({ behavior, block: 'start' })`；
        `behavior` 依 `prefers-reduced-motion` 動態切換 `smooth`/`auto`。因為攔截了原生
        跳轉，手動用 `history.replaceState`（非 `pushState`）同步網址 hash——用
        `replaceState` 是刻意選擇，避免每次點擊 TOC 都在瀏覽器歷史堆疊多塞一筆記錄。
        `smoothJump` 排除 Ctrl/Cmd/Shift/Alt 修飾鍵點擊（保留原生開新分頁行為），且只
        `preventDefault()` 不 `stopPropagation()`，讓底部抽屜原有的「點連結即關閉」委派
        監聽仍正常運作。

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
