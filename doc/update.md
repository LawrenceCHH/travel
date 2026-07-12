> **維護規範：** 每次修改程式碼後，請更新此檔案 — 勾選已完成的
> 「目前目標」項目（如果修改產生了後續工作，請新增項目），並在「更新歷史」中
> 新增一筆帶有日期的記錄。如果變更影響了檔案結構或設計決策，也請一併
> 更新 [`./project.md`](./project.md)。完整規範請見根目錄的 `CLAUDE.md`。

## 目前目標

清理與維護 Vite + Tailwind CSS v4 純前端架構專案：

- [x] 將 Jekyll 專案完整遷移至 Vite + Tailwind CSS v4 純前端多頁面架構 (方案 A)
- [x] 開發 Node.js 文章元資料與索引建置腳本，預先計算中英文閱讀時間並產生 `posts.json`
- [x] 抽離重複 Layout，改為前端 `fetch` 動態載入 `navbar.html` 與 `footer.html` 元件
- [x] 重構 `index.html` 首頁，設定每頁 5 筆文章的前端分頁
- [x] 重構 `posts/index.html` 文章目錄，設定每頁 100 筆文章表格分頁，並整合標籤篩選與即時搜尋
- [x] 建立通用文章內頁 `posts/detail.html`，整合 `marked.js` 動態編譯並剝離 Front Matter，且新增上下一篇導覽按鈕
- [x] 配置 PWA 相關檔案 (`manifest.json` 與 `sw.js`)，編寫 Vite 打包雜湊快取防刷外掛
- [x] 移除專案中所有舊 Jekyll/Ruby 的無關檔案，包含 Gemfile、Gemfile.lock、_config.yml、_layouts、_includes、_posts，以及舊遺留檔案如 `assets/app.css` 與 `screenshot.png` 等
- [x] 更新 `.github/workflows/pages.yml` 部署流程為 Node/Vite 專屬版本，改為監聽 `main` 分支並打包 `dist` 部署
- [x] 調整建議頁面觸發與介面設計：導覽列移除建議頁籤，改由頁尾信件按鈕跳轉，表單姓名改為暱稱、移除電話欄位並優化置中版面
- [x] 新增三種不同風格的演示文章（學術版、旅遊隨筆、技術文章），整合自訂配圖與其排版樣式
- [x] 將 GitHub Pages 設定 (Settings) → 來源 (Source) 切換至 "GitHub Actions"（若是首次部署）
- [x] 視覺與排版全面改版：設計 Token 系統化（新中性色票 + 咖啡強調色）、標題改用襯線字體、
      Navbar 改為文字 Logo、文章內文導入 `@tailwindcss/typography` 排版、修正表格 RWD 溢出問題
- [x] 修復目錄頁標籤篩選下拉選單手機版破版（超出螢幕左側邊界）與清單可見高度過高的問題
- [x] 修復目錄頁標題搜尋輸入時畫面自動捲動、蓋住搜尋框看不到打字內容的問題
- [x] 提高 Hero 遮罩不透明度以確保各背景圖情境下文字對比度符合 WCAG AA
- [x] Bump PWA `sw.js` 的 `CACHE_NAME`（v13 → v14），配合本次 CSS/JS 行為變更強制舊快取失效
- [x] 新增文章大綱 (TOC) 元件：桌機固定側欄 + Scroll Spy、手機頂部速覽區塊 + 浮動按鈕 +
      底部抽屜快速跳轉，設計流程由 Opus（UI/UX）與 Opus（工程）分工審核後實作
- [x] Bump PWA `sw.js` 的 `CACHE_NAME`（v14 → v15），配合 TOC 功能新增的 `scripts.js`/CSS
      行為變更強制舊快取失效
- [x] 調整 TOC 底部抽屜：移除 X 關閉按鈕、內容置中且高度過半（`min-height: 60vh`）、
      背景改毛玻璃遮罩（`backdrop-filter: blur`）
- [x] 目錄頁文章列重排：標題字改小、日期移至標題下方、標籤改高雅低調膠囊 (`.tag-pill`)
- [x] Bump PWA `sw.js` 的 `CACHE_NAME`（v15 → v16），配合抽屜與目錄頁樣式變更強制舊快取失效
- [x] 目錄頁視覺強化（資深 UI/UX 審查回饋全採納）：分頁器改暖色 Token、篩選列改左結果計數+
      右控制並補即時更新、空狀態提示列、日期改 `tabular-nums`、列內 meta 帶收斂垂直節奏、
      `.tag-pill` 行高收緊、下拉/清除/確定/checkbox 補 `focus-visible` 焦點樣式、搜尋框
      emoji 改內聯 SVG 放大鏡圖示
- [x] Bump PWA `sw.js` 的 `CACHE_NAME`（v16 → v17），配合本次目錄頁視覺強化的 CSS/JS
      行為變更強制舊快取失效
- [x] 修正手機版 TOC 底部抽屜（Bottom Sheet）快速索引列設計不佳問題：清單改回左對齊＋
      左側色條縮排階層語彙，並補上桌機側欄原有的 active 目前章節高亮，抽屜高度改為
      隨內容自然撐開（不再強制置中/固定 60vh）
- [x] Bump PWA `sw.js` 的 `CACHE_NAME`（v17 → v18），配合本次抽屜樣式變更強制舊快取失效
- [x] 修正 TOC 抽屜標題「本文章節」置中對齊為靠左；修正 scroll-spy 次像素捨入導致錨點
      跳轉後重開抽屜時反白停留在前一個標題的 off-by-one 判斷錯誤
- [x] Bump PWA `sw.js` 的 `CACHE_NAME`（v18 → v19），配合本次修正強制舊快取失效
- [x] TOC 錨點跳轉改為平滑捲動動畫（`scrollIntoView({behavior:'smooth'})`），取代瀏覽器
      原生瞬間跳轉，尊重 `prefers-reduced-motion`
- [x] Bump PWA `sw.js` 的 `CACHE_NAME`（v19 → v20），配合本次修正強制舊快取失效
- [x] 全站配色改版：由「淺色紙感編輯風格」翻轉為「暖色調深色主題」，四色取自使用者指定
      色票（#222831/#393E46/#948979/#DFD0B8），設計決策由 Opus（資深 UI/UX 設計師角色）
      拍板，Sonnet 依規格全站落地實作
- [x] 重新設計文章封面圖 Hero 遮罩與標題文字配色，確保深色／淺色封面圖兩種最壞情境下
      標題文字對比皆通過 WCAG AA
- [x] Bump PWA `sw.js` 的 `CACHE_NAME`（v20 → v21），配合全站配色改版強制舊快取失效
- [x] 使用者確認全站配色改版要保留白色底色（推翻上一步 Opus 拍板的全站深色主題方向），
      重新設計為「白底＋灰色系深色字體為主，偶爾搭配四色票中的暖褐色系當強調色」
- [x] Bump PWA `sw.js` 的 `CACHE_NAME`（v21 → v22），配合白底配色修正強制舊快取失效
- [x] 修正文章詳細頁封面照片（Hero）中閱讀時間字色與標籤配色，使其在深色遮罩背景上具有足夠對比度，符合風格並通過 WCAG AA 規範
- [x] Bump PWA `sw.js` 的 `CACHE_NAME`（v22 → v23），配合 Hero 配色修正強制舊快取失效
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

### 2026-07-12 — 修正文章詳細頁封面照片（Hero）中閱讀時間字色與標籤樣式

修正點擊進去各文章頁面後，封面照片下方的閱讀時間等文字在深色背景上不夠明顯的問題：
*   **閱讀時間字色修正**：原本 `.reading-time` 被全域設定為 `@apply text-muted-text`（對比度僅 1.25:1 近乎不可見），新增 `.post-heading .reading-time` 規則使其在 Hero section 中改用 `--color-hero-text`（`#F4ECDD`），與日期統一，對比度提升至 6.19:1，完全通過 WCAG AA。
*   **標籤外觀精緻化**：為 `.post-heading #post-tags span` 設計了專屬的半透明 pill 樣式（`border-hero-text/30 bg-hero-text/10 text-hero-text text-xs`），既與目錄頁的標籤視覺呼應，又符合封面照片的深色美學，兼顧清晰可讀性與高質感。
*   **PWA `CACHE_NAME`**：`clean-blog-v22` → `clean-blog-v23` 以強制失效舊快取。

### 2026-07-12 — 全站配色三版修正：改回白色底色（推翻深色主題方向）

上一版（見下方「全站配色改版：暖色調深色主題」條目）由 Opus 判斷「灰色為主導色」應該
落地為全站深色主題並已實作。使用者實際看過後回饋兩句話：「底色為白色」、「底色為白色，
深色字體以灰色為主，偶爾搭其他顏色」——明確推翻深色主題方向，改為白底 + 灰階文字為主、
偶爾點綴暖色的方案（即 Opus 原本分析裡被否決的「淺底方案」，但這次由使用者直接拍板
採用）。這次由 Sonnet 直接用 Node 手算 WCAG 對比（未再另跑一次 Opus 設計決策，因為是
單純算術驗證，不需要重新做開放式設計判斷）重新分配 token：

*   **色票拆兩個家族運用**：`#222831`/`#393E46` 這組偏冷的深灰供「灰色為主」的文字使用；
    `#948979`/`#DFD0B8` 這組偏暖的褐/米供「偶爾搭配的其他顏色」（強調色/邊框/標籤底）
    使用——賦予四色票明確分工，而非隨機挑用。
*   **`@theme` 最終值**（`assets/tailwind.css`）：
    - `--color-paper` / `--color-surface`：`#FFFFFF`（頁面與卡片/導覽列同白，
      靠 `border-sand` 區隔層次，不做額外的白/近白雙階，避免過度設計）
    - `--color-ink`：`#222831`（主要文字/標題）
    - `--color-muted-text`：`#61656B`（由 `#393E46` 淺化衍生，對白底約 5.86:1 通過 AA，
      比 ink 略淺以建立次要文字的視覺層次）
    - `--color-muted`：`#888B90`（僅供 disabled 文字，常搭配 `opacity-40` 使用；
      初版曾誤用更淺的 `#B0B2B5`，實測在 `opacity-40` 疊加下會過於淡到近乎不可見，
      改用與原始改版前 `--color-muted #8E8B82` 相近的深淺度）
    - `--color-sand`：`#948979`（色票原色，邊框/分隔線/標籤底/hover 底——偶爾搭配的
      其他顏色）
    - `--color-primary` / `--color-primary-dark`：`#6F675B` / `#595249`（由 `#948979`
      加深衍生的暖褐強調色，對白底雙向皆約 5.57:1 通過 AA，同時滿足「文字疊在白底上」
      與「白字疊在強調色底上」兩種方向的可讀性）
    - `--color-hero-text` 維持 `#F4ECDD` 不變
*   **關鍵陷阱：Hero 遮罩不能跟著 `--color-paper` 翻白**——`.masthead .overlay` 二版時
    改綁 `bg-paper`（當時 paper 是深色，遮罩才會是深色），這次 `--color-paper` 改回白色
    後，若沒注意到這個關聯，遮罩會變成蓋在封面圖上的「白色」遮罩，直接讓深色封面圖上的
    淺色標題文字失去對比，等於重新製造使用者最初詢問的那個問題。已在改 `@theme` 時同步
    抓出並修正：改綁 `bg-ink`（`--color-ink` 這次仍是深灰 `#222831`，方向正確），遮罩
    機制與 0.78 不透明度、`--color-hero-text` 皆不受站內底色变化影響，維持獨立。
*   **`.prose` pre-code/pre-bg 還原引用 token**：二版曾因 ink/paper 語意互換而暫時改用
    字面值 `#1A1F26`/`#E4D8BF` 繞開衝突；這次 ink（深）/paper（淺）的深淺方向重新回到
    與改版前一致，直接改回引用 `var(--color-ink)`/`var(--color-paper)` 即可正確運作
    （深 code 底 + 白 code 字），移除了不必要的字面值特例。
*   **TOC 抽屜 active tint 重新換算**：`.toc-sheet .toc-link.is-active` 的 rgba tint
    需要對應新的 `--color-primary` rgb 值，由二版的暖金 `rgba(216,190,150,0.14)`
    改算為新暖褐 `rgba(111,103,91,0.12)`。
*   **因為大部分元件（導覽列/頁尾/按鈕/分頁器/下拉選單/表單/TOC 抽屜背景）先前就是
    引用 token 而非寫死色碼**，這次白底修正只需要動 `@theme` 區塊 + 上述兩個「方向性
    陷阱」特例，不需要重新逐檔案掃過一遍——這是二版採用「token-first」寫法帶來的直接
    好處（详见二版條目「因為大部分元件…全站落地」段落）。
*   **PWA `CACHE_NAME`**：`clean-blog-v21` → `clean-blog-v22`；`manifest.json` 的
    `background_color`/`theme_color` 與 5 個頁面的 `<meta name="theme-color">` 皆從
    二版的 `#222831` 改回 `#FFFFFF`。
*   **驗證**：`npm run build` 成功；用系統內建 chromium headless 重新截圖同一篇深色
    封面圖文章，確認導覽列/頁面底色已變回白色、內文標題為深灰、TOC 側欄 active 項目
    呈現暖褐色調，且 Hero 遮罩仍正確維持深色、標題文字仍清楚可讀（未因底色翻白而連帶
    劣化）。

### 2026-07-12 — 全站配色改版：暖色調深色主題（Opus UI/UX 設計決策 × Sonnet 實作，已被上方白底版本取代）

使用者提供四色色票（`#222831`／`#393E46`／`#948979`／`#DFD0B8`，「灰色為主要代表色」）
要求全站換色，並詢問文章封面圖 Hero 遮罩在深色封面圖情境下標題文字如何維持可讀性。
流程：Sonnet 先盤點現有 7 個色彩 token（ink/muted/muted-text/sand/paper/primary/
primary-dark）在全站的實際用途（導覽列、按鈕、TOC、分頁器、下拉選單、`.prose` 排版、
Hero 遮罩等）→ 交給 Opus（資深 UI/UX 設計師角色）判斷「灰色主導」的具體落地方向並
產出逐 token 色碼規格 → Sonnet 依規格實作。

*   **Opus 的方向判斷**：翻轉為「暖色調 moody 深色主題」，而非「淺底僅換強調色」。理由：
    這組色票明度是連續遞進的一整條深→淺灰階（非「一底色+三點綴」），只有深色方案能讓
    `#222831`/`#393E46` 這兩個灰真正鋪滿主導畫面，滿足「灰色為主要代表色」；淺底方案
    會被迫保留白/淺灰當主要 surface，灰色只能退居點綴，與需求矛盾。深色主題也讓 Hero
    （本來就是「深遮罩+淺字」）與全站語彙一致，順帶解決 Hero 深色封面圖的可讀性問題。
*   **Token 對照表**（`assets/tailwind.css` `@theme`）：
    - `--color-paper`：`#F3F3F3` → `#222831`（頁面整體底色，四色中最深階）
    - `--color-ink`：`#343434` → `#DFD0B8`（主要文字/標題，語意由「深」翻轉為「淺」）
    - `--color-muted-text`：`#6E6B62` → `#B7AC93`（`#948979` 提亮衍生，對 surface 約
      4.75:1 過 AA；`#948979` 原色直接當內文字對比不足，故衍生此變體）
    - `--color-muted`：`#8E8B82` → `#6E7681`（純中性灰，僅供 disabled 文字/裝飾）
    - `--color-sand`：`#E9DCBE` → `#948979`（色票原色，邊框/分隔線/標籤底/hover 底）
    - `--color-primary`：`#6B4A34` → `#D8BE96`（`#DFD0B8` 加飽和衍生的暖金，因四色本身
      沒有能與文字區隔的高彩強調色，連結會糊在內文裡）
    - `--color-primary-dark`：`#56392A` → `#C4A876`
    - 新增 `--color-surface: #393E46`（抬升面：導覽列/卡片/下拉選單/TOC 抽屜，取代所有
      隱含的 `bg-white`；深色主題需要「頁面底」與「抬升卡片」兩階可區分的暗面）
    - 新增 `--color-hero-text: #F4ECDD`（Hero 遮罩上的標題文字專用，見下）
*   **深字/淺字連動修正**：`--color-ink`/`--color-paper` 語意翻轉後，任何「深底淺字」
    寫死用法都要重新檢視方向是否仍成立——`.btn-primary`／分頁器 active 頁／`.toc-fab`
    圖示／`::selection` 選取文字，這些原本在強調色底上疊「白字」的地方，現在強調色
    `--color-primary`（暖金）依然是淺色，疊白字對比僅約 1.8:1 不合格，統一改疊
    `--color-paper`（`#222831` 深字，重用既有 token 而非另開新變數，因為 Opus 給的深字
    色碼恰好就是 paper 的值）。`--tw-prose-pre-bg`/`--tw-prose-pre-code`（code block 底/
    字）先前直接引用 `var(--color-ink)`/`var(--color-paper)`，兩者語意翻轉後會讓 code
    block 顏色對調錯誤，改用獨立字面值 `#1A1F26`/`#E4D8BF`（比頁面更深的底 + 米白字）。
*   **Hero 遮罩與封面圖文字規格**（回應使用者「深色封面圖字看不清」的提問，見
    `assets/tailwind.css` `.masthead .overlay`）：遮罩色改用 `--color-paper`
    （`#222831`），不透明度由 `0.70` 調高到 `0.78`；標題文字不沿用純白，也不用
    `--color-ink`（`#DFD0B8` 在 0.78 遮罩下對近純白封面圖的最壞情境對比偏緊），改用專屬
    的 `--color-hero-text`（`#F4ECDD`，比 ink 更亮的暖米白）。這個組合同時扛住兩種最壞
    情境：近純白封面圖時，遮罩把合成底壓到 L≈0.09，`F4ECDD` 對比約 6:1（一般粗細副標/
    meta 門檻 4.5:1、大標題門檻 3:1 皆過）；近全黑封面圖時合成底更暗，對比只會更高。
    `posts/detail.html` Hero 內原本寫死的 `text-white`/`text-gray-200`/`text-gray-300`/
    `text-blue-200`（標題/副標/meta/標籤的漸層灰階）統一改為 `text-hero-text`，不維持
    原本「越次要越淡」的透明度階層——刻意選擇不用透明度做層次，因為調低不透明度會直接
    削弱經過驗證的對比安全邊際，層次改由既有的字級/字重差異（h1 最大最粗、subheading
    次之、meta 最小）表現即可。維持既有「單層純色遮罩、不做 Canvas 動態偵測圖片明暗」
    的零運算成本原則，不因換色而改變這個既有架構決策。
*   **其餘連動元件**（逐一過 Opus 規格表落地）：
    - 導覽列 `bg-white/90` → `bg-surface/90`（`navbar.html`）
    - 頁尾社群圖示鈕 `bg-ink text-white hover:bg-primary` → `bg-surface text-ink
      hover:bg-primary hover:text-paper`（`footer.html`，因 ink 已翻轉為淺色，圖示
      hover 到暖金底時文字也要跟著翻深）
    - TOC 抽屜背景 `#fff` → `var(--color-surface)`；scrim `rgba(0,0,0,0.25)` 加深到
      `0.5`（深色頁面上原本的淡遮罩已不足以與底層區隔）；抽屜 `.is-active` 淡咖啡色
      tint `rgba(107,74,52,0.08)` 改暖金 tint `rgba(216,190,150,0.14)`
    - 分頁器/下拉選單/搜尋框（`scripts.js`）所有 `bg-white` → `bg-surface`；下拉選單
      `ring-black ring-opacity-5`（深底上看不見）→ `ring-sand/40`；分頁器 active 頁與
      TOC FAB 圖示的文字色比照上述「深字」原則改 `text-paper`
    - `about.html`／`posts/detail.html` 的內文卡片 `bg-white` → `bg-surface`
    - 新增全站表單控制項 base 規則（`input, textarea, select`）明確指定
      `background-color: var(--color-surface); color: var(--color-ink)`，否則深色主題下
      `contact.html` 的輸入框會落回瀏覽器預設白底黑字，與全站色調斷裂
    - 5 個頁面的 `<meta name="theme-color">` 與 `manifest.json` 的
      `background_color`/`theme_color`：`#343434`/`#F3F3F3` → 統一 `#222831`
*   **PWA `CACHE_NAME`**：`clean-blog-v20` → `clean-blog-v21`。
*   **驗證**：`npm run build` 成功；grep 全站確認無殘留的 `bg-white`/`text-white`/
    `text-gray-*`/`text-blue-*`/`ring-black`/`#343434`/`bg-ink`；grep 編譯後 CSS 確認
    `.bg-surface`/`.text-hero-text`/`.text-paper` 新 utility 與 `opacity:.78`
    （`.masthead .overlay` 的任意值透明度）皆已進 bundle。用系統內建 chromium headless
    截圖驗證一篇背景圖本身就偏深色（系統架構暗色示意圖）的文章內頁，確認標題／副標／
    meta／標籤在遮罩上清楚可讀，導覽列/TOC 側欄/文章卡片皆呈現一致的深色調性。

### 2026-07-12 — TOC 錨點跳轉改為平滑捲動動畫

使用者回報 TOC 連結（桌機側欄／手機頂部速覽／手機底部抽屜三處皆同）點擊後移動到定位點
是瞬間跳轉，希望改成有捲動動畫的效果。

*   **問題根因**：三處 TOC 連結都只是普通 `<a href="#id">`，捲動行為完全交給瀏覽器原生
    錨點跳轉處理——若頁面沒有設定 `scroll-behavior: smooth`，原生行為就是瞬間跳轉，
    沒有任何動畫。
*   **修法**：`assets/scripts.js` `initTOC()` 新增共用的 `smoothJump(e)` click handler，
    在三處連結建立時（`buildDesktopSidebar()`、`buildMobileOutlineAndSheet()` 內的頂部
    速覽清單與底部抽屜清單）各自 `addEventListener('click', smoothJump)`。
    `smoothJump` 先排除修飾鍵點擊（Ctrl/Cmd/Shift/Alt，保留原生「開新分頁」行為不受影響）
    與已被攔截的事件，才 `preventDefault()` 並呼叫 `el.scrollIntoView({ behavior, block:
    'start' })`；`behavior` 依 `window.matchMedia('(prefers-reduced-motion: reduce)')`
    動態切換 `'smooth'` 或 `'auto'`，符合無障礙規範不強迫有動暈症狀使用者看動畫。因為
    `preventDefault()` 取消了瀏覽器原生的 hash 跳轉，改用 `history.replaceState(null, '',
    '#'+id)` 手動同步網址列 hash（維持可分享的深層連結網址），刻意用 `replaceState`
    而非 `pushState`——避免每點一次標題就在瀏覽器歷史堆疊多塞一筆，導致使用者連續點好幾個
    章節後按上一頁要按好幾次才能真正離開文章頁。底部抽屜原本「點連結即關閉」的行為
    （`sheetList` 上的委派 click listener）不受影響，因為 `smoothJump` 只呼叫
    `preventDefault()` 沒有 `stopPropagation()`，事件仍會冒泡到 `sheetList` 觸發
    `closeSheet()`。`scrollIntoView` 直接沿用標題已有的 `scroll-margin-top: 6rem`
    CSS（與 `NAV_OFFSET` 常數對應同一個 sticky navbar 遮擋高度），不需要另外手動計算
    捲動終點座標。
*   **PWA `CACHE_NAME`**：`clean-blog-v19` → `clean-blog-v20`。
*   **驗證**：`npm run build` 成功；用系統內建 `/usr/local/bin/chromium --headless=new` +
    `chrome-remote-interface` 在點擊後以 80ms 間隔連續取樣 `window.scrollY` 八次，
    確認數值連續遞增（例如 `54→154→482→1034→1749→2495→3124→3545`）而非一次到位，
    證實動畫確實生效；同時確認點擊後網址 hash 正確更新、手機抽屜點擊連結後仍會自動關閉。
    桌機側欄連結另外用 1440px 寬度重複同一組取樣驗證同樣有平滑捲動效果。

### 2026-07-12 — 修正 TOC 抽屜標題對齊與 scroll-spy off-by-one 反白錯誤

使用者在實際點擊使用後回報兩個問題：(1) 抽屜標題「本文章節」仍置中，(2) 點擊抽屜索引
跳轉到對應章節後，再次打開抽屜，反白的項目跟實際所在章節不一致（永遠停留在「上一個」
標題）。

*   **標題置中**：`assets/scripts.js` `buildMobileOutlineAndSheet()` 內 sheet template
    的標題容器由 `class="px-4 pb-3 text-center"` 改為 `class="px-5 pb-3"`（移除
    `text-center`，靠左對齊呼應下方清單的靠左排版）。
*   **scroll-spy off-by-one（實際根因，非只是巧合的顯示延遲）**：用 headless Chromium
    重現後，在瀏覽器 DevTools Protocol 裡直接讀取錨點跳轉落點後目標標題的
    `getBoundingClientRect().top`，量到的值是 `96.625px`，而非預期的精確
    `96px`（`NAV_OFFSET`／`scroll-margin-top: 6rem`）。`computeCurrentId()` 原本的判斷式
    `top - NAV_OFFSET <= 0` 因此以 0.625px 之差判定「還沒到」，於是把反白權重留在
    上一個標題身上——這是瀏覽器對 `scroll-margin-top` 錨點跳轉套用次像素捨入造成的
    既有計算誤差，先前只是沒被注意到（桌機側欄同一套公式理論上也會遇到，只是使用情境
    較少人剛好卡在這個邊界值上測試）。修法為把嚴格比較放寬 2px 容忍值
    （`top - NAV_OFFSET <= 2`），已用相同的 headless 重現腳本確認修正後跳轉並重開抽屜
    可正確反白「目前所在」標題。
*   **PWA `CACHE_NAME`**：`clean-blog-v18` → `clean-blog-v19`。
*   **驗證**：`npm run build` 成功；用系統內建 `/usr/local/bin/chromium --headless=new` +
    `chrome-remote-interface`（暫時安裝於 scratchpad）在 390×844 模擬下完整重現「開啟
    抽屜 → 點擊第 3 項連結跳轉 → 重新開啟抽屜」流程，確認反白項目與 `getBoundingClientRect`
    量測到的實際目前章節一致，且截圖確認標題已靠左對齊。

### 2026-07-12 — 修正手機版 TOC 底部抽屜快速索引列設計（UI/UX 審查）

使用者回報文章內頁「手機版 TOC 底部抽屜」的快速索引清單設計不好看。用 `ui-ux-pro-max`
skill 查詢導覽清單／bottom sheet 相關準則交叉比對後，定位出三個具體問題並修正，皆只動
`assets/tailwind.css` 的 `.toc-sheet*` 規則與 `assets/scripts.js` 的 `initTOC`，未新增
套件。

*   **問題 1：清單置中對齊，長短不一的標題造成左緣參差不齊、難以掃視**——導覽類清單的
    標準做法是靠左對齊而非置中（置中僅適合單行、等長或純裝飾性文字）。`.toc-sheet-list`
    移除 `text-align: center` + `justify-content: center`；`.toc-sheet .toc-link` 移除
    `text-align: center`。
*   **問題 2：h2/h3 階層線索被拿掉**——前次改版（見下方 2026-07-12 抽屜微調記錄）為了置中
    刻意移除了桌機側欄用的左側色條縮排（`border-left`），導致手機抽屜裡 h2/h3 只能靠字級
    大小分辨，長清單容易搞不清楚 h3 是屬於哪個 h2。此次讓抽屜沿用桌機側欄的
    `.toc-link` 基底樣式（保留 `border-left` 色條），額外用 `margin-left` + 加大
    `padding-left` 讓 h3 縮排更明顯。
*   **問題 3：抽屜沒有「目前章節」高亮，桌機側欄卻有**——導覽準則明確要求目前所在位置要有
    視覺標示，先前只有桌機側欄的連結會被 `updateActive()` 加上 `.is-active`，手機抽屜的
    清單完全沒有這個機制。`assets/scripts.js` 把原本寫在 `buildDesktopSidebar()` 內部的
    scroll-spy 計算邏輯（`computeCurrentId()`／IntersectionObserver／scroll listener）
    提升到 `initTOC` 頂層共用一份，新增 `activeUpdaters` 陣列讓桌機側欄與手機抽屜各自
    註冊自己的清單、各自訂閱同一份「目前章節 id」廣播，避免重複掛兩份 IO/scroll
    listener。`.toc-sheet .toc-link.is-active` 額外補一個淡咖啡色底 tint
    （`rgba(107,74,52,0.08)`）加強在抽屜裡的辨識度（純色條在較寬的抽屜清單裡不夠明顯）。
*   **順手修正**：抽屜高度原本 `min-height: 60vh` 強制撐開、內容用
    `justify-content: center` 塞進置中，造成標題少的文章清單懸浮在一大片空白中間、
    視覺上不像清單反而像單張卡片。改為移除 `min-height`，讓抽屜隨內容自然撐高（僅保留
    `max-height: 80vh` 上限），清單改由上往下正常排列，並補上
    `padding-bottom: env(safe-area-inset-bottom)` 處理 iOS 底部安全區域。清單項目
    `padding` 加大至 `0.75rem` 上下確保觸控熱區，`li` 間距改用 CSS `gap`（原本
    Tailwind `space-y-1` 與新的 flex `gap` 會疊加，已移除 `space-y-1`）。
*   **PWA `CACHE_NAME`**：`clean-blog-v17` → `clean-blog-v18`。
*   **驗證**：`npm run build` 成功；grep 編譯後 CSS 確認 `.toc-sheet-list`／
    `.toc-sheet .toc-link` 規則已依新設計進 bundle（無 `text-align:center`、無
    `min-height:60vh`）。用系統內建 `/usr/local/bin/chromium --headless=new` 搭配
    `chrome-remote-interface`（暫時安裝於 scratchpad，未寫入專案 `package.json`）在
    390×844 模擬手機寬度下實際開啟兩篇文章的抽屜截圖驗證：純 h2 文章（技術文）清單
    左對齊、目前章節（`引言：高併發下的系統瓶頸`）有色條＋淡咖啡底＋粗體高亮；含
    h2+h3 的學術文抽屜清單中 `參考文獻 (References)`（h3）正確縮排、字級縮小、
    `muted-text` 灰字表現階層，且抽屜高度隨清單項目數量自然撐開、未強制置中撐版。

### 2026-07-12 — 文章目錄頁視覺強化（資深 UI/UX 審查回饋逐項落實）

由資深 UI/UX 設計師對目錄頁提出審查回饋，Sonnet 逐項實作，硬約束：不新增 npm 套件/外部
字型/CDN、維持既有色彩 Token 系統、維持 WCAG AA、中文標題不加 `tracking-*`。

*   **分頁器改暖色 Token**（`assets/scripts.js` `renderPaginationControls`）：一般頁碼
    button 由冷灰 `text-gray-700 bg-white border-gray-200 hover:bg-gray-100 hover:text-primary
    active:bg-gray-200` 改為 `text-ink bg-white border-sand hover:bg-sand/30 hover:text-primary
    active:bg-sand/50`；disabled 由 `text-gray-300` 改為 `text-muted opacity-40`；省略號
    `...` 由 `text-gray-400` 改為 `text-muted-text`。當前頁 `bg-primary text-white font-bold`
    維持不動。原本的冷灰色調脫離了本站的暖色設計系統，此次收斂統一。
*   **篩選/搜尋列改左資訊＋右控制，補結果計數**（`posts/index.html` + `assets/scripts.js`）：
    外層由 `justify-end` 改 `justify-between`，左側新增 `<span id="result-count">` 顯示
    「共 N 篇」，右側維持一個 `flex gap-3` 包住原本兩個並排控制元件。**實作時發現並修正一個
    潛在版面陷阱**：原始設計稿字面上是把控制元件包一層無明確寬度的 `flex` wrapper，但兩個
    子元素仍用 `w-1/2`（相對父層寬度的百分比）——當父層（wrapper）本身沒有明確寬度、靠
    shrink-to-fit 自動運算時，`w-1/2` 對「不定寬度」父層屬於循環依賴，375px 手機寬度實測
    會造成結果計數文字被擠到換行、控制元件寬度不穩定。修正為 wrapper 加 `flex-1 min-w-0`
    使其寬度改吃「外層 flex 容器扣掉計數文字後的剩餘空間」這個明確值，`w-1/2` 才有穩定的
    百分比基準；計數 `<span>` 加 `shrink-0 whitespace-nowrap` 避免被擠壓換行。結果計數靠
    `initPagination` 內新增的 `updateResultCount()` helper（讀 DOM `#result-count` 是否存在，
    存在才更新 `textContent = filteredItems.length`），在 `applyFilters()` 與 `render()`
    兩處呼叫，涵蓋首次載入、篩選、換頁全部情境；未改變 `initPagination` 對外呼叫簽名。
*   **空狀態「查無結果」**（`assets/scripts.js` `render()`）：`filteredItems.length === 0`
    時於 `#archive-table-body`（即 `<tbody>`）注入一列 `.toc-empty-row` 提示（「找不到符合的
    文章／試試調整標籤或清除搜尋關鍵字」），每次 `render()` 先移除舊的 `.toc-empty-row`
    再視情況重新注入，避免累積；因為用獨立 class 與 `itemSelector`（`.archive-row`）區隔，
    不會混入 `allItems` 快照或干擾分頁計數邏輯。
*   **日期不用 `font-mono`**（`posts/index.html`）：`<time>` 的 `font-mono` 改
    `tabular-nums`——`@theme` 未定義 mono 字體 Token，`font-mono` 會 fallback 到瀏覽器預設
    冷硬等寬字體，破壞編輯質感；`tabular-nums` 純粹讓數字等寬對齊，不影響字體家族。
*   **收斂列內垂直節奏**（`posts/index.html`）：把日期與標籤視為同一「meta 帶」，合併進
    `<div class="flex items-center flex-wrap gap-2 mt-1">`（日期在前、標籤群組在後），移除
    標籤 `<div>` 原本多餘的 `mt-0.5`，外層改 `flex flex-col gap-1`，間距統一交給 `gap`
    控制，讓「標題為主、meta 為輔」的層次更清楚，列與列之間更緊湊。
*   **膠囊標籤行高收緊**（`assets/tailwind.css` `.tag-pill`）：`leading-5` 改 `leading-4`，
    其餘（`rounded-full border-sand bg-sand/20 px-2.5 py-0.5 text-muted-text`）不動，維持
    低調基調。
*   **補鍵盤 focus 態**（`assets/scripts.js` `renderTagDropdown`）：下拉主鈕、清除鈕、確定鈕、
    checkbox 原本 `focus:outline-none` 卻無替代焦點樣式（a11y 缺口），統一補
    `focus-visible:ring-1 focus-visible:ring-primary`。搜尋框已有 `focus:border-primary`
    維持不動。
*   **搜尋框圖示改內聯 SVG**（`assets/scripts.js` `renderSearchBox`）：placeholder 的 emoji
    `🔍︎`（跨平台字重/對齊不一致、非設計系統一部分）移除，改為 placeholder 純文字「搜尋標題」
    ＋ input 左側 `absolute` 定位的內聯 SVG 放大鏡圖示（`stroke="currentColor"` 呼應下拉箭頭
    風格，`text-muted-text`），input 加 `pl-9` 留出圖示空間，外層容器加 `relative`；未引入
    任何外部圖示套件或 CDN。
*   **PWA `CACHE_NAME`**：`clean-blog-v16` → `clean-blog-v17`。
*   **驗證**：`npm run build` 建置成功；grep 編譯後的 `dist/assets/scripts-*.css` 確認
    `.tag-pill` 的 `leading-4`（`--tw-leading:calc(var(--spacing) * 4)`）、
    `.focus-visible\:ring-1:focus-visible`、`.focus-visible\:ring-primary:focus-visible`、
    `.opacity-40`、`.tabular-nums` 均已進 bundle。另用 `npm run preview` + headless
    Chromium 在 375px 寬度實際截圖驗證：篩選列計數與控制元件排版正確（未發現上述循環寬度
    陷阱前的破版）、分頁器暖色調＋disabled 狀態變淡、標籤行高收緊、搜尋框放大鏡圖示正確
    顯示、meta 帶（日期＋標籤同排）版面更緊湊。空狀態與 focus-visible 互動態因缺乏
    headless CDP 驅動工具（專案未安裝 puppeteer/playwright），改以程式邏輯覆核＋CSS bundle
    grep 確認規則存在，未做即時互動截圖。

### 2026-07-12 — TOC 底部抽屜與文章目錄頁樣式微調

由統籌者列出兩區塊調整項目，Opus 讀取現有程式碼後彙整逐檔規劃並實作。

*   **TOC 底部抽屜 (Bottom Sheet)**（`assets/scripts.js` `buildMobileOutlineAndSheet` +
    `assets/tailwind.css` `.toc-sheet*`）：
    *   **移除 X 關閉按鈕**：刪除 sheet template 內的 `.toc-sheet-close` 與其事件監聽，標題列
        由 `justify-between` 改為 `text-center`。保留其餘四種關閉方式（點 scrim、下滑手勢、
        Esc、點連結），頂端 grabber 拖曳條作為主要關閉提示。
    *   **內容置中、高度過半**：`.toc-sheet` 加 `min-height: 60vh`（原僅 `max-height: 70vh`，
        短清單時抽屜過矮不像主要重點），`max-height` 放寬至 `80vh`；`.toc-sheet-list` 改
        `flex: 1` + `justify-content: center` + `text-align: center` 讓清單在多出的高度內
        垂直＋水平置中。新增 `.toc-sheet .toc-link` scope 覆寫，移除桌機側欄用的左側色條縮排
        （`border-left`/`padding-left`），h3 子項改用較小字級與 muted 色表現層級而非縮排
        （不影響桌機側欄共用的基底 `.toc-link`）。
    *   **背景毛玻璃**：`.toc-sheet-scrim` 加 `backdrop-filter: blur(4px)`（含 `-webkit-`
        前綴），黑度由 `rgba(0,0,0,0.4)` 降為 `0.25` 避免疊加模糊後過暗。
*   **文章目錄頁 (`posts/index.html` inline render + `assets/tailwind.css`)**：
    *   **版面重排**：由雙欄 `<td>`（左日期／右標題+標籤）改為單一 `<td>` 垂直堆疊——
        標題 → 日期 → 標籤，日期改置於標題下方。維持 `<tr class="archive-row">` + `<a>`
        結構，`initPagination` 的 `itemSelector`/`data-title` 衍生邏輯不受影響。
    *   **標題字改小**：列內文章標題由繼承的 18px + `font-bold` 改為 `text-base` +
        `font-semibold`（頁首 masthead `<h1>` 不動）。
    *   **高雅膠囊標籤**：原 `#tag` 純文字 + `truncate` 改為會換行的 `.tag-pill`
        （`rounded-full` + `border-sand` + `bg-sand/20` 極淡米底 + `muted-text` 灰字 +
        11px），去掉 `#` 前綴。
*   **PWA `CACHE_NAME`**：`clean-blog-v15` → `clean-blog-v16`。
*   **驗證**：`npm run build` 建置成功，並確認編譯後的 `dist/assets/scripts-*.css` 含
    `.tag-pill`、`backdrop-filter:blur(4px)`、`.toc-sheet .toc-link` 等新規則。

### 2026-07-12 — 新增文章大綱 (TOC) 元件（Opus UI/UX × Opus 工程雙審核流程）

由統籌者提出需求規格（桌機左側固定大綱 + Scroll Spy、手機頂部速覽區塊 + 捲動後浮現的
懸浮按鈕 + 底部抽屜快速跳轉），開放兩個關鍵設計決策交由 Opus 判斷：桌機側欄的確切定位/
斷點/active 樣式，以及手機快速跳轉面板該用左側 drawer 還是底部 sheet。流程為 Sonnet 先
彙整技術事實 → Opus（資深 UI/UX 設計師角色）拍板響應式行為決策 → Opus（資深前端工程師
角色）依決策產出逐檔技術規格 → Sonnet 依規格實作。

*   **UI/UX 決策**：桌機側欄斷點訂在 `xl:`（1280px），因為 1024px 時 `max-w-3xl`
    文章卡片單邊留白僅約 128px，放不下側欄；1280px 起單邊約 256px 才夠。1024–1279px
    平板區間直接沿用行動版模式，不留 TOC 消失的空窗。Active 章節用文字轉咖啡色
    `text-primary` + 字重轉 500 + 左側 2px 色條標示，不用色塊/膠囊高亮（維持極簡調性）。
    行動版快速跳轉面板決定用 **Bottom Sheet**（非左側 drawer）：按鈕在右下拇指熱區，
    出現位置與觸發點同一垂直動線，且左側 drawer 的心智模型是「全站導覽」，用在單篇文章
    段內跳轉語意錯位；Bottom Sheet 是 Medium、Bear、iOS 閱讀類 App、Notion 行動版處理
    頁內動作的共通慣例。頂部速覽區塊只列 h2（維持文章開頭簡潔），Bottom Sheet 給完整
    h2+h3（使用者已有精確跳轉意圖）。h4 以下層級一律排除。
*   **技術實作**：`assets/scripts.js` 新增 `initTOC(contentContainer)`
    （`window.initTOC`），由 `posts/detail.html` 在文章內容注入與表格 RWD 修正完成後
    呼叫。TOC 走訪「渲染後」的 `#post-content` DOM 抓取 `h2`/`h3`（而非解析 Markdown
    原始碼），確保 Markdown 與手寫 HTML 兩種文章格式都能正確產生大綱；標題若無 `id`
    才自動指派繁中安全的 slug（保留 Unicode 文字字元，非 ASCII-only 轉寫，`Set` 去重
    保證唯一）。桌機側欄用 `position: fixed` 搭配算式
    `left: max(1.5rem, calc(50vw - 37rem))` 浮在文章卡片左側留白區（卡片本身不位移），
    Scroll Spy 用 `IntersectionObserver` 觸發、但由幾何位置重算決定實際 active 項目
    （避免短小節被跳過），另掛一個被動 `scroll` 監聽同一份邏輯當保險。行動版：頂部速覽
    區塊插入 `#post-content` 最前面；速覽區塊捲出視窗後浮動按鈕淡入；Bottom Sheet 提供
    四種關閉方式（點擊 scrim、簡易 `touchmove` 位移判斷下滑手勢、右上 X 按鈕、點擊連結）。
    所有標題統一加 `scroll-margin-top: 6rem` 處理 sticky navbar 遮擋，跳轉與 scroll-spy
    共用同一個 `NAV_OFFSET = 96` 常數。CSS 新增於 `assets/tailwind.css` 的
    `@layer components`（`.toc-sidebar`/`.toc-link`/`.toc-fab`/`.toc-sheet-*`），顯示/
    隱藏斷點交給 Tailwind 既有的 `hidden xl:block` / `xl:hidden` utility 而非另寫
    `@media` 區塊，避免斷點邏輯在 CSS 與 JS 兩處重複維護。未引入任何新 npm 套件或 CDN
    script（`IntersectionObserver`/`touch` 事件皆瀏覽器原生）。`public/sw.js` 的
    `CACHE_NAME` bump 至 `clean-blog-v15`。
*   **驗證**：`npm run build` 成功。用 headless Chromium 透過暫存 iframe 測試頁
    （未納入版控）模擬桌機 1440px 寬度捲動、確認側欄正確浮於留白區且 Scroll Spy 高亮
    對應章節；模擬 375px 手機寬度確認文章開頭速覽區塊正常渲染、程式化點擊浮動按鈕後
    Bottom Sheet 正確開啟（DOM 確認 `is-open` class 與內容清單皆正確；因 headless
    `--virtual-time-budget` 模式無法正確推進 CSS transition 動畫，另用暫時關閉
    transition 的方式截圖確認開啟後的靜態最終狀態）。

### 2026-07-12 — 修復目錄頁篩選/搜尋互動問題與 Hero 對比度（規劃由 Opus 資深前端工程師審核）

由統籌者（產品負責人）列出四項已知問題與兩項建議修改，Sonnet 撰寫規劃書後交由 Opus
扮演資深前端工程師審核，依審核意見確認方案後實作。

*   **標籤篩選下拉選單破版（手機）**：`assets/scripts.js` 的 `renderTagDropdown()` 中，
    選單原本是 `absolute right-0 w-72`（288px 定寬），錨點相對於「按鈕自身容器」
    （`posts/index.html` 裡 `tag-filter-container` 與 `search-container` 是同一個
    `flex-row justify-end` 裡的兩個 `w-1/2` 子元素，按鈕容器本身只有 ~130-180px 寬、
    落在整列的左半邊而非螢幕右緣）。288px 選單以 `right-0` 往左展開，在 320-375px
    窄螢幕上左緣會算出負值，超出可視範圍。修法：錨點改為 `left-0`（往右展開，左緣
    貼齊按鈕容器左緣，本來就對齊頁面內容區左側 padding，穩定落在視窗內），寬度改為
    `w-64 max-w-[calc(100vw-2.5rem)]` 作為安全上限，避免超出視窗。已用 headless
    Chromium 在 375px 寬度下模擬點擊開啟選單截圖確認完整落在可視範圍內。
*   **標籤篩選清單可見高度過高**：`#tag-checkbox-list` 的 `max-h-[320px]`（約可見
    10 筆）改為 `max-h-48`（12rem = 192px，約可見 6 筆），其餘標籤靠內部
    `overflow-y-auto` 捲動選取；Opus 審核認為第 6 筆被切一半是良好的「可捲動」視覺
    提示，不需要額外加高緩衝。
*   **標題搜尋輸入時畫面自動捲動蓋住輸入框**：`renderSearchBox()` 每個 `input` 事件
    都呼叫 `applyFilters()` → `render(1)`，而 `render()` 只要非首次載入就一定會
    `window.scrollTo(...smooth)` 捲動到列表容器頂端——因為搜尋框位於列表容器上方，
    每次打字都會把輸入框捲出可視範圍（手機虛擬鍵盤情境更明顯），導致看不到自己
    打的關鍵字。修法：`render()` 新增第三個參數 `shouldScroll`（預設 `true`），
    `applyFilters()` 內的呼叫改為 `render(1, false, false)`（篩選/搜尋造成的重新
    渲染不捲動畫面）；分頁按鈕點擊與瀏覽器上一頁/下一頁（`popstate`）維持吃預設值
    `true`，換頁時仍會捲動到清單頂端。已用 headless Chromium 模擬在搜尋框輸入
    「京都」後截圖確認畫面未捲動、輸入框內容清楚可見、清單已即時篩選。
*   **Hero 遮罩對比度**：`.masthead .overlay` 原本固定 `bg-ink opacity-60`。經 WCAG
    對比度試算，60% 疊加在最壞情境（近純白背景圖）下，白字對比約 3.68:1——大標題
    （屬「大字」，門檻 3:1）過關，但副標題／meta 等一般粗細文字（門檻 4.5:1）不通過。
    數學上需要 α ≥ 0.672 才能達標，改為 `opacity-70`，換算後對比約 4.9:1，安全超過
    4.5:1 門檻。Opus 審核同意用「調高固定 opacity 覆蓋最壞情境」取代動態偵測圖片
    亮度（後者需 Canvas 像素取樣，對此規模的部落格是過度工程），並確認不需要折衷到
    65%（65% 僅約 4.2:1，仍不過 AA）。
*   **PWA `sw.js` CACHE_NAME bump**：`CACHE_NAME` 由 `clean-blog-v13` 改為
    `clean-blog-v14`，配合本次 CSS/JS 行為變更，依 `CLAUDE.md` 規範強制已安裝 PWA
    的舊訪客清除殘留快取。
*   **維持不變（僅確認註記，無程式碼異動）**：「關於」頁面無導覽入口、Navbar 手機版
    漢堡選單死程式碼——這兩項先前已記錄於「未來建議修改方向」，本次統籌者明確表示
    不做修改，維持現狀。
*   **驗證**：`npm run build` 建置成功；`npm run preview` 起本地伺服器後，用 headless
    Chromium 在 375px 寬度下透過暫存驗證頁（iframe + 模擬點擊/輸入事件，未納入版控）
    截圖確認標籤選單完整落在可視範圍內、搜尋輸入不觸發畫面捲動。

### 2026-07-12 — 視覺與排版全面改版（簡潔高雅風格，色彩/字體系統重構）

由統籌者規劃、Opus（資深 UI/UX 設計師角色）審查、Sonnet（工程師角色）實作的三階段流程完成。

*   **設計方向確認**（產品負責人拍板）：標題採 Lora 襯線字體＋內文維持 Open Sans；主色調從
    青藍色 `#0085a1` 改為沉穩中性色系；Navbar 加入文字 Logo，維持現有 2 項導覽的極簡架構
    （不擴充項目、不做手機漢堡選單）。
*   **Opus 審查發現並修正的兩個規劃遺漏**：
    1.  中文襯線字體實際上未被載入（僅 Lora 支援拉丁字），多數 Android 裝置無內建中文襯線會
        fallback 到無襯線字——決議不引入外部 Google Fonts CDN（會破壞 PWA 離線快取架構），
        改記錄為已知取捨（詳見 `doc/project.md` 視覺設計系統章節）。
    2.  規劃書原訂的 `--color-muted (#8E8B82)` 若直接用於內文文字，對白/paper 底對比僅
        ~3.1–3.4:1，未達 WCAG AA 正文標準（4.5:1）。新增專用的 `--color-muted-text (#6E6B62)`
        token（對比約 5:1）供 meta、副標、版權宣告等內文級文字使用，`--color-muted` 收斂為
        僅供邊框/分隔線/裝飾底色。
*   **實際改動**：`assets/tailwind.css`（新色彩/字體 Token、標題與元件樣式、`.prose` 排版
    客製化）、`package.json`（新增 `@tailwindcss/typography` 依賴）、`public/components/
    navbar.html`（房屋圖示改文字 wordmark「旅遊指南」、`bg-white/90 backdrop-blur-sm` 毛玻璃
    nav）、`public/components/footer.html`、5 個入口頁（`index.html`、`about.html`、
    `contact.html`、`posts/index.html`、`posts/detail.html`，含 `theme-color` meta 更新、
    `bg-white`/`text-gray-900` 移除改用新 base 樣式、長文閱讀欄改白底卡片區隔 paper 底）、
    `posts/detail.html`（新增表格 `overflow-x-auto` 動態包裹，修正窄螢幕表格撐破版問題）、
    `assets/scripts.js`（標籤篩選/搜尋元件顏色 Token 替換）、`public/manifest.json`
    （`theme_color`/`background_color` 更新）。
*   **驗證**：`npm run build` 建置成功；用 headless Chromium 對首頁/關於頁/建議頁/文章目錄/
    文章內頁在 320/375/768/1024/1440 五種寬度實際截圖檢視，確認 Nav wordmark 不與「目錄」
    擠壓換行、長文白卡與 paper 底色層次正確、表格橫向捲動修正生效（用 `--dump-dom` 確認
    wrapper 確實包住 `<table>`）。統籌者事後另用乾淨 incognito headless session 重新截圖
    `posts/index.html` 覆核，排除「目錄」連結顯示咖啡色是否為異常——確認該色是既有的
    「目前頁面反白」功能（`scripts.js` 依 `currentPath` 比對加上 `text-primary`），非 bug。
*   完整施工清單與 Opus 審查意見存檔於本次任務的暫存規劃書中（未納入版控，供追溯決策脈絡）。

### 2026-07-12 — 解決 GitHub Pages 部署環境保護限制與更新 Node.js 版本

*   **GitHub Pages 部署設定說明**：
    *   指出因 GitHub Pages 環境保護規則（Environment Protection Rules）阻擋 `main` 分支部署至 `github-pages` 環境的問題。
    *   解決方案為使用者需至 GitHub 儲存庫 Web 介面的 **Settings** -> **Pages**，將 **Build and deployment -> Source** 切換成 **"GitHub Actions"**，即可授權工作流直接部署。
*   **工作流 Node.js 版本更新**：
    *   將 [pages.yml](file:///home/lawrencechh/j/travel/.github/workflows/pages.yml) 中的 `node-version` 升級為 `22`，以因應 Node 20 棄用警示。

### 2026-07-12 — 新增三類風格排版演示文章（HTML 加強版與純 Markdown 對照版）

*   **文章內容與配圖生成**：
    *   **學術風格文章**：
        *   HTML 加強版：[2026-07-12-academic-style.md](file:///home/lawrencechh/j/travel/src/posts/2026-07-12-academic-style.md)
        *   純 Markdown 版：[2026-07-12-academic-pure-md.md](file:///home/lawrencechh/j/travel/src/posts/2026-07-12-academic-pure-md.md)
        *   探討深度學習在 NLP 特徵空間的幾何結構。配置學術對照曲線圖 `academic_diagram.jpg`。
    *   **旅遊風格文章**：
        *   HTML 加強版：[2026-07-12-travel-style.md](file:///home/lawrencechh/j/travel/src/posts/2026-07-12-travel-style.md)
        *   純 Markdown 版：[2026-07-12-travel-style-pure-md.md](file:///home/lawrencechh/j/travel/src/posts/2026-07-12-travel-style-pure-md.md)
        *   細緻描述京都暮色漫步隨筆。配置京都黃昏法觀寺八坂塔照片 `travel_kyoto.jpg`。
    *   **技術寫作文章**：
        *   HTML 加強版：[2026-07-12-technical-style.md](file:///home/lawrencechh/j/travel/src/posts/2026-07-12-technical-style.md)
        *   純 Markdown 版：[2026-07-12-technical-style-pure-md.md](file:///home/lawrencechh/j/travel/src/posts/2026-07-12-technical-style-pure-md.md)
        *   詳解高併發 Web 系統與快取一致性實戰。配置系統架構拓撲圖 `tech_architecture.jpg`。
*   **排版結構設計對照**：
    *   **HTML 加強版**：內嵌 Tailwind 佈局（如微調容器寬度 `max-w-xl`、`max-w-2xl`，添加配圖圓角、懸停縮放陰影動畫，自訂 SVG 時間軸），實現高度定制化的美觀效果。
    *   **純 Markdown 版**：完全不使用任何 HTML 標籤（如 `<div>`、`<span>`、`<img />`）。純粹依靠 GFM（GitHub Flavored Markdown）的內建元素來實現美觀的結構：
        *   學術版：利用標準標題級別（`#`）、公式引言塊、表格以及測地線比率等原生標識符。
        *   旅遊隨筆：利用原生的 Emoji 符號配合列表項目、粗體時戳與二級塊引用來呈現清爽的散步行程時間軸，以原生 Markdown 嵌入圖片。
        *   技術文章：利用 GFM 原生警告提示塊（`> [!WARNING]`）、高亮程式碼塊（` ```javascript `）以及常規 Markdown 表格來呈現高凝聚力、層次分明的工程文檔。
*   **整合與建置**：
    *   執行 `npm run build:metadata` 重新生成含有 14 篇文章的 `posts.json` 並執行 `npm run build` 確認全部編譯成功。

### 2026-07-12 — 調整建議頁面觸發與介面設計

*   **導覽列與頁尾調整**：
    *   移除導覽列 `navbar.html` 中的「建議」頁籤，並將導覽列最大寬度從 `max-w-5xl` 縮減為 `max-w-3xl`，使導覽列元件能完美與主要內容欄位左右對齊。
    *   修改頁尾 `footer.html` 中的信件按鈕連結，由原先的 `mailto` 行為改為直接跳轉至建議頁面 `/travel/contact.html`。
*   **建議表單介面優化**：
    *   調整 `contact.html` 建議頁面表單的排版，將表單內容容器最大寬度縮減為 `max-w-xl`，並將簡介文字置中（`text-center`），使其在桌上型螢幕下更具視覺凝聚力與高級感。
    *   修改表單輸入欄位，將「您的姓名」改為「您的暱稱」（placeholder 改為「請輸入暱稱」）。
    *   完全移除「聯絡電話」輸入欄位與其對應的 DOM 元素，確保隱私性與簡潔度，同時保留 Formspree 送出與 `#name` 重設焦點的 JS 機制。

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
