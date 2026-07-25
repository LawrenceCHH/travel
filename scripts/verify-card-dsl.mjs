#!/usr/bin/env node
/**
 * Dev-only 驗證腳本：比對某篇文章「卡片 DSL 重構」前後渲染出的 HTML 是否逐字相同。
 *
 * - 原始版本：改寫前的備份檔（純 marked，無擴充）。
 * - 改寫後版本：改寫後的文章檔（marked + registerCardExtensions）。
 * - 兩者各自剝除 front matter 後渲染，再正規化空白（移除標籤間空白、連續空白壓成一個、trim）
 *   比對是否完全相同。
 *
 * 用法：node scripts/verify-card-dsl.mjs <改寫前備份路徑> <改寫後文章路徑>
 * 備份路徑是暫時性檔案（通常放在 scratchpad），故本腳本不內建預設路徑——呼叫時務必自行指定。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Marked } from 'marked';
import { registerCardExtensions } from '../assets/markdown-cards.js';

const [origArg, newArg] = process.argv.slice(2);
if (!origArg || !newArg) {
  console.error('用法：node scripts/verify-card-dsl.mjs <改寫前備份路徑> <改寫後文章路徑>');
  process.exit(2);
}
const ORIG_PATH = resolve(origArg);
const NEW_PATH = resolve(newArg);

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
