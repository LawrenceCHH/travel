/**
 * Card DSL 擴充：把文章 markdown 裡精簡的 ```compare / ```prep / ```apps / ```info /
 * ```stepper / ```accordion / ```quickjump / ```stop / ```eat / ```eatarea 資料區塊，在
 * marked 渲染時逐字還原成與手寫版本相同的卡片 HTML。
 *
 * 純字串邏輯，不引用 document / window 等瀏覽器專有物件，可在 Node 環境（驗證腳本、
 * 未來若要在建置時預渲染）與瀏覽器（scripts.js 於 window.marked 上註冊）共用。
 *
 * 用法：
 *   import { registerCardExtensions } from './markdown-cards.js';
 *   registerCardExtensions(marked); // marked 可以是全域單例，也可以是 new Marked() 實例
 */

const CARD_LANGS =
  'compare|prep|apps|info|stepper|accordion|quickjump|stop|eat|eatarea';
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

/**
 * 手風琴摺疊區塊擴充。
 * 格式：
 * id: em-119
 * cat: medical
 * tag: 醫療・消防
 * summary: 119 救護車/消防車 — 有人受傷、生病送醫、火災
 * 
 * * 內容（Markdown 格式）
 */
function renderAccordion(body, marked) {
  const idx = body.indexOf('\n\n');
  let metaPart = '';
  let bodyPart = '';
  if (idx === -1) {
    metaPart = body;
  } else {
    metaPart = body.slice(0, idx);
    bodyPart = body.slice(idx + 2);
  }

  const f = {};
  for (const line of metaPart.split('\n').map(l => l.trim()).filter(Boolean)) {
    const [key, val] = kv(line);
    f[key] = val;
  }

  const contentHtml = bodyPart ? marked.parse(bodyPart.trim()) : '';

  return `<details class="fold border-l-4 cat-${f.cat}" id="${f.id}">
<summary><span class="em-tag badge-${f.cat}">${f.tag}</span> ${f.summary}</summary>
${contentHtml}
</details>`;
}

/**
 * 「7 大主題景點快速導覽」跳轉清單（07-16 editorial-card 風格專用，僅出現一次）。
 * 格式：`title: 標題` 一行，之後每行 `href | 連結文字 | 說明`。
 */
function renderQuickjump(body) {
  let title = '';
  const items = [];
  for (const line of bodyLines(body)) {
    const [key, val] = kv(line);
    if (key === 'title') {
      title = val;
      continue;
    }
    const parts = line.split(FIELD_SEP);
    const href = (parts[0] || '').trim();
    const label = (parts[1] || '').trim();
    const desc = parts.slice(2).join(FIELD_SEP).trim();
    items.push(
      `<div><a href="${href}" class="text-primary hover:underline font-serif font-bold">${label}</a> <span class="text-xs text-muted-text">${desc}</span></div>`
    );
  }

  return `<div class="editorial-quick-jump my-6 p-4 bg-sand/5 border border-sand/30 rounded-sm">
  <h4 class="text-xs uppercase tracking-widest text-muted-text font-bold mb-3">${title}</h4>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
    ${items.join('\n    ')}
  </div>
</div>`;
}

// level → 07-16 editorial-card 風格既有的「友善度」徽章 utility class 組合（逐字對應手寫版四種變體）。
const STOP_LEVEL_CLASS = {
  diet: 'food-tag diet ml-3',
  flat: 'food-tag bg-sand/20 text-primary-dark ml-3',
  slope: 'food-tag bg-[#f6eed6] text-[#6e4f0a] ml-3',
  steps: 'food-tag bg-[#f4e6dc] text-[#833411] ml-3',
};

/**
 * 景點漫遊主題章節卡（07-16 editorial-card 風格 `.spot-section`）。
 * `sub` 欄位為 `子標題 | 內文`，可含原樣 HTML（`<br>`/`<em>`/`<a>` 等）。
 */
function renderStop(body) {
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

  const tagClass = STOP_LEVEL_CLASS[f.level] || 'food-tag ml-3';
  const subsHtml = f.subs
    .map(
      (s) => `
    <div class="sub-option-item">
      <strong>${s.subtitle}</strong>
      ${s.subbody}
    </div>`
    )
    .join('');

  return `<div class="spot-section">
  <h4 id="${f.id}" class="spot-title"><a href="${f.url}" target="_blank" class="no-underline text-inherit">${f.title}</a> <span class="${tagClass}">${f.tag}</span></h4>
  <p class="spot-desc">${f.desc}</p>
  <div class="sub-option-list">${subsHtml}
  </div>
</div>`;
}

/**
 * 美食推薦分區小標題（07-16 editorial-card 風格 `.food-list-title`，採用 `<h3>` 讓大綱 TOC Drawer 抓取索引）。
 */
function renderEatarea(body) {
  const f = {};
  for (const line of bodyLines(body)) {
    const [key, val] = kv(line);
    f[key] = val;
  }
  return `<h3 class="food-list-title"><a href="${f.url}" target="_blank" class="no-underline text-inherit">${f.name}</a></h3>`;
}

/**
 * 美食卡（07-16 editorial-card 風格 `.food-item`）。
 * `diet` 欄位以逗號分隔；單一項目字尾加 `*` 會改用警示樣式（如「需排隊!」的紅框變體），
 * 逐字對應原始 30 筆手寫資料裡兩種並存的既有樣式差異。
 */
function renderEat(body) {
  const f = {};
  for (const line of bodyLines(body)) {
    const [key, val] = kv(line);
    f[key] = val;
  }

  const dietTags = (f.diet || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((d) => {
      if (d.endsWith('*')) {
        return `<span class="food-tag font-bold text-red-700 bg-red-50 border border-red-200">${d.slice(0, -1)}</span>`;
      }
      return `<span class="food-tag diet">${d}</span>`;
    })
    .join('\n      ');

  const sigSep = f.sigsep === 'half' ? ': ' : '：';

  return `<div class="food-item">
  <div class="food-header">
    <span class="food-name"><a href="${f.url}" target="_blank" class="no-underline text-inherit">${f.name}</a></span>
    <div class="food-meta">
      <span class="food-tag">${f.meal}</span>
      ${dietTags ? `${dietTags}\n      ` : ''}<span class="food-price">${f.price}</span>
    </div>
  </div>
  <p class="food-body"><strong>招牌菜</strong>${sigSep}${f.signature}</p>
  <p class="food-why">${f.why}</p>
  <div class="food-actions">
    <a href="${f.naver}" target="_blank" class="food-action-link">Naver ↗</a>
    <a href="${f.kakao}" target="_blank" class="food-action-link">Kakao ↗</a>
    <a href="${f.ref}" target="_blank" class="food-action-link">食記參考 ↗</a>
  </div>
</div>`;
}

const RENDERERS = {
  compare: renderCompare,
  prep: renderPrep,
  apps: renderApps,
  info: renderInfo,
  quickjump: renderQuickjump,
  stop: renderStop,
  eat: renderEat,
  eatarea: renderEatarea,
};

// ---- marked 擴充註冊 ----------------------------------------------------

export function registerCardExtensions(marked) {
  marked.use({
    renderer: {
      link(hrefOrToken, title, text) {
        let href, linkTitle, linkText;
        if (typeof hrefOrToken === 'object' && hrefOrToken !== null) {
          href = hrefOrToken.href;
          linkTitle = hrefOrToken.title;
          linkText = hrefOrToken.text || hrefOrToken.tokens?.map((t) => t.raw || t.text).join('') || '';
        } else {
          href = hrefOrToken;
          linkTitle = title;
          linkText = text;
        }
        const titleAttr = linkTitle ? ` title="${linkTitle}"` : '';
        const isExternal = typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'));
        const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${href || '#'}"${titleAttr}${targetAttr}>${linkText}</a>`;
      },
    },
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
          // stepper 與 accordion 需要 marked 實例遞迴解析 body，故特判、不走 RENDERERS 單參數路徑。
          if (token.lang === 'stepper') return renderStepper(token.body, marked);
          if (token.lang === 'accordion') return renderAccordion(token.body, marked);
          const render = RENDERERS[token.lang];
          return render ? render(token.body) : '';
        },
      },
    ],
  });
}
