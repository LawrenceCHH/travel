#!/usr/bin/env node
/**
 * Dev-only 驗證腳本：比對「首爾文章卡片 DSL 重構」前後渲染出的 HTML 是否逐字相同。
 *
 * - 原始版本：src/posts/2026-07-13-韓國首爾旅行.md 改寫前的備份（見 ORIG_PATH），
 *   用純 marked（無擴充）渲染。
 * - 改寫後版本：目前工作區的 src/posts/2026-07-13-韓國首爾旅行.md，
 *   用 marked + registerCardExtensions 渲染。
 * - 兩者各自剝除 front matter 後渲染，再正規化空白（移除標籤間空白、連續空白壓成一個、trim）
 *   比對是否完全相同。
 *
 * 用法：node scripts/verify-card-dsl.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import { registerCardExtensions } from '../assets/markdown-cards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ORIG_PATH = resolve(
  '/tmp/claude-1000/-home-lawrencechh-j-travel/c841c1d6-6f20-4f59-a53d-86576430e7ad/scratchpad/orig.md'
);
const NEW_PATH = resolve(__dirname, '../src/posts/2026-07-13-韓國首爾旅行.md');

function stripFrontMatter(raw) {
  if (!raw.startsWith('---')) return raw;
  const nextDashIndex = raw.indexOf('---', 3);
  if (nextDashIndex === -1) return raw;
  return raw.slice(nextDashIndex + 3).trim();
}

function normalize(html) {
  return html
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstDiffContext(a, b, context = 80) {
  let i = 0;
  const len = Math.min(a.length, b.length);
  while (i < len && a[i] === b[i]) i++;
  const start = Math.max(0, i - context);
  return {
    index: i,
    a: a.slice(start, i + context),
    b: b.slice(start, i + context),
  };
}

const origRaw = readFileSync(ORIG_PATH, 'utf8');
const newRaw = readFileSync(NEW_PATH, 'utf8');

const origContent = stripFrontMatter(origRaw);
const newContent = stripFrontMatter(newRaw);

const plainMarked = new Marked();
const cardMarked = new Marked();
registerCardExtensions(cardMarked);

const origHtml = normalize(plainMarked.parse(origContent));
const newHtml = normalize(cardMarked.parse(newContent));

if (origHtml === newHtml) {
  console.log('[verify-card-dsl] 正規化後 0 diff ✅');
  console.log(`[verify-card-dsl] 正規化後長度: ${origHtml.length} 字元`);
  process.exit(0);
} else {
  console.error('[verify-card-dsl] 發現差異 ❌');
  console.error(`原始長度: ${origHtml.length}, 改寫後長度: ${newHtml.length}`);
  const diff = firstDiffContext(origHtml, newHtml);
  console.error(`第一個差異位置: index ${diff.index}`);
  console.error('--- 原始 (附近) ---');
  console.error(diff.a);
  console.error('--- 改寫後 (附近) ---');
  console.error(diff.b);
  process.exit(1);
}
