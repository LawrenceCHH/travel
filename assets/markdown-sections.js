/**
 * Markdown 結構轉換層 —— 讓作者只寫純 Markdown，由前端依「內容形狀」辨識語意，
 * 重組成卡片結構後交給 CSS 上色。
 *
 * 與 `markdown-cards.js` 的差別：
 *   - `markdown-cards.js`：作者寫自訂 fence（```eat + key: value），renderer 依「欄位名」取值。
 *   - 本檔：作者寫**純 Markdown**，轉換層依「形狀」（是不是只有 code span 的段落、是不是
 *     以粗體開頭、是不是整串連結的清單）判斷各區塊語意。
 *
 * 為什麼用「形狀」而不是「位置順序」：
 *   位置約定（第一段是 A、第二段是 B）一旦作者少寫一段就會整組錯位，而且不會報錯。
 *   形狀判斷則是自我描述的——價格永遠在 code span 裡、招牌菜永遠以粗體標籤開頭，
 *   段落順序調換也不會跑錯格子。這是本原型最重要的設計取捨。
 *
 * 實作方式：marked v12 的 `hooks.processAllTokens`，在 token 陣列上重組（而非對渲染後的
 * HTML 做正則），因此不受標籤巢狀、屬性引號等問題影響。純字串邏輯，Node／瀏覽器共用。
 *
 * ---- 美食卡（.food-item）的 Markdown 約定 --------------------------------
 *
 *   #### [店名](主要連結)
 *
 *   `餐別` `飲食標籤` `飲食標籤` `價格`
 *
 *   **招牌菜**：招牌菜內容
 *
 *   為什麼推薦的描述文字。
 *
 *   - [Naver ↗](地圖連結)
 *   - [Kakao ↗](地圖連結)
 *   - [食記參考 ↗](參考連結)
 *
 * 觸發條件（兩者都成立才視為美食卡，避免誤判一般的 h4）：
 *   1. `####` 標題的內容是「單一連結」
 *   2. 緊接著的段落「只由 code span 組成」
 *
 * meta 行的槽位規則：第一個 code span＝餐別、最後一個＝價格、中間＝飲食標籤；
 * 飲食標籤字尾加 `*` 改用警示樣式（沿用既有 `eat` 家族語意，`*` 在 code span 內是字面值）。
 *
 * ---- App 推薦清單（.app-card）的 Markdown 約定 --------------------------
 *
 *   - **N** Naver Map：韓國在地導航首選。支援繁體中文與中文語音導航。
 *   - **K** KakaoMap：韓國市佔率極高之地圖。
 *
 * 觸發條件：清單「每一項」開頭都是單一英數字元的粗體（如 `**N**`），全站掃過
 * 沒有其他清單／段落用單一粗體字母開頭，是安全、不會誤判的形狀。名稱與說明以
 * 「：」分隔（第一個全形冒號之前是名稱，之後是說明，可含行內 HTML 如 `<br>`/`<a>`）。
 *
 * 註：`prep`（30 秒速覽的粗體標籤列）沒有納入本檔——它的形狀「粗體開頭＋『：』
 * 直接接說明文字」跟全站許多一般段落的手寫習慣（如 07-20 支付教學文）撞形狀，
 * 無法安全區分，因此 `prep` 決策保留 fence（見 `doc/archive/plan.md` Phase D）。
 */

/** 判斷 inline token 陣列是否「只由 code span（與空白）組成」。 */
function isOnlyCodespans(tokens) {
  if (!tokens || !tokens.length) return false;
  let found = 0;
  for (const t of tokens) {
    if (t.type === 'codespan') {
      found++;
    } else if (t.type === 'text' || t.type === 'space') {
      if ((t.raw ?? t.text ?? '').trim() !== '') return false;
    } else {
      return false;
    }
  }
  return found > 0;
}

/** 判斷 heading token 的內容是否為「單一連結」。 */
function isSingleLink(tokens) {
  if (!tokens) return false;
  const meaningful = tokens.filter(
    (t) => !((t.type === 'text' || t.type === 'space') && (t.raw ?? '').trim() === '')
  );
  return meaningful.length === 1 && meaningful[0].type === 'link';
}

/** 判斷 list token 是否「每一項都只是一個連結」。 */
function isLinkList(token) {
  if (!token || token.type !== 'list' || !token.items?.length) return false;
  return token.items.every((item) => {
    const inline = item.tokens?.[0];
    if (!inline || inline.type !== 'text') return false;
    return isSingleLink(inline.tokens);
  });
}

/** 段落是否以粗體標籤開頭（→ 招牌菜那一列）。 */
function startsWithStrong(tokens) {
  const first = (tokens || []).find(
    (t) => !((t.type === 'text' || t.type === 'space') && (t.raw ?? '').trim() === '')
  );
  return first?.type === 'strong';
}

/**
 * 掃描 token 陣列，把符合美食卡形狀的連續 token 收合成單一 `foodCard` token。
 */
function collapseFoodCards(tokens) {
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    const isCardHead =
      tok.type === 'heading' &&
      tok.depth === 4 &&
      isSingleLink(tok.tokens) &&
      (() => {
        // 往後找第一個非 space token，必須是「只由 code span 組成」的段落
        let k = i + 1;
        while (k < tokens.length && tokens[k].type === 'space') k++;
        return tokens[k]?.type === 'paragraph' && isOnlyCodespans(tokens[k].tokens);
      })();

    if (!isCardHead) {
      out.push(tok);
      continue;
    }

    // 收集這張卡的內容：從標題之後，到下一個 heading（任何層級）或區塊結尾為止
    const card = { type: 'foodCard', raw: tok.raw, head: tok, meta: null, body: null, why: [], actions: null };
    let j = i + 1;
    for (; j < tokens.length; j++) {
      const t = tokens[j];
      if (t.type === 'heading') break;
      if (t.type === 'space') continue;

      if (t.type === 'paragraph' && isOnlyCodespans(t.tokens) && !card.meta) {
        card.meta = t;
      } else if (t.type === 'paragraph' && startsWithStrong(t.tokens) && !card.body) {
        card.body = t;
      } else if (isLinkList(t)) {
        card.actions = t;
      } else if (t.type === 'paragraph') {
        card.why.push(t);
      } else {
        // 卡片內出現預期外的區塊（表格、引用…）→ 保守起見中止收合，避免吞掉不該吞的內容
        break;
      }
    }
    out.push(card);
    i = j - 1;
  }
  return out;
}

/** 判斷 inline token 陣列的第一個有意義 token，是不是「單一英文字母」的粗體（→ App 圖示）。
 *  刻意不含數字：App 圖示取的是名稱首字母，不會是數字，若含數字會誤判手寫的粗體編號清單
 *  （如「- **1** 下載 App」）。 */
function startsWithLetterStrong(tokens) {
  const first = (tokens || []).find(
    (t) => !((t.type === 'text' || t.type === 'space') && (t.raw ?? '').trim() === '')
  );
  if (first?.type !== 'strong') return false;
  const text = (first.tokens?.[0]?.raw ?? first.text ?? '').trim();
  return /^[A-Za-z]$/.test(text);
}

/** 判斷 list token 是否「每一項都以單一字母粗體開頭，且含全形冒號『：』」（→ App 推薦清單）。
 *  冒號條件對應 renderAppList 用第一個「：」切名稱／說明的實際渲染邏輯——沒有冒號的清單
 *  一樣會被誤判成 App 卡，只是說明區塊留空，故一併收進觸發條件。 */
function isAppList(token) {
  if (!token || token.type !== 'list' || !token.items?.length) return false;
  return token.items.every((item) => {
    const inline = item.tokens?.[0];
    if (!inline || inline.type !== 'text') return false;
    return startsWithLetterStrong(inline.tokens) && inline.raw.includes('：');
  });
}

/**
 * 掃描 token 陣列，把符合 App 清單形狀的 `list` token 換成單一 `appList` token。
 */
function collapseAppLists(tokens) {
  return tokens.map((tok) => (isAppList(tok) ? { type: 'appList', raw: tok.raw, items: tok.items } : tok));
}

// ---- 渲染 ---------------------------------------------------------------

function renderFoodCard(token, parser) {
  const inline = (t) => (t ? parser.parseInline(t.tokens) : '');

  // 標題：h4 內的單一連結 → 保留輸出為 <h4 class="food-name">（而非 <span>），讓 30 家店名
  // 在無障礙樹上仍是標題，螢幕閱讀器可用標題導覽；連結樣式交給既有 .prose h4 a 規則
  // （text-decoration: none; color: inherit），不需再手動疊加 no-underline/text-inherit
  const link = token.head.tokens.find((t) => t.type === 'link');
  const nameHtml = `<a href="${link.href}" target="_blank">${parser.parseInline(link.tokens)}</a>`;

  // meta 行：第一個 code span＝餐別、最後一個＝價格、中間＝飲食標籤
  const spans = (token.meta?.tokens || []).filter((t) => t.type === 'codespan');
  const parts = [];
  spans.forEach((t, idx) => {
    const text = t.text;
    if (idx === 0) {
      parts.push(`      <span class="food-tag">${text}</span>`);
    } else if (idx === spans.length - 1) {
      parts.push(`      <span class="food-price">${text}</span>`);
    } else if (text.endsWith('*')) {
      parts.push(
        `      <span class="food-tag font-bold text-red-700 bg-red-50 border border-red-200">${text.slice(0, -1)}</span>`
      );
    } else {
      parts.push(`      <span class="food-tag diet">${text}</span>`);
    }
  });

  const actionsHtml = (token.actions?.items || [])
    .map((item) => {
      const l = item.tokens[0].tokens.find((t) => t.type === 'link');
      return `    <a href="${l.href}" target="_blank" class="food-action-link">${parser.parseInline(l.tokens)}</a>`;
    })
    .join('\n');

  return `<div class="food-item">
  <div class="food-header">
    <h4 class="food-name">${nameHtml}</h4>
    <div class="food-meta">
${parts.join('\n')}
    </div>
  </div>
  <p class="food-body">${inline(token.body)}</p>
${token.why.map((w) => `  <p class="food-why">${inline(w)}</p>`).join('\n')}
  <div class="food-actions">
${actionsHtml}
  </div>
</div>`;
}

function renderAppList(token, parser) {
  return token.items
    .map((item) => {
      const inline = item.tokens[0].tokens;
      const strongIdx = inline.findIndex((t) => t.type === 'strong');
      const icon = parser.parseInline(inline[strongIdx].tokens);
      const restHtml = parser.parseInline(inline.slice(strongIdx + 1)).trim();
      const sepIdx = restHtml.indexOf('：');
      const name = sepIdx === -1 ? restHtml : restHtml.slice(0, sepIdx);
      const appBody = sepIdx === -1 ? '' : restHtml.slice(sepIdx + '：'.length);
      return `<div class="app-card"><div class="app-icon-wrapper">${icon}</div><div class="app-info"><h4>${name.trim()}</h4><p>${appBody.trim()}</p></div></div>`;
    })
    .join('\n');
}

// ---- 註冊 ---------------------------------------------------------------

export function registerSectionExtensions(marked) {
  marked.use({
    hooks: {
      processAllTokens(tokens) {
        return collapseAppLists(collapseFoodCards(tokens));
      },
    },
    extensions: [
      {
        name: 'foodCard',
        level: 'block',
        // token 由 processAllTokens 產生，不需要自己的 tokenizer
        tokenizer() {
          return undefined;
        },
        renderer(token) {
          return renderFoodCard(token, this.parser);
        },
      },
      {
        name: 'appList',
        level: 'block',
        tokenizer() {
          return undefined;
        },
        renderer(token) {
          return renderAppList(token, this.parser);
        },
      },
    ],
  });
}
