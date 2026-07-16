# 旅遊部落格 (Vite + Tailwind CSS v4 純前端版)

此專案已從傳統的 Jekyll (Ruby) 遷移至基於 **Vite** 與 **Tailwind CSS v4** 的純前端 MPA（多頁面應用）靜態架構。所有文章列表、目錄搜尋與篩選、以及 Markdown 文章渲染，皆在瀏覽器端 (Client-side) 動態處理，免去了 Ruby 執行環境與 Jekyll 建置的複雜度。

## 技術棧

*   **建置打包**：Vite (v5) + Rollup (MPA 多入口配置)
*   **CSS 樣式**：Tailwind CSS v4（使用 `@tailwindcss/vite` 插件）
*   **Markdown 解析**：用戶端使用 `marked.js` CDN 解譯
*   **PWA 離線支援**：`public/manifest.json` 與 `public/sw.js`（含自訂隨機雜湊資源快取防刷機制）
*   **部署**：GitHub Actions → GitHub Pages (發布 `dist/` 目錄，監聽 `main` 分支)

---

## 前置需求

*   **Node.js (v20+)** 與 npm

專案不再需要 Ruby、Gem 或是 Bundler 執行環境。

---

## 本地開發

### 1. 安裝套件
在專案根目錄下執行：
```bash
npm install
```

### 2. 啟動本地開發伺服器
```bash
npm run dev
```
這會自動執行文章元資料索引生成，並啟動 Vite 開發伺服器。請使用瀏覽器開啟預設的網址：`http://localhost:5173/travel/`（由於設定了專案 Base URL，請務必帶上 `/travel/` 才能正常載入頁面）。

### 3. 生產環境建置與預覽
進行靜態檔案編譯（打包結果將輸出至 `dist/`）：
```bash
npm run build
```
打包後預覽生產版本（主要用以測試 Service Worker PWA 快取與離線閱讀功能）：
```bash
npm run preview
```

---

## 如何新增部落格文章

1.  在 [src/posts/](src/posts/) 目錄下建立一個檔名格式為 `YYYY-MM-DD-slug.md`（或 `.html`）的檔案。
2.  在檔案最上方加入 Front Matter 區塊以描述文章資訊：
    ```yaml
    ---
    layout: post
    title: "您的文章標題"
    subtitle: "顯示於標題下方的一行副標題。"
    date: 2026-07-11 12:00:00 +0800
    background: '/img/posts/01.jpg'
    tags:
      - 日本
      - 自由行
    ---
    ```
3.  在第二個 `---` 底下以 Markdown 或 HTML 撰寫文章內容。
4.  保存後，在本地端執行 `npm run dev` 或 `npm run build`，腳本會自動抓取新文章並更新 `public/data/posts.json` 索引檔，無須手動編輯 JSON 檔案。在 GitHub Actions 部署時，CI/CD 也會自動跑此建置步驟。

---

## 專案目錄結構

```
.github/workflows/pages.yml   CI/CD 部署腳本，建置並發布 dist 目錄，監聽 main 分支
assets/
  tailwind.css                 Tailwind v4 樣式進入點與主題 Token、自訂組件定義
  scripts.js                   通用 JS，含動態 Layout 元件載入、分頁 (initPagination) 與 SW 註冊
public/
  components/                  共用頁面元件 (navbar.html, footer.html)
  data/
    posts.json                 由 Node 腳本自動產出的文章索引 JSON 檔 (已被 gitignore)
  img/                         影像資源與圖示
  manifest.json、sw.js         PWA 安裝與離線快取設定
src/
  posts/                       存放所有文章 Markdown/HTML 原始檔的目錄
scripts/
  generate-posts-metadata.js   Node.js 文章元資料與索引產生器
vite.config.js                 Vite 整合與多入口 (MPA) 設定檔，包含 swPrecachePlugin 插件
index.html                     首頁入口
about.html                     關於我們頁面入口
contact.html                   建議與聯絡表單入口
posts/
  index.html                   文章目錄頁面入口 (橫線表格，每頁分頁為 100 筆)
  detail.html                  通用文章內頁入口 (Fetch 文章原始檔、剝離 Front matter 並用 marked 解析)
```

詳細的設計決策與檔案對照表，請參閱 [`doc/project.md`](doc/project.md)。

---

## 開發文件說明

*   [`doc/project.md`](doc/project.md) — 專案完整架構、多頁面 (MPA) 進入點、關鍵設計決策，以及更新歷史與待辦目標。
*   [`doc/jekyll_migration_design.md`](doc/jekyll_migration_design.md) — 從 Jekyll 遷移至 Vite + Tailwind CSS v4 的原始設計理念說明。
