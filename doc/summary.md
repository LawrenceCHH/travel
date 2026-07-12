# 視覺改版與排版優化任務總結（2026-07-12）

為了優化讀者閱讀的舒適度，本輪工作對部落格的視覺設計細節（特別是封面照片中的閱讀時間、副標題及清單斜體元資料）進行了全面評估，並實施了微觀排版與字型系統的重構。

## 本次更動與優化項目

### 1. 封面照片（Hero）元資料字色與標籤微調
*   **字色對比度提升**：解決點擊進入文章頁後，封面照片下方的閱讀時間因全域設定為 `.reading-time { @apply text-muted-text; }` 而呈暗灰色（`#61656B`）、對比度僅 **1.25:1** 近乎不可見的問題。新增專屬 CSS 規則，強制改用輕盈且高亮度的 `--color-hero-text`（`#F4ECDD`，暖米白）。對比度因此躍升至 **6.19:1**，完美通過 **WCAG AA** 無障礙閱讀標準。
*   **標籤 Pill 化設計**：將 Hero 區內的文章標籤由純文字 `<span>#${tag}</span>` 升級為精緻的圓角半透明膠囊樣式（`border-hero-text/30 bg-hero-text/10 text-hero-text text-xs`），在暗色遮罩背景上不僅高度清晰，更增添了現代感與精緻層次。

### 2. 全站無襯線字型升級：Open Sans ➔ Inter
*   **升級核心字型**：將全站英文與數字的無襯線字型從 `Open Sans` 升級為當代螢幕排版與 UI 設計的黃金標準字型 **`Inter`**。
*   **自架與打包優化**：下載了支援 weights `100` 至 `900` 的單一 variable 變數型字型檔 [inter-latin-var.woff2](file:///home/lawrencechh/j/travel/assets/fonts/inter-latin-var.woff2)，取代原本需要加載多個 Open Sans 靜態字型檔的方案，縮減了包體積與預載資源數。
*   **死程式碼與舊資源清理**：從 Git 與源碼中徹底刪除了已無引用的 Open Sans 字型檔。

### 3. Hero 副標題（Subheading）視覺風格對齊
*   **主副標題字體統一**：原 Hero 下方的副標題（`Travel Guide` 等）使用無襯線字體，與大標題（Lora / 襯線體）搭配起來略顯突兀且風格不協調。
*   **改進方案**：將 `.subheading` 字體統一變更為 `font-serif`（Lora 襯線體），讓中英大標題與副標題建立一致優雅、具高質感雜誌編輯風格的版面氛圍。

### 4. 文章預覽元資料（Meta）排版與 CJK 斜體歪斜修正
*   **移除 CJK 斜體防鋸齒失真**：中文與日文字型並無原生「斜體」設計，瀏覽器對其進行強制傾斜（Oblique/Italic）會嚴重破壞漢字結構，產生鋸齒及顯得「不對稱且歪斜」。我們徹底去除了 `.post-preview .post-meta` 與 `.post-heading .meta` 中英文元資料的 `italic` 斜體樣式。
*   **微觀層次收斂**：將原本偏大的 `text-lg` 元資料字級縮小為更合適的 `text-sm`，並將字型改為無襯線的 `font-sans`（Inter），使數字（日期、閱讀時間）以極佳的清晰度呈現，拉開「標題 ➔ 副標題 ➔ 元資料」的視覺節奏與主次關係。

### 5. PWA 與快取失效機制
*   **更新快取**：更新 [sw.js](file:///home/lawrencechh/j/travel/public/sw.js) 中的 `CACHE_NAME` 至 `clean-blog-v24`，保證回訪讀者的瀏覽器會自動下載最新的樣式與 Inter 字型檔。
*   **重新建置**：完成修改後已成功執行 `npm run build`，Vite 成功編譯出包含新字型的 `scripts-*.css` 靜態檔並完成打包部署。

---

## 修改後字體排版架構對照

| 元素 | 舊版樣式 | 新版優化樣式 | 設計意圖與優勢 |
| :--- | :--- | :--- | :--- |
| **Hero 大標題** | Serif (Lora / 襯線) | Serif (Lora / 襯線) | 滿意原樣，維持優雅雜誌感標題風骨。 |
| **Hero 副標題** | Sans-serif (Open Sans) | **Serif (Lora / 襯線)** | 建立主副標題一致的襯線字型家族語彙。 |
| **內文/ body 英文** | Sans-serif (Open Sans) | **Sans-serif (Inter)** | 升級成清晰度與可讀性更卓越的現代 UI 字體。 |
| **文章清單元資料** | Serif + text-lg + **Italic (斜體)** | **Sans-serif (Inter) + text-sm + 正常體** | 消除中文斜體不對稱歪斜，縮小字級建立精緻的資訊層次。 |
| **文章 Hero 閱讀時間** | 暗灰 (1.25:1 對比) | **暖米白 (6.19:1 對比) + normal** | 解決細節頁面閱讀時間看不清的 bug，符合 WCAG AA。 |
| **文章 Hero 標籤** | `#tag` 純文字 | **半透明 Rounded Pill 膠囊標籤** | 加強標籤觸控區與背景區隔，提高設計精緻感。 |
