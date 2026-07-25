#!/usr/bin/env node
/**
 * 文章渲染回歸驗證：用「同一份渲染器」比對某個 git ref 與工作目錄（或兩個 ref）
 * 渲染出的文章 HTML 是否相同。
 *
 * 取代已失效的 `verify-card-dsl.mjs`——後者「改寫前」刻意用無擴充的 marked 渲染，
 * 那是為「手寫 HTML → DSL fence」那一次遷移設計的一次性工具；全部文章卡片化後
 * 該前提已不成立，用它驗任何後續改動都會必然紅字。
 *
 * 本工具兩邊都用當前的 markdown-cards.js 渲染，因此驗的是「這次改動有沒有改變輸出」，
 * 適用於 renderer 重構、DSL 欄位語意調整、文章內容遷移等所有情境。
 *
 * 用法：
 *   node scripts/verify-post-render.mjs                    # HEAD vs 工作目錄，全部文章
 *   node scripts/verify-post-render.mjs HEAD~1             # 指定基準 ref
 *   node scripts/verify-post-render.mjs HEAD 2026-07-16    # 只驗檔名含該字串的文章
 *
 * 注意：兩邊都用「工作目錄當前版本」的 markdown-cards.js。若這次改動同時動了
 * renderer 與文章內容，本工具驗的是「兩者加總後輸出是否仍相同」——這正是內容遷移
 * （renderer 支援新語法 + 文章改用新語法）想要的驗證語意。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { Marked } from 'marked';
import { registerCardExtensions } from '../assets/markdown-cards.js';

const [refArg, filterArg] = process.argv.slice(2);
const REF = refArg || 'HEAD';
const POSTS_DIR = 'src/posts';

const marked = new Marked();
registerCardExtensions(marked);

function stripFrontMatter(raw) {
  if (!raw.startsWith('---')) return raw;
  const i = raw.indexOf('---', 3);
  return i === -1 ? raw : raw.slice(i + 3).trim();
}

function render(md) {
  return marked.parse(stripFrontMatter(md));
}

function firstDiff(a, b, ctx = 100) {
  let i = 0;
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
  const s = Math.max(0, i - ctx);
  return { index: i, a: a.slice(s, i + ctx), b: b.slice(s, i + ctx) };
}

const files = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !filterArg || f.includes(filterArg));

if (!files.length) {
  console.error(`找不到符合的文章（filter: ${filterArg || '無'}）`);
  process.exit(2);
}

let failed = 0;
console.log(`基準：${REF}    比對對象：工作目錄    文章數：${files.length}\n`);

for (const file of files) {
  const path = `${POSTS_DIR}/${file}`;
  let oldRaw;
  try {
    oldRaw = execSync(`git show ${REF}:"${path}"`, {
      encoding: 'utf8',
      maxBuffer: 1e8,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    console.log(`  ⏭  ${file} —— 在 ${REF} 不存在（新增的文章），略過`);
    continue;
  }
  const newRaw = readFileSync(path, 'utf8');

  const oldHtml = render(oldRaw);
  const newHtml = render(newRaw);

  if (oldHtml === newHtml) {
    console.log(`  ✅ ${file} —— 0 diff（${newHtml.length} 字元）`);
  } else {
    failed++;
    const d = firstDiff(oldHtml, newHtml);
    console.log(`  ❌ ${file} —— 長度 ${oldHtml.length} → ${newHtml.length}，首個差異在 index ${d.index}`);
    console.log(`     基準: …${d.a.slice(-160)}`);
    console.log(`     現在: …${d.b.slice(-160)}`);
  }
}

console.log(failed ? `\n${failed} 篇有差異` : '\n全部 0 diff ✅');
process.exit(failed ? 1 : 0);
