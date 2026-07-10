# 旅遊部落格 (Jekyll)

一個 Jekyll 部落格，最初基於 [Start Bootstrap 的 Clean Blog](https://startbootstrap.com/themes/clean-blog-jekyll/) 主題，現已使用 Tailwind CSS 重構，並加入 PWA 離線支援與 GitHub Actions 部署。

## 技術棧

- **Jekyll** — 核心檔案安裝（layouts/includes/posts 直接存在於此專案庫中，而非從 gem 主題引入）。
- **Tailwind CSS v4** (`@tailwindcss/cli`) — 實用工具優先（utility-first）樣式，透過 `npm run build:css` 進行建置。
- **原生 JavaScript (Vanilla JS)** — 無框架；`assets/scripts.js` 僅處理行動版導覽列的切換。
- **內聯 SVG (Inline SVG)** — 圖示均為手寫 SVG，無使用圖示字型（icon font）。
- **自我託管字型** — 將 Lora + Open Sans (400/700) 作為本地 `woff2` 檔案託管。
- **PWA** — 包含 `manifest.json` 與 `sw.js`，以支援安裝與離線閱讀。

在最近一次重構中**已移除**：Bootstrap 4、jQuery、Font Awesome、Google Fonts CDN。

## 前置需求

- Ruby 3.2+ 與 Bundler（用於建置網站）
- Node 20+（用於建置 CSS）

這兩個工具鏈都是必須的 — Jekyll 無法執行 Tailwind，而 Tailwind 也無法渲染 Liquid。

## 本地開發

```bash
bundle install
npm install
npm run build:css       # assets/tailwind.css -> assets/main.css (已納入 .gitignore，壓縮後約 14KB)
bundle exec jekyll serve
```

`assets/main.css` 是建置產物且不提交至 Git — 複製專案後必須至少執行一次 `build:css`，且每次修改 `assets/tailwind.css` 時也需重新執行。

若要在修改樣式時自動重新建置 CSS，請在第二個終端機視窗中執行監聽器：

```bash
npx tailwindcss -i ./assets/tailwind.css -o ./assets/main.css --watch
```

`bin/cibuild` 可一鍵執行完整建置（`npm run build:css` + `bundle exec jekyll build`） — 其步驟與 CI 執行的完全相同。

## 配置說明

請編輯 `_config.yml`：

- `title`、`email`、`description`、`author`、`*_username` — 目前仍是原主題的預留占位值；請替換為實際數值。
- `baseurl` / `url` — 目前設定為 `https://lawrencechh.github.io/travel`。
- `google_analytics` — 留空即可停用（不會發出任何外部請求）；設定 GA4 ID 即可啟用透過 `_includes/google-analytics.html` 進行的追蹤。

## 聯絡表單 (Formspree)

聯絡頁面會透過 `fetch()` 提交至 Formspree (`_includes/scripts.html`)。您必須替換預留的端點：

```js
var FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
```

請使用來自 [formspree.io/forms](https://formspree.io/forms) 的真實表單 ID 進行替換。較舊的 `//formspree.io/{email}` 端點格式已被 Formspree 棄用，將無法傳送郵件。

## PWA / 離線支援

`manifest.json` 與 `sw.js` 使網站可被安裝並支援離線閱讀：

- 靜態資源（`/assets/`、`/img/`、`/fonts/`）採快取優先（cache-first）服務。
- 網頁採網路優先（network-first）服務，並在離線時回退至快取 — 如此一來，訪客已開啟過的網頁在無網路連線時仍可閱讀。

如果您修改了預先快取清單，或想強制重新整理訪客的快取，請更新 `sw.js` 中的 `CACHE_NAME`（目前為 `clean-blog-v1`）。

`img/icons/` 中的應用程式圖示為預留占位符 — 請在正式發布前替換為真實的品牌圖示。

## 部署 (GitHub Actions)

推送至 `master` 分支會觸發 `.github/workflows/pages.yml`：

1. **build 工作** — 執行 `npm ci` + `npm run build:css`，接著執行 `bundle exec jekyll build` (`JEKYLL_ENV=production`)，並透過 `actions/upload-pages-artifact` 上傳產物。
2. **deploy 工作** — 透過 `actions/deploy-pages` 發布該產物。

> **需要進行一次性手動步驟：** GitHub → 專案設定 (Settings) → Pages → 來源 (Source) 必須設定為 **GitHub Actions**（此項目無法透過專案庫中的檔案進行設定）。這將取代舊有的「從分支部署 (Deploy from a branch)」模式。您也可以透過以下指令進行設定：
> ```bash
> gh api -X POST repos/LawrenceCHH/travel/pages -f build_type=workflow
> ```

## 專案結構

```
_layouts/, _includes/    Jekyll 範本
_posts/, posts/          部落格內容
assets/tailwind.css      Tailwind 原始碼（請編輯此檔案，而非 main.css）
assets/main.css          建置輸出產物（已納入 .gitignore）
manifest.json, sw.js     PWA 支援檔案
.github/workflows/       CI 建置 + 部署工作流
```

請參閱 [`doc/project.md`](doc/project.md) 以瞭解完整的檔案對照表與設計決策。

## 開發文件

- [`doc/project.md`](doc/project.md) — 供貢獻者/代理（agents）接手此專案庫時閱讀的架構快照。
- [`doc/update.md`](doc/update.md) — 目前任務清單、變更日誌以及驗證指令。

## 致謝與授權條款

基於 [Start Bootstrap](https://startbootstrap.com/) / [David Miller](http://davidmiller.io/) 的 [Clean Blog Jekyll](https://startbootstrap.com/themes/clean-blog-jekyll/) 主題建置，原主題基於 [Bootstrap](https://getbootstrap.com/)。程式碼採用 [MIT](LICENSE) 授權條款釋出（Copyright 2013-2021 Start Bootstrap LLC）。
