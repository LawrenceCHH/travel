# 卡片 DSL 語法參考

這是本站文章內文裡可用的一組 Markdown fenced code block（```prep ~ ```eatarea，共 10 種），
用來把精簡的 `key: value` / `label | value` 資料逐字渲染成卡片化 HTML。渲染邏輯全部在
`assets/markdown-cards.js`（`registerCardExtensions()`，注册為 marked.js 的 block 級擴充），
由 `assets/scripts.js` 檔頭在 `window.marked` 上接線，純字串邏輯、無 DOM 依賴，可在瀏覽器與
Node 共用。改動 renderer 或遷移文章內容時，用
`node scripts/verify-post-render.mjs [基準 git ref] [檔名過濾字串]` 驗證渲染輸出沒有改變
（不給參數＝以 `HEAD` 為基準比對工作目錄的全部文章）。

> 舊的 `scripts/verify-card-dsl.mjs` **已失效**：它對「改寫前」刻意用純 marked（無卡片擴充）
> 渲染，是為「手寫 HTML → DSL fence」那一次遷移設計的一次性工具。全部文章都卡片化之後，
> 拿它驗任何後續改動都會必然紅字（fence 會被當成 `<pre><code>`）。一律改用
> `verify-post-render.mjs`。

以下總表與範例以 `assets/markdown-cards.js` 目前實際支援的清單為準；
`quickjump`/`stop`/`eat`/`eatarea` 家族專為 `src/posts/2026-07-16-韓國首爾旅行.md`
（`editorial-card` 風格）而建，語法範例逐字擷取自該篇文章。

> `food`/`spot`/`gallery`/`triage`/`emergency` 5 個家族原本是 2026-07-15 卡片 DSL 初版時
> 針對單一風格設計的產物，後續一直沒有任何文章使用，已於 2026-07-25「文章視覺風格系統」
> 重構時連同其孤兒 CSS 一併移除。若日後需要類似家族，請參考 `quickjump`/`stop`/`eat`/
> `eatarea` 的寫法重新設計，不要嘗試恢復舊實作。

> **`eat`／`eatarea` 新文章請勿再用下方 fence 語法（2026-07-26 起）**：兩者已改用純
> Markdown 寫法——`eat` 由 `assets/markdown-sections.js` 依「內容形狀」自動辨識重組
> （語法見 `plan.md` §2.1：`#### [店名](連結)` ＋ 反引號標籤列 ＋ `**招牌菜**` 段落 ＋
> 描述 ＋ 連結清單），`eatarea` 直接寫 `### [分區名稱](連結)` 即可、完全不需要任何轉換層
> （CSS 早已把純 `<h3>` 設計成與 `.food-list-title` 同款）。07-16 全部 30 張美食卡與 6 個
> 分區標題已於 2026-07-26 遷移完畢。下方 `eat`/`eatarea` 的 fence 語法**仍受渲染器支援**
> （`markdown-cards.js` 未刪除對應 renderer，向後相容、不強制既有內容改寫），只是不再是
> 建議寫法，僅供讀懂舊 commit 歷史或 `assets/markdown-cards.js` 原始碼時參考。完整規劃
> 見根目錄 `plan.md`；本檔尚未依此改寫成「Markdown 寫作約定手冊」（見 `plan.md` Phase E，
> 待其餘家族 `compare`/`info`/`prep`/`apps`/`stepper` 決策後一併重寫，避免分批改動）。

## 總表

| fence | 渲染成什麼 | 一個 block = | 適合放什麼內容 |
| --- | --- | --- | --- |
| `prep` | `.prep-pill-row` 內多個 `.prep-pill` | 一組多張 pill | 文章開頭「30 秒速覽」，關鍵字→一句話結論 |
| `stepper` | `.stepper` 內多個 `.step-item` 垂直時間軸 | 一組多步驟 | 有先後順序的流程（機場通關、WOWPASS 開卡） |
| `compare` | `.compare-card`（含左主色條，可加 `stars`） | 一張卡 | 需要「擇一比較」的選項（交通方案、網路方案） |
| `info` | `.info-card`（無色條、平框＋分隔線，不支援 `stars`） | 一張卡 | 純參考資訊，不是選項（在地習俗、氣候卡規定） |
| `apps` | 多個相鄰 `.app-card`（無外層 wrapper） | 一組多張 | 推薦 App／工具清單 |
| `accordion` | `<details class="fold border-l-4 cat-*">` | 一張可摺疊卡 | 分類化的摘要＋展開細節（緊急聯絡各分類） |
| `quickjump` | `.editorial-quick-jump` 內標題＋連結格狀清單 | 一組多張（僅一次） | 07-16「7 大主題景點快速導覽」，全文僅出現一次；套用 `editorial-card` 風格 |
| `stop` | `.spot-section`（h4 標題＋友善度徽章＋子選項清單） | 一張卡 | 07-16 景點漫遊主題章節，套用 `editorial-card` 風格 |
| `eat` | `.food-item`（`.food-header`/`.food-tag`/`.food-body`/`.food-why`/`.food-actions`） | 一張卡 | 07-16 美食推薦項目，套用 `editorial-card` 風格 |
| `eatarea` | `.food-list-title` | 一個標題列 | 07-16 美食推薦分區小標題（採用 `<h3 class="food-list-title">`，可進入 TOC 供 Drawer 索引定位） |

## 語法範例（皆為現有文章真實片段）

**`prep`**（`src/posts/2026-07-13-*.md` 「30 秒行前速覽」）：
```prep
網路：中華電信韓國日租型最划算： | 原機原號免換卡，每日優惠價 NT$99 吃到飽，4 天合計 NT$396。
現金：4 人備約 20 萬韓元： | 小吃攤與 T-money 交通卡儲值僅收韓元現金，WOWPASS 交通卡餘額也無法用 App 線上儲值。
```

**`stepper`**（標題不含「Step N:」，編號與全形冒號由渲染器自動補上；多行 body 會遞迴解析成清單）：
```stepper
@ 桃園機場 T1 出發（凌晨 22:30 抵達櫃台）
前往第一航廈真航空報到櫃台，領取紙本登機證並辦理託運（確保行李 &le; 15kg）。
@ 機上飛行與降落 (01:25 - 05:00)
航程約 2.5 小時，請成員備好頸枕與耳塞休息。
```

**`compare`**（`stars` 可省略；`row` 用 `label | value`）：
```compare
name: 機場直通列車 (AREX)
stars: ★★★☆☆
tagline: 速度最快且不塞車，但抵達首爾站後，站體內轉乘步行距離長且電扶梯轉乘繁瑣。
row: 車資 | 單人 13,000 韓元
row: 時間 | 約 51 分鐘 (直達首爾站)
```

**`info`**：支援 `row`（鍵值列）或 `text`（單段落）兩種 body 形式，同一 block 不混用：
```info
name: 交通禮儀
row: 地鐵博愛座 | 不論車廂多擠，<strong>一般旅客絕對不要入座博愛座！</strong>
row: 手扶梯 | 習慣「右側站立，左側通行」。
```
```info
name: 秋季穿搭
text: 10 月中旬首爾平均氣溫約 10°C - 18°C，日夜溫差極大。強烈建議<strong>「洋蔥式穿搭」</strong>。
```

**`apps`**（每行 `圖示字元 | 名稱 | 說明含 HTML 連結`）：
```apps
N | Naver Map | 韓國在地導航首選。支援繁體中文與中文語音導航。<br>下載連結：<a href="https://play.google.com/store/apps/details?id=com.nhn.android.nmap" target="_blank">Android ↗</a>
```

**`accordion`**（第一段空行前為 meta，之後為可含 Markdown 清單的展開內容）：
```accordion
id: em-119
cat: medical
tag: 醫療・消防
summary: 119 救護車/消防車 — 有人受傷、生病送醫、火災

*   **緊急熱線**：直撥 **[119](tel:119)**。
*   **中文服務**：接通後說 **"Chinese, please"**，系統將在數秒內連線至中文口譯人員進行三方通話。
```

**`quickjump`**（07-16「7 大主題景點快速導覽」，全文僅一次；`title:` 一行之後每行
`href | 連結文字 | 說明`）：
```quickjump
title: 7 大主題景點快速導覽
#spot-1 | 01 / 首日緩衝 | 紅眼降落後的從容補眠
#spot-2 | 02 / 德壽宮 | 金黃銀杏石牆路散步
```

**`stop`**（`sub` 可重複，格式 `子標題 | 內文`；`level` 對應徽章樣式，見下方注意事項）：
```stop
id: spot-2
url: https://www.google.com/search?q=...
title: 德壽宮・金黃銀杏石牆路散步
tag: 全線平坦・多設有長椅
level: flat
desc: 德壽宮石牆路地勢完全平坦，秋季銀杏會將道路染成金黃色。距離新首爾飯店僅 300 公尺，對體力要求極低。
sub: 鄰近休憩處：<a href="https://www.google.com/search?q=..." target="_blank" class="no-underline text-inherit">貞洞展望台</a> | 位於首爾市廳西小門廳舍 13 樓，內設有咖啡廳，有直達電梯。
sub: 下一站移動 | 直接步行 4 分鐘返回新首爾飯店休息。
```

**`eat`**（`diet` 逗號分隔，可留空；字尾加 `*` 觸發紅框警示樣式；`sigsep: half` 為可省欄位）：
```eat
name: 味成屋 (미성옥)
url: https://www.google.com/search?q=...
meal: 正餐
diet: 不辣, 無內臟, 無生食
price: 11,000 ~ 45,000 韓元
signature: 韓牛雪濃湯 (설렁탕) / 白切韓牛肉盤
why: 純牛骨慢熬湯頭極清淡溫潤且完全不辣、無生食與內臟，對熬夜後的腸胃負擔極低。
naver: https://map.naver.com/v5/search/미성옥
kakao: https://map.kakao.com/?q=미성옥
ref: https://bigfang.tw/blog/post/seolleongtang-miseongok
```

**`eatarea`**：
```eatarea
name: 德壽宮與市廳區美食
url: https://www.google.com/search?q=...
```

## 注意事項

- **多行 body 的空行規則**：`stepper`／`accordion` 的多行內容前後、清單前後都需要保留空行，
  marked.js 才會把 `*   ` 解析成 `<ul><li>`；省略空行會被當成純文字，`*` 不會轉換成項目符號。
- **`apps` 無外層 wrapper**：多個 `.app-card` 相鄰輸出、無共用父層，CSS 若要做去尾/去頭樣式須用
  相鄰選擇器（如 `.app-card + .app-card`），`:first-of-type`/`:last-of-type` 對此無效。
- **URL 欄位原樣輸出**：`url`／`naver`／`kakao`／`ref`／`href` 等連結欄位不做 `encodeURIComponent`，
  保留原始查詢字串（含韓文）。
- **`compare` vs `info`**：兩者結構平行，但語意分工是「`compare` = 可擇一的選項（有色條、可加
  `stars`）」「`info` = 純參考資訊（無色條、不支援 `stars`）」，新增內容前先判斷屬於哪一種。
- **`stop` 的 `level` 四種值**：`diet`（`.food-tag.diet` 樣式，如「極度舒適」）／`flat`（沙色底，
  平坦友善）／`slope`（淺黃底，緩坡）／`steps`（淺橘底，階梯/碎石）——四種 utility class 組合
  逐字對應 07-16 原始資料裡就存在的 4 種寫法，非本次新設計，新增景點卡時依實際地形難度選擇。
- **`eat` 的 `*` 警示標記與 `sigsep`**：原始 30 筆美食資料裡「需排隊!」這個詞有兩種並存寫法
  （多數用純 `.food-tag.diet` 樣式，僅 1 筆用紅框警示樣式），`diet` 欄位裡對該項目字尾加 `*`
  即可還原紅框樣式；`<strong>招牌菜</strong>` 後面的分隔符號 29 筆是全形「：」，僅 1 筆原始
  資料是半形「: 」，須加 `sigsep: half` 才能逐字還原——兩者都是原始內容既有的不一致，不是
  新增資料時應該模仿的寫法（新資料建議统一用不加 `*` 的 diet 標籤、全形「：」）。

## 文章視覺風格系統（`style` front matter，2026-07-25）

DSL 輸出的 HTML／class 永遠只有一份 canonical 版本；不同文章想要不同的整篇視覺風格，
不靠改 renderer 或手寫 wrapper `<div>`，而是靠一個獨立的 CSS 層：

1. **front matter 加一個欄位**：`style: <風格名稱>`（例如 07-16 用的 `style: editorial-card`）。
   `scripts/generate-posts-metadata.js` 會把它原樣寫進 `posts.json` 的 `style` 欄位；
   `posts/detail.html` 在 `marked.parse()` 完成、`innerHTML` 寫入的同一個 tick 內，判斷
   `post.style` 是否有值，有的話就 `contentContainer.classList.add('post-style-' + post.style)`
   ——不會有 FOUC，也不需要在 Markdown 裡手寫任何 wrapper。
2. **風格 CSS 放 `assets/post-styles/<風格名稱>.css`**，整份檔案 scope 在
   `.post-style-<風格名稱>` 之下，由 `assets/tailwind.css` **最末行** `@import` 進來
   （見 `doc/style.md` B8：位置放錯 build 不會報錯，是靜默的 cascade 失效，務必放最後）。
3. **多篇文章要共用同一份風格**：front matter 填同一個 `style` 值即可，`.post-style-<name>`
   天生支援多篇套用。但有個必要前提——風格檔的選擇器綁定特定 DSL 家族（例如
   `editorial-card.css` 綁定 `quickjump`/`stop`/`eat`/`eatarea` 這組家族的 class，如
   `.spot-title`/`.food-item`/`.food-list-title`），**第二篇文章必須使用同一組 DSL 家族**，
   風格才會生效；新增風格檔時務必在檔頭註明「本風格依賴哪些 DSL 家族」。
4. **風格檔只能用 `@theme` 既有 Token**（見 `doc/style.md` B1），不得發明新色票；也不得出現
   文章專屬的 `#id` 選擇器——這是共用機制成立的前提，寫死單篇專屬選擇器會讓其他文章即使套用
   同一 `style` 值也無法生效。
5. **新增一篇風格不同的文章時的完整流程**：照本檔既有語法寫 fence → front matter 加
   `style: <名稱>` → 新增一份 scoped 在 `.post-style-<名稱>` 的 CSS → **完全不寫新 JS、
   不動 `markdown-cards.js`、不手寫 `<div>` 包版型**。風格差異永遠只寫 CSS，不要為了換皮
   再造一組 DSL 家族（這正是 `food`/`spot`/`gallery`/`triage`/`emergency` 5 個家族當初
   變成孤兒代碼的原因——07-16 改版視覺時另外設計了一套新家族，而不是把舊家族的 CSS
   抽換掉，導致兩者都得維護）。
