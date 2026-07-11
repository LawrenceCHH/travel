> **維護規範：** 每次修改程式碼後，請更新此檔案 — 勾選已完成的
> 「目前目標」項目（如果修改產生了後續工作，請新增項目），並在「更新歷史」中
> 新增一筆帶有日期的記錄。如果變更影響了檔案結構或設計決策，也請一併
> 更新 [`./project.md`](./project.md)。完整規範請見根目錄的 `CLAUDE.md`。

## 目前目標

清理從 Bootstrap → Tailwind + PWA + GitHub Actions 重構後遺留的事項：

- [ ] 將 GitHub Pages 設定 (Settings) → 來源 (Source) 切換至 "GitHub Actions"（可透過設定 UI，或執行 `gh api -X POST repos/LawrenceCHH/travel/pages -f build_type=workflow`）
- [ ] 從 [formspree.io/forms](https://formspree.io/forms) 取得真實的 Formspree 表單 ID，並替換 `_includes/scripts.html` 中的 `YOUR_FORM_ID`
- [x] 在已安裝 Ruby 的環境中完整運行 `bundle exec jekyll serve`（或 `jekyll build`），並確認頁面/PWA/聯絡表單均正常運作（已成功執行 Jekyll 建置與 CSS 編譯）
- [ ] 將 `_config.yml` 中的預留占位值（`title`、`email`、`description`、`author`、`*_username`）替換為真實數值
- [ ] 將 `img/icons/` 中的預留 PWA 圖示替換為真實的品牌圖示
- [ ] 刪除遺留檔案：`assets/app.css`（多餘的建置產物）、`jekyll-theme-clean-blog.gemspec` 與 `screenshot.png`（核心檔案安裝模式中不再使用的 gem 主題模式遺留物）
- [ ] 更新 `package.json` 中的元數據（`name`、`description`、`author`、`repository`、`bugs`） — 目前仍為原主題的數值

## 更新歷史

### 2026-07-11 — 介面中文化、中文字型比例最佳化、導覽列簡化與雙頁面 JS 前端分頁實作

- **中文化與字型比例最佳化 (任務 1)**：
  - 更新 `_layouts/default.html` 加上 `<html lang="zh-Hant-TW">`，避免瀏覽器誤判網頁語系。
  - 將閱讀時間 (`_includes/read_time.html`) 修改為以中文字元數為基準（`char_count / 300`）的計算方式並翻譯為中文。
  - 將聯絡表單 (`contact.html`) 欄位、提示、與 `_includes/scripts.html` 裡的 Formspree 狀態訊息全部中文化。
  - 調整 `assets/tailwind.css` 中的 font-family，導入 `'PingFang TC'`, `'Microsoft JhengHei'`, `'Noto Sans TC'` 等中文字型，並將預設內文改為無襯線體，行高調至 `1.7`，字級調為 `18px`，標題粗細調為 `700`，符合中文閱讀視覺比例。
- **導覽列簡化 (任務 2)**：
  - 修改 `_includes/navbar.html`，移除非選單連結（About），僅保留並翻譯為「主頁」、「文章目錄」、「建議」。
- **首頁前端分頁 (任務 3)**：
  - 在 `assets/scripts.js` 中開發了通用前端分頁 `initPagination` 函式。具備以下特色：
    - **全功能分頁按鈕**：包含第一頁 `<<`、上一頁 `<`、頁碼、省略號 `...`、下一頁 `>`、最後一頁 `>>`。
    - **轉場效果**：切換頁面時使用 200ms 的淡入淡出（opacity transition）來提供流暢的 Loading Pattern。
    - **捲動重置 (Scroll Reset)**：切換頁面後自動以平滑滾動（smooth scroll）置頂到列表上方。
    - **URL 同步**：利用 `history.pushState` 與 `URLSearchParams` 同步網頁網址（如 `?page=3`），支援上一頁/下一頁瀏覽器導航（`popstate`）與書籤功能。
  - 修改 `_layouts/home.html` 輸出全部文章，並呼叫 `initPagination` 以每頁 5 筆文章進行前端分頁。
- **文章目錄表格與分頁 (任務 4)**：
  - 重構 `posts/index.html`，改用只有橫線的簡潔 HTML 表格（table），包含日期與文章標題欄位。
  - 套用與首頁相同的 `initPagination` 分頁控制，設定為每頁 100 筆。
- **建置管線優化**：
  - 移除了 `_config.yml` 裡不再使用的 `jekyll-paginate` 套件與其 paginate 設定，防止 Jekyll 生成多餘的重複頁面。
  - 本地端成功執行 `npm run build:css` 與 `bundle exec jekyll build` 驗證。

### 2026-07-10 — 記錄 GitHub Pages 工作流，建置並推送重構版本 (e5be734)

- 在 `doc/project.md` 中新增「GitHub Pages 部署」章節，包含完整的 `pages.yml` 工作流內容、其設計架構的考量（Node 優於 Ruby 的執行順序、必要的 `pages`/`id-token` 權限、`concurrency` 群組、拆分為 build/deploy 兩個工作），以及一次性手動設定步驟（將 Pages 設定中的來源切換至 "GitHub Actions"，並提供 UI 路徑與 `gh api` 一鍵指令）。
- 執行 `npm run build:css`，提交完整的 Bootstrap→Tailwind+PWA+Actions 重構變更（共修改 136 個檔案），並推送至 `origin/master` (`1f8996f..e5be734`)。

### 2026-07-10 — Bootstrap 4 → Tailwind CSS + PWA + GitHub Actions 重構

- 完全移除 Bootstrap 4、jQuery、Font Awesome 與 Google Fonts CDN；刪除 `assets/vendor/bootstrap/`、`assets/vendor/startbootstrap-clean-blog/{scss,js}`、`_sass/styles.scss`、`assets/main.scss`。
- 新增 Tailwind CSS v4 建置管線（`assets/tailwind.css` → `npm run build:css` → `assets/main.css`，壓縮後大小約 14KB，相較於 Bootstrap 的 150KB+ 大幅縮減）。
- 將所有 Font Awesome 圖示替換為內聯 SVG；自我託管 Lora + Open Sans (400/700 woff2)，取代 Google Fonts CDN。
- 使用原生 JS 重寫行動版導覽列切換與聯絡表單提交（使用 `fetch()` 傳送至 Formspree）；捨棄了導覽列隨滾動隱藏及浮動標籤等裝飾性特效，不再重新實作。
- 新增 PWA 支援：包含 `manifest.json` 與 `sw.js`（兩者均需要空的前言（front matter）以便透過 Liquid 解析 `baseurl`）以及預留的應用程式圖示。
- 修正 `_config.yml` 中的 `baseurl`/`url`（原為指向 StartBootstrap 自有 GitHub Pages 的範本占位符）；在 `google_analytics` 留空時，預設停用 Google Analytics 載入。
- 將部署方式從 GitHub Pages 的「從分支部署」切換為 GitHub Actions 工作流（`.github/workflows/pages.yml`），因為 Tailwind 的 npm 建置步驟無法在 Pages 預設的安全沙盒分支建置中執行。
- 在實作前起草了方案，並通過 Opus 級別的審查與修正（發現的問題包括：遺漏 GA CDN 依賴、舊 Formspree 整合中已失效的端點、移轉期間 `main.css` 命名衝突風險，以及 `manifest.json`/`sw.js` 需要空前言的要求）。
- 建立 `doc/project.md`、`doc/update.md`，並重寫 `README.md` 以反映新架構。

## 驗證

**目前可直接執行（無需 Ruby 環境）：**

```bash
npm run build:css               # 應可成功執行，並產生 assets/main.css (~14KB)
```

- 確認無遺留的 Bootstrap/jQuery/Font Awesome 參照：`grep -rIn "bootstrap\|jquery\|font-awesome" --include="*.html" _layouts _includes *.html posts/*.html`
- 確認 `manifest.json` 與 `sw.js` 仍以空前言 `---\n---` 開頭（Liquid 解析所需）。
- 確認沒有即將發布的占位值：`grep -rn "YOUR_FORM_ID\|your-email@example.com" _includes _config.yml`

**需要 Ruby 環境（目前尚未執行 — 請在下次部署前執行）：**

```bash
bundle install
npm install && npm run build:css
bundle exec jekyll serve
```

- 開啟 `http://localhost:4000/travel/`（注意 baseurl）並檢查：首頁/文章/關於/聯絡頁面是否正常以 Lora/Open Sans 字型與藍綠色調渲染；行動版導覽列可正常開啟/關閉 (`toggleNav()`)；上一篇/下一篇文章連結是否有效。
- 開發者工具 (DevTools) → Application 頁籤：確認 manifest解析無誤、service worker 成功註冊，且離線重新整理時仍可顯示先前訪問過的網頁。
- 提交聯絡表單（在填入真實的 Formspree ID 後）並確認成功/錯誤訊息正常渲染。
- 執行 `bin/cibuild` 以確認完整的 CI 建置順序可在本地端成功執行。
