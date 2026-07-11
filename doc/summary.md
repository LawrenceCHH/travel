# 視覺改版任務總結（2026-07-12）

流程：使用者確認方向 → 統籌者（Sonnet 主控）撰寫規劃書 → Opus（資深 UI/UX 設計師角色）
審查並修正規劃 → Sonnet（工程師角色）依定案清單實作 → 統籌者驗證實際 diff/畫面並整理文件。

## 已完成項目

- [x] Design Token 系統重構：`assets/tailwind.css` 新增 `--color-ink`、`--color-muted`、
      `--color-muted-text`、`--color-sand`、`--color-paper`、`--color-primary`（咖啡色），
      取代舊有青藍色 `#0085a1` 主題
- [x] 標題字體改用 Lora 襯線（Hero H1、文章標題、post-preview 標題、section-heading），
      內文維持 Open Sans；字重限制在專案實際擁有字型檔的 400/700，移除拉丁字距 utility
- [x] 安裝並整合 `@tailwindcss/typography` 外掛，透過 `--tw-prose-*` 變數客製化文章內文配色
- [x] 修正 `about.html` 的 `prose` 寬度設定不一致（補上 `max-w-none`）
- [x] `posts/detail.html` 新增表格 `overflow-x-auto` 動態包裹，修正窄螢幕表格撐版問題
- [x] Navbar 改版：房屋 SVG 圖示 → 文字 wordmark「旅遊指南」，sticky nav 改
      `bg-white/90 backdrop-blur-sm` 毛玻璃效果
- [x] Footer、5 個入口頁（首頁/關於/建議/目錄/文章內頁）、`assets/scripts.js` 篩選搜尋元件、
      `public/manifest.json` 全站色彩 token 掃描替換（`text-gray-*`/`bg-gray-*`/
      `border-gray-*`/`#0085a1` → 新 token）
- [x] 長文閱讀欄（關於頁、文章內頁）改白底卡片，與新的 paper 頁面底色做出層次區隔
- [x] `npm run build` 建置驗證成功
- [x] 用 headless Chromium 對 5 個頁面 × 5 種寬度（320/375/768/1024/1440）實際截圖驗證 RWD
- [x] 統籌者事後獨立覆核：重新以乾淨 incognito session 截圖 `posts/index.html`，排除「目錄」
      連結顯示咖啡色是否為異常（結論：是既有「目前頁面反白」功能正常運作，非 bug）

## 過程中發現並處理的問題

- [x] **CJK 襯線字體未真正載入**（Opus 審查發現）：專案只自架 Lora 拉丁字型，中文標題會
      fallback 到系統字型，多數 Android 無內建中文襯線。**處理方式**：不引入外部 Google
      Fonts CDN（會破壞 PWA 離線快取架構），列為刻意取捨並記錄於 `project.md` / 下方「未來
      建議修改方向」。
- [x] **`--color-muted` 對比不足 WCAG AA**（Opus 審查發現）：規劃書原訂色票中的灰色
      `#8E8B82` 若直接用於內文文字，對白/paper 底對比僅 ~3.1–3.4:1，未達正文 4.5:1 標準。
      **處理方式**：新增專用的 `--color-muted-text (#6E6B62)` token（約 5:1 對比）給內文級
      文字用，原 muted 收斂為僅供邊框/裝飾。
- [x] **`about.html` 的 `prose` 寬度未加 `max-w-none`**：會導致與 `posts/detail.html` 的
      閱讀欄寬度行為不一致。已在施工清單中列為明確修正項並確認實作。
- [ ] 未發現其他需要修正的實質性 bug（本輪 RWD 截圖與 DOM 檢查未發現版面破版或明顯樣式缺陷）。

## 未來建議修改方向

（詳細版本見 [`update.md`](./update.md) 的「未來建議修改方向」區塊，此處僅列重點）

- [ ] 若要讓中文襯線標題在 Android 等裝置上也能一致呈現，需自行 subset 打包 Noto Serif TC
- [ ] `about.html`（關於頁）目前沒有任何導覽入口，需決定是否要補回連結
- [ ] Navbar 的手機漢堡選單（`toggleNav()`）目前是死程式碼，未來若導覽項目增加需重新評估
      或直接移除
- [ ] Hero 遮罩對比度是固定值，未逐一實測每張背景圖，未來新增背景圖時建議留意可讀性
- [ ] 若合併後有訪客回報看到改版前的殘留樣式，可手動 bump `sw.js` 的 `CACHE_NAME` 強制失效
- [ ] 既有待辦（非本次改版產生）：取得真實 Formspree 表單 ID、更新 `package.json` 專案
      元數據、替換 `your-email@example.com` 佔位信箱
