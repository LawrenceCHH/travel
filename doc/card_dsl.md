# 文章卡片寫作手冊：純 Markdown 優先，剩餘家族用 fence DSL

這份文件是給「要在文章裡放卡片化內容」的人看的寫作參考，涵蓋兩種寫法：

1. **純 Markdown 形狀約定**（建議寫法）：美食卡、App 推薦清單。作者只寫一般 Markdown，
   前端依「內容形狀」自動辨識、重組成卡片 HTML。渲染邏輯在 `assets/markdown-sections.js`
   （`registerSectionExtensions()`，marked v12 的 `hooks.processAllTokens` token 層擴充）。
2. **Fence DSL**（`compare`/`prep`/`info`/`stepper`/`accordion`/`quickjump`/`stop`，共 7 種）：
   `key: value` 形式的自訂語法，渲染邏輯在 `assets/markdown-cards.js`
   （`registerCardExtensions()`，marked block 級擴充）。這 7 個家族逐一評估過「形狀規則能否
   安全與其他 Markdown 內容區分」後，判定不適合轉換（帶顏色變體、需要群組容器、或會與既有
   Markdown 段落撞形狀），詳見 §3 每個家族的決策理由。

兩者都是純字串邏輯、無 DOM 依賴，可在瀏覽器與 Node 共用，由 `assets/scripts.js` 檔頭在
`window.marked` 上接線。改動 renderer 或遷移文章內容時，用
`node scripts/verify-post-render.mjs [基準 git ref] [檔名過濾字串]` 驗證渲染輸出沒有改變
（不給參數＝以 `HEAD` 為基準比對工作目錄的全部文章）。

> `eat`/`eatarea`/`apps` 原本也是 fence DSL，已於 2026-07-26 廢除、改成 §1 的純 Markdown
> 寫法，`markdown-cards.js` 已不含這三個家族的 renderer——**若文章裡還留著
> `` ```eat ``/`` ```eatarea ``/`` ```apps `` fence，會被當成純程式碼區塊原樣輸出，不會渲染
> 成卡片**，需要照 §1 改寫。`food`/`spot`/`gallery`/`triage`/`emergency` 5 個更早的家族
> 從未被任何文章使用過，已於 2026-07-25 隨孤兒 CSS 一併移除，若日後需要類似效果，參考本檔
> 既有家族重新設計，不要嘗試恢復舊實作。

---

## §1 純 Markdown 卡片形狀（建議寫法）

**核心原則：用「形狀」判斷語意，不用「位置順序」。** 位置約定（第一段是 A、第二段是 B）
一旦作者少寫一段就整組錯位，而且不會報錯；形狀判斷是自我描述的——價格永遠在 code span
裡、招牌菜永遠以粗體標籤開頭，段落順序調換也不會跑錯格子。

### 1.1 美食卡（`.food-item`）

```markdown
#### [味成屋 (미성옥)](https://www.google.com/search?q=...)

`正餐` `不辣` `無內臟` `無生食` `11,000 ~ 45,000 韓元`

**招牌菜**：韓牛雪濃湯 (설렁탕) / 白切韓牛肉盤

純牛骨慢熬湯頭極清淡溫潤且完全不辣、無生食與內臟，不加鹽上桌。

- [Naver ↗](<https://map.naver.com/v5/search/미성옥 시청점>)
- [Kakao ↗](https://map.kakao.com/?q=미성옥)
- [食記參考 ↗](https://bigfang.tw/blog/post/seolleongtang-miseongok)
```

- **反引號當標籤**：`` `正餐` `` 是 Markdown 原生 code span，任何編輯器都讀得懂，CSS 把它
  變成標籤 pill，不需要自訂語法。槽位規則：**第一個**＝餐別、**最後一個**＝價格、**中間**＝
  飲食標籤；標籤字尾加 `*`（如 `` `需排隊!*` ``）觸發紅框警示樣式（`*` 在 code span 內是
  字面值，不會被當成 Markdown 強調語法）。
- **觸發條件**（兩者都成立才判定為美食卡，避免誤判一般 `####`）：
  1. `####` 標題內容是**單一連結**
  2. 緊接著的段落**只由 code span 組成**（可以有多個，中間留空白）
- 標題之後依序放：meta 標籤列（見上）、`**招牌菜**：` 開頭的段落、描述段落（可多段）、
  一份「每一項都是單一連結」的清單（動作按鈕）。**這些段落的順序可以調換**，只有標題後
  緊接 meta 列這一項有位置要求，因為那是觸發條件本身。
- **URL 含空格時用角括號**：`[文字](<含空格的網址>)`——標準 Markdown 連結語法在空格處會
  斷掉，韓文店名＋分店名的 Naver/Kakao 網址很常見這個情況。角括號寫法下 `href` 輸出與原始
  網址逐字相同（本轉換層直接取 token 的原始 `href`，不做 `encodeURIComponent`）。

### 1.2 App 推薦清單（`.app-card`）

```markdown
- **N** Naver Map：韓國在地導航首選，支援繁體中文與中文語音導航。
- **K** KakaoMap：韓國市佔率極高之地圖，與 Naver Map 互為備用。
```

- 每一項以**單一英數字元的粗體**開頭（App 圖示），接著是名稱，第一個**全形冒號「：」**
  之後是說明（可含 `<br>`/`<a>` 等行內 HTML）。
- **觸發條件**：清單「每一項」開頭都是單一英數字元的粗體。全站掃過確認沒有其他清單/段落
  用單一粗體字母開頭，是安全、不會誤判的形狀。
- 渲染出的多個 `.app-card` 相鄰、無外層 wrapper；CSS 若要做去尾/去頭樣式須用相鄰選擇器
  （如 `.app-card + .app-card`），`:first-of-type`/`:last-of-type` 對此無效。

### 1.3 美食分區小標題（`eatarea`）

```markdown
### [德壽宮與市廳區美食](https://www.google.com/search?q=...)
```

直接寫成一個普通的 `### [分區名稱](連結)`，**不需要任何轉換層程式碼**——CSS 早就把純
`<h3>` 設計成與舊 fence 版的 `.food-list-title` 同字級、同留白、同樣不加底線，`initTOC()`
的 TOC 篩選也只看 DOM 深度、不看 class，兩種寫法在頁面上的行為完全一樣。

### 1.4 為什麼不是每種卡片都能這樣做

不是所有卡片都適合轉換成形狀約定——`prep`（30 秒速覽的粗體標籤列）就試過，候選形狀
「粗體開頭＋『：』直接接說明文字」在 `src/posts/2026-07-20-韓國自由行支付教學.md:98,100`
撞到兩個完全符合此形狀、且彼此相鄰的**真實一般段落**，無法安全區分，因此維持 fence。
評估一個家族能不能轉換，先問：這個形狀在全站既有文章裡，會不會跟正常的手寫段落長得一樣？
會的話就不安全，維持 fence（見 §3 各家族理由）。

---

## §2 Fence DSL 總表（仍需要 fence 的 7 個家族）

| fence | 渲染成什麼 | 一個 block = | 適合放什麼內容 |
| --- | --- | --- | --- |
| `prep` | `.prep-pill-row` 內多個 `.prep-pill` | 一組多張 pill | 文章開頭「30 秒速覽」，關鍵字→一句話結論 |
| `stepper` | `.stepper` 內多個 `.step-item` 垂直時間軸 | 一組多步驟 | 有先後順序的流程（機場通關、WOWPASS 開卡） |
| `compare` | `.compare-card`（含左主色條，可加 `stars`） | 一張卡 | 需要「擇一比較」的選項（交通方案、網路方案） |
| `info` | `.info-card`（無色條、平框＋分隔線，不支援 `stars`） | 一張卡 | 純參考資訊，不是選項（在地習俗、氣候卡規定） |
| `accordion` | `<details class="fold border-l-4 cat-*">` | 一張可摺疊卡 | 分類化的摘要＋展開細節（緊急聯絡各分類） |
| `quickjump` | `.editorial-quick-jump` 內標題＋連結格狀清單 | 一組多張（僅一次） | 07-16「7 大主題景點快速導覽」，全文僅出現一次；套用 `editorial-card` 風格 |
| `stop` | `.spot-section`（h4 標題＋友善度徽章＋子選項清單） | 一張卡 | 07-16 景點漫遊主題章節，套用 `editorial-card` 風格 |

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

## 注意事項

- **多行 body 的空行規則**：`stepper`／`accordion` 的多行內容前後、清單前後都需要保留空行，
  marked.js 才會把 `*   ` 解析成 `<ul><li>`；省略空行會被當成純文字，`*` 不會轉換成項目符號。
- **URL 欄位原樣輸出**：`url`／`href` 等連結欄位不做 `encodeURIComponent`，保留原始查詢
  字串（含韓文）。
- **`compare` vs `info`**：兩者結構平行，但語意分工是「`compare` = 可擇一的選項（有色條、可加
  `stars`）」「`info` = 純參考資訊（無色條、不支援 `stars`）」，新增內容前先判斷屬於哪一種。
- **`stop` 的 `level` 四種值**：`diet`（`.food-tag.diet` 樣式，如「極度舒適」）／`flat`（沙色底，
  平坦友善）／`slope`（淺黃底，緩坡）／`steps`（淺橘底，階梯/碎石）——四種 utility class 組合
  逐字對應 07-16 原始資料裡就存在的 4 種寫法，新增景點卡時依實際地形難度選擇。

## §3 為什麼這 7 個家族維持 fence（2026-07-26 決策）

逐一評估「形狀規則能否安全與其他 Markdown 內容區分」後，判定都不適合轉換：

- **`compare`／`info`**：兩者結構完全相同，唯一差異是有無左色條＋`stars`，這是**兩種 fence
  類型間的二元判斷**，不是單一家族內可用形狀規則描述的差異。
- **`prep`**：形狀「粗體開頭＋『：』直接接說明文字」會與全站許多一般段落手寫習慣撞形狀
  （見 §1.3 的 07-20 反例），無法安全區分。
- **`stepper`**：`.stepper` 的垂直時間軸連接線（`::before` 橫跨首尾步驟）需要一個群組容器，
  純 Markdown 沒有天然的「這裡是一組步驟的起訖」邊界標記，容易與一般 `###`/`####` 子標題
  混淆。
- **`accordion`**：`<details>/<summary>` 摺疊與 5 種分類色都沒有純 Markdown 對應語法，工程上
  不值得為它發明約定。
- **`quickjump`**：全站僅一處使用，訂一套形狀約定不划算。
- **`stop`**：4 種顏色徽章（`level`）沒有 Markdown 原生語法可以表達，歸類為「帶顏色變體」，
  比照 `accordion` 保留 fence。

**已確認的方向**：不追求「消滅所有 fence」。高重複、形狀規則清楚的內容（`eat`/`eatarea`/
`apps`）改用純 Markdown；帶顏色變體、需要群組容器、或全站只出現一次的家族，保留 fence 是
合理的工程判斷。目標是「作者寫內容時 95% 的時間都在寫純 Markdown」，不是「fence 歸零」。

---

## §4 文章視覺風格系統（`style` front matter，2026-07-25）

DSL／形狀轉換層輸出的 HTML／class 永遠只有一份 canonical 版本；不同文章想要不同的整篇視覺
風格，不靠改 renderer 或手寫 wrapper `<div>`，而是靠一個獨立的 CSS 層：

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
5. **新增一篇風格不同的文章時的完整流程**：照本檔既有語法寫作（§1 純 Markdown 形狀 ＋ §2
   fence）→ front matter 加 `style: <名稱>` → 新增一份 scoped 在 `.post-style-<名稱>` 的
   CSS → **完全不寫新 JS、不動 `markdown-cards.js`/`markdown-sections.js`、不手寫 `<div>`
   包版型**。風格差異永遠只寫 CSS，不要為了換皮再造一組家族（這正是 `food`/`spot`/
   `gallery`/`triage`/`emergency` 5 個家族當初變成孤兒代碼的原因——07-16 改版視覺時另外
   設計了一套新家族，而不是把舊家族的 CSS 抽換掉，導致兩者都得維護）。
