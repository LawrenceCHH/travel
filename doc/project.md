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
  index.html                   文章目錄頁面（橫線表格，分頁大小為 100）
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
5.  **視覺設計系統（2026-07-12 改版）**：
    網站風格定位為「簡潔、乾淨、高雅」，設計 Token 全部定義於 `assets/tailwind.css` 的
    `@theme` 區塊：
    *   **色彩**：捨棄舊有青藍色主題色 `#0085a1`，改用中性沉穩色系——
        `--color-ink (#343434)` 標題/主要文字、`--color-muted (#8E8B82)` 僅供邊框/分隔線/
        裝飾底色（不可用於內文文字）、`--color-muted-text (#6E6B62)` 供內文級次要文字
        （meta、副標、版權宣告，對白/paper 底對比約 5:1 通過 WCAG AA）、`--color-sand
        (#E9DCBE)` 米色 hover 底/標籤底、`--color-paper (#F3F3F3)` 頁面整體底色、
        `--color-primary (#6B4A34)` 由米色系推導的咖啡色強調色（CTA/連結/hover，對比已驗證
        通過 AA）。
    *   **字體分工**：大字級展示型標題（Hero、文章標題、Nav wordmark）用已內建但先前未使用
        的 Lora 襯線字體建立編輯雜誌感；小字級高資訊密度的 UI（表格、按鈕、標籤、導覽次要
        連結）維持 Open Sans 無襯線以確保清晰度。中文字重僅使用 400/700（因自架字型檔只有
        這兩種字重），標題不加 `tracking-tight`/`tracking-wide` 等字距 utility——這類拉丁
        排版習慣套用在全形中文字上會造成擠字或鬆散，不符合 CJK 排版慣例。
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
        改用 `bg-white/90 backdrop-blur-sm` 毛玻璃效果。
    *   **Hero 遮罩對比度（2026-07-12 修正）**：`.masthead .overlay` 由 `opacity-60` 調高為
        `opacity-70`。經 WCAG 對比度試算，60% 疊加在最壞情境（近純白背景圖）下白字對比僅
        約 3.68:1，大標題（大字門檻 3:1）過關但副標題/meta 等一般粗細文字（門檻 4.5:1）
        不通過；數學上需要 α ≥ 0.672 才達標，故調至 70%（對比約 4.9:1）。刻意不做「依圖片
        動態偵測明暗調整遮罩」——那需要 Canvas 像素取樣、有 CORS/效能成本，對此規模的部落格
        是過度工程，用「保守調高固定值覆蓋最壞情境」一次解決所有現有與未來背景圖的疑慮。
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
        圓鈕淡入，點擊開啟含 h2+h3 完整清單的 Bottom Sheet（`max-height: 70vh` 可內部
        捲動，`bg-black/40` scrim）。關閉方式四選一：點擊 scrim、下滑手勢（`touchmove`
        簡易位移判斷，非物理引擎，且僅在清單已捲到頂端時才允許拖曳避免與內部捲動衝突）、
        右上 X 按鈕、點擊任一連結（自動關閉後交由原生 hash 錨點捲動）。
    *   **sticky navbar 遮擋處理**：所有標題統一加 `scroll-margin-top: 6rem`（對應 navbar
        實測高度），錨點跳轉與 scroll-spy 判斷線共用同一個 `NAV_OFFSET = 96` 常數，不需要
        在各個點擊處分別計算 offset。
    *   **未新增任何 npm 套件或 CDN script**：`IntersectionObserver` 與 `touch` 事件皆為
        瀏覽器原生 API，與本專案「純 vanilla JS、無元件庫」的既有慣例一致。

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
