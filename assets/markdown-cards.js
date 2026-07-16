/**
 * Card DSL 擴充：把文章 markdown 裡精簡的 ```food / ```spot / ```compare / ```gallery /
 * ```prep / ```apps / ```triage / ```emergency / ```info / ```stepper 資料區塊，在 marked
 * 渲染時逐字還原成與手寫版本相同的卡片 HTML。
 *
 * 純字串邏輯，不引用 document / window 等瀏覽器專有物件，可在 Node 環境（驗證腳本、
 * 未來若要在建置時預渲染）與瀏覽器（scripts.js 於 window.marked 上註冊）共用。
 *
 * 用法：
 *   import { registerCardExtensions } from './markdown-cards.js';
 *   registerCardExtensions(marked); // marked 可以是全域單例，也可以是 new Marked() 實例
 */

const CARD_LANGS = 'food|spot|compare|gallery|prep|apps|triage|emergency|info|stepper';
const CARD_BLOCK_RE = new RegExp(
  `^ {0,3}\`\`\`(${CARD_LANGS})[ \\t]*\\n([\\s\\S]*?)\\n {0,3}\`\`\`[ \\t]*(?:\\n|$)`
);

// ---- 小工具 ----------------------------------------------------------

/** 取出區塊 body 內的非空行，去除前後空白。 */
function bodyLines(body) {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** 以第一個半形冒號切成 [key, value.trim()]，僅用於 `key: value` 行。 */
function kv(line) {
  const idx = line.indexOf(':');
  if (idx === -1) return [line.trim(), ''];
  return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
}

/** 以「第一次出現」的分隔字串切成兩段（用於半形空白-豎線-半形空白欄位分隔）。 */
function splitFirst(str, sep) {
  const idx = str.indexOf(sep);
  if (idx === -1) return [str.trim(), ''];
  return [str.slice(0, idx).trim(), str.slice(idx + sep.length).trim()];
}

const FIELD_SEP = ' | ';

// ---- 各家族 renderer ---------------------------------------------------

function renderFood(body) {
  const f = {};
  for (const line of bodyLines(body)) {
    const [key, val] = kv(line);
    f[key] = val;
  }

  const MEAL_CLASS = {
    正餐: 'chip-meal',
    小吃: 'chip-snack',
    咖啡廳: 'chip-cafe',
    伴手禮: 'chip-gift',
  };
  const mealChips = (f.meal || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((m) => `<span class="food-chip ${MEAL_CLASS[m] || ''}">${m}</span>`)
    .join('');

  let dietRow = '';
  if (f.diet) {
    const chips = f.diet
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((d) => {
        if (d.endsWith('!')) {
          return `<span class="diet-chip is-warn">${d.slice(0, -1)}</span>`;
        }
        return `<span class="diet-chip">${d}</span>`;
      })
      .join('');
    dietRow = `<div class="food-diet-row">${chips}</div>`;
  }

  // map 為 naver／kakao 共用的搜尋字串；少數店名 kakao 端原始資料多一個空白，
  // 以可省的 map_kakao 覆寫欄位保留這個既有差異，逐字還原。
  const mapKakao = f.map_kakao || f.map;

  return `<div class="food-item">
  <div class="food-item-title-row"><span class="food-item-name">${f.name}</span></div>
  <div class="food-item-meta-row">${mealChips}</div>
  ${dietRow}
  <div class="food-item-body">
    <div class="food-item-row"><strong>價位帶：</strong>${f.price}</div>
    <div class="food-item-row"><strong>招牌菜：</strong>${f.signature}</div>
    <div class="food-item-row"><strong>為何適合此同伴：</strong>${f.why}</div>
    <div class="food-actions">
      <a class="action-btn btn-naver" href="https://map.naver.com/v5/search/${f.map}" target="_blank">Naver 地圖</a>
      <a class="action-btn btn-kakao" href="https://map.kakao.com/?q=${mapKakao}" target="_blank">Kakao 地圖</a>
      <a class="action-btn btn-ref" href="${f.ref}" target="_blank">食記參考</a>
    </div>
  </div>
</div>`;
}

function renderSpot(body) {
  const f = { subs: [] };
  for (const line of bodyLines(body)) {
    const [key, val] = kv(line);
    if (key === 'sub') {
      const [subtitle, subbody] = splitFirst(val, FIELD_SEP);
      f.subs.push({ subtitle, subbody });
    } else {
      f[key] = val;
    }
  }

  const [level, badgeRest] = splitFirst(f.badge, FIELD_SEP);
  const [stars, text] = splitFirst(badgeRest, FIELD_SEP);

  const subsHtml = f.subs
    .map(
      (s) => `
  <div class="info-subcard">
    <div class="info-subcard-title">${s.subtitle}</div>
    <p>${s.subbody}</p>
  </div>`
    )
    .join('');

  let walkHtml = '';
  if (f.walk) {
    const [wtext, href] = splitFirst(f.walk, FIELD_SEP);
    walkHtml = `\n  <a class="spot-walk-link" href="${href}">${wtext}</a>`;
  }

  return `<div class="spot-card">
  <span class="day-label">${f.day}</span>
  <h4 id="${f.id}" class="spot-title">${f.title}</h4>
  <div class="friendly-badge ${level}"><span class="stars">${stars}</span>&nbsp;${text}</div>
  <p class="area-desc">${f.desc}</p>${subsHtml}${walkHtml}
</div>`;
}

function renderCompare(body) {
  let name = '';
  let stars = '';
  let tagline = '';
  const rows = [];

  for (const line of bodyLines(body)) {
    const [key, val] = kv(line);
    if (key === 'name') {
      name = val;
    } else if (key === 'stars') {
      stars = val;
    } else if (key === 'tagline') {
      tagline = val;
    } else if (key === 'row') {
      const [label, value] = splitFirst(val, FIELD_SEP);
      rows.push(`<div class="compare-row"><strong>${label}：</strong>${value}</div>`);
    } else if (key === 'text') {
      rows.push(`<div class="compare-row">${val}</div>`);
    }
  }

  const starsHtml = stars ? `<span class="stars">${stars}</span>` : '';
  const taglineHtml = tagline ? `\n  <p class="compare-tagline">${tagline}</p>` : '';

  return `<div class="compare-card">
  <div class="compare-card-head"><span class="compare-card-name">${name}</span>${starsHtml}</div>${taglineHtml}
  ${rows.join('\n  ')}
</div>`;
}

function renderInfo(body) {
  let name = '';
  let tagline = '';
  const rows = [];

  for (const line of bodyLines(body)) {
    const [key, val] = kv(line);
    if (key === 'name') {
      name = val;
    } else if (key === 'tagline') {
      tagline = val;
    } else if (key === 'row') {
      const [label, value] = splitFirst(val, FIELD_SEP);
      rows.push(`<div class="info-row"><strong>${label}：</strong>${value}</div>`);
    } else if (key === 'text') {
      rows.push(`<div class="info-row">${val}</div>`);
    }
  }

  const taglineHtml = tagline ? `\n  <p class="info-tagline">${tagline}</p>` : '';

  return `<div class="info-card">
  <div class="info-card-head"><span class="info-card-name">${name}</span></div>${taglineHtml}
  ${rows.join('\n  ')}
</div>`;
}

function renderGallery(body) {
  const cards = bodyLines(body)
    .map((line) => {
      const parts = line.split(FIELD_SEP);
      const href = (parts[0] || '').trim();
      const name = (parts[1] || '').trim();
      const theme = parts.slice(2).join(FIELD_SEP).trim();
      return `<a class="gallery-card" href="${href}"><span class="gallery-card-name">${name}</span><span class="gallery-card-theme">${theme}</span></a>`;
    })
    .join('\n  ');

  return `<div class="gallery-grid not-prose">
  ${cards}
</div>`;
}

function renderPrep(body) {
  const pills = bodyLines(body)
    .map((line) => {
      const [lead, rest] = splitFirst(line, FIELD_SEP);
      return `<div class="prep-pill"><strong>${lead}</strong>${rest}</div>`;
    })
    .join('\n  ');

  return `<div class="prep-pill-row not-prose">
  ${pills}
</div>`;
}

function renderApps(body) {
  return bodyLines(body)
    .map((line) => {
      const parts = line.split(FIELD_SEP);
      const icon = (parts[0] || '').trim();
      const name = (parts[1] || '').trim();
      const appBody = parts.slice(2).join(FIELD_SEP).trim();
      return `<div class="app-card"><div class="app-icon-wrapper">${icon}</div><div class="app-info"><h4>${name}</h4><p>${appBody}</p></div></div>`;
    })
    .join('\n');
}

function renderTriage(body) {
  const items = bodyLines(body)
    .map((line) => {
      const parts = line.split(FIELD_SEP);
      const cat = (parts[0] || '').trim();
      const href = (parts[1] || '').trim();
      const num = (parts[2] || '').trim();
      const bold = (parts[3] || '').trim();
      const rest = parts.slice(4).join(FIELD_SEP).trim();
      return `<a class="triage-item cat-${cat}" href="${href}"><span class="triage-num badge-${cat}">${num}</span><span class="triage-body"><strong>${bold}</strong>${rest}</span></a>`;
    })
    .join('\n  ');

  return `<div class="triage-list not-prose">
  ${items}
</div>`;
}

function renderEmergency(body) {
  const f = { ps: [] };
  for (const line of bodyLines(body)) {
    const [key, val] = kv(line);
    if (key === 'p') {
      f.ps.push(val);
    } else {
      f[key] = val;
    }
  }

  const psHtml = f.ps.map((p) => `\n  <p>${p}</p>`).join('');

  return `<div class="emergency-card cat-${f.cat}">
  <h3><span class="em-tag badge-${f.cat}">${f.tag}</span>${f.title}</h3>${psHtml}
</div>`;
}

/**
 * 時間軸步驟卡。與其他家族不同，需要外部傳入的 marked 實例來把「多行清單型」步驟
 * body 遞迴解析成 <ol>/<ul>（單行步驟則原樣 inline，逐字保留 <strong>/&le; 等）。
 *
 * DSL 語法：每個步驟以 `@ 標題` 行起始，之後到下一個 `@ `（或區塊結尾）之間的所有行
 * 都是該步驟 body（保留空行與縮排）。標題不含「Step N:」——編號由本函式自動補上，
 * 統一輸出全形冒號「Step ${n}：${title}」（冒號後不加空白），比照原手寫版寫法。
 */
function renderStepper(body, marked) {
  // 刻意不用 bodyLines()：它會濾掉空行，會破壞多行步驟裡「清單前後需空行」的結構。
  const steps = [];
  let current = null;
  for (const line of body.split('\n')) {
    const m = /^@ (.*)$/.exec(line);
    if (m) {
      current = { title: m[1].trim(), lines: [] };
      steps.push(current);
    } else if (current) {
      current.lines.push(line);
    }
    // 第一個 `@ ` 之前的行（正常情況不存在）忽略
  }

  const items = steps
    .map((step, i) => {
      const n = i + 1;
      const b = step.lines.join('\n').trim();
      // 多行 → 遞迴 marked（清單）；單行 → 原樣 inline（不包 <p>，逐字保留 HTML 實體/標籤）。
      const content = b.includes('\n') ? marked.parse(b) : b;
      return `  <div class="step-item">
    <div class="step-node"></div>
    <div class="step-title">Step ${n}：${step.title}</div>
    <div class="step-content">${content}</div>
  </div>`;
    })
    .join('\n');

  return `<div class="stepper">
${items}
</div>`;
}

const RENDERERS = {
  food: renderFood,
  spot: renderSpot,
  compare: renderCompare,
  gallery: renderGallery,
  prep: renderPrep,
  apps: renderApps,
  triage: renderTriage,
  emergency: renderEmergency,
  info: renderInfo,
};

// ---- marked 擴充註冊 ----------------------------------------------------

export function registerCardExtensions(marked) {
  marked.use({
    extensions: [
      {
        name: 'cardBlock',
        level: 'block',
        start(src) {
          const idx = src.indexOf('```');
          return idx === -1 ? undefined : idx;
        },
        tokenizer(src) {
          const match = CARD_BLOCK_RE.exec(src);
          if (!match) return undefined;
          return {
            type: 'cardBlock',
            raw: match[0],
            lang: match[1],
            body: match[2],
          };
        },
        renderer(token) {
          // stepper 需要 marked 實例遞迴解析步驟 body，故特判、不走 RENDERERS 單參數路徑。
          if (token.lang === 'stepper') return renderStepper(token.body, marked);
          const render = RENDERERS[token.lang];
          return render ? render(token.body) : '';
        },
      },
    ],
  });
}
