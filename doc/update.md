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
- [x] 首爾文章手機閱讀體驗優化：機場接駁表格改垂直卡片、美食項目新增長輩友善屬性晶片、開場擴充 30 秒行前速覽、保險/違禁品細節改用 `<details class="fold">` 摺疊、統一「長輩」術語
- [x] 修正 CLAUDE.md 文件 drift：記錄 `npm run build:css` 指令已不存在於 `package.json`，CSS 實際由 `@tailwindcss/vite` 外掛在 `dev`/`build` 時即時編譯，驗證應改跑 `npm run build`（CLAUDE.md 本文尚未同步修正，見下方後續項）
- [x] 修正桌機版 TOC 側欄自動滾動聚焦與頁尾防破版遮擋機制
- [x] 首爾文章章節重排：改為「行程優先」結構，將行前準備／機場通關／機場接駁／退稅等作業性內容降級收攏進新增的 `## 出發前準備（主辦人專區）` 附錄，`## 景點漫遊` 上移至總覽之後成為主視覺重心
- [x] 修正 TOC 大綱誤收卡片內部標題：`initTOC` 的 heading 選擇器由 `querySelectorAll('h2, h3')` 收斂為 `:scope > h2, :scope > h3`，只取文章區塊層級（Markdown 產生）的章節標題，排除 `.emergency-card`／`.alert-box` 等卡片元件內自帶的 `<h3>`（如救護車/警局/各醫院、WOWPASS 步驟、行李限重提醒），首爾文章大綱條目由約 42 條降為 30 條，「緊急應變」子索引由約 11 條收斂為 3 條
- [x] 新增行動版章節分頁列（chapter tab bar）：`<1280px` 時 navbar 正下方常駐橫向膠囊列，複用既有 `toc`/`smoothJump`/`activeUpdaters`，並將 heading 的 `scroll-margin-top` 改為依斷點動態計算（`updateScrollMargins()`），避免標題被「navbar＋分頁列」蓋住
- [x] 修正行動版分頁列高亮半拍延遲：抽出共用的 `stickyOffset()`，讓 `computeCurrentId()`（scroll-spy 目前章節判定門檻）與 `updateScrollMargins()`（錨點跳轉落點）共用同一偏移量——行動版含分頁列高度、桌機維持 `NAV_OFFSET`(96)不變——點擊跳轉落地即正確高亮
- [x] 首爾文章「出發前準備」附錄再整理：標題移除「（主辦人專區）」與開頭「同行家人可略過」提示橫幅；區塊內小節重排為「機場通關步驟／機場接駁比較／免稅與退稅指南」固定置頂三項，其後依重要度排序（旅遊相關保險／網路與漫遊方案評估／支付工具與匯率評估／最新違禁品與行李規定），並將原「現場實用資訊」下的「推薦 App」「在地習俗與避雷」併入此區塊收尾；`## 現場實用資訊` 這個 H2 因此消失，行動版章節分頁列（`buildChapterBar`）為動態衍生標籤、無需改動即自動少一顆膠囊
- [x] 首爾文章「簡潔高雅」風格重整（美食／景點雜誌感卡片、出發前準備欄位化、緊急應變分類色碼）：`.food-item`／`.spot-card` 改雜誌感大襯線標題＋招牌菜暖褐 highlight（純 CSS flex order／`:nth-of-type` 重排，30 筆 HTML 不動）；出發前準備 4 個巢狀清單（網路漫遊／支付匯率／免稅退稅／在地習俗）改為滿版 `.compare-card` 欄位卡消除縮排右壓；緊急應變新增置頂 `.triage-list` 情境速查與 5 色分類色碼（醫療紅／警察藍／資訊琥珀／代表處綠／醫院靛），聯絡卡拆分並上色左色條
- [ ] **後續**：CLAUDE.md「Build reminders」一節仍寫著 `npm run build:css`，與實際建置流程不符，建議找機會直接修正 CLAUDE.md 原文（本次任務範圍未涵蓋修改 CLAUDE.md 本身，僅在此記錄 drift）
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

### 2026-07-15 — 首爾文章「簡潔高雅」視覺重整：美食／景點雜誌感、出發前準備欄位化、緊急應變分類色碼

*   **背景**：使用者（以資深 UI/UX 設計師視角）指出三個問題——(1) 美食／景點區塊字多但不吸睛、無法一眼掃到「想吃什麼／想去哪」；(2) 出發前準備充斥巢狀清單，內容朝右壓縮、左邊空空（純排版問題）；(3) 緊急應變風格不統一，危急時無法一眼鎖定該看哪一塊。經 `AskUserQuestion`（附 ASCII 預覽）確認三個方向：美食／景點走「雜誌感大標題」、出發前準備走「資訊卡／欄位排版」、緊急應變走「分類色碼＋圖示卡」。
*   **美食卡（`.food-item`，30 筆）＋景點卡（`.spot-card`，7 筆）→ 雜誌感**：**刻意不改動 30 筆項目的 HTML**，改以純 CSS 達成——`.food-item` 由 `border-b` 清單改為 `rounded-lg` 邊框卡片並設 `flex flex-col`，用 `order` 把「餐別 chip＋長輩友善屬性」提到店名上方當 kicker；店名 `.food-item-name` 放大為 `font-serif text-[22px]`；`.food-item-body` 亦設 flex，用 `:nth-of-type` 把既有的 價位帶(1)／招牌菜(2)／為何適合(3) 三列重排為「招牌菜(hero，暖褐 `--color-primary` 粗體)→價位(muted meta)→理由(本文)→按鈕」。已先以腳本驗證 30 筆 body 列順序完全一致，故 `:nth-of-type` 選取穩定。`.spot-title` 同步放大為 `font-serif text-[22px]`。
*   **出發前準備 → 欄位卡（消除巢狀縮排）**：4 個原本 2–3 層的 Markdown 巢狀清單改寫為滿版 `.compare-card`＋`.compare-row`（沿用既有機場接駁比較卡的元件，未新增樣式）：**網路與漫遊**（eSIM／實體 SIM／WiFi 分享器／中華電信 4 張卡）、**支付與匯率**（換匯與支付重點／氣候同行卡 2 張卡）、**免稅退稅**（退稅方式卡＋醫美退稅取消 `alert-warning`）、**在地習俗**（交通禮儀／秋季穿搭／無障礙避雷 3 張卡）。每列左標籤右內容、滿版對齊，左右不再失衡。內容逐項保留（連結、金額、警語不變）。
*   **緊急應變 → 分類色碼＋圖示卡**：置頂 `alert-note` 情境速查改為 `.triage-list`——5 條可點擊直撥（`tel:`／錨點）列，各帶分類色號 badge（119／112／1330／代表部／醫院）與左色條；下方原本「119／112／1330 共擠一張卡」拆成 3 張獨立色碼卡，代表部（綠）、3 間醫院（靛）各自上色，卡片標題加分類 `.em-tag` chip。新增 5 色語意色票（醫療 `#b23a3a`／警察 `#3f5e8c`／資訊 `#b07d1f`／代表處 `#4a7a55`／醫院 `#3f7676`，皆去飽和深色版、文字對白底過 AA），為功能性導引服務，僅用於此區塊。醫院分組 `<p>` 加 `id="em-hospitals"` 供情境速查跳轉。
*   **一個 cascade 修正**：`.cat-*`（左色條分類色）初版寫在 `.emergency-card`／`.triage-item` 之前，同 specificity 下被後者的 `border`／預設暖褐色壓過（Playwright 實測所有卡左色條都吃到 `#b56a43`）。將 5 條 `.cat-*` 移到緊急應變 CSS 區塊最末，來源順序壓過前者，左色條正確吃到分類色（已重新截圖確認）。
*   **驗證**：`npm run build` 成功、`swPrecachePlugin` 自動更新 `dist/sw.js` 雜湊（無須手動 bump `CACHE_NAME`）；`marked.parse()` 靜態檢查——無殘留 `**`、food-item 30／spot-card 7／compare-card 14／emergency-card 7、triage 5 條、`em-hospitals` id 存在；Playwright headless 於 390px／1280px 截圖確認雜誌感美食卡、欄位化網路卡、分類色碼緊急卡皆正確渲染，`document.documentElement` 無水平溢出（overflow=0）、console 無錯誤。

### 2026-07-15 — 首爾文章「出發前準備」附錄重排，併入 App／習俗避雷小節

*   **標題**：`## 出發前準備（主辦人專區）` → `## 出發前準備`，移除開頭給同行家人的「這一區可以略過」`.alert-box alert-note` 提示橫幅。
*   **小節順序**：固定置頂「機場通關步驟／機場接駁比較／免稅與退稅指南」三項，其後依重要度排序其餘小節：旅遊相關保險 → 網路與漫遊方案評估 → 支付工具與匯率評估 → 最新違禁品與行李規定 → 推薦 App → 在地習俗與避雷。
*   **併入**：原獨立的 `## 現場實用資訊` H2（僅含「在地習俗與避雷」「推薦 App」兩個 `###`）整段搬入「出發前準備」收尾，原 H2 標題本身移除，內容原樣保留。
*   **驗證**：`npm run build` 成功無錯誤；行動版章節分頁列 `buildChapterBar()`（`assets/scripts.js`）標籤是由 H2 全文動態衍生（含既有註解已預期「出發前準備（主辦人專區）」→「出發前準備」的縮寫規則），故本次標題與 H2 數量變動無需修改該函式，會自動少呈現一顆膠囊。

### 2026-07-14 — 修正行動版章節分頁列高亮半拍延遲（stickyOffset 統一偏移量）

*   **問題**：章節分頁列初版，scroll-spy 的「目前章節」判定（`computeCurrentId`）沿用固定 `NAV_OFFSET`（96px），但行動版標題的實際 scroll-margin 落點是「navbar＋分頁列高度」。兩者不一致 → 點擊膠囊跳轉落地那一瞬間，高亮短暫停在前一章節，約需再捲動 30 多 px 才切換。
*   **修正**：抽出共用函式 `stickyOffset()`（`assets/scripts.js` `initTOC` 內）：`>=1280px` 或無分頁列時回傳 `NAV_OFFSET`；`<1280px` 且分頁列存在時回傳 `navbar.offsetHeight + chapterBar.offsetHeight + 12`。`updateScrollMargins()`（錨點落點）與 `computeCurrentId()`（scroll-spy 門檻）改為共用此函式，兩者偏移量一致，跳轉落地即正確高亮。
*   **桌機不受影響**：`stickyOffset()` 在 `>=1280px` 直接回傳原本的 96；`buildDesktopSidebar` 的釘選/頁尾幾何仍直接使用 `NAV_OFFSET`，行為與修正前完全相同。
*   **驗證**：`npm run build` 成功；桌機（分頁列隱藏）判定路徑等同修正前。

### 2026-07-14 — 新增行動版章節分頁列（chapter tab bar），為既有 TOC 系統的延伸

*   **目標**：在文章內頁的既有 TOC 系統之上，為手機/平板（`<1280px`）新增一條 navbar 正下方常駐、橫向可捲動的膠囊分頁列，顯示本文各 `## ` 章節，捲動時高亮目前章節並可點擊平滑跳轉。桌機（`>=1280px`）已有左側欄，此分頁列維持隱藏。**沿用既有 TOC 基礎，未另起爐灶**：複用 `initTOC` 內既有的 `toc` 陣列、`smoothJump`、`activeUpdaters`。
*   **新增函式（`assets/scripts.js` 的 `initTOC` 內）**：
    *   `buildChapterBar(toc)`：只取 `toc.filter(i => i.level === 2)`（少於 2 個時 `return null` 不建立），逐一建立 `.chapter-pill`（掛 `smoothJump`）append 到一個 `.chapter-bar-scroller` → `.chapter-bar`（`position: fixed`、`xl:hidden`，append 到 `document.body`，比照側欄掛法）。短標籤衍生規則通用（去掉全形/半形括號附註＋只取空白/｜/`|` 分隔前第一段），不寫死本篇字串。內部 `measure()` 讀 `#mainNav` 的 `offsetHeight` 動態設定 `bar.style.top`（找不到 navbar 時預設 64px），掛 `load`/`resize`/`setTimeout(300ms)` 補算，應對 navbar 為非同步 fetch 注入。`updateVisibility()` 依 `.masthead` 下緣（或無 masthead 時 200px 門檻）切換 `.is-visible`，掛 `scroll`(passive)/`resize`。
    *   `updateScrollMargins()`：取代原本寫死在 `headings.forEach` 內的 `scrollMarginTop = '6rem'`。依 `window.matchMedia('(min-width: 1280px)')` 判斷斷點：`>=1280px` 維持 `96px`；`<1280px` 動態算 `navEl.offsetHeight + chapterBar.offsetHeight + 12`，套用到所有 `toc` 標題。掛 `load`/`resize`/`setTimeout(300ms)` 重算。此為整合關鍵：章節分頁列出現時若標題只避開 navbar 會被「navbar＋分頁列」一起蓋住，故需疊加分頁列高度。
*   **高亮與自動捲入視野**：`buildChapterBar` 內 push 一個 `activeUpdaters` closure：收到 `currentId`（可能是 h3 id）後在 `toc` 陣列中往回找最近的 `level===2` 項目對應的 id，為對應 `.chapter-pill` 加 `.is-active`，並比照桌機側欄 `offsetLeft`/`offsetWidth` vs 容器 `scrollLeft`/`clientWidth` 的邏輯把 active 膠囊水平捲入可見範圍。
*   **新增 CSS（`assets/tailwind.css` `@layer components`）**：`.chapter-bar`（`position:fixed`＋淡入淡出/位移 transition，`z-index:40` 低於 Bottom Sheet 的 50、高於一般內容；毛玻璃 `bg-surface/90 backdrop-blur-sm border-b border-sand xl:hidden` 直接以 Tailwind utility class 掛在 JS 建立的元素上）、`.chapter-bar-scroller`（隱藏捲軸，比照 `.toc-sidebar` 寫法）、`.chapter-pill`/`.chapter-pill:hover`/`.chapter-pill.is-active`（`bg-primary text-paper`，沿用站內既有已驗證通過 WCAG AA 的組合）。新增 `@media (prefers-reduced-motion: reduce)` 覆寫略過位移動畫。
*   **未破壞既有**：`:scope > h2, :scope > h3` heading 選擇器、`buildDesktopSidebar`、`buildMobileOutlineAndSheet`（頂部靜態 `toc-outline`／FAB／Bottom Sheet）皆未更動邏輯，僅 `headings.forEach` 內移除寫死的 `scrollMarginTop` 賦值（改由 `updateScrollMargins()` 動態管理）。scroll-spy 用的 `NAV_OFFSET`（96）依規格維持不變（僅為「目前章節」判定門檻，允許誤差）。
*   **驗證**：`npm run build` 成功無錯誤。另用 `playwright-core`（`NODE_PATH=$(npm root) node ...`）驅動 headless Chromium 對 `npm run preview` 產物實測 375px 寬度：初始頁頂分頁列隱藏、捲過 Banner 後淡入且 `document.body.scrollWidth` 無橫向溢出、6 顆膠囊短標籤符合預期（總覽/景點漫遊/美食推薦/現場實用資訊/出發前準備/緊急應變）、點擊膠囊後對應 H2 `getBoundingClientRect().top` 落在 navbar+分頁列高度下方（約 130px，正值、未被遮擋）；1280px 寬度時 `.chapter-bar` computed `display: none`、`.toc-sidebar` 正常顯示；全程 console 無錯誤。
*   **後續已修正（同批次）**：初版 scroll-spy 判定沿用固定 `NAV_OFFSET` 96px，導致剛點擊跳轉落地瞬間高亮短暫停留在前一章節。已抽出共用的 `stickyOffset()`（行動版＝navbar＋分頁列高度＋12，桌機＝`NAV_OFFSET`），供 `computeCurrentId()` 與 `updateScrollMargins()` 共用同一偏移量，跳轉落地即正確高亮；桌機邏輯不受影響。詳見上方「修正行動版章節分頁列高亮半拍延遲」更新歷史。

### 2026-07-14 — 首爾文章「緊急應變」改為情境速查導向、TOC 只留一個條目

*   **目標**：承上一則 TOC 選擇器修正後，「緊急應變」仍有 3 個 `###` 子標題（當地緊急求助電話／台灣駐外代表處／大型醫院推薦），使用者希望大綱在此節只保留「緊急應變」一個條目，並讓讀者一眼看懂「什麼狀況該聯絡什麼單位」。
*   **情境速查區塊**：於 `## 緊急應變` 開頭新增一個 `.alert-box alert-note`，用 Markdown 清單列出「情境 → 打給誰」對照（受傷/火災→119、治安/車禍→112、旅遊諮詢/口譯→1330、台灣人重大急難→駐韓代表部 010-9080-2761、就醫要英文診斷書→大型醫院）。alert-box 標題用 `<h3 class="alert-box-title">`（巢狀，不進 TOC）。
*   **3 個子標題改為非標題分組標籤**：原 `### 當地緊急求助電話`／`### 台灣駐外代表處`／`### 大型醫院推薦` 改為 `<p class="emergency-group">…</p>`（新增 CSS class，`assets/tailwind.css`），視覺上仍以小標＋底線分隔三組卡片，但因非 `h2/h3` 直接子，`initTOC` 不再收錄，「緊急應變」子索引由 3 條收斂為 0（該節僅剩 `## 緊急應變` 本身）。同時移除三組間原本的兩條 `---`，改由 `.emergency-group` 的上邊距與底線分隔。
*   **驗證**：`marked.parse()` 確認情境速查清單正確渲染為 `<ul><li>`、全文無殘留裸 `**`、`emergency-group` 為 `<p>` 非標題；文章真章節標題數由 30 降為 27；無連續 `---`；`npm run build` 成功。

### 2026-07-14 — 修正 TOC 大綱誤收卡片內部標題（緊急應變子索引灌爆問題）

*   **問題**：`assets/scripts.js` 的 `initTOC` 以 `contentContainer.querySelectorAll('h2, h3')` 掃描標題，會把 `.emergency-card`／`.alert-box` 等卡片元件內部自帶的 `<h3>` 標題也收進大綱。首爾文章「緊急應變」一節含 8 張 emergency-card（救護車 119／警局 112／1330／駐韓代表部／江北三星／首爾大學／延世／就醫防雷提示），加上全篇 `.alert-box` 標題（WOWPASS 步驟、行李限重提醒等），使 TOC 總條目膨脹到約 42 條，其中 12 條是不該出現的卡片標題。
*   **修正**：heading 選擇器改為 `contentContainer.querySelectorAll(':scope > h2, :scope > h3')`。由於文章內容以 `marked.parse()` 注入 `#post-content`，Markdown 產生的 `h2/h3` 是該容器的**直接子節點**，而卡片內的 `<h3>` 是巢狀子孫，`:scope >` 直接子選擇器正好只留下真正的區塊層級章節標題。TOC 條目由約 42 條降為 30 條（純 Markdown `##`×6＋`###`×24），「緊急應變」子索引由約 11 條收斂為 3 條（當地緊急求助電話／台灣駐外代表處／大型醫院推薦）。
*   **影響範圍**：桌機側欄與手機底部抽屜共用同一份 `toc` 陣列，故單點修正同時生效；卡片標題不再被指派 slug id（原本也無人連結），頁面可見內容完全不變。`npm run build` 編譯成功，`swPrecachePlugin` 自動更新 `dist/sw.js` 的雜湊資源名（scripts JS 內容變動→新雜湊→預快取清單自動刷新，無須手動 bump `CACHE_NAME`）。

### 2026-07-14 — 首爾文章重構為「行程優先」：景點漫遊上移、行前作業資訊降級為主辦人專區附錄

*   **目標**：文章原本的 H2 順序（總覽 → 行前準備 → 機場通關 → 景點漫遊 → 美食推薦 → 實用資訊 → 緊急應變）把「保險／網路／支付／行李／機場通關」這類主辦人才需要的作業手冊內容擋在行程與美食之前，對只想看行程分享給家人的讀者不友善。本次純粹重排 H2/H3 順序與層級，**不改寫任何逐字內容**。
*   **新的 H2 順序**：`## 總覽` → `## 景點漫遊` → `## 美食推薦` → `## 現場實用資訊`（新增，收納原「實用資訊」下的 `### 在地習俗與避雷`、`### 推薦 App`）→ `## 出發前準備（主辦人專區）`（新增附錄，開頭加一段 `.alert-box alert-note` 說明橫幅告知同行家人可略過此區，其下依序收納原「行前準備」1-4 項降級為 `###`：旅遊相關保險／網路與漫遊方案評估／支付工具與匯率評估／最新違禁品與行李規定，再接原 `## 機場通關` 整段降級為 `### 機場通關步驟`，最後接原「實用資訊」的 `### 機場接駁比較`、`### 免稅與退稅指南`）→ `## 緊急應變`（維持全篇最後）。舊的 `## 行前準備`、`## 機場通關`、`## 實用資訊` 三個 H2 標題本身已消失，內容全數保留、僅搬移位置。
*   **輕度去重**：機場通關 Step 4 stepper 內「晨間休息與防雷緩衝方案」原本重複列出 Darakhyu 膠囊旅館的詳細價格（與「景點1：首日緩衝」方案 B 重複），已將該行改為指向方案 B 的一句話參照，僅改動該單行文字，未變動 stepper 內 Markdown 清單的空行結構。
*   **驗證**：以 Python 腳本按行號切片重組全文，逐一 assert 搬移前每個區塊的標題文字與行號對應無誤；`sort` 後對全文做逐行 diff 確認除既定的標題改寫/新增橫幅/去重那一行外沒有任何內容被增刪；`grep -c` 確認 `.spot-card`(7)／`.food-item`(30)／`.compare-card`(4)／`.app-card`(5)／`.emergency-card`(5)／`.info-subcard`(15)／`<details class="fold">`(2) 數量與搬移前完全一致；`id="spot-1"`~`id="spot-7"` 與各 `href="#..."` 錨點對應的標題全數保留；`npm run build` 編譯成功無錯誤。

### 2026-07-14 — 修正 TOC 側欄自動滾動聚焦與頁尾防破版遮擋機制

*   **自動滾動聚焦**：在 `assets/scripts.js` 中，當 TOC 的當前選中項目 (`.is-active`) 改變時，自動比對該項目相對於側欄容器的偏移量，若是超出可見範圍則手動調整側欄 `scrollTop`。這解決了當右側滾動拉到最底部時，左側 sidebar 聚焦項目因不在可見區域而消失的問題。
*   **頁尾防破版遮擋**：實作與 Header 類似的邊界阻擋計算。動態尋找 `footer` 及其前面的 `HR` 作為頁尾界線。當側欄底部在 `position: fixed` 狀態下即將穿過頁尾邊界時，自動改用 `position: absolute`，並鎖定它的 `top` 偏移量，使其能貼齊被推回頁尾之上。
*   **異步頁尾同步更新**：動態 Fetch 載入 `footer.html` 完畢並置換 DOM 時，主動對 window 發送 `scroll` 事件，觸發側欄即時重新計算與頁尾的相對位置。

### 2026-07-14 — 首爾文章「手機閱讀體驗」優化：機場接駁卡片化、美食長輩友善晶片、條款摺疊、術語統一（feature/travel-guide-style-match 分支）

*   **P0-A 機場接駁比較改為垂直卡片**：`### 機場接駁比較` 下原本的 5 欄 Markdown 表格在 375px 手機寬度下必然橫向擠壓／水平捲動，且下方「方案 A／方案 B」散文與表格內容重複。改為 4 張 `.compare-card`（Klook 商務車／機場巴士 6701／AREX／現場計程車），每卡含卡頭（方案名 + `.stars` 星等）、一句話 tagline、`.compare-row` 明細列（車資／時間／班次．購票），並將原本藏在「方案 B」散文裡、表格沒有的 6701 搭乘月台與首末班車時間併入該卡的明細列，確保資訊零遺漏後刪除重複散文。
*   **P0-B 美食項目新增「長輩友善」屬性晶片**：30 個 `.food-item` 依既有「為何適合此同伴」文字，逐項機械式比對關鍵詞（不辣／軟嫩好入口／無內臟／無生食／桌邊代烤／需排隊）推導出 1–3 顆 `.diet-chip`，插入 `.food-item-meta-row`（餐別晶片）下方的新 `.food-diet-row`。其中「需排隊」使用警示變體 `.diet-chip.is-warn`。26/30 項目有對應晶片，4 項（珈琲島市廳店／大林倉庫／Point of View／Index Caramel）原文無可推導關鍵詞，依規則不硬湊、不新增 diet-row。
*   **P0-C 開場擴充為「30 秒行前速覽」**：`### 行前提醒膠囊` 標題改為 `### 30 秒行前速覽`，`.prep-pill-row` 由 3 條擴充為 5 條（新增網路方案、機場進市區首選/備選、現金備妥金額；保留原本的暖暖包與通關系統提醒），沿用既有 `.prep-pill` class，未新增樣式。
*   **P1-D 保險理賠細節／違禁品清單改用原生 `<details class="fold">` 摺疊**：「保額與理賠必知要點」保留醫療保額建議可見，其餘不便險新制／行李損失延誤／理賠三寶收進摺疊；「2026 最新航空違禁品規定」整段收進摺疊，`<summary>` 只露結論標題。`<details>` 內 Markdown 清單依 marked.js 對 raw HTML 內解析的既有慣例（比照 `.alert-box`/`.stepper` 寫法）在前後與清單間留空行，避免渲染成純文字。新增 `.fold`／`.fold summary` 樣式。
*   **P1-E 統一「同伴」術語**：精確字串「休憩處成員」（僅 2 處）改為「長輩」，並在首次出現處（旅遊相關保險段落開頭）加一句「本行程為帶長輩同遊設計：步調慢、每站都有休憩點、餐食忌辣與生冷」定位說明。刻意不動「年輕隨行成員」「隨行成員」（語意為年輕家人，與長輩不同），避免全域盲替換誤傷。
*   **新增 CSS class**（`assets/tailwind.css` `@layer components` 末尾）：`.compare-card`／`.compare-card-head`／`.compare-card-name`／`.compare-tagline`／`.compare-row`；`.food-diet-row`／`.diet-chip`／`.diet-chip.is-warn`；`.fold`／`.fold > summary`。全部沿用既有色彩 Token，未引入新色票、圖片或 JS。
*   **修正文件 drift**：CLAUDE.md 提到的 `npm run build:css` 指令在目前 `package.json` 已不存在——CSS 樣式實際由 `@tailwindcss/vite` 外掛在 `npm run dev`／`npm run build` 時即時編譯（`assets/main.css` 是未被引用的舊檔，不應編輯）。驗證編譯改跑 `npm run build`。
*   **驗證方式**：`npm run build` 編譯通過無誤；以既有的 Playwright（`node_modules` 快取於暫存目錄，透過 `NODE_PATH` 引入）驅動 headless Chromium，在 375px 寬度下對機場接駁卡、美食晶片列、行前速覽、兩處 `<details class="fold">`（含點擊展開）分別截圖與程式化斷言：4 張比較卡皆無水平捲動（`document.documentElement.scrollWidth === clientWidth === 375`）、晶片正確換行、5 條行前速覽、`<details>` 展開後內部確實渲染成 `<ul><li>` 而非純文字、`grep -c "休憩處成員"` 為 0，且瀏覽器 console 無錯誤。

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
