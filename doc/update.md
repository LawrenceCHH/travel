> **維護規範：** 每次修改程式碼後，請更新此檔案 — 勾選已完成的
> 「目前目標」項目（如果修改產生了後續工作，請新增項目），並在「更新歷史」中
> 新增一筆帶有日期的記錄。如果變更影響了檔案結構或設計決策，也請一併
> 更新 [`./project.md`](./project.md)。完整規範請見根目錄的 `CLAUDE.md`。

## 目前目標

清理與維護 Vite + Tailwind CSS v4 純前端架構專案：

- [x] 將 Jekyll 專案完整遷移至 Vite + Tailwind CSS v4 純前端 MPA 架構
- [x] 設計 Node.js 文章 metadata 生成腳本，動態計算字數與閱讀時間
- [x] 抽離 Layout 為動態 fetch 載入之元件（Navbar/Footer）
- [x] 首頁與目錄頁重構：實作前端分頁、整合標籤篩選與搜尋，優化 RWD 下拉選單與畫面捲動行為
- [x] 建立通用文章內頁 `detail.html`：整合 marked.js 解析、自動剥離 Front Matter、新增導覽按鈕
- [x] 新增文章大綱 (TOC) 元件：實作桌機固定側欄與手機 Bottom Sheet，支援 Scroll Spy 與平滑捲動跳轉
- [x] 全站視覺、排版與配色重構：以使用者四色票建立 Token 系統（確立白底方案），調整 Hero 遮罩與字色對比度以通過 WCAG AA，升級全站字型為 Inter，並優化中英文 Meta 排版
- [x] 配置 PWA 資源快取與 SW (sw.js)，自訂 Vite 雜湊快取防刷插件，配合多次功能變更升級 Cache 版本至 v25
- [x] 調整建議頁面版面，簡化表單欄位，並將觸發入口改為頁尾信件按鈕
- [x] 移除所有舊 Jekyll 遺留檔案與未使用的 Open Sans 字型檔，清理專案體積
- [x] 新增學術、旅遊與技術三種風格的 HTML 及純 Markdown 演示文章
- [ ] 從 [formspree.io/forms](https://formspree.io/forms) 取得真實的 Formspree 表單 ID，並替換 `contact.html` 中的 `YOUR_FORM_ID`
- [ ] 更新 `package.json` 中的元數據描述與真實的專案儲存庫（目前保留原 Jekyll 主題的資訊）
- [ ] 將 `public/manifest.json` 與元件中預留的 `your-email@example.com` 替換為真實數值

---

## 未來建議修改方向

以下項目在本次視覺改版過程中被發現或討論過，但刻意排除在本次範圍之外（多數是使用者
明確選擇不做，或屬於需要額外評估成本的中長期項目），記錄於此供後續排入待辦：

- [ ] **中文襯線字體跨裝置一致性**：目前中文標題襯線僅在有系統內建中文襯線字型（macOS
      Songti、Windows 新細明體）的裝置上生效，多數 Android 裝置無內建中文襯線會退回無襯線
      字體。若未來要追求完全一致的跨裝置「編輯雜誌感」，需自行 subset 打包 Noto Serif TC
      字型檔（僅收錄實際會用到的標題字元，避免全字集體積過大），並更新 `sw.js` 的
      precache 清單。
- [ ] **「關於」頁面目前沒有任何入口**：`about.html` 存在且已隨本次改版套用新樣式，但
      Navbar 與 Footer 都沒有連結指向它，一般使用者無法從導覽找到這個頁面。本次規劃階段
      有提出「把關於頁連回導覽列」的選項，使用者當時未勾選採用，維持現狀；若未來要恢復
      這個入口，建議與「是否要幫 Nav 增加手機版漢堡選單」一併評估（見下一項）。
- [ ] **Navbar 手機版漢堡選單**：`assets/scripts.js` 裡仍保留舊 Jekyll 主題遺留的
      `toggleNav()` 漢堡選單邏輯（對應 `#navbarResponsive` 元素），但目前 `navbar.html`
      只有 2 個導覽項目（Logo + 目錄），單排橫向排列在小螢幕也不會擠壓，因此沒有實際啟用。
      若未來導覽項目增加（例如加回「關於」），需要重新評估是否啟用漢堡選單，或考慮直接
      移除這段死程式碼。
- 以下三項為改版前既有的待辦，狀態未變，一併列於此處避免與上方「目前目標」重複追蹤：
  取得真實 Formspree 表單 ID、更新 `package.json` 專案元數據、替換
  `your-email@example.com` 佔位信箱（詳見上方「目前目標」清單）。

---

## 更新歷史

### 2026-07-14 — 首爾文章改版：移植 travel_guide/index.html 卡片式排版體驗（feature/travel-guide-style-match 分支）

*   **新增文章內文組件系統**：於 `assets/tailwind.css` 新增一組卡片/清單類別（`.gallery-grid`/`.spot-card`/`.food-item`/`.stepper`/`.app-card`/`.emergency-card`/`.alert-box` 等），移植自 `travel_guide/index.html`（外部旅遊手帳 App 原型）的視覺語彙，但色彩改用本站既有 Token（ink/sand/primary/surface），不沿用原檔案自帶的侘寂綠色票。互動一律改用純錨點跳轉，不移植原檔案的分頁 JS 與底部快捷列（本站已有 Navbar／TOC 側欄可用）。
*   **改寫 `src/posts/2026-07-13-韓國首爾旅行.md`**：在保留原有 Markdown 標題結構（供 TOC／錨點正常運作）的前提下，將條列文字置換為對應的卡片化 HTML 區塊——總覽的 7 大景點改為 `.gallery-grid` 導覽卡；行前提醒改為 `.prep-pill-row`；機場通關 Step 1-5 改為 `.stepper` 時間軸；7 個景點改為 `.spot-card`（含 `.day-label`/`.friendly-badge`/`.info-subcard`）；30 筆美食改為 `.food-item`（含分類 `.food-chip` 與 Naver/Kakao/食記三個 `.action-btn` 按鈕）；推薦 App 改為 `.app-card`；緊急聯絡改為 `.emergency-card`；所有 `[!NOTE]/[!WARNING]/[!IMPORTANT]` 提示改為 `.alert-box`（同時修正了這些提示先前因未安裝 GFM alert 擴充、只會顯示純文字 `[!WARNING]` 字樣的既有小瑕疵）。
*   **修正兩個渲染陷阱**（供未來寫作參考）：
    1.  `**粗體**` 若結尾是標點符號且緊接非空白字元（如 `**嚴禁託運！**必須`），marked/CommonMark 的定界符規則會拒絕收尾，導致literal `**` 殘留不轉換；文中 11 處（含 6 處原有未改動文字）改用 `<strong>` 原生標籤解決。
    2.  自訂 `not-prose` 不能透過 `@apply` 使用（它是 Typography 外掛的選擇器類，非一般 utility），必須直接寫在 HTML class 上；另外任何 flex 容器若子節點混雜「行內元素 + 純文字節點」，瀏覽器會把它們拆成個別 flex item 橫向排列而非同一段落換行，`.prep-pill` 因此改回區塊排版。
*   **驗證方式**：以 Playwright 對 `npm run build` + `npm run preview` 產物做全篇 7 個分頁的桌機/手機截圖比對，並用 Node 直接跑 `marked.parse()` 檢查渲染後 HTML 有無殘留 `**`、id 是否齊全、各元件數量是否與來源一致（30 food-item／7 spot-card／7 gallery-card／5 app-card／5 emergency-card／15 info-subcard）。
*   **後續**：目前變更僅存在於 `feature/travel-guide-style-match` 分支，尚未合併至 `main`；若要推廣此卡片化排版到其他文章，可直接複用 `assets/tailwind.css` 內新增的組件類別。

### 2026-07-13 — 修正桌機版 TOC 側欄初始蓋住 Banner 的問題，並隱藏側欄捲軸

*   **側欄改為「貼齊 Banner 下緣 → 捲動後固定」**：原本 `.toc-sidebar` 全程 `position: fixed`，導致頁面在最頂端時側欄文字會直接蓋在 Banner 圖片與標題上。改為初始 `position: absolute`，由 `assets/scripts.js` 的 `buildDesktopSidebar` 內 `updatePinnedState()` 監聽 `scroll`/`resize`，動態計算 Banner（`.masthead`）下緣位置；未捲動到該位置前側欄隨頁面捲動貼在 Banner 下方，捲動超過後才切換 `.is-pinned` class 改為 `position: fixed`，效果等同原生 `position: sticky`（因側欄掛載於 `document.body` 而非文章內文的 flow 子節點，無法直接套用原生 sticky）。
*   **隱藏側欄內部捲軸**：`.toc-sidebar` 加上 `scrollbar-width: none`（Firefox）與 `::-webkit-scrollbar { display: none }`（Chrome/Safari/新版 Edge），僅隱藏視覺捲軸樣式，`overflow-y: auto` 捲動功能不受影響。

### 2026-07-12 — 新增開發模式文章自動監聽更新插件

*   **Vite 開發伺服器自動化**：在 [vite.config.js](file:///home/lawrencechh/j/travel/vite.config.js) 中新增自訂插件 `watchPostsMetadataPlugin`，在本地開發模式下（`npm run dev`）會自動偵測 [src/posts/](file:///home/lawrencechh/j/travel/src/posts) 目錄中的變動（包含新增、修改、刪除 `.md` 和 `.html` 檔案）。
*   **熱更新 (Hot reload)**：偵測到變動後，插件會使用防抖動（Debounce）機制調用 `scripts/generate-posts-metadata.js` 重新編譯 `posts.json` 索引檔，並自動對瀏覽器發送 `full-reload` 訊號重載網頁，徹底解決新增/修改文章網頁未同步更新的問題。

### 2026-07-12 — 視覺與字型排版演進（白底配色、Inter字型與Meta排版優化）

*   **全站配色定案（白底方案）**：採用使用者指定的四色色票（`#222831`/`#393E46`/`#948979`/`#DFD0B8`）。經歷了「深色主題」嘗試後，最終確立白底（`#FFFFFF`）與偏冷深灰文字（`#222831`/`#393E46`），並搭配暖褐（`#948979`）作為強調色與邊框 Token 的設計。
*   **Hero 遮罩與對比度優化**：遮罩固定使用 `bg-ink`，不透明度調高至 `0.78`，文字強制使用 `text-hero-text`（`#F4ECDD`）。修復了詳細頁閱讀時間字色被全域樣式覆蓋的問題，確保在深色背景圖下對比度符合 WCAG AA。
*   **字型與微觀排版升級**：將無襯線字型升級為現代高清晰度的 `Inter` 變數型字型，移除未使用的舊 `Open Sans` 檔案。Hero 區副標題改為與大標題呼應的 `Lora` 襯線字體；移除 CJK 漢字的斜體（`italic`）屬性，並將元資料尺寸收細至 `text-sm`，提升易讀性與排版層次。

### 2026-07-12 — 文章大綱 (TOC) 元件開發與極致細化

*   **TOC 架構實作**：於文章渲染後動態掃描 `h2`/`h3` 生成大綱，支援 MD 與手寫 HTML。桌機版固定在文章左側，結合 `IntersectionObserver` 幾何計算做精準章節高亮；手機版在開頭提供靜態速覽，並在向下捲動時淡入懸浮按鈕以開啟 Bottom Sheet 抽屜。
*   **手機抽屜體驗微調**：移除了 X 關閉鈕（以頂部 grabber 拖曳條提示關閉），清單改回靠左對齊並保留階層色條縮排。新增手機抽屜的當前章節高亮（淡咖啡底色 tint），高度調整為隨內容自適應（最大 `80vh`）。
*   **平滑跳轉與精準度修正**：攔截原生瞬間跳轉，改用平滑捲動，並以 `replaceState` 寫入 hash 避免累積歷史堆疊。設定統一的 `scroll-margin-top: 6rem` 避開 sticky navbar 遮擋，並放寬 2px 誤差以修正 active 章節誤判。

### 2026-07-12 — 目錄頁視覺強化、下拉選單破版修復與內容建設

*   **下拉選單與搜尋捲動修正**：修復手機版標籤篩選下拉選單超出螢幕左側的問題，選單錨點改為 `left-0` 並限制最大寬度與高度。搜尋與篩選時不觸發畫面自動捲動，避免搜尋框被鍵盤推走。
*   **目錄頁視覺與 RWD 重構**：文章列由雙欄改為單欄垂直堆疊，標題字級改為 `text-base`，日期與膠囊標籤合併為單一 Meta 帶，分頁器改用暖色 Token，日期改為 `tabular-nums`，並加入即時結果計數與查無結果的空狀態提示。
*   **設計分析文件與演示文章**：編寫全站視覺與互動風格分析文件 `doc/style.md`；新增學術、隨筆與技術三類風格排版演示文章（HTML 加強版與純 Markdown 對照版）。

### 2026-07-11 — 遷移至 Vite + Tailwind CSS v4 純前端多頁面架構 (方案 A)

*   **專案架構現代化**：
    *   移除所有 Ruby 相關依賴（刪除 `Gemfile`、`Gemfile.lock`、`_config.yml`、`_layouts`、`_includes`、`_posts` 等）。
    *   專案全面移轉至以 Vite 為核心的前端 MPA 架構，啟用 ESM (`type: "module"`)。
*   **自動化建置元資料**：
    *   新增 `scripts/generate-posts-metadata.js`，在建置時掃描文章檔案，自動解析 Jekyll 格式的 Front Matter 與標籤陣列。
    *   整合中英文混合字數估算，預先在 Node 端計算「閱讀時間」，避免前端運算開銷。
    *   將所有提取的 metadata 彙整為 `public/data/posts.json` 索引檔，並將文章複製至 `src/posts/` 目錄。
*   **多頁面重構與 Layout 動態載入**：
    *   將 Navbar、Footer 獨立組件抽離至 `public/components/`，並在 `assets/scripts.js` 最尾端附加 fetch 加載邏輯，使多頁面能共用同一個 Header/Footer 版面。
    *   重構 `index.html` 首頁：在 DOM 載入後 Fetch `posts.json` 列表，渲染卡片，並透過 `initPagination` 進行 5 筆文章的前端分頁。
    *   重構 `posts/index.html` 文章目錄：展示簡潔橫線表格，每頁 100 筆，並與之前的標籤篩選與關鍵字搜尋邏輯完美結合。
    *   新建 `posts/detail.html` 通用文章內頁：動態 Fetch 當前 ID 對應的文章內容，使用正則表達式剝離 Front Matter，引入 `marked.js` CDN 解譯為 HTML 注入，並支持 HTML/MD 文章雙重渲染，以及「上一篇/下一篇」文章導航切換。
*   **PWA 與打包預快取優化**：
    *   將 `manifest.json` 與 `sw.js` 移動至 `public/` 目錄下，改為純前端 Base URL 設定 (`/travel/`)。
    *   在 `vite.config.js` 中編寫自訂插件 `swPrecachePlugin`，在 Vite 完成打包時，自動取得帶有 Hash 值的 `tailwind.css`、`scripts.js` 檔名並寫入 `dist/sw.js` 的預快取陣列中，保證離線載入能抓到最新的雜湊檔案。
*   **CI/CD 流程重塑**：
    *   修改 `.github/workflows/pages.yml`，移除了 Jekyll 相關建置指令。
    *   改用 Node.js 執行 `npm ci` -> `npm run build` -> 上傳 `dist/` 資料夾並部署至 GitHub Pages。
    *   將 Action 觸發分支更改為 **`main`**。
*   **專案垃圾清理**：
    *   刪除所有 Jekyll 快取與殘留物（`jekyll-theme-clean-blog.gemspec`、`screenshot.png`、`assets/app.css` 等）。
    *   更新 `.gitignore` 只保留 Node-based 相關 entries。

### 2026-07-11 — 介面中文化、中文字型比例最佳化、導覽列簡化與雙頁面 JS 前端分頁實作
*   *(詳細內容請參考 Git 歷史紀錄或舊版 update.md)*

### 2026-07-10 — 記錄 GitHub Pages 工作流，建置並推送重構版本 (e5be734)
*   *(詳細內容請參考 Git 歷史紀錄或舊版 update.md)*
