# 首爾文章「簡潔高雅」視覺重整 — 變更摘要（2026-07-15）

> 目標檔案：`src/posts/2026-07-13-韓國首爾旅行.md`、`assets/tailwind.css`
> 方向：簡潔、高雅、一眼掃到重點。使用者（資深 UI/UX 視角）點出三塊問題，經 AskUserQuestion（附 ASCII 預覽）確認三個方案後執行。

---

## 一、美食卡／景點卡 → 雜誌感大標題

**問題**：30 筆美食、7 筆景點字多卻不吸睛，像一整面相似的文字牆，無法一眼掃到「想吃什麼／想去哪」。

**做法（純 CSS，30 筆項目 HTML 完全不動）**：
- `.food-item`：`border-b` 清單 → `rounded-lg` 邊框卡片，每筆各自成塊。
- 用 flex `order` 把「餐別 chip＋長輩友善屬性」提到店名上方當 kicker。
- 店名 `.food-item-name` / 景點 `.spot-title` 放大為 `font-serif text-[22px]`，當雜誌主標。
- `.food-item-body` 用 `:nth-of-type` 把既有三列重排為：
  **招牌菜（暖褐 `--color-primary` highlight，視覺主角）→ 價位（次要 meta）→ 為何適合（本文）→ 按鈕**。

> 依賴前提：全 30 筆 body 列順序一致（價位帶→招牌菜→為何適合，已用腳本驗證）。新增卡片務必維持此順序，否則 `:nth-of-type` 重排會錯位。

## 二、出發前準備 → 資訊卡／欄位排版

**問題**：多處 2–3 層 Markdown 巢狀清單，內容朝右壓縮、左邊空空（純排版問題）。

**做法**：4 節巢狀清單改寫為滿版 `.compare-card` + `.compare-row`（複用既有機場接駁比較卡元件，未新增樣式），每列「左標籤／右內容」滿版對齊：
- 網路與漫遊（eSIM／實體 SIM／WiFi 分享器／中華電信，4 卡）
- 支付與匯率（換匯與支付重點／氣候同行卡，2 卡）
- 免稅退稅（退稅方式卡＋醫美退稅取消警示框）
- 在地習俗（交通禮儀／秋季穿搭／無障礙避雷，3 卡）

> 內容逐項保留：連結、金額、警語不變，只換排版容器。

## 三、緊急應變 → 分類色碼＋圖示卡

**問題**：風格不統一，聯絡卡全為同一色左邊框，危急時無法一眼鎖定該看哪一塊。

**做法**：
- 置頂 `alert-note` 情境速查 → `.triage-list`：5 條可點擊直撥（`tel:`／錨點），各帶分類色號 badge 與左色條。
- 下方原「119／112／1330 共擠一卡」拆成 3 張獨立色碼卡；代表部（綠）、3 間醫院（靛）各自上色，卡片標題加分類 `.em-tag` chip。
- 5 色語意色票（醫療紅 `#b23a3a`／警察藍 `#3f5e8c`／資訊琥珀 `#b07d1f`／代表處綠 `#4a7a55`／醫院靛 `#3f7676`）：去飽和深色版、文字對白底過 WCAG AA，**僅用於此區塊**（功能性導引優先於全站暖褐單色）。
- 醫院分組 `<p>` 加 `id="em-hospitals"` 供情境速查跳轉。

> Cascade 陷阱：`.cat-*` 的 `border-left-color` 與 `.emergency-card`/`.triage-item` 自身 `border` 同 specificity，必須放在來源順序後方（現置於緊急應變 CSS 區塊最末）才生效；初版寫在前面時，Playwright 實測所有左色條都被預設暖褐 `#b56a43` 壓過，已修正並重截確認。

---

## 驗證

- `npm run build` 成功，`swPrecachePlugin` 自動更新 `dist/sw.js` 雜湊（CSS 內容變動→新雜湊→預快取清單自動刷新，無須手動 bump `CACHE_NAME`）。
- `marked.parse()` 靜態檢查：無殘留 `**`；food-item 30／spot-card 7／compare-card 14／emergency-card 7、triage 5 條、`em-hospitals` id 存在。
- Playwright headless（390px／1280px）截圖：雜誌感美食卡、欄位化網路卡、分類色碼緊急卡皆正確渲染；`document.documentElement` 無水平溢出（overflow=0）、console 無錯誤；緊急左色條分類色以 setContent 重截確認生效。

## 動到的檔案

| 檔案 | 變更 |
| --- | --- |
| `assets/tailwind.css` | 重寫 `.food-item*`、加大 `.spot-title`；新增 `.triage-*`／`.cat-*`／`.badge-*`／`.em-tag`；`.emergency-card` 移除寫死左色改由 `.cat-*` 上色 |
| `src/posts/2026-07-13-韓國首爾旅行.md` | 出發前準備 4 節巢狀清單改欄位卡；緊急應變情境速查改 triage、聯絡卡拆分上色 |
| `doc/project.md`、`doc/update.md` | 記錄設計決策（第 11 點）與更新歷史 |
| `public/data/posts.json` | 建置自動重算閱讀時間 |
