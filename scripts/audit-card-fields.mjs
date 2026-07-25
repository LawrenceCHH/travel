#!/usr/bin/env node
/**
 * 稽核腳本：把 src/posts/ 所有卡片 DSL fence 的欄位值抽出來，逐一丟進
 * marked.parseInline()，回報「解析後會改變」的欄位。
 *
 * 目的：在把 renderer 改成支援 Markdown inline 語法之前，先量化風險——
 * 哪些既有欄位值會因為 escape（& → &amp;）、強調（* _）、程式碼（`）等
 * 語法而被改動，導致渲染輸出不再逐字相同。
 *
 * 用法：node scripts/audit-card-fields.mjs [--verbose]
 */
import { readFileSync, readdirSync } from 'node:fs';
import { Marked } from 'marked';
import { registerCardExtensions } from '../assets/markdown-cards.js';

const VERBOSE = process.argv.includes('--verbose');

const marked = new Marked();
registerCardExtensions(marked);

const FENCE_RE = /^```([a-z]+)[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm;

// 已知「絕對不可 inline 解析」的欄位（URL、控制值、特殊語法標記）。
// 稽核時仍會掃描它們，但另外標註，避免與真正的內容欄位混為一談。
const NEVER_PARSE = new Set([
  'url', 'naver', 'kakao', 'ref',   // 純 URL
  'id', 'cat', 'level', 'sigsep',   // 控制值
  'diet',                            // 以字尾 * 當警示標記，會與 Markdown 強調語法衝突
]);

const results = [];
let totalFields = 0;

for (const file of readdirSync('src/posts')) {
  if (!file.endsWith('.md')) continue;
  const raw = readFileSync(`src/posts/${file}`, 'utf8');
  const body = raw.startsWith('---') ? raw.slice(raw.indexOf('---', 3) + 3) : raw;

  for (const m of body.matchAll(FENCE_RE)) {
    const [, lang, fenceBody] = m;
    // stepper / accordion 的 body 本來就會遞迴丟進 marked.parse()（見 markdown-cards.js
    // 第 159、200 行），它們的內容行不是「欄位值」，不在本次稽核範圍內。
    if (lang === 'stepper' || lang === 'accordion') continue;
    for (const line of fenceBody.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      const idx = t.indexOf(':');
      // 只看 `key: value` 形式；quickjump/prep/apps 的無 key 行另外處理
      let key, val;
      if (idx > 0 && /^[a-z]+$/.test(t.slice(0, idx))) {
        key = t.slice(0, idx);
        val = t.slice(idx + 1).trim();
      } else {
        key = '(無key行)';
        val = t;
      }
      if (!val) continue;
      totalFields++;

      const parsed = marked.parseInline(val);
      if (parsed !== val) {
        results.push({ file, lang, key, val, parsed, never: NEVER_PARSE.has(key) });
      }
    }
  }
}

// ---- 分類統計 ------------------------------------------------------------
function classify(r) {
  if (r.val.includes('&') && r.parsed.includes('&amp;')) return 'HTML escape (&)';
  if (/[<>]/.test(r.val) && r.parsed.includes('&lt;')) return 'HTML escape (< >)';
  if (r.parsed.includes('<em>') && !r.val.includes('<em>')) return 'Markdown 強調 (* _)';
  if (r.parsed.includes('<strong>') && !r.val.includes('<strong>')) return 'Markdown 粗體 (**)';
  if (r.parsed.includes('<code>')) return 'Markdown 程式碼 (`)';
  if (r.parsed.includes('<a href') && !r.val.includes('<a ')) return 'Markdown 連結 ([]())';
  return '其他';
}

console.log(`掃描 ${totalFields} 個欄位值，其中 ${results.length} 個經 parseInline 後會改變\n`);

const byKind = {};
for (const r of results) {
  const k = classify(r);
  (byKind[k] ||= []).push(r);
}

console.log('=== 依變動原因分類 ===');
for (const [kind, rs] of Object.entries(byKind).sort((a, b) => b[1].length - a[1].length)) {
  const safe = rs.filter((r) => r.never).length;
  console.log(`  ${kind.padEnd(24)} ${String(rs.length).padStart(3)} 筆` +
    (safe ? `（其中 ${safe} 筆在「不解析」白名單內，無風險）` : ''));
}

console.log('\n=== 依欄位名稱分類 ===');
const byKey = {};
for (const r of results) (byKey[`${r.lang}.${r.key}`] ||= []).push(r);
for (const [k, rs] of Object.entries(byKey).sort((a, b) => b[1].length - a[1].length)) {
  const flag = rs[0].never ? ' [不解析白名單]' : '';
  console.log(`  ${k.padEnd(22)} ${String(rs.length).padStart(3)} 筆${flag}`);
}

const risky = results.filter((r) => !r.never);
console.log(`\n=== 真正需要處理的（不在白名單內）：${risky.length} 筆 ===`);
const show = VERBOSE ? risky : risky.slice(0, 12);
for (const r of show) {
  console.log(`\n[${r.lang}.${r.key}] ${r.file}`);
  console.log(`  原始: ${r.val.slice(0, 150)}`);
  console.log(`  解析: ${r.parsed.slice(0, 150)}`);
}
if (!VERBOSE && risky.length > show.length) {
  console.log(`\n… 另有 ${risky.length - show.length} 筆，加 --verbose 看完整清單`);
}
