# suggestion.md — 樣式系統與 Markdown 轉換層架構檢視（2026-07-26）

> ⛔ **凍結紀錄**：本檔為 2026-07-26 的架構審查建議，內容為當時的分析與提案，**尚未定案**。
> 已採納並落地的項目會記錄在 [`doc/project.md`](doc/project.md) 的更新歷史與待辦事項並引註本檔
> 編號（Rn／Sn）；本檔本身不再更新，不代表現況。

## 目的與範圍

這份文件是針對「post style system」與「純 Markdown 化」兩次重構合併進 `main` 之後的架構
檢視，檢視角度固定在使用者提出的三點目標：

1. **未指定 CSS 時，各 Markdown 檔案共用一套通用風格**，維持全站呈現一致。
2. **需要較多樣式修改時，front matter 指向另一份客製 CSS。**
3. **Markdown 塞不進太多樣式資訊，所以保留的 fence 要盡可能最小。**

檢視方法是直接讀程式碼與建置產物（`dist/assets/scripts-*.css` 的 cascade layer 位移、
shallow clone 實測、marked token 實跑），文件（`plan.md`／`report.md`／`doc/card_dsl.md`／
`doc/style.md`／`doc/project.md`）一律當成「待驗證的主張」而非事實。凡是本文寫「已實測」
的，都附了可重現的依據。

**不在範圍內**：文案、SEO、`contact.html` 的 Formspree、`template_posts/` 的處置
（`report.md` §C-9 已記錄，我同意其判斷，不重複）。

---

## 一句話結論

**大方向是對的，不需要推翻重來。** 「base CSS ＋ front matter 指向 scoped 變體 CSS」是這個
規模的專案正確的選擇；「不追求 fence 歸零」也是務實且我認同的判斷。但目標一目前**只做了
一半**（有一整組元件樣式只存在於變體檔裡，沒有 base 版本），而 cascade layer 的層級關係
有一個會靜默吃掉樣式的反轉，已經造成 07-16 一個看得見的錯誤渲染。這兩件事應該優先修。

---

# 第一部分：風險清單

嚴重度定義：**高**＝現在已經有錯誤行為或很快會撞到；**中**＝在可預見的下一步（第 2 篇套用
風格、第 2 個風格檔、新增第 4 篇文章）就會發生；**低**＝目前無害，但值得記錄。

---

## R1. 「未指定 style」的預設風格是**不完整**的 — 嚴重度：高

**現狀**
`assets/tailwind.css` 的元件區（744–835 行）確實提供了一組全站 base 樣式，但只涵蓋
`.food-item`／`.food-actions`／`.spot-title`／`.stars`／`.app-card`／`.alert-*`／
`.compare-*`／`.info-*`／`.prep-*`／`.stepper`／`.fold`。以下 12 個 class 在 base **完全
沒有任何規則**，只存在於 `assets/post-styles/editorial-card.css`：

| class | base (`tailwind.css`) | `editorial-card.css` |
|---|---|---|
| `.food-header` / `.food-name` / `.food-meta` | 0 | 有 |
| `.food-tag` / `.food-price` / `.food-body` / `.food-why` / `.food-action-link` | 0 | 有 |
| `.food-list-title` | 0 | 有 |
| `.spot-section` / `.spot-desc` / `.sub-option-list` / `.sub-option-item` | 0 | 有 |

**具體風險場景**
`doc/card_dsl.md` §1.1 把純 Markdown 美食卡寫成**建議的預設寫法**，完全沒提它依賴
`style: editorial-card`。今天新增第 4 篇文章、front matter 不填 `style`、照 §1.1 寫一張
美食卡，實際結果會是：外框（`.food-item`）有、但店名沒有襯線放大、`` `正餐` `` 這些
code span 標籤沒有 pill 底色與圓角、價格沒有縮小退色、推薦理由沒有左色條與斜體、
動作連結是裸連結。**看起來像壞掉，但沒有任何錯誤訊息。** `stop` fence 更嚴重——
`.spot-section`／`.spot-desc`／`.sub-option-*` 全裸，整張景點卡塌成連續的裸段落。

這直接與目標一衝突：目前的真相是「不指定 style 有一套通用風格，但**只有部分元件家族**有」。

**附帶的文件不一致**：`editorial-card.css` 檔頭第 8–10 行自稱「本風格不是獨立元件，而是
這組家族的視覺覆寫層」。對 `.food-item`／`.spot-title` 而言成立，對上表 12 個 class 而言
不成立——它是**唯一**的一層，不是覆寫層。

---

## R2. Cascade layer 反轉：unlayered CSS 永遠壓過 Tailwind utility — 嚴重度：高（已造成實際錯誤渲染）

**現狀**
Tailwind v4 把所有 utility 放進 `@layer utilities`；而 `tailwind.css` 的元件區與整份
`post-styles/*.css` 都是**未分層**的。CSS 規範中，未分層樣式優先序高於任何 `@layer`，
**與 specificity 和來源順序無關**。`tailwind.css:499-507` 的註解已經記錄過這個陷阱
（`.toc-fab` 的 `display:flex` 壓過 `xl:hidden`），但只當成單點處理，沒有推廣成通則。

**具體風險場景（已發生）**
`markdown-cards.js:231-236` 的 `STOP_LEVEL_CLASS` 用 Tailwind utility 表達 `stop` 的四種
地形徽章顏色：

```js
flat:  'food-tag bg-sand/20 text-primary-dark ml-3',
slope: 'food-tag bg-[#f6eed6] text-[#6e4f0a] ml-3',
steps: 'food-tag bg-[#f4e6dc] text-[#833411] ml-3',
```

而 `editorial-card.css:81-83` 的 `.post-style-editorial-card .food-tag` 用 `@apply` 設了
`bg-sand/10` 與 `text-primary-dark`，且是未分層的。實測建置產物
`dist/assets/scripts-D7xLD1PX.css`：

```
.bg-[#f6eed6]  → byte 29104，位於 @layer utilities 內
.post-style-editorial-card .food-tag → byte 70147，unlayered
```

→ **在 07-16（唯一套用 `editorial-card` 的文章）裡，`flat`／`slope`／`steps` 三種徽章的
顏色全部被吃掉，渲染成同一個沙色。** 只有 `diet` 因為 `editorial-card.css:84-86` 另外寫了
`.food-tag.diet` 才保住差異。

這件事有雙重殺傷力：它同時**推翻了保留 `stop` fence 的核心理由**——`plan.md` §4-1 與
`card_dsl.md` §3 都寫「4 種顏色徽章沒有 Markdown 原生語法可以表達，所以保留 fence」，
但那 4 種顏色**現在根本沒有渲染出差異**。用 fence 承載的資訊，被樣式層默默丟掉了。

**推而廣之**：任何 renderer 用 Tailwind utility 表達的變體（`quickjump` 的
`text-primary font-serif font-bold`、`stop` 的 `no-underline text-inherit`），都可能被
任何一條未分層的 `.post-style-x .foo` 規則整組壓掉，**且不會報錯**。第 2 個風格檔一定會
再踩一次。

---

## R3. 變體 CSS 靠「反向歸零」覆寫 base，不是靠 token — 嚴重度：中

**現狀**
`editorial-card.css:54-59`：

```css
.post-style-editorial-card .food-item {
  @apply relative p-0 mb-12 border-0 bg-transparent rounded-none shadow-none last:mb-0;
}
```

這 5 個宣告（`p-0 border-0 bg-transparent rounded-none shadow-none`）**唯一的作用是抵銷
base 的 `p-5 border border-sand/50 bg-surface rounded-lg`**，本身不表達任何設計意圖。

**具體風險場景**
第 2、第 3 個風格檔出現時，每個風格都要重寫一次「先歸零 base，再畫自己的」。base 只要
多加一條宣告（例如給 `.food-item` 加個 `transition`），所有變體檔都可能需要跟著補一條
歸零——但沒有任何機制會提醒你，症狀是「新風格裡莫名多了一條邊框」。這是典型的
specificity war 前兆，目前只有 1 個變體所以還撐得住。

---

## R4. `style` front matter 是開放輸入，但可用的 CSS 是封閉 enum — 嚴重度：中

**現狀**
`generate-posts-metadata.js:129` 把 front matter 的 `style` 原樣寫進 `posts.json`；
`posts/detail.html:176-178` 原樣接成 class。**沒有任何一端驗證這個值。** 但實際可用的
風格是封閉的——`assets/post-styles/<name>.css` 必須被人工加進
`assets/tailwind.css` **最末行**的 `@import`（目前只有 838 行那一條）。

**具體風險場景**
1. `style: editorail-card`（打錯字）→ 掛上 `.post-style-editorail-card` → 沒有對應 CSS →
   文章變成 R1 描述的「半裸」狀態，build 全綠、console 全靜。`report.md` §B-4 已經記錄過
   這件事並建議補檢查，至今未做。
2. 新增風格檔卻忘了加 `@import`，或 `@import` 加在檔案中段 → `report.md` §B-3 記錄的靜默
   cascade 失效。這是一條**只寫在文件裡、程式碼不強制**的契約。

至於「front matter 能不能指向任意 CSS 檔／URL」——目前**不能**，值只用來組 class 名，
不會被當成路徑或 URL 取用。這是正確的設計（沒有注入面），我不建議改成可指定任意路徑；
真正的問題只是「開放的輸入對上封閉的集合，中間沒有驗證」。

---

## R5. `classList.add()` 對含空白的 style 值會丟例外，整篇文章變成錯誤頁 — 嚴重度：中低

**現狀**
`posts/detail.html:176-178`：

```js
if (post.style) {
  contentContainer.classList.add(`post-style-${post.style}`);
}
```

這段在 `try` 區塊內（67–241 行）。`classList.add()` 對含空白的字串會丟
`InvalidCharacterError`。

**具體風險場景**
front matter 寫成 `style: editorial card`（誤打空白）或 `style: "editorial-card" # 註解`，
→ 例外 → 跳進 `catch` → `innerHTML` 被覆寫成「載入文章內容失敗: String contains an
invalid character」。**一個空白鍵讓整篇文章消失**，而且錯誤訊息完全指不到 front matter。

---

## R6. Shape 偵測：`appList` 的觸發形狀已經有具體的誤判入口 — 嚴重度：中

**現狀**
`markdown-sections.js:148-155` 的 `startsWithLetterStrong()` 用
`/^[A-Za-z0-9]$/` 判定「單一英數字元的粗體」，`isAppList()` 要求清單**每一項**都符合。
`card_dsl.md` §1.2 宣稱「全站掃過確認沒有其他清單/段落用單一粗體字母開頭，是安全、不會
誤判的形狀」。

**具體風險場景**
「掃過現有 3 篇沒撞到」不等於安全，因為這個形狀正好涵蓋一個非常常見的手寫慣例：

```markdown
- **1** 下載 Toss App，選擇「韓國地區」
- **2** 掃描護照完成身份驗證
- **3** 填入電子信箱、密碼
```

這會被**靜默**轉成 3 張 App 卡（含 44×44 圖示方塊）。`0-9` 落在字元類別裡是沒有理由的
——App 圖示取的是名稱首字母，不會是數字。而 07-20 這篇本來就有大量編號步驟清單
（`2026-07-20-韓國自由行支付教學.md` 的「申請方式」「儲值方式」各一組），只是目前寫成
有序清單所以躲過。作者哪天改成粗體編號就中。

同一段還有第二個弱點：`renderAppList` 用第一個全形冒號「：」切名稱與說明
（`markdown-sections.js:233-235`），但**偵測條件不包含這個冒號**。沒有冒號的清單一樣會被
判定成 App 卡，只是說明區塊變空。

---

## R7. Shape 偵測：`foodCard` 貪婪吞併到下一個 heading — 嚴重度：中

**現狀**
`markdown-sections.js:120-143`：卡片一旦被觸發，會從 `####` 之後一路收到「下一個任意層級的
heading」或「出現非段落/清單的區塊」為止。所有沒對上其他形狀的段落一律進 `card.why`。

**具體風險場景**
07-16 的美食區塊結構是「`###` 分區標題 → 數張 `####` 美食卡」。作者在某個分區的**最後一張
卡之後**補一句收尾（「以上三家步行都在 5 分鐘內」）——這句話會被吸進最後一張卡，渲染成
`.food-why`（斜體＋左色條的「推薦理由」）。輸出是合法 HTML、沒有錯誤，只是**語意被改掉了**。
這正是 `plan.md` §2 想避開的「靜默錯誤」，形狀判斷解決了槽位錯置，但沒有解決**邊界**問題。

---

## R8. 語意降級：作者寫的 `####` 被渲染成 `<span>` — 嚴重度：中

**現狀**
`markdown-sections.js:181-184`：美食卡的店名（作者在 Markdown 裡明確寫成 `#### [店名](url)`）
被渲染成 `<span class="food-name"><a …></span>`，不是 heading。

**具體風險場景**
07-16 有 30 張美食卡，等於 30 個作者標記為「這是標題」的節點，在無障礙樹上不是標題。
螢幕閱讀器使用者無法用標題導覽在 30 家店之間跳，也無法用標題層級理解「這家店屬於哪個分區」。
純 Markdown 路線的賣點之一就是「檔案本身是一份正常的 Markdown、語意正確」，結果轉換層在
最後一步把語意丟掉了。

（`renderAppList` 相對正確——它輸出 `<h4>`。兩個 renderer 在同一份檔案裡做法不一致。）

---

## R9. 剩下的不是「7 個 fence」，是「7 套各不相同的迷你語法」 — 嚴重度：中

**現狀**
目標三說的是「保留盡可能最小的 fence」。現在 fence 的**數量**降到 7 個，但作者要記的
**語法種類**沒有降。實際使用量：07-13 有 22 個 fence（compare 8／info 6／accordion 5／
stepper 2／prep 1），07-16 有 8 個（stop 7／quickjump 1），只有 07-20 是零 fence。
這 7 個家族用的是 4 種不同的內部語法：

| 家族 | 內部語法 |
|---|---|
| `compare`／`info`／`stop`／`quickjump` | `key: value`，其中 `row:`／`sub:` 又要用 ` \| ` 分欄 |
| `prep` | 沒有 key，每行直接 `前段 \| 後段` |
| `stepper` | `@ 標題` 起始，之後到下一個 `@ ` 都是 body |
| `accordion` | 前段是 `key: value`，**空行**之後是 Markdown body |

**具體風險場景**
作者要記「哪個家族用哪種寫法、哪個欄位吃 Markdown、哪個吃原樣 HTML、哪裡的空行不能省」。
`doc/card_dsl.md` §2 的「注意事項」與 `doc/doc_style.md` §5 就是這個認知負擔的具體證據。
新增第 8 個家族時，多半又會發明第 5 種語法。

**這一點也是我對前一階段決策唯一的實質異議**：`plan.md` Phase B–D 把問題定義成「這個家族
能不能用形狀規則安全辨識」，逐家族做二元決策。但還有第三條路沒被評估——**把 7 個家族收斂
到單一容器語法**（見後面 S7）。以「stepper 需要群組容器」「accordion 的 body 要能寫
Markdown」為由保留 fence 的理由，在容器語法下是自動成立的，不需要發明形狀規則。

---

## R10. 瀏覽器端的 marked 沒有鎖版本，且與建置端不是同一份 — 嚴重度：高

**現狀**
`posts/detail.html:13`：

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

沒有版本號 → jsDelivr 解析成 **latest major**。而 `package.json` 鎖的是 `marked ^12.0.0`，
`node_modules` 實際安裝 **12.0.2**。`generate-posts-metadata.js` 與 `verify-post-render.mjs`
用的都是 npm 那份 12.0.2；**只有讀者的瀏覽器用 CDN 那份 latest**。

**具體風險場景**
整條轉換層綁死在 marked v12 的兩個 API 上：`hooks.processAllTokens`（v12 才有）與
extension 的 `renderer(token)` 單參數簽章。`markdown-cards.js:286-296` 那段
`link(hrefOrToken, title, text)` 雙簽章 shim，本身就是上一次 marked 破壞性變更留下的疤。
上游只要發一版 major，**線上所有文章的卡片會同時失效或整頁報錯，而本地開發、CI、
`verify-post-render.mjs` 全部驗不到**——因為它們用的是 pinned 的 12.0.2。
這是全專案唯一一個「不動任何一行程式碼也可能整站壞掉」的點。

**連帶影響（PWA）**：`public/sw.js:44-46` 只快取同源請求，第三方 CDN 不在 precache 也不會
被 runtime 快取。離線開啟文章頁時 `typeof marked === 'undefined'` 成立，
`posts/detail.html:167` 會 fallback 成 `contentContainer.textContent = cleanContent`
——讀者看到的是**含 fence 原始碼的純文字 Markdown**。這也與 `doc/style.md` A10 宣稱的
「零外部依賴的自足性（PWA 友善）」直接矛盾。

---

## R11. `verify-post-render.mjs` 對「純 renderer 改動」是恆真的驗證 — 嚴重度：中

**現狀**
`verify-post-render.mjs:32-34` 建立**一個** marked 實例，`80-82` 行用它同時渲染
`git show REF:` 的舊內容與工作目錄的新內容。

**具體風險場景**
當一次改動**只動 renderer、沒動文章內容**時，`oldRaw === newRaw`，因此
`render(oldRaw) === render(newRaw)` **恆成立**，不論 renderer 被改成什麼。這個工具在該情境
下 100% 回報 0 diff，是純粹的空驗證。

具體例子：`plan.md` Phase E 寫「移除 `markdown-cards.js` 中不再被使用的 renderer …
`node scripts/verify-post-render.mjs` 驗證刪除前後 0 diff」。那個 0 diff 沒有驗證任何東西
——文章內容沒變，兩邊必然相同。檔頭註解（10–11 行）宣稱「適用於 renderer 重構」，是不成立的。

它真正有效的情境只有一個：**文章內容變了、renderer 也同步變了，驗兩者加總後輸出不變**
（Phase C 的 `eat` 遷移正是這種）。這個情境它做得很好，但涵蓋面比註解宣稱的窄很多。

---

## R12. CI 沒有任何驗證步驟，且 shallow clone 讓每篇文章的「更新時間」都變成部署日 — 嚴重度：中

**現狀**
`.github/workflows/pages.yml` 的流程是 checkout → setup-node → `npm ci` →
`build:metadata` → `build` → deploy。**沒有 lint、沒有 test、沒有跑
`verify-post-render.mjs`。**

同時 `actions/checkout@v4`（第 22 行）沒設 `fetch-depth`，預設是 `1`（淺層）。而
`generate-posts-metadata.js:26-41` 用 `git log -1 --format=%ad -- <file>` 取每篇文章的
最後編輯日。

**具體風險場景（已實測重現）**
淺層 clone 只有一個 commit，且該 commit 沒有 parent，git 視為「引入了所有檔案」，因此
`git log -1 -- <任何路徑>` 都回傳同一個日期。實測：

```
$ git clone --depth 1 file:///…/travel shallow2
$ git -C shallow2 log --oneline | wc -l          → 1
$ git -C shallow2 log -1 --date=…  -- 07-20…md   → 2026-07-26
$ git -C shallow2 log -1 --date=…  -- 07-13…md   → 2026-07-26
```

而本地完整 clone 下 07-20 應該是 `2026-07-25`。→ **線上每篇文章的「更新時間」都等於最後
一次部署的日期，而且每次部署都會集體跳動**，不管文章有沒有改。repo 裡 commit 的
`public/data/posts.json` 是本機跑出來的正確值，但 CI 會在 build 時重新覆蓋掉。

---

## R13. 三處接線是同一份設定被抄了三份 — 嚴重度：中低

**現狀**
`plan.md` §6-3 已記錄：`assets/scripts.js:1-6`、`scripts/generate-posts-metadata.js:6-13`、
`scripts/verify-post-render.mjs:25-34` 各自 import 並註冊兩個擴充。

**具體風險場景**
除了「新增第三個擴充時漏掉某一處」之外，還有一個更隱蔽的：**三處註冊的 marked 實例來源
不同**（前者是 CDN 全域，後兩者是 npm 套件），所以這不只是「重複」，而是 R10 那個版本
分裂的結構性入口。這是很小的一段程式碼，抽成單一模組的成本幾乎為零。

---

## R14. renderer 對插值不做跳脫 — 嚴重度：低

`markdown-cards.js:300` 的 `<a href="${href || '#'}">`（覆寫掉 marked 內建的 `cleanUrl`）、
`markdown-sections.js:182` 與 `:207` 的 `href="${link.href}"`，以及各 fence renderer 對
`${f.desc}`／`${val}` 的原樣插值，都沒有跳脫。

內容全部是本專案作者自己寫的靜態檔，所以**這不是 XSS**，我不打算把它講成安全問題。實際會
遇到的只是：網址裡含 `"` 會直接截斷 `href` 屬性。fence 欄位刻意允許原樣 HTML 是明確的設計
決定（`card_dsl.md` 有寫），我同意保留。只有 `href` 這幾處值得順手加一行跳脫。

---

## R15. 文件與程式碼已出現漂移 — 嚴重度：低（但便宜）

實際核對後找到 3 處：

| 位置 | 文件說 | 程式碼實際 |
|---|---|---|
| `doc/style.md:362`、`:373` | 「跑 `npm run build:css` 產出 `assets/main.css`」 | 根本沒有這個 script（`CLAUDE.md` 與 `doc/project.md:59-63` 都明確否定） |
| `doc/style.md:309-310` | blockquote 是 `italic` + `text-muted-text` | `tailwind.css:376-384` 是 `font-style: normal`、`color: var(--color-ink)`、襯線 pull-quote |
| `doc/style.md:274` | 桌機 TOC 側欄 `position: fixed` | `tailwind.css:424-439` 預設 `absolute`，由 `scripts.js` 的 `updatePinnedState()` 切換成 fixed |

`doc/style.md` 是本專案唯一一份「新增元件時照抄」的規格書，D 節（操作鏈）漂移的傷害
比一般文件大——照著做會去找一個不存在的指令。

---

# 第二部分：改進建議

每項標註：**對應風險**／**做法**／**成本**（小改動＝單檔數十行以內；中＝跨檔但不改架構；
大＝需要重構）／**與三點目標的關係**。

---

## 【現在就做】

### S1. 把變體專屬的元件樣式補一份 base — 對應 R1

**做法**：把 `editorial-card.css` 裡那 12 個「只有變體有」的 class，各補一份中性的 base
規則進 `tailwind.css` 元件區（744–753 行那一段旁邊），風格取全站既有語彙即可：
`.food-tag` → 比照 `.tag-pill`；`.food-price`／`.food-why` → `text-muted-text`；
`.spot-section` → `border-b border-sand/20 mb-10 pb-8`；`.food-name` → `doc/style.md` B6
定義的「元件項目標題」16–18px 襯線粗體。**不用發明新色票、不用新 token**。

補完之後，`editorial-card.css` 裡凡是與 base 相同的宣告可以刪掉，只留真正的差異
（去框線、加分隔線、`::before` 的 ◇ 等），檔案會變短。

**成本**：小～中。約 60–80 行 CSS，加上刪掉變體裡的重複宣告。零 JS 改動。
**目標關係**：**直接完成目標一**。這是目前離「未指定 CSS 就有一套完整通用風格」最短的路。

---

### S2. 把元件層與風格層放進明確的 `@layer`，並修掉 `stop` 徽章 — 對應 R2

**做法**（兩步，可分開做）：

1. **先修 bug**：把 `STOP_LEVEL_CLASS`（`markdown-cards.js:231-236`）的四種顏色從 Tailwind
   utility 改成語意 class（`.level-flat` / `.level-slope` / `.level-steps` / `.level-diet`），
   在 `tailwind.css` 元件區定義。這樣它與 `.post-style-x .food-tag` 處在同一個未分層空間，
   靠 specificity 正常競爭，不會被整組吃掉。順手在 `card_dsl.md` §3 修正「4 種顏色徽章」
   這條保留 fence 的理由敘述（理由仍成立，但要說明它是靠 CSS class 而非 utility 承載）。
2. **再定規則**：宣告一條全站約定並寫進 `doc/style.md`——
   `@layer components { … }` 放 base 元件、`@layer post-styles { … }` 放變體，
   並在 `tailwind.css` 頂端寫 `@layer theme, base, components, utilities, post-styles;`。
   之後 base／變體／utility 的覆寫關係就是可預測的，不再依賴「誰沒分層誰贏」。
   注意這會改變現有覆寫關係（例如 `.toc-fab` 對 `xl:hidden` 那條 499–507 行的註解就可以
   拿掉了），**必須跑一次 `npm run build` 並目視三篇文章**。

**成本**：第 1 步小（改 4 行 JS ＋ 加 4 條 CSS）。第 2 步中——分層本身只是幾行，但要全站
目視回歸。建議第 1 步立刻做，第 2 步排在 S1 之後一起驗。
**目標關係**：目標一＋目標二。這是「base 與變體如何安全共存」的地基，第 2 個風格檔出現前
一定要有。

---

### S3. 把 marked 從 CDN 改成打包進 bundle，並收斂成單一註冊模組 — 對應 R10 + R13 + R15(PWA)

**做法**：
1. `posts/detail.html:13` 刪掉 CDN `<script>`。
2. 新增 `assets/markdown-extensions.js`，內容大約 10 行：
   ```js
   import { Marked } from 'marked';
   import { registerCardExtensions } from './markdown-cards.js';
   import { registerSectionExtensions } from './markdown-sections.js';
   export function createMarked() {
     const m = new Marked();
     registerCardExtensions(m);
     registerSectionExtensions(m);
     return m;
   }
   ```
3. `assets/scripts.js`、`generate-posts-metadata.js`、`verify-post-render.mjs` 三處都改成
   `createMarked()`；`scripts.js` 把實例掛到 `window.__marked` 給 `detail.html` 的
   inline script 用（或把該段 inline script 一併搬進 `scripts.js`，更乾淨）。

一次解掉三件事：版本分裂（瀏覽器與建置端保證同一份 12.0.2）、三處接線漂移、
離線時文章降級成純文字。bundle 只多約 40 KB（gzip 後更少），對照現在 CSS 76 KB 的量級可以接受。

**成本**：中。約 4 個檔案的小幅改動，但要重跑 `npm run build`、bump `sw.js` 的
`CACHE_NAME`、實測離線情境。
**目標關係**：不直接對應三點目標，但**這是三點目標所依賴的整條渲染管線的穩定性前提**。
形狀偵測層完全建立在 marked v12 的 `processAllTokens` 上，這個依賴現在是浮動的。

---

### S4. `style` 值加驗證（build 時擋掉，執行時不炸） — 對應 R4 + R5

**做法**：
- `generate-posts-metadata.js`：`style` 有值時，檢查
  `assets/post-styles/<值>.css` 是否存在、值是否符合 `/^[a-z0-9-]+$/`。不符就
  **`process.exit(1)` 讓 build 失敗**（不要只印警告——`report.md` §B-4 上次建議印警告，
  但這種錯誤的症狀是「樣式莫名沒生效」，印在 build log 裡沒人會看到）。
- 同一段順便檢查 `assets/tailwind.css` 是否含有對應的 `@import`，把 `report.md` §B-3 那條
  「只寫在文件裡的契約」變成機器強制。
- `posts/detail.html:176-178`：加 `String(post.style).trim()` 與正則守衛，並把
  `classList.add` 包進自己的 try，讓最壞情況是「沒套上風格」而不是「整篇文章不見」。

**成本**：小。兩個檔案各約 10 行。
**目標關係**：**直接支撐目標二**。「front matter 指向客製 CSS」這個機制目前唯一缺的就是
「指錯了會告訴你」。

---

### S5. CI 補 `fetch-depth: 0` 與一道驗證步驟 — 對應 R12

**做法**：
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```
外加一步 `- run: node scripts/verify-post-render.mjs`（在 R11 修好之前，它至少能擋住
「改了文章內容導致渲染爆炸」這類問題，成本是零）。

**成本**：極小。改 workflow 兩行。注意 `fetch-depth: 0` 會拉完整歷史，這個 repo 很小，
影響不到 build 時間。
**目標關係**：不對應三點目標，是純粹的正確性修復。但「每篇文章的更新時間都跳到今天」
是讀者看得見的資訊錯誤，不該留著。

---

### S6. 收緊 `appList` 的觸發形狀 — 對應 R6

**做法**：`markdown-sections.js:154` 的 `/^[A-Za-z0-9]$/` 改成 `/^[A-Za-z]$/`（拿掉數字），
並在 `isAppList()` 追加條件「該項的行內文字必須含全形冒號『：』」。兩個條件疊加後，
手寫的粗體編號清單再也不會誤中，而現有 5 張 App 卡全部仍然符合（已核對
`2026-07-13-…md:256-260`，五項都是 `**N**`／`**K**`／`**T**`／`**P**`／`**W**` ＋「：」）。
`doc/card_dsl.md` §1.2 與 `doc/doc_style.md` §5 的敘述同步更新。

**成本**：極小。一行正則 ＋ 一個條件 ＋ 兩行文件。
**目標關係**：目標三。形狀規則要能長期存活，判定條件就必須比「掃過現有文章沒撞到」更嚴格。

---

### S7. 修掉文件漂移 — 對應 R15

`doc/style.md` D 節第 1 點改寫成「樣式只改 `assets/tailwind.css`，由 `@tailwindcss/vite`
在 `npm run dev`／`npm run build` 時即時編譯，沒有 `build:css`」；E 節那條
`main.css` 反模式改成「不要編輯 `assets/main.css`（gitignored 的無用殘留，不在建置流程內）」；
B7 的 blockquote 敘述與 B5 的側欄定位敘述照實際程式碼更新。

**成本**：極小，10 分鐘。
**目標關係**：間接。`doc/style.md` 是新增元件時的照抄來源，錯的規格書會複製錯誤。

---

## 【可以先觀察，之後視情況再做】

### S8. 把 base／變體的關係改成 CSS 變數，而非「歸零再重畫」 — 對應 R3

**做法**：base 元件用 token 表達可變的部分：

```css
.food-item {
  padding: var(--card-pad, 1.25rem);
  border: var(--card-border, 1px solid var(--color-sand));
  background: var(--card-bg, var(--color-surface));
  border-radius: var(--card-radius, .5rem);
}
```
變體檔就只寫：
```css
.post-style-editorial-card { --card-pad: 0; --card-border: 0; --card-bg: transparent; --card-radius: 0; }
```

**觸發時機**：**等第 2 個風格檔真的要寫的時候再做。** 只有 1 個變體時，這個抽象化不會回本，
而且「哪些屬性該變數化」要有 2 個以上的真實變體才判斷得準——現在做等於憑空猜介面。
**成本**：中（要重寫 base 元件區）。
**目標關係**：目標一＋目標二的長期解。做了之後變體檔會從「先歸零再重畫」變成「只宣告差異」，
`report.md` §A-2 擔心的「class 名稱帶內容語意」也會緩解一半（風格檔只認 token，不認
`.food-item` 這個名字）。

---

### S9. 用單一容器語法收斂 7 個 fence 家族 — 對應 R9

**做法**：不再逐家族發明形狀規則，改成把 7 個家族統一到**一種**容器指令語法
（remark-directive／MDX 那一系的 `:::name{key=value}` 慣例，社群事實標準）：

```markdown
:::stop{level=flat id=spot-2}
### [德壽宮・金黃銀杏石牆路散步](https://…)

德壽宮石牆路地勢完全平坦，秋季銀杏會將道路染成金黃色。

- **鄰近休憩處**：貞洞展望台，13 樓設有咖啡廳。
- **下一站移動**：步行 4 分鐘返回飯店。
:::
```

三個關鍵好處，都正中目標三：
- **作者要記的語法從 4 種變成 1 種**（`:::名稱{屬性}` … `:::`），這才是「fence surface
  最小化」的實質意義——不是把 fence 數量從 7 砍到 5。
- **內容回到純 Markdown**。容器內部就是一般 Markdown，由 marked 正常解析。這自動解掉了
  `plan.md` 判定「無法轉換」的兩個理由：`stepper` 的「純 Markdown 沒有群組容器邊界」
  （`:::` 本身就是邊界）、`accordion` 的「body 要能寫 Markdown」。
- **顏色變體用屬性表達**（`{level=flat}`、`{cat=medical}`），這正是 Markdown 本身表達不了、
  而使用者說的「保留最小 fence」要承載的東西。屬性與內容分離之後，`compare` vs `info` 的
  「二元判斷」問題也消失——它就是 `{stars=★★★★☆}` 有沒有出現。

**觸發時機**：**現在不要做。** 這是一次會動到全部 3 篇文章、`markdown-cards.js` 全部
renderer、以及 `card_dsl.md`／`doc_style.md` 兩份文件的遷移。建議的觸發條件是**任何一個
出現時**：(a) 要新增第 8 個 fence 家族；(b) 文章數超過 6 篇；(c) 有第二位作者要寫文章。
在那之前現況能撐。
**成本**：大。需要一個新的 block tokenizer（約 60 行）＋ 7 個 renderer 改寫 ＋ 3 篇文章遷移
＋ 文件重寫。好處是做完之後 `markdown-sections.js` 的形狀偵測層可以只保留 `eat`／`apps`
這兩個已驗證的家族，不必再長大。
**目標關係**：目標三的**正解**，但時機未到。

---

### S10. `verify-post-render.mjs` 改成 golden snapshot — 對應 R11

**做法**：改成把每篇文章的渲染 HTML 產出到 `scripts/__snapshots__/*.html` 並 commit 進 repo；
驗證＝重新渲染後與 snapshot 比對，`--update` 才覆寫。這樣「只改 renderer 不改內容」也能被
偵測到，也才有資格放進 CI（S5）。

**觸發時機**：可以現在做（成本不高），但優先序在 S1–S6 之後。至少應該先把
`verify-post-render.mjs` 檔頭 10–11 行那句「適用於 renderer 重構」的敘述改掉，以及
`plan.md` Phase E 那條「驗證刪除前後 0 diff」加註說明——**不要讓下一個人以為那次刪除
有被驗證過**。
**成本**：小～中。約 40 行改寫 ＋ 3 個 snapshot 檔。
**目標關係**：間接，但這是形狀偵測層唯一的安全網。形狀規則越多，安全網越重要。

---

### S11. 給 `foodCard` 一個明確的結束邊界 — 對應 R7

**做法**：最便宜的版本是**把貪婪收集改成保守收集**——`why` 段落最多收 N 段（例如 2 段），
超過就停止收合，剩下的段落回到一般 `.prose` 段落。這不需要作者改寫法，也不會有靜默錯誤
（多寫的段落會落在卡片外，作者一眼看得出來）。若之後走 S9 的容器路線，這個問題自然消失。

**觸發時機**：等實際踩到再做。目前 30 張卡都是「meta ＋ 招牌菜 ＋ 1 段描述 ＋ 連結清單」
的整齊結構，還沒出過事。
**成本**：小（約 5 行）。

---

### S12. 美食卡店名輸出改回 heading — 對應 R8

**做法**：`renderFoodCard` 的 `<span class="food-name">` 改成 `<h4 class="food-name">`，
CSS 選擇器相應改成 `.prose h4.food-name`（2-class，穩過 `.prose h4`）。需要確認
`initTOC()`（`scripts.js:474-477`）不受影響——它只收 h2/h3，h4 不會進 TOC，所以安全。

**觸發時機**：可以隨時做，但建議與 S1 的 CSS 補齊一起，一次驗一次視覺。
**成本**：小。1 行 JS ＋ 2 個選擇器。

---

### S13. `sw.js` 的 `CACHE_NAME` 自動化 — 對應 `report.md` §C-10

`report.md` 已記錄這是專案歷史上最常見的疏漏（2026-07-22 出過線上事故）。做法很直接：
`vite.config.js` 的 `swPrecachePlugin` 既然已經在改寫 `PRECACHE_URLS`，順手把
`CACHE_NAME` 也換成從 CSS/JS 檔名的 hash 衍生。**我同意 `report.md` 的判斷，且認為它比
現在排在待辦清單裡的多數項目更值得做**，只是它與本次三點目標無關，所以放在觀察區。
**成本**：小（`vite.config.js` 約 5 行）。

---

# 第三部分：我檢視後認為現狀沒問題的地方

為了不讓上面的清單看起來像「什麼都要改」，以下是我實際核對過、認為**不需要動**的部分。

**1. `prep` 保留 fence 的決策，我完全同意。**
`card_dsl.md` §1.4 引用 `2026-07-20-…md:98,100` 當反例，我逐行核對過，那兩段確實是
「粗體開頭 ＋ 全形冒號 ＋ 說明文字」（`**實體卡**：需要寄送到…`、
`**若持有外國人登錄證**（…）：流程更完整…`），而且相鄰。這個形狀真的沒辦法安全區分。
**這是整份 plan.md 裡我最欣賞的一個決策**——用真實文章的反例否決自己的方案，而不是用手打
測資證明可行。

**2. `quickjump` 保留 fence，同意。** 全站一處使用，為它訂形狀約定確實不划算。

**3. `compare` vs `info` 是二元類型判斷、不是單一形狀規則的論證，成立。**
兩者 renderer 結構確實完全平行（`markdown-cards.js:52-108`），唯一差異是色條與 `stars`。
（不過如果將來走 S9 的容器路線，這個問題會被屬性語法自然解掉。）

**4. 「不追求 fence 歸零、目標是作者 95% 時間寫純 Markdown」這個目標設定是對的。**
07-20 完全零 fence、07-16 只剩 8 個，這個比例是健康的。要求歸零會逼出更多脆弱的形狀規則
（R6、R7 就是形狀規則的代價），得不償失。

**5. `style` 只用來組 class 名、不當路徑或 URL 取用，是正確的設計。**
沒有給 front matter 指定任意 CSS 路徑或外部 URL 的能力，等於沒有注入面、沒有第三方請求、
沒有 CSP 問題。R4 講的是缺驗證，不是要放寬這個限制——**不要為了「更彈性」把它改成可指定
任意路徑**。

**6. FOUC 這件事目前確實沒問題。**
`posts/detail.html:165` 寫 `innerHTML`、`:177` 加 class，兩者在同一個 task 內，中間不會有
paint。`card_dsl.md` §4-1 與 `doc/style.md` B8 對這點的描述是準確的。

**7. 單一 CSS bundle（不做動態 `<link>`）目前是對的選擇。**
`report.md` §B-6 已經正確指出 `swPrecachePlugin` 的 `files.find(f => f.endsWith('.css'))`
讓多 CSS 產物變成硬約束。以現在的量級（1 個變體、CSS 共 76 KB），為了省下幾 KB 去拆檔
＋ 處理 FOUC ＋ 改寫 plugin，完全不划算。等到有 5 個以上變體、或單一變體超過 20 KB 再談。

**8. `@import` 必須放在 `tailwind.css` 最末行這件事，是真的有效、也真的被驗證過。**
我用建置產物核對：`.food-item`（base）在 byte 58328、
`.post-style-editorial-card .food-item` 在 68887，順序正確。`report.md` §B-3 對這個陷阱的
描述準確。（S4 建議把它從「文件契約」升級成「機器檢查」，但機制本身沒問題。）

**9. `eatarea` 不需要轉換層的判斷，是這次重構最漂亮的一筆。**
`plan.md` §4-4 的推理（CSS 早已把 `.food-list-title` 設計成與 `.prose h3` 同款、
`initTOC` 只看 DOM 深度不看 class）我核對過，成立。**發現「不需要寫程式碼」比寫出程式碼
更有價值**，這一筆值得記著。

**10. `markdown-cards.js` / `markdown-sections.js` 維持純字串邏輯、不碰 DOM，是對的架構決定。**
正因為如此，`generate-posts-metadata.js` 的閱讀時間才能算準，`verify-post-render.mjs` 才
可能存在。這個約束要繼續守住。

---

# 附錄：優先序總表

| # | 建議 | 對應風險 | 成本 | 目標 |
|---|---|---|---|---|
| **S1** | 補齊 12 個 class 的 base 樣式 | R1 | 小～中 | 目標一 |
| **S2** | 修 `stop` 徽章 ＋ 定義 `@layer` 順序 | R2 | 小 → 中 | 目標一、二 |
| **S3** | marked 改 npm 打包 ＋ 單一註冊模組 | R10, R13 | 中 | （管線前提） |
| **S4** | `style` 值 build 時驗證 ＋ 執行時守衛 | R4, R5 | 小 | 目標二 |
| **S5** | CI `fetch-depth: 0` ＋ 加驗證步驟 | R12 | 極小 | — |
| **S6** | 收緊 `appList` 形狀（去掉數字＋要求「：」） | R6 | 極小 | 目標三 |
| **S7** | 修 `doc/style.md` 三處漂移 | R15 | 極小 | — |
| — | — 以上為「現在就做」 — | | | |
| S8 | base／變體改用 CSS 變數 | R3 | 中 | 目標一、二 |
| S9 | 單一容器語法收斂 7 個 fence | R9 | 大 | 目標三 |
| S10 | `verify-post-render` 改 golden snapshot | R11 | 小～中 | — |
| S11 | `foodCard` 收合邊界收斂 | R7 | 小 | 目標三 |
| S12 | 美食卡店名輸出改回 `<h4>` | R8 | 小 | — |
| S13 | `CACHE_NAME` 自動化 | `report.md` C-10 | 小 | — |
