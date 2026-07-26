# plan.md — 純 Markdown 寫作 ＋ 前端結構轉換層

> **目標（已與使用者確認）**：
> **作者只用 Markdown 寫內容；不同頁面要呈現的風格，統一由 CSS 和前端程式解析 Markdown 後套用。**
>   看完這份執行計畫後，有疑問的話就先跟我討論，沒有的話就繼續執行未完成任務。任務完成後要更新plan.md，完成的打勾，需要我決策的列入新的checklist，最後commit
> 上一階段（文章視覺風格系統重構）已完成並 commit，成果與遺留風險見 [`report.md`](report.md)。

---

## 1. 方向修正：本檔上一版寫錯了

本檔上一版把問題理解成「fence 語法可以留，只要讓 `key: value` 的**值**支援 Markdown」（讀法 A）。
經與使用者確認，真正的目標是**讀法 B**：`` ```eat `` 加上 `key: value` 這種寫法**本身就不是
Markdown**，整個自訂 DSL 才是「格式不統一」的來源。

因此方向改為：**廢掉 fence DSL → 作者寫純 Markdown → 前端依「內容形狀」重組成卡片結構 → CSS 上色。**

**存在證明**：07-20 那篇是純 Markdown 寫的——30 個標題、37 行表格、56 個清單項、1 個引用，
`<` 只出現 4 次（且僅為了 `aria-label` 無障礙屬性）。純 Markdown 完全寫得出完整文章。

---

## 2. 核心設計：用「形狀」判斷語意，不用「位置順序」

這是本方案最重要的取捨。

**位置約定**（第一段是 meta、第二段是招牌菜、第三段是描述）一旦作者少寫一段就整組錯位，
而且**不會報錯**。這個專案已經踩過這個坑——`card_dsl.md` 記載 `.food-item-row:nth-of-type`
依賴固定順序是既有的已知限制。

**形狀判斷**則是自我描述的：
- 「只由 code span 組成的段落」→ meta 標籤列
- 「以粗體開頭的段落」→ 招牌菜列
- 「每一項都是單一連結的清單」→ 動作按鈕列
- 其餘段落 → 描述

**段落順序調換也不會跑錯格子**，因為每種內容的形狀不同。這解決了我原本擔心的「靜默錯誤」問題。

### 2.1 美食卡的 Markdown 約定（原型已驗證）

```markdown
#### [味成屋 (미성옥)](https://www.google.com/search?q=...)

`正餐` `不辣` `無內臟` `無生食` `11,000 ~ 45,000 韓元`

**招牌菜**：韓牛雪濃湯 (설렁탕) / 白切韓牛肉盤

純牛骨慢熬湯頭極清淡溫潤且完全不辣、無生食與內臟，不加鹽上桌。

- [Naver ↗](<https://map.naver.com/v5/search/미성옥 시청점>)
- [Kakao ↗](https://map.kakao.com/?q=미성옥)
- [食記參考 ↗](https://bigfang.tw/blog/post/seolleongtang-miseongok)
```

- **反引號當標籤**是關鍵技巧：`` `正餐` `` 是 Markdown 原生 code span，任何編輯器都讀得懂，
  CSS 把它變成標籤 pill，完全不需要自訂語法。
- meta 槽位：第一個＝餐別、最後一個＝價格、中間＝飲食標籤；字尾 `*` 用警示樣式
  （`*` 在 code span 內是字面值，不會被當成 Markdown 強調語法）。
- **觸發條件**（兩者都成立才判定為美食卡）：`####` 內容是單一連結，且緊接著的段落只由
  code span 組成。已用反向測試確認一般 `####` 不會被誤判。

### 2.2 實作方式

marked v12 的 `hooks.processAllTokens`，**在 token 陣列上重組**（而非對渲染後的 HTML 跑正則），
不受標籤巢狀、屬性引號等問題影響。純字串邏輯，Node／瀏覽器共用，沿襲既有架構。

檔案：`assets/markdown-sections.js`（新增，與既有 `markdown-cards.js` 並存，可漸進遷移）。

---

## 3. 原型結果（已完成，見 §5 Phase A）

**全部 30 張真實美食卡自動轉換後逐張比對：**

```
✅ 逐字等價              29 張
✅ 僅網址百分比編碼不同   0 張
❌ 有結構差異            1 張
```

唯一差異是 `Cafe Onion` 那筆的 `O'sulloc` → `O&#39;sulloc`（HTML 實體，瀏覽器顯示完全相同），
與 Phase 1 稽核當時預測的完全是同一筆。

### 3.1 真實資料暴露的問題（手打測資看不到）

**URL 含空格**：30 個 `naver`/`kakao` 網址中有 **13 個含空格**（韓文店名＋分店名，
如 `.../만족오향족발 시청점`）。標準 Markdown 連結語法在空格處就斷掉，13 張卡全部渲染錯誤。

**解法**：CommonMark 的角括號語法 `[文字](<含空格的網址>)`。已實測有效，且 `href` 輸出
與現行 fence 版**逐字相同**（本轉換層直接取 token 的原始 `href`，只有 marked 的預設 renderer
才會做百分比編碼）。

**這是「純 Markdown」路線的第一個真實成本**：作者得知道網址含空格時要加角括號。

---

## 4. 尚未解決的難題（誠實列出，不要假裝已解決）

原型只證明了 `eat` 這一個家族可行。以下是全面遷移前必須先想清楚的：

1. ~~`stop.level` 的 4 種顏色徽章無法用純 Markdown 表達~~ **✅ 已決策（2026-07-26）**：
   `stop` 屬於「帶顏色變體」類，比照 `accordion`／`quickjump` **保留 fence**。不需要為
   顏色徽章設計形狀約定，`markdown-cards.js` 的 `renderStop` 不動。

2. ~~`accordion` 的 `<details>` 摺疊沒有 Markdown 原生語法~~ **✅ 已決策（2026-07-26）**：
   **保留 fence**。`<details>/<summary>` 摺疊與 5 種分類色都沒有純 Markdown 對應語法，
   工程上不值得為它發明約定。

3. **`quickjump` 是只出現一次的客製版型** **✅ 已決策（2026-07-26）**：**保留 fence**。
   全站僅一處使用，訂一套形狀約定不划算。

4. **`eatarea` 不需要新設計**——原以為它跟 `eat` 一樣需要形狀判斷，但檢查
   `assets/post-styles/editorial-card.css:49-53` 才發現：`.food-list-title` 本來就
   被刻意設計成與純 Markdown 的 `<h3>` **同字級、同留白、同樣不加底線**（2026-07-21 那次
   標題階層整併的結果），CSS 選擇器 `.food-item:has(+ h3, + .food-list-title)` 也早就同時
   涵蓋兩者。07-16 現有 6 個 `eatarea` 標題裡 **5 個其實已經是純 `### [名稱](url)`**，只剩
   1 個（仁寺洞文藝區美食）還是 fence。**結論：`eatarea` 不需要任何轉換層程式碼**，直接寫
   `### [名稱](url)` 即可。已核對 `assets/scripts.js:474` 的 TOC 大綱篩選邏輯——只看
   `parent === contentContainer`（DOM 深度），不看 class，所以原 fence 版
   `<h3 class="food-list-title">` 跟純 Markdown 版 `<h3>` 在 TOC 大綱裡的行為**完全一樣**，
   沒有落差。渲染輸出唯一的結構差異是少了 `class="food-list-title"`／`<a>` 的
   `class="no-underline text-inherit"`——兩者都已被 `.prose h3` 與
   `.prose h1 a,h2 a,h3 a,h4 a{color:inherit;text-decoration:none}` 涵蓋（§2.4），
   純屬 HTML 結構差異，視覺與功能都不受影響。

5. ~~其餘家族仍待決策：`compare`（含 `stars`）、`info`、`prep`、`apps`、`stepper`~~
   **✅ 已決策（2026-07-26，Phase D）**：`apps` 轉純 Markdown（清單每項以單一英數字元粗體
   開頭，全站掃過無誤判風險，07-13 已遷移、`verify-post-render.mjs` 0 diff）；
   `compare`／`info`／`prep`／`stepper` 維持 fence——`compare` 與 `info` 結構相同、僅
   差在有無色條＋`stars`，是兩種 fence 類型間的二元判斷而非單一形狀規則；`prep` 的
   「粗體開頭＋『：』」形狀與 07-20 既有一般段落撞形狀（`2026-07-20-韓國自由行支付教學.md:98,100`
   為相鄰的真實反例），無法安全區分；`stepper` 的時間軸連接線需要群組容器，純 Markdown
   沒有天然的起訖邊界標記。詳見 `doc/card_dsl.md` 對應段落。

6. **一般 h4 誤判風險**：目前靠「h4 是單一連結 ＋ 下一段只有 code span」雙重條件擋住。
   反向測試通過，但文章數變多後仍需持續驗證。

**已確認的方向（2026-07-26 拍板）**：不追求「消滅所有 fence」。`eat`/`eatarea` 這種高重複、
形狀規則的內容改用純 Markdown；`stop`/`accordion`/`quickjump` 這種帶顏色變體或全站只出現一次
的，保留 fence 是合理的工程判斷。目標是「作者寫內容時 95% 的時間都在寫純 Markdown」，不是
「fence 歸零」。

---

## 5. Checklist

### Phase A — `eat` 家族原型 ✅ 已完成

- [x] 確認 marked v12.0.2 支援 `hooks.processAllTokens`（可在 token 層重組，不需正則處理 HTML）
- [x] 取得現行 `eat` fence 的精確渲染輸出當對照基準
- [x] 設計「形狀判斷」約定（§2.1），刻意避開位置順序依賴
- [x] 新增 `assets/markdown-sections.js`：`collapseFoodCards()` token 重組 ＋ `foodCard` renderer
- [x] 新增 `scripts/__proto-test.mjs`：3 個手打案例（多標籤／警示標籤／無標籤）＋
      2 個反向測試（一般 h4、h4 是連結但下段不是 code span）→ **5 項全過**
- [x] 新增 `scripts/__proto-bulk.mjs`：把 07-16 全部 30 張真實美食卡自動轉換後逐張比對
      → **29/30 逐字等價**，1 筆為已知的撇號 HTML 實體差異
- [x] 發現並解決「13 個網址含空格」問題（角括號語法，`href` 輸出逐字相同）

### Phase B — 決策 ✅ 已完成（2026-07-26）

- [x] §4 第 1 點：`stop` 的 4 種顏色徽章要怎麼處理 → **保留 fence**（歸類為「帶顏色變體」）
- [x] §4 第 2 點：`accordion` 的摺疊與分類色要怎麼處理 → **保留 fence**
- [x] 確認「不追求 fence 歸零」這個目標設定是否符合預期 → **確認**：`eat`/`eatarea` 轉純
      Markdown，`stop`/`accordion`/`quickjump` 保留 fence
- [x] （執行時發現，非原 checklist 項目）確認 `eatarea` 不需要形狀轉換層——CSS 早已把純
      `<h3>` 與 `.food-list-title` 設計成同款，07-16 現有 6 處裡 5 處已是純 Markdown

### Phase C — `eat`／`eatarea` 正式接線與遷移 ✅ 已完成（2026-07-26）

- [x] `assets/scripts.js` 檔頭接線 `registerSectionExtensions`（比照現有 `registerCardExtensions`）
- [x] `scripts/generate-posts-metadata.js` 的閱讀時間計算也要註冊（否則字數會算錯）
- [x] `scripts/verify-post-render.mjs` 同步註冊，否則驗證會失真
- [x] 用 `__proto-bulk.mjs` 的轉換函式批次改寫 07-16 的 30 張美食卡
- [x] 把 07-16 僅剩的 1 個 `eatarea` fence（仁寺洞文藝區美食）改成純 `### [名稱](url)`
      （不需轉換層程式碼，見 §4 第 4 點）
- [x] `node scripts/verify-post-render.mjs` → 兩處容許差異：`O'sulloc` 的 `&#39;`（Phase 1
      稽核已知）、`eatarea` 少掉的 `food-list-title`／`no-underline text-inherit` 兩個 class
      （見 §4 第 4 點，視覺與 TOC 行為皆不受影響）
- [x] 瀏覽器目視確認視覺無變化（headless Chromium 截圖比對，`.food-item` 30 張正常渲染，
      無 console error，「仁寺洞文藝區美食」與其餘 5 個區塊標題視覺與 TOC 行為一致）
- [x] `public/sw.js` bump `CACHE_NAME`（v55 → v56）

### Phase D — 其餘家族 ✅ 已完成（2026-07-26）

> `stop`／`accordion`／`quickjump` 已在 Phase B 決策保留 fence，`eatarea` 已在 §4 第 4 點
> 確認不需轉換層，三者都**不需要**本 Phase 的工作。Phase D 範圍縮小為僅剩的家族：

- [x] 07-13 的 `compare`（含 `stars`）：評估後**保留 fence**——與 `info` 結構相同，僅差
      有無色條＋`stars`，是二元 fence 類型判斷，非可安全轉換的單一形狀規則
- [x] 07-13 的 `info`：**保留 fence**（同上，與 `compare` 一併決策）
- [x] 07-13 的 `prep`：**保留 fence**——形狀「粗體開頭＋『：』」會與 07-20 既有一般段落
      撞形狀（`2026-07-20-韓國自由行支付教學.md:98,100` 為相鄰真實反例），無法安全區分
- [x] 07-13 的 `apps`：**轉純 Markdown**——清單每項以單一英數字元粗體開頭（App 圖示），
      全站掃過確認此形狀無誤判風險。新增 `assets/markdown-sections.js` 的
      `collapseAppLists()`／`renderAppList()`，07-13 唯一一處 `apps` fence 已改寫，
      `verify-post-render.mjs` 驗證 0 diff（含既有的 `foodCard` 反向測試一併通過）
- [x] 07-13 的 `stepper`：**保留 fence**——`.stepper` 垂直時間軸需要群組容器橫跨多步驟，
      純 Markdown 沒有天然的起訖邊界標記，容易與一般 `###`/`####` 子標題混淆
- [x] `public/sw.js` bump `CACHE_NAME`（v56 → v57，`markdown-sections.js` 內容變更）

### Phase E — 收尾 ✅ 已完成（2026-07-26）

- [x] `doc/card_dsl.md` 改寫：從「fence 語法手冊」改成「Markdown 寫作約定手冊」（§1 純
      Markdown 形狀約定、§2 剩餘 7 個 fence 家族、§3 保留 fence 理由彙整、§4 視覺風格系統）
- [x] `doc/doc_style.md`：補上第 5 節新的寫作約定速查（反引號標籤、角括號網址、App 圖示
      單字元粗體、`eatarea` 免轉換層），並更新檔頭指向新版 `card_dsl.md`
- [x] `doc/project.md`：更新歷史新增 Phase E 完整記錄、`eat`/`eatarea` 記錄壓縮進摘要清單、
      功能→程式碼速查表與目錄結構表同步移除已刪檔案、`eat`/`eatarea`/`apps` 從 fence 家族
      清單移除
- [x] 刪除已失效的 `scripts/verify-card-dsl.mjs`
- [x] 刪除原型腳本 `scripts/__proto-test.mjs`、`scripts/__proto-bulk.mjs`、
      `scripts/__proto-apps-test.mjs`、`scripts/audit-card-fields.mjs`
- [x] 移除 `markdown-cards.js` 中因遷移而不再被使用的 renderer：`renderEat`／`renderEatarea`／
      `renderApps` 連同 `CARD_LANGS`／`RENDERERS` 對應項一併刪除（全站已 0 使用這三個
      fence，`node scripts/verify-post-render.mjs` 驗證刪除前後 0 diff）
- [x] `public/sw.js` bump `CACHE_NAME`（v57 → v58，`markdown-cards.js` 內容變更）

---

## 6. 風險

1. **形狀判斷的誤判**是這個方案的核心風險。目前靠雙重條件與反向測試控制，
   但每新增一種形狀約定，就多一次與既有 Markdown 語法碰撞的機會。
2. **作者仍需記住約定**——反引號標籤的槽位順序、網址含空格要加角括號。
   這比 `key: value` 隱晦，但換來的是「檔案就是一份正常的 Markdown」。
3. **接線點有三處**（`scripts.js`、`generate-posts-metadata.js`、`verify-post-render.mjs`），
   漏掉任一處會造成「瀏覽器正常但閱讀時間算錯」或「驗證失真」這類不易察覺的問題。
4. 本階段**不觸碰** report.md 第三節列出的其他遺留問題。

---

## 7. 目前完成度與下一步（2026-07-26）

### 已完成

Phase A～E 全部完成，5 個 commit 已在 `refactor/post-style-system` 分支上（尚未合併
`main`）：

```
21275de refactor(posts): Phase E 收尾——card_dsl.md 改寫為寫作手冊、移除孤兒 renderer 與失效工具
cd95921 refactor(posts): Phase D 決策 compare/info/prep/stepper 保留 fence，apps 廢 fence 改純 Markdown
8cfcd73 refactor(posts): 07-16 eat/eatarea 廢 fence 改純 Markdown，其餘家族決策保留 fence
c288adc build(scripts): 新增渲染回歸驗證與 DSL 欄位稽核工具，完成欄位 Markdown 化 Phase 0-1
fe997e3 refactor(styles): 文章視覺風格改為 style front matter ＋ post-styles CSS
```

本檔開頭定義的目標——「作者只用 Markdown 寫內容，風格由 CSS/前端解析套用」——已落地：
`eat`/`eatarea`/`apps` 三個家族改純 Markdown，`compare`/`info`/`prep`/`stepper`/
`accordion`/`quickjump`/`stop` 7 個家族逐一評估後決策維持 fence（理由見 `doc/card_dsl.md`
§3）。文件（`card_dsl.md`/`doc_style.md`/`project.md`）已同步更新，失效與原型工具已刪除，
`node scripts/verify-post-render.mjs` 全程驗證渲染輸出 0 diff。

### 下一步

這是需要你判斷的部分，agent 不會自作主張執行：

1. **人工瀏覽器目視確認**：`npm run dev` 目前仍在跑（背景 terminal），實際點開
   07-13／07-16／07-20 三篇文章，確認美食卡、App 推薦清單、`eatarea` 分區標題視覺與互動
   （TOC 跳轉）都正常，尤其是含空格網址的美食卡連結（Naver/Kakao）真的可以點開。
2. **確認無誤後再決定合併方式**：直接把 `refactor/post-style-system` merge 進 `main`，
   或先開一個 PR 走 review／CI 流程——這兩者都會動到共享分支，我不會自己執行，需要你
   指示要哪一種、以及是否要先跑 `ultrareview`。
3. 決定合併方式後，可以派 agent 執行實際的 merge／開 PR 動作（例如「開個 PR」或「直接
   merge 進 main」），或你自己手動操作。
4. `report.md` 第三節列出的其他遺留問題（既有脆弱點、尚未驗證項目等）不在本次範圍，
   合併後可以另外排期評估要不要處理。
