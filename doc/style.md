# 設計風格分析報告 — 旅遊指南

> 本文件由資深 UI/UX 設計師視角，針對「旅遊指南」部落格（Vite + Tailwind CSS v4 純前端
> 架構）的現行視覺與互動風格所做的系統化分析。內容拆為兩個區塊：**A. 抽象設計準則**
> （為什麼這樣設計、可延續的心法）與 **B. 具體網頁設計細節**（實際的 token、元件與規格）。
>
> 現行實作源頭：`assets/tailwind.css`（`@theme` 設計 Token）、`public/components/*.html`
> （導覽列／頁尾）、各頁 `*.html`。設計決策的歷史脈絡見 [`project.md`](./project.md)
> 第一部分第 5 節，以及該檔第二部分的更新歷史。

---

## 使用者提供的品牌色票

四色主色票（使用者指定，作為全站配色的來源）：

| HEX | RGB | 色相印象 | 家族 |
| --- | --- | --- | --- |
| `#222831` | `rgb(34, 40, 49)` | 近黑冷深灰 | 冷深灰家族（文字） |
| `#393E46` | `rgb(57, 62, 70)` | 中深冷灰 | 冷深灰家族（文字） |
| `#948979` | `rgb(148, 137, 121)` | 暖灰褐 | 暖褐／米家族（強調） |
| `#DFD0B8` | `rgb(223, 208, 184)` | 淺暖米 | 暖褐／米家族（強調） |

**核心運用原則**：這組色票被刻意拆成**兩個家族**分工，而非隨機挑用——
- `#222831` / `#393E46`（**偏冷深灰**）→ 供「灰色為主」的**文字**使用。
- `#948979` / `#DFD0B8`（**偏暖褐／米**）→ 供「偶爾搭配的其他顏色」（**強調色、邊框、
  標籤底**）使用。

> 設計定位一句話：**白底 + 灰階深色字為主，暖褐色系點綴** 的簡潔、乾淨、高雅編輯風格。

---

# A. 抽象設計準則

適用於後續任何新頁面／新元件時應延續的設計心法。

### A1. 中性灰主導、暖褐點綴的「安靜」配色哲學
全站以無彩度的白底與灰階文字承擔 95% 的視覺，僅在需要「行動指引」（連結、CTA、hover、
目前所在章節）時才動用暖褐強調色。強調色刻意選擇**低彩度的暖褐**（`#6F675B`）而非高彩度
色相，讓介面保持克制、不喧賓奪主。這是編輯／出版類內容網站的典型策略：**讓內容（文字與
照片）當主角，介面退為背景**。

> 準則：新增顏色前先問「這是內容還是介面？」。介面預設用灰階；只有需要引導動作時才碰
> 暖褐強調色。永遠不要為了「好看」而引入色票以外的高彩度顏色。

### A2. 冷／暖雙家族的語意分工
色票不是「四個平等的選項」，而是兩組各有職責的家族（冷灰＝文字、暖褐＝強調／邊界）。
這條分工線是全站配色一致性的根本，任何新元件都應該落在這兩個家族的既有語意內，而非
自創用色。

### A3. 無障礙優先，對比度用「算」的而非「看」的
所有前景／背景配色都以 WCAG AA（一般文字 4.5:1、大字 3:1）為硬性門檻，並以數學反推而非
目測：次要文字 `#61656B` 對白底 5.86:1、暖褐強調 `#6F675B` 對白底雙向皆 ~5.57:1、Hero
淺字 `#F4ECDD` 在最壞情境封面圖上 ~6:1。衍生色（如把 `#948979` 加深成 `#6F675B`）正是
為了在維持色票調性的同時跨過對比門檻。

> 準則：任何新的文字／背景組合，落地前先算對比度，不要靠肉眼判斷「應該夠了」。

### A4. Token-First：顏色只定義一次
所有顏色集中定義在 `assets/tailwind.css` 的 `@theme` 區塊為語意 Token（ink / muted-text /
muted / sand / paper / surface / primary / hero-text），元件一律引用 Token 而非寫死 HEX。
這帶來的直接紅利：本專案的配色曾在同一天內經歷「淺紙感 → 全站深色 → 白底」三次大翻轉，
大多數改版只需要改 `@theme` 一處，元件不必逐一重掃。

> 準則：元件裡不出現裸 HEX。要用色就引用（或新增）語意 Token。

### A5. 層次靠「排版」建立，不靠顏色或透明度
資訊層級主要由**字級、字重、字型家族、留白**表現，而非用多種顏色或降低透明度來區分。
例如 Hero 內標題／副標／meta 的層次是靠 h1 最大最粗 → subheading 次之 → meta 最小，
而非把次要文字調淡（調淡會直接削弱經過驗證的對比安全邊際）。2026-07-21 曾具體評估過
「h1~h4 標題顏色由深到淺做漸層」的提案並否決：h3/h4 是要被讀的正文結構（h4 甚至是卡片
內的迷你標籤），變淺在本站色票語意裡等於「次要/停用」，會誤導讀者跳過；且深淺漸層會讓
「同一邏輯層級的標題」因為在不同文章裡巢狀深度不同，顏色卻不一樣，反而不一致。

> 準則：想強調某元素時，先動字級／字重／留白；把「換顏色」與「降透明度」當最後手段。

### A6. 襯線標題 × 無襯線內文的雙字型人格
展示型大字（Hero、文章標題、Nav wordmark、副標）用襯線體 Lora 建立「編輯雜誌感」；
高資訊密度的 UI 與內文英數用無襯線 Inter 追求極致清晰度。兩種字型各司其職，形成統一
而有層次的排版人格。

### A7. 尊重 CJK 排版慣例，不硬套拉丁習慣
中文標題**不加** `tracking-tight`/`tracking-wide` 字距調整（會造成全形字擠壓或鬆散）；
meta 全面**去除斜體**（`italic`）（瀏覽器對漢字的強制傾斜會產生鋸齒歪斜）；中文字重
只用 400/700（自架字型僅此兩種字重）。

> 準則：任何拉丁排版技巧（字距、斜體、小型大寫）套到中文前，先確認它在 CJK 上不會劣化。

### A8. 克制而有意義的動效
微互動一律 150ms（`transition-colors duration-150`）；捲動、抽屜等較大動作 250–300ms；
TOC 平滑捲動尊重 `prefers-reduced-motion`。動效只用來表達「因果關係」（hover 回饋、
狀態切換、空間連續性），不做純裝飾動畫。

### A9. 反過度工程（Anti Over-engineering）
在多處刻意選擇「保守的固定解」而非「聰明的動態解」：Hero 遮罩用固定不透明度覆蓋最壞
情境，而非 Canvas 逐圖偵測明暗；paper/surface 同為白色、靠邊框分層，而非硬做白／近白
雙階。對這個規模的部落格，簡單、零運算成本、一體適用的方案優於花俏但脆弱的方案。

### A10. 零外部依賴的自足性（PWA 友善）
字型自架（Lora + Inter woff2）、圖示用內聯 SVG、互動用瀏覽器原生 API（IntersectionObserver、
touch 事件），不引入 Google Fonts CDN、圖示套件或 npm UI 元件庫。這是為了維持 PWA 離線
能力與可控的成品體積而做的刻意取捨（代價：中文襯線標題在無內建中文襯線的裝置上會 fallback
到無襯線，跨平台不完全一致）。

### A11. 用「邊框」分層，不用「陰影」
`--color-paper` 與 `--color-surface` 同為白色，卡片／導覽列／下拉／抽屜與頁面底色之間
靠 `border-sand`（暖褐細線）區隔，而非 drop-shadow。全站唯一的陰影是 TOC 浮動圓鈕
（`.toc-fab`，因為它浮在內容之上、需要空間縱深暗示）。

> 準則：新元件要跟背景分層時，優先用 `border border-sand`；除非該元素真的「浮」在其他
> 內容上方（如浮鈕、彈出層），否則不加 `shadow-*`。

### A12. 分隔線／底線只在「有東西可分隔」時才出現，不是逢章節必加
分隔用的視覺元素（`<hr>`、標題 `border-bottom`）的職責是標記「這裡發生了內容交接」，
不是替每個章節開頭蓋章。2026-07-21 修正了一處把這條準則做反的情況：
`2026-07-20-韓國自由行支付教學.md` 原本每個 `## 小節` 前都手動加 `<hr>`，但 h1/h2
本身已經有 `border-bottom` 底線，兩者同時出現等於同一件事講兩遍——這不是「內容夠不夠長」
的主觀判斷，而是可機械化驗證的結構條件（是否跨過文件實際用到的最高層結構斷點）。

> 準則：加分隔線前先問「這裡有沒有實質內容要跟上一段分開」；如果答案是「只是換了個
> 標題」，讓標題自己的字級/字重/底線負責就好，不要疊加額外的分隔線。

### A13. 高頻／節奏錨點層級：可預期的規律 > 消除次要的語意冗餘
2026-07-21 曾對同一個問題（標題 `border-bottom` 在「大標題後緊接小標題」時語意上有點
多餘）試過用 `.prose h1:has(+ h2), .prose h2:has(+ h3) { border-bottom: none }` 條件式
拿掉底線——邏輯本身沒錯，但套用在 `h2` 這種**高頻、讀者用來建立掃描節奏的層級**上時，
反而製造了更嚴重的問題：07-20 一篇文章裡 6 個 `##` 就有 4 個底線忽有忽無，讀者只看畫面
完全猜不到規律（觸發條件藏在看不見的 markup 結構裡）。最終改用最簡單的固定規則：底線
只給 `h2`（唯一的節奏錨點層級）、無條件套用，`h1`/`h3`/`h4` 一律不加，拿掉所有 `:has()`
條件邏輯。CSS 細節見 B6。

> 準則：任何「有條件才套用」的視覺規則，上線前先問「這在讀者用來抓節奏的高頻層級上
> 會不會忽有忽無」；如果會，寧可選「固定、單調、偶爾語意上稍嫌多餘」的規則，也不要選
> 「邏輯更精確、但視覺上不可預期」的規則——**規律的節奏感優先於消除次要的冗餘**。

### A14. 標題層級撐不住時，先減標題數量，不要加裝飾
2026-07-21 針對「`h3` 要不要像 `.style-a-post .spot-title` 那樣掛一個 ◇ 之類的字符記號」
做過評估，先否決了字符方案（◇ 已被更低的 h4 層級佔用，重用會抹平階層；字符會吃掉約
1.5em，讓中文長標題在行動版多折一行並破壞左緣對齊），改試「左側 3px 暖褐色條」作為替代。
實際套上 `2026-07-20-韓國自由行支付教學.md`（19 個 `h3`）後由使用者判定**更亂**：色條讓
每一個 h3 都變成視覺焦點，19 個焦點等於沒有焦點，反而稀釋了 `h2` 這個真正的掃描錨點。
色條全數移除，`h3` 維持純文字（襯線 20/21px 粗體 + `mt-9` 留白）；真正有效的處理是**減少
標題數量**——把「緊接在 `h2` 之後、內容只有三四行」的標籤型 `###` 收成 h2 的引言段。

> 準則：覺得某個標題層級「不夠明顯」時，先確認問題是不是出在**同級標題太密**。密集才是
> 病因，裝飾只是止痛藥且會反過來加重症狀：非錨點層級每多一種視覺標記，錨點層級（`h2`）
> 的相對權重就被稀釋一分。能靠內容結構解決的，不要靠 CSS 解決。

### A15. 全站只有一組標題音階；元件不自帶第二組
2026-07-21 修正 `2026-07-16-韓國首爾旅行.md`「標題階層忽大忽小」時發現的病灶：
`.style-a-post` 那組樣式當初是為「文章內最大的標題就是 `h3`」設計的**獨立音階**
（`h3` 26 / `.spot-title` 22 / `.food-list-title` 20 / `.food-name` 18px）。等到這篇也開始用
裸 `<h2>`、且全站 `.prose` 標題階層被內化進來之後，兩組音階疊在一起，一次生出三種病徵：

1. **母子打平**：`.style-a-post h3` 26px 撞上 `.prose h2` 行動版 26px，而且 h3 的底線是 3px、
   h2 只有 2px——同尺寸下更粗的線就是更重的量體，子標題看起來反而比母標題大。
2. **同層兩種量體**：同屬 `h2` 之下第一層的「Day X」(26px) 與「◇ ○○區美食」(20px) 差 6px，
   讀者掃到後者會誤以為自己掉進更深的層級。這就是「忽大忽小」的主因。
3. **階層倒置**：孫層 `.spot-title` (22px) 大過叔層 `.food-list-title` (20px)。

當時的處置（把 `.prose h2` 行動版從規格的 24px 拉到 26px 去「打平」子層）是止血不是修復：
**母標題不該只是「不弱於」子標題**。相鄰層級要拉開到約 1.2 倍以上才讀得出階層，差 7% 等於沒差。
最終解法是把 `.style-a-post` 整組併回 `.prose` 的音階（`h3` 的覆寫直接刪掉、讓它回落到
`.prose h3`），而不是繼續替它調數值。

> 準則：新元件要標題時，先問「它對應到 `h2`/`h3`/`h4` 的哪一階」，然後**直接沿用該階的字級**；
> 不要為元件另訂一組尺寸。判斷是否出錯有一個機械化的檢查：把畫面上所有標題按**邏輯層級**排好，
> 同層必須同字級、下層必須明顯小於上層——只要出現同層不同級、或下層 ≥ 上層，就是疊了第二組音階。
> 元件的個性用**字色、記號、留白**表現（如 `.spot-title` 的 `text-primary` 與 ◇），不要用字級。

---

# B. 具體網頁設計細節

## B1. 色彩 Token（`assets/tailwind.css` `@theme`）

| Token | 值 | 用途 | 對比／備註 |
| --- | --- | --- | --- |
| `--color-ink` | `#222831` | 標題、主要內文；連結預設字色 | 灰色為主的深色字體 |
| `--color-muted-text` | `#61656B` | 次要文字（meta、副標、版權、內文捲軸） | 由 `#393E46` 淺化，對白底 ~5.86:1（AA） |
| `--color-muted` | `#888B90` | 僅供 disabled 文字／裝飾（常搭 `opacity-40`） | 不可用於一般內文 |
| `--color-sand` | `#948979` | 邊框、分隔線、標籤底、hover 底 | 色票原色（暖褐家族） |
| `--color-paper` | `#FFFFFF` | 頁面整體底色 | 白 |
| `--color-surface` | `#FFFFFF` | 卡片／導覽列／下拉／抽屜等「抬升面」 | 與 paper 同白，靠 `border-sand` 分層 |
| `--color-primary` | `#6F675B` | CTA／連結／hover／TOC active | 由 `#948979` 加深，對白底雙向 ~5.57:1（AA） |
| `--color-primary-dark` | `#595249` | primary 的 hover／按下態 | |
| `--color-hero-text` | `#F4ECDD` | Hero 遮罩上的標題／meta 專用淺字 | 與站內底色脫鉤，最壞封面圖情境 ~6:1 |

**關鍵陷阱（務必留意）**：Hero 遮罩色**固定綁 `bg-ink`（`#222831` 深灰）**，
**不可**綁 `--color-paper`。因為 paper 現在是白色，若遮罩跟著翻白會蓋掉深色封面圖上的
淺色標題，直接摧毀對比。遮罩機制與站內底色刻意解耦。

## B2. 字型系統

```css
--font-serif: "Lora", "Noto Serif TC", "Songti TC", ui-serif, Georgia, ...;
--font-sans:  "Inter", "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", ...;
```

- **自架字型**：`Lora`（400/700，woff2）、`Inter`（可變字型 100–900，woff2），皆
  `font-display: swap`。
- **襯線 Lora 用於**：Hero `h1`、頁面／文章標題、Nav wordmark「旅遊指南」、Hero 副標題
  `.subheading`、文章列標題 `.post-title`、`.section-heading`、`.prose` 內的 h1–h4。
- **無襯線 Inter 用於**：body 內文、meta、按鈕、標籤、導覽次要連結、表格數字，以及
  內文中的英文與數字。
- **body 基準**：`font-size: 18px`（為 CJK 密度略縮）、`line-height: 1.7`、段落
  `margin: 24px 0`。
- **標題字重**：CJK 用 `700`（比 800 更銳利不糊）。
- **CJK 排版禁忌**：標題不加字距 utility；meta 去斜體並收至 `text-sm`。

## B3. 佈局系統

- **內容容器**：全站統一 `mx-auto max-w-3xl px-5`（768px 最大寬 + 20px 水平內距），
  導覽列、Hero 內容、文章列表、頁尾一致對齊。
- **響應式斷點**：沿用 Tailwind 預設（`md:` 768、`xl:` 1280）。桌機 TOC 側欄斷點訂在
  `xl:`（1280px），因為此時 `max-w-3xl` 卡片單邊留白才夠放側欄；1024–1279px 沿用行動版。
- **垂直節奏**：Hero `py-24 md:py-32`；區塊間距用 `space-y-*` / `gap-*` 統一控制，避免
  零散 margin。
- **語言**：`<html lang="zh-Hant-TW">`，`theme-color` 為 `#FFFFFF`。

## B4. 核心元件規格

### 導覽列 Navbar（`public/components/navbar.html`）
- `sticky top-0 z-50`，毛玻璃 `bg-surface/90 backdrop-blur-sm`，底部 `border-b border-sand`。
- 極簡資訊架構：**僅 2 項**——左側 serif 文字 wordmark「旅遊指南」（`font-bold text-ink`）、
  右側「目錄」連結（`font-sans text-sm font-bold`）。無房屋 SVG 圖示、無漢堡選單（項目少
  不需要）。
- hover 全站統一轉 `text-primary`，`transition-colors duration-150`。

### Hero / Masthead（`.masthead`）
- 結構：`.masthead`（背景圖 `bg-cover bg-center`）+ `.overlay`（`absolute inset-0 bg-ink
  opacity-[0.78]`）+ `.page-heading/.post-heading/.site-heading`（`relative z-10`，淺字
  `text-hero-text`）。
- 標題 `font-serif`：首頁／頁面 `text-4xl md:text-6xl`，文章頁 `text-3xl md:text-5xl`。
- 副標 `.subheading`：`font-serif text-xl`（與標題呼應）。
- 遮罩 `0.78` 不透明度是 WCAG 反推值，確保任意封面圖最壞情境下淺字仍過 AA。

### 頁尾 Footer（`public/components/footer.html`）
- 上緣 `<hr class="border-sand">`，內容置中。
- 單一實心圓形連結鈕（信件圖示，內聯 SVG）：`h-11 w-11 rounded-full bg-ink text-paper
  hover:bg-primary`（44px 觸控熱區達標）。
- 版權：`text-sm text-muted-text` 置中。

### 文章列預覽卡（首頁 `.post-preview`）
- `border-b border-sand pb-6 mb-6` 橫線分隔。
- 標題 `.post-title`：`font-serif text-2xl md:text-3xl font-bold`，hover → `text-primary`。
- 副標 `.post-subtitle`：`font-light text-muted-text`。
- meta `.post-meta`：`font-sans text-sm text-muted-text`，日期 `&middot;` 分隔閱讀時間。
- 分頁：首頁每頁 5 篇、目錄頁每頁 100 篇。

### 目錄頁膠囊標籤（`.tag-pill`）
```css
@apply inline-flex items-center rounded-full border border-sand bg-sand/20
       px-2.5 py-0.5 text-[11px] leading-4 text-muted-text;
```
低調暖褐調：`border-sand` + 極淡 `bg-sand/20` 米底 + `muted-text` 灰字，無 `#` 前綴。

### 按鈕（`.btn-primary`）
- 方正無圓角（`rounded-none`）、`px-6 py-4`、`text-sm font-extrabold uppercase tracking-wider`、
  `text-paper`（白字）底色 `--color-primary`，hover → `--color-primary-dark`。

### 表單控制項
- base 明確指定 `background-color: var(--color-surface); color: var(--color-ink)`，
  placeholder 用 `muted-text`，避免落回瀏覽器預設樣式。
- 互動元件（下拉／清除／確定／checkbox）補 `focus-visible:ring-1 focus-visible:ring-primary`。

### 分頁器（`assets/scripts.js`）
- 暖色 Token：一般頁 `text-ink bg-white border-sand hover:bg-sand/30 hover:text-primary`；
  當前頁 `bg-primary text-white font-bold`；disabled `text-muted opacity-40`；省略號
  `text-muted-text`。

## B5. 文章大綱（TOC）

- **桌機（`xl:`≥1280）**：`.toc-sidebar` 預設 `position: absolute`（隨頁面捲動貼在
  Banner 下緣，避免初始就以 fixed 蓋住 Banner 文字），捲動超過休息位置後由 `scripts.js`
  的 `buildDesktopSidebar`／`updatePinnedState()` 切換 `.is-pinned` class 改為
  `position: fixed`（效果等同 sticky；因側欄掛載於 `document.body` 而非文章內文的 flow
  子節點，無法直接套用原生 `position: sticky`）。定位 `left: max(1.5rem, calc(50vw -
  37rem))`，寬 `11rem`。`.toc-link` 左側 2px 色條，active 態 `text-primary` +
  `font-weight:500` + `border-left-color: primary`。
- **手機／平板（<1280）**：文章開頭靜態速覽（僅 h2）；捲離後右下浮動圓鈕 `.toc-fab`
  （`3.25rem` 圓、`bg-primary`）淡入；點擊開啟底部抽屜 `.toc-sheet`（`border-radius:
  1rem 1rem 0 0`、`max-height:80vh`、隨內容撐高）。scrim `rgba(0,0,0,0.5) + blur(4px)`。
  抽屜連結左對齊、保留左側色條縮排表達 h2/h3 階層，active 態加淡暖褐底 `rgba(111,103,91,0.12)`。
- 所有標題 `scroll-margin-top: 6rem`（對應 sticky nav），跳轉用 `scrollIntoView({behavior})`
  依 `prefers-reduced-motion` 切換 smooth/auto。

## B6. 內文排版（`.prose` / `@tailwindcss/typography`）

配色透過官方 `--tw-prose-*` 變數委派給 Token（而非手刻各選擇器）：
- 內文／標題 `--color-ink`、連結 `--color-primary`、清單符號／分隔線／引言邊框／表格框線
  `--color-sand`、caption／counters `--color-muted-text`。
- Code block：底 `--color-ink`（深）、字 `--color-paper`（白）。
- `.prose` 標題 h1–h4 覆寫為 `font-serif` `font-weight:700`；內文家族 `font-sans`
  （h4 例外，用 `font-sans`，因為中文全大寫/字距拉開的傳統小標籤手法在中文字上很醜）。
- 只有 `h2` 帶 `border-bottom`，且**固定、無條件套用**（h1/h3/h4 皆無底線，全站不使用
  任何 `:has()` 條件式底線邏輯）——曾試過「h1/h2 都有底線、下一個兄弟若是更小標題就用
  `:has()` 拿掉」，但套在高頻的 h2 上會讓底線忽有忽無、讀者抓不到規律，故改回最簡單的
  固定規則，見 A13。
- **全站唯一的文件標題音階（行動／桌機）**：h1 30/34、h2 26/28、h3 20/21px（皆襯線），
  h4 15px（無襯線小標籤，給元件標籤用，不是給一般章節）。文章專屬元件的標題必須先判斷
  「它對應到哪一階」再沿用該階數值，不得另訂尺寸（見 A15）——例如 07-16 的
  `.food-list-title` 與 `### Day X` 同屬 h3 階，故同為 20/21px。
- **元件項目標題自成一小階（16–18px 襯線粗體）**：卡片／清單項目的標題（`.spot-title`
  與 `.food-name` 18px、`.emergency-card h3` 16.5px、`.app-info h4` 16px）刻意落在 h3(20/21)
  與 h4(15) 之間——它們是「項目名稱」不是文件章節，用 h3 會與真正的章節標題搶層級，用 h4 的
  15px 又撐不住旁邊的 tag chip。新增同類元件時就取這個區間，不要再往上長。
- 表格額外用 JS 包 `overflow-x-auto` 容器避免窄螢幕撐破版面。

## B7. 全域互動與狀態

- 連結：預設 `text-ink`；`p a` 加底線；hover/focus 全站轉 `text-primary`。
- 引言 `blockquote`：`.prose blockquote` 全權接管，`font-style: normal`（**不**斜體）＋
  `font-family: var(--font-serif)` 襯線 pull-quote，左側 3px sand 色條，文字色
  `text-ink`（2026-07-21 拿掉了原本西式引言慣用的斜體＋muted，改走與標題階層一致的
  雜誌感樣式，全站 blockquote 樣式已不再殘留斜體，見 `assets/tailwind.css` `.prose
  blockquote`）。
- 文字選取 `::selection`：`color: paper`（白字）/ `background: primary`（暖褐底）。
- 過場統一 `transition-colors duration-150`（微互動）～ `0.25–0.3s`（抽屜／浮鈕）。

## B8. 文章專屬視覺風格（`assets/post-styles/`，2026-07-25）

文章想要「整篇換一種視覺風格」時，不手寫 `<div class="...">` wrapper 包版型，改用一個獨立的
CSS 層（機制細節、`style` front matter 用法見 `doc/card_dsl.md`「文章視覺風格系統」一節）：

- **檔案位置**：每個風格一份 `assets/post-styles/<風格名稱>.css`，整份 scope 在
  `.post-style-<風格名稱>` 之下，class 由 `posts/detail.html` 依 front matter `style`
  欄位動態掛在 `#post-content` 上（與 `marked.parse()` 同一個 tick，無 FOUC）。
- **`@import` 位置是硬性要求，必須放 `assets/tailwind.css` 檔案最末行**（不是元件區中間）。
  風格檔的職責就是覆寫上方元件基礎樣式，來源順序必須排最後才吃得到 cascade；放在檔案中間
  時 Tailwind v4 一樣能編譯、`@apply` 一樣能解析，**build 不會報錯**，但風格規則會排在多數
  元件 CSS 之前，變成靜默的「風格覆寫不到元件樣式」cascade bug。
- **只打包成單一 CSS bundle，不做動態 `<link>`**：`vite.config.js` 的 `swPrecachePlugin` 用
  `files.find(f => f.endsWith('.css'))` 只抓第一個 CSS 檔寫進 PWA 預快取清單，多 CSS 輸出會
  讓預快取抓錯檔案，是現行 plugin 的硬性前提，不是單純的簡化選擇。
- **只能用 `@theme` 既有 Token**（見 B1），不得發明新色票；選擇器只能是
  `.post-style-<名稱> .xxx` 的形式，不得出現文章專屬的 `#id` 選擇器。
- **跨文章共用風格的前提**：風格檔的選擇器會綁定特定 DSL 家族（例如 `editorial-card.css`
  綁定 `quickjump`/`stop`/`eat`/`eatarea`），第二篇文章要套用同一個 `style` 值，必須使用
  同一組 DSL 家族的 class 結構，風格才會生效；新增風格檔時務必在檔頭註明依賴哪些家族。
- **base 先給中性樣式，風格檔只寫差異（2026-07-26 修正）**：`assets/tailwind.css` 的元件區
  必須先為 DSL 家族輸出的每個 class 定義一份中性 base 樣式，`assets/post-styles/*.css` 只
  補「與 base 不同之處」（去框線、換字級、加裝飾記號等）。**不可**讓風格檔是某個 class 唯一
  的一層——`editorial-card.css` 曾經有 13 個 class（`.food-header`／`.spot-section` 等）只
  存在風格檔裡，未指定 `style` 的文章一旦用到這些 class 就會渲染成外框有、內容全裸的「半裸
  卡片」，且 build 全綠、console 全靜，完全無法察覺（`doc/archive/suggestion.md` R1）。這條
  規則是「文章預設有通用 CSS、少數文章才疊加客製化 CSS」這個設計目標成立的前提，不是可省的
  細節。
- **風格檔覆寫用具名 class，不要用 Tailwind 任意值 utility 表達顏色變體**：`editorial-card.css`
  是未分層（unlayered）CSS，優先序恆高於 Tailwind 產生的 `@layer utilities`，與 specificity
  無關；若某個 renderer 用 `bg-[#f6eed6]` 這類任意值 utility 表達顏色變體，只要有任何一條
  未分層的 `.post-style-x .foo` 規則同時命中該元素，utility 會被整組壓過且不報錯。曾在
  07-16 造成 `stop` fence 的 flat/slope/steps 三種地形徽章全部被吃成同一色（見
  `assets/tailwind.css` 的 `.food-tag.level-*`）；顏色變體一律改用與風格檔同處未分層空間的
  具名 class，讓覆寫關係回到可預期的 specificity 競爭（`doc/archive/suggestion.md` R2）。

---

# C. 新元件配方（照抄即上手）

新增 UI 時，從既有語彙組裝，不要自創用色／字型：

- **卡片／區塊分層**：`bg-surface border border-sand rounded-*`（要圓角時）。分隔用
  `border-b border-sand`。**不要**加 `shadow-*`（見 A11）。
- **強調鈕 / CTA**：`.btn-primary`（方正、白字、底 `--color-primary`，hover
  `--color-primary-dark`）。
- **標籤 / pill**：沿用 `.tag-pill`（`border-sand` + `bg-sand/20` + `text-muted-text`）。
- **連結 / hover**：預設字色 `text-ink`，hover/focus 一律轉 `text-primary` +
  `transition-colors duration-150`。
- **圖示**：內聯 SVG，`stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round"`，`24×24` viewBox；靠父層 `text-*` 決定顏色。**不要**用 emoji、
  PNG 或圖示套件。
- **焦點態**：互動元件補 `focus-visible:ring-1 focus-visible:ring-primary`（a11y 必要）。
- **標題字**：展示型用 `font-serif font-bold`；UI／meta／英數用 `font-sans`。CJK 標題
  **不加** `tracking-*`，meta **不加** `italic`。
- **文字階層**：主 `text-ink`、次 `text-muted-text`、禁用 `text-muted opacity-40`。
- **觸控熱區**：可點元素 ≥ `h-11 w-11`（44px）。

# D. 操作鏈：如何讓樣式改動真正生效

設計理念看懂了還不夠——動手時務必照這條鏈，否則改了不生效或讀者看不到（完整規範見
根目錄 [`../CLAUDE.md`](../CLAUDE.md)）：

1. 樣式只改 `assets/tailwind.css`——沒有獨立的 `build:css` 指令，`@tailwindcss/vite`
   外掛會在 `npm run dev`／`npm run build` 時即時編譯。**`assets/main.css` 是
   gitignored、未被引用的舊檔殘留，絕不可編輯，驗證樣式變更請直接跑 `npm run build`。**
2. 顏色一律改 `@theme` 的語意 Token，不在元件寫裸 HEX（見 A4）。
3. 動到會被快取的資產（CSS/JS/元件）時，**bump `public/sw.js` 的 `CACHE_NAME`**
   （目前 `clean-blog-vNN`，每次 +1），否則舊 PWA 快取不會失效。
4. `manifest.json` / `sw.js` 的空 front matter（`---\n---`）不可移除。
5. 改完更新 `doc/project.md` 的更新歷史（＋必要時第一部分的架構/決策段落）——文件同步是任務的一部分。

# E. ❌ 反模式與已否決方向

**別做這些（會破壞一致性或對比）：**
- ❌ 直接編輯 `assets/main.css`（gitignored 的無用殘留，不在建置流程內，編輯了也不會有
  任何效果）。
- ❌ 忘了 bump `sw.js` 的 `CACHE_NAME`（讀者停在舊樣式）。
- ❌ 把 Hero 遮罩 `.overlay` 綁 `bg-paper`（paper 現為白色，會蓋掉深色封面圖上的淺字，
  摧毀對比）——必須固定 `bg-ink`（見 B1）。
- ❌ 用 `shadow-*` 做卡片分層（改用 `border-sand`，見 A11）。
- ❌ 引入色票以外的高彩度顏色，或回頭用冷灰 `text-gray-*`（脫離暖色系統，請用
  `text-ink` / `muted-text` / `sand` / `primary`）。
- ❌ 給 CJK 標題加 `tracking-*`、給 meta 加 `italic`（會擠字／歪斜）。
- ❌ 用 emoji 當結構性圖示（改內聯 SVG）。
- ❌ 只憑肉眼判斷對比「應該夠」——落地前用公式算（見 A3）。

**已被否決 / 刻意不做（別再提議，避免重走冤枉路）：**
- **深色主題（dark mode）**：同日三次改版曾實作過全站深色主題，**使用者明確推翻**，
  定案為「白底＋灰字＋暖褐點綴」。除非使用者重新要求，不要再加 dark mode。
- **依圖片動態偵測明暗調整 Hero 遮罩**（Canvas 像素取樣）：對此規模部落格屬過度工程，
  已用「固定 0.78 不透明度覆蓋最壞情境」一次解決。
- **白／近白雙階 surface**：刻意不做，paper=surface 同白靠邊框分層即可（見 A11）。
- **TOC 抽屜 X 關閉鈕**：刻意移除，改用頂端 grabber 拖曳條＋點 scrim／下滑／Esc 關閉。

---

## 附錄：一句話設計備忘

> **白底、灰字、暖褐點綴；襯線標題、無襯線內文；顏色只定義一次、對比度用算的；
> 讓內容當主角，介面保持安靜。**
