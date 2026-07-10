# 專案快照 (供代理使用)

Jekyll 旅遊部落格，**核心檔案安裝**（layouts/includes/posts 直接存在於此專案庫中，而非從 gem 主題中引入）。剛完成從 Bootstrap 4 到 Tailwind CSS 的重構。在探索本專案庫前請先閱讀此檔案 — 這能省去您進行 grep 搜尋的時間。

安裝/建置/部署指令 → [`../README.md`](../README.md)。未完成任務、變更日誌、驗證指令 → [`./update.md`](./update.md)。

## 技術棧

- Jekyll + `jekyll-feed` / `jekyll-paginate` / `jekyll-sitemap`
- 透過 `@tailwindcss/cli` 使用 Tailwind CSS v4（CSS 優先配置，無 `tailwind.config.js`）
- 原生 JS（無框架）、內聯 SVG 圖示、自我託管 Lora + Open Sans (woff2) 字型
- PWA：`manifest.json` + `sw.js`
- 部署：GitHub Actions → GitHub Pages（非基於分支的傳統 Pages 部署）

**已移除**：Bootstrap 4、jQuery、Font Awesome、Google Fonts CDN。如果您看見類似 `btn-primary` 或 `masthead` 的類別，它是定義在 `assets/tailwind.css` 中的**自訂 Tailwind `@layer components` 類別**，而非 Bootstrap 的遺留物 — 請勿假設其符合 Bootstrap 的語義。

## 如何使用此專案庫

**安裝 Ruby**（Jekyll 本體是用 Ruby 寫的，npm/Tailwind 只負責 CSS，兩者缺一不可，詳見上面技術棧段落）。以下針對 **Ubuntu/WSL(apt)** 環境，整段可直接複製貼上到終端機執行：

```bash
# 更新 apt 套件清單
sudo apt-get update

# 安裝 Ruby 本體、編譯工具，以及 bundle install 需要用到的開發函式庫
# （build-essential 用來編譯原生擴充套件；libssl-dev/libreadline-dev/libyaml-dev 缺了會導致
#  Ruby 編譯出來的版本無法處理 HTTPS/YAML，進而讓 bundle install 連不上 rubygems.org 或直接失敗）
sudo apt-get install -y ruby-full build-essential libssl-dev libreadline-dev libyaml-dev

# 安裝 Bundler（管理 Gemfile 依賴用的工具）
# gem install bundler
sudo gem install bundler -v 2.4.22

# 驗證安裝成功，兩行都應該印出版本號（CI 的 .github/workflows/pages.yml 釘的是 Ruby 3.2）
ruby -v
bundle -v

# 進入專案目錄，依 Gemfile 安裝 Jekyll 等套件
cd ~/j/travel
# 讓 gem 都裝在專案本地資料夾，不動系統目錄，避免權限問題
bundle config set --local path 'vendor/bundle'
bundle install

# 啟動本地開發伺服器
# 記得帶 --baseurl /travel，不然本機預覽的路徑會跟 _config.yml 裡設定的、
# GitHub Pages 實際使用的 /travel baseurl 對不上，連結會壞掉
bundle exec jekyll serve --baseurl /travel
```

**什麼時候要重跑指令、什麼時候伺服器會自動更新**：

- `bundle exec jekyll serve` 執行時會顯示 `Auto-regeneration: enabled`——**只要這個伺服器本身還在背景跑著**，不管你是新增一篇文章、改一篇文章內容，還是改 layout/`_includes`，存檔後它都會自動偵測、自動重新建置，您不用重跑任何指令，重新整理瀏覽器即可看到最新結果。
- 但如果您**關掉終端機或伺服器沒在執行**（例如換一台機器、重開機後第一次執行），不管您修改的是什麼，都要重新執行 `bundle exec jekyll serve`（或 `bundle exec jekyll build`）才看得到任何畫面——這點與您修改的內容種類無關。
- `npm run build:css` 是唯一的例外：它**不會**被 `jekyll serve` 的自動重新建置（auto-regeneration）觸發，是獨立的建置步驟。只有在您修改了 `assets/tailwind.css`（設計標記 token、新增 `@layer components`），或是在任何 HTML/文章中用到「之前整個專案都沒出現過的新 Tailwind 類別（class）」時，才需要重新執行。**單純新增一篇文章、撰寫一般文字內容，幾乎不會用到新類別，因此通常不用重新執行 `build:css`。**

簡單結論：修改 `_posts/` 新增文章 → 伺服器開著就會自動生效，不用碰任何建置指令；修改 CSS/JS/版面（layout） → 視情況可能需要重新執行 `npm run build:css`，但 `jekyll serve` 本身一樣不用重開。

**在任何類別/樣式變更後重建 CSS** — Jekyll 不會處理 Tailwind；您必須：

```bash
npm run build:css                                              # 單次執行
npx tailwindcss -i ./assets/tailwind.css -o ./assets/main.css --watch   # 編輯時持續監聽
```

忘記此步驟代表 `bundle exec jekyll serve` 將使用過期或遺失的 `assets/main.css` 進行渲染。

**新增部落格文章** — 在 `_posts/` 中建立一個名為 `YYYY-MM-DD-slug.md` 的檔案（已配置 kramdown，因此 `.md` 可正常解析 — 6 篇範例文章剛好是 `.html`，但新文章不需要是 HTML）。前言（Front matter）為必填項目：

```yaml
---
layout: post
title: "文章標題"
subtitle: "顯示於標題下方的一行副標題。"
date: 2026-07-10 09:00:00 -0000
background: '/img/posts/01.jpg'
---
```

正文內容置於結尾 `---` 下方，以純 Markdown（或 HTML）撰寫。無需修改其他檔案 — 首頁、`/posts` 索引與 RSS 訂閱源都會透過 Liquid (`site.posts`) 自動從 `_posts/` 抓取新文章，並按照前言中的 `date` 進行排序。

**新增靜態網頁**（如「關於/聯絡我們」） — 在專案庫根目錄建立包含 `layout: page` 前言（`title`、`description`、`background`）的 `name.html`，如果需要將其顯示在選單中，請在 `_includes/navbar.html` 中新增導覽連結（選單是手寫的 HTML，並非由設定檔驅動 — 參見下方的檔案地圖）。

**目錄結構：**

```
_config.yml        全站設定（見下方說明）
_layouts/           default.html (外殼) / home.html / page.html / post.html
_includes/           navbar (導覽列), footer (頁尾), head, scripts, google-analytics, read_time (閱讀時間)
_posts/              每篇文章一個檔案，檔名格式 = YYYY-MM-DD-slug.{md,html}
posts/index.html     分頁的文章列表 (layout: page)
about.html           靜態網頁
contact.html         帶有 Formspree 表單的靜態網頁
assets/
  tailwind.css         Tailwind 原始碼 — 在此編輯樣式
  main.css             建置輸出檔案（已納入 .gitignore，需執行 npm run build:css）
  scripts.js           原生 JS（控制行動版導覽列切換）
  fonts/               自我託管的 woff2 字型
img/                 文章/頁面背景圖片、img/icons/ (PWA 圖示)
manifest.json, sw.js  PWA 支援檔案
```

**配置 `_config.yml`：**

| 欄位 | 用途 |
|---|---|
| `title`, `description`, `author` | 顯示於頁首及網頁 `<title>` 中的網站名稱/標語/署名。 |
| `email` | 用於頁尾信箱圖示與 `mailto:` 連結。 |
| `baseurl` | 網站載入的子路徑（目前為 `/travel`，符合 GitHub Pages 專案網站的規則）。如果專案庫或網站名稱變更，請修改此項。 |
| `url` | 網站的完整網域名稱（目前為 `https://lawrencechh.github.io`），用於建置絕對 URL（標準網址標記、RSS 訂閱源）。 |
| `twitter_username` / `facebook_username` / `github_username` / `linkedin_username` / `instagram_username` | 若有設定，則在頁尾渲染對應的社群媒體圖示；留空則隱藏。 |
| `google_analytics` | 留空以停用（不會發出外部請求）；設定 GA4 ID 以啟用追蹤。 |
| `paginate` / `paginate_path` | 每頁文章數量與 `/posts` 的分頁網址格式。 |
| `plugins` | 使用中的 Jekyll 外掛 — 如果是透過舊的分支部署模式，請勿在此處新增外掛（它只允許特定的外掛白名單）；本專案庫中的 GitHub Actions 工作流則無此限制。 |

變更 `baseurl`/`url` 後，請重新建置並重啟 `jekyll serve` — Jekyll 僅在啟動時讀取 `_config.yml`，而非每次檔案變更時讀取。

## GitHub Pages 部署 (GitHub Actions)

部署方式**不是**舊版的「從分支部署」模式 — 它是位於 `.github/workflows/pages.yml` 的雙工作 GitHub Actions 工作流，在每次推送至 `master` 時觸發（或透過 `workflow_dispatch` 手動觸發）：

```yaml
name: Build and deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build:css
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.2
          bundler-cache: true
      - env:
          JEKYLL_ENV: production
        run: bundle exec jekyll build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

採用此結構的原因：
- **`build` 工作先執行 Node 再執行 Ruby** — Tailwind 必須在 `jekyll build` 將 `assets/` 複製到 `_site/` 之前產生 `assets/main.css`，否則 Jekyll 會發布一個沒有樣式表的網站。
- **`permissions: pages: write` + `id-token: write`** 是 `actions/deploy-pages` 執行所需（OIDC 權杖交換） — 缺少這些權限會導致部署工作因權限錯誤而失敗，而非建置錯誤。
- **`concurrency: group: pages`** 可防止在快速連續推送時，兩個重疊的部署產生競態條件（racing）。
- **拆分為 `build` + `deploy` 兩個工作**（而非單一工作）是 GitHub 官方 `configure-pages`/`deploy-pages` 動作所預期的模式 — `deploy` 負責部署 `build` 所上傳的產物。

### 一次性手動設定步驟（尚未執行 — 參見未完成任務 / `update.md`）

1. 將此工作流檔案推送至 `master`（已提交，因此請勿刪除它）。
2. In the GitHub repo → **Settings → Pages → Build and deployment → Source** 中，將來源從 "Deploy from a branch" 切換為 **"GitHub Actions"**。此步驟實際上將 Pages 與此工作流進行了綁定 — 若無此設定，工作流雖能執行並上傳產物，但不會發布任何內容。
   - UI 路徑：`github.com/LawrenceCHH/travel/settings/pages`
   - 或透過 CLI：`gh api -X POST repos/LawrenceCHH/travel/pages -f build_type=workflow`（若該專案庫已存在 Pages 網站，請使用 `-X PUT` 代替 `-X POST`）。
3. 推送至 `master`（或透過 Actions 頁籤 / `workflow_dispatch` 手動重新執行）以觸發首次部署。
4. 在 `https://lawrencechh.github.io/travel/` 進行確認 — 若網址不明確，請至 Actions 頁籤查看 `page_url` 輸出。

一旦切換至 GitHub Actions，任何舊版基於分支模式的 Pages 建置將停止發布 — 此工作流將成為發布至實際運作環境的唯一路徑。

## 檔案對照表

| 路徑 | 內容 / 注意事項 |
|---|---|
| `assets/tailwind.css` | **樣式的唯一可靠來源。** `@theme` 定義了 `--color-primary:#0085a1`、`--font-serif` (Lora)、`--font-sans` (Open Sans)。`@layer components` 定義了 `.masthead`、`.overlay`、`.page-heading`/`.post-heading`、`.subheading`、`.post-preview`、`.btn-primary`、`.section-heading`、`.reading-time`。在此進行編輯，然後重新建置。 |
| `assets/main.css` | `npm run build:css` 的建置輸出檔案。**已納入 .gitignore。** 請勿直接編輯 — 它會被覆寫。本地開發必須存在此檔案，否則 Jekyll 會轉譯出無樣式的網頁。 |
| `assets/app.css` | 從 Bootstrap→Tailwind 移轉過程中遺留的檔案（因權限錯誤阻礙了刪除）。已納入 .gitignore，可安全刪除，無任何檔案引用。 |
| `assets/scripts.js` | 僅包含一個函式：`toggleNav()`（控制行動版導覽列開關）。無使用 jQuery。 |
| `assets/fonts/*.woff2` | 自我託管的 Lora + Open Sans 字型，僅包含粗細 400/700。 |
| `manifest.json`、`sw.js` | **兩者最頂部均帶有空的 Jekyll 前言 (`---\n---`)** — 這是使用 Liquid 解析變數（如 `{{ site.baseurl }}` 等）的必要條件。請勿刪除這兩行，否則會破壞路徑解析。 |
| `sw.js` | 對於 `/assets/`、`/img/`、`/fonts/` 採用快取優先；對網頁採用網路優先且帶有快取回退；跨網域請求則不進行快取。`CACHE_NAME` 為 `clean-blog-v1` — **每當預快取清單或快取的資源變更時，請更新此字串**，否則訪客會一直讀取過期的快取。 |
| `_includes/scripts.html` | 註冊 service worker；同時包含聯絡表單的 `fetch()` 提交邏輯（Formspree 端點目前為占位符 — 詳見 update.md）。 |
| `_includes/google-analytics.html` | 包裹於 `{% if site.google_analytics %}` 中 — 留空代表完全不發出外部請求。 |
| `_config.yml` | `baseurl: /travel`，`url: https://lawrencechh.github.io`。社群/作者欄位仍為主題的占位符。 |
| `.github/workflows/pages.yml` | CI：執行 `npm ci` + `build:css` → `bundle exec jekyll build` → `upload-pages-artifact` → `deploy-pages`。 |
| `bin/cibuild` | 用於在本地執行與 CI 相同建置步驟的單行腳本。 |
| `img/icons/` | PWA 圖示 — 為此重構版本生成的臨時抽象圖示，非正式的品牌識別。 |

## 關鍵設計決策

- CSS 是一個**建置步驟**，而非 CDN 或執行期依賴項 — `assets/main.css` 僅在 `npm run build:css` 執行後才存在。這也是它被納入 .gitignore 的原因：建置它是 CI 的職責，而非 Git 的存儲職責。
- 原主題的裝飾性 JS 特效（導覽列隨滾動隱藏、浮動表單標籤）已被刻意捨棄，並未以原生 JS 重新實作 — 這樣做更簡潔，且符合本次重構所追求的輕量化與離線支援目標。
- 字型為自我託管（非 CDN），主要是因為離線支援是硬性需求 — 在離線狀態下請求 CDN 字型會失敗。
- 部署模式從「從分支部署」改為 GitHub Actions，因為 Tailwind 的建置步驟（`npm run build:css`）無法在 GitHub Pages 預設的分支沙盒建置環境中執行。

## 已知缺失（詳情與清單請見 [`./update.md`](./update.md)）

1. GitHub Pages Settings → Source 尚未切換至 "GitHub Actions"（手動、一次性，無法透過專案檔案設定）。
2. Formspree 聯絡表單的端點仍為占位符 (`YOUR_FORM_ID`) — 表單目前還無法寄送郵件。
3. 此重構版本尚未在 `bundle exec jekyll serve` 中運行過（因為建置環境中沒有安裝 Ruby） — 僅進行了靜態檢查。
4. `_config.yml` 與 `package.json` 仍保留原主題的預留占位元數據（標題/電子郵件/作者/社群連結/套件名稱）。
5. `img/icons/` 中的 PWA 圖示為臨時預留，非最終的品牌識別圖示。
