import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const POSTS_DIR = path.join(__dirname, '../src/posts');
const OUTPUT_JSON = path.join(__dirname, '../public/data/posts.json');

// 確保目標資料夾與輸出 JSON 資料夾存在
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(OUTPUT_JSON))) {
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
}

const files = fs.readdirSync(POSTS_DIR);
const posts = [];

files.forEach(file => {
  const filePath = path.join(POSTS_DIR, file);
  if (fs.statSync(filePath).isDirectory()) return;

  const content = fs.readFileSync(filePath, 'utf8');
  
  // 正則表達式抓取 Front Matter
  const fmMatch = content.match(/^---([\s\S]*?)---/);
  if (!fmMatch) return;

  const fmText = fmMatch[1];
  const metadata = {};
  
  // 基礎 Key-Value 解析
  fmText.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    metadata[key] = val;
  });

  // 解析 YAML 格式 Tags 陣列
  const tags = [];
  let inTagsSection = false;
  
  fmText.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('tags:')) {
      const inlineVal = trimmed.substring(5).trim();
      if (inlineVal && inlineVal !== '[]') {
        if (inlineVal.startsWith('[') && inlineVal.endsWith(']')) {
          inlineVal.slice(1, -1).split(',').forEach(t => {
            const cleanTag = t.trim().replace(/^['"]|['"]$/g, '');
            if (cleanTag) tags.push(cleanTag);
          });
        } else {
          inlineVal.split(',').forEach(t => {
            const cleanTag = t.trim().replace(/^['"]|['"]$/g, '');
            if (cleanTag) tags.push(cleanTag);
          });
        }
      } else {
        inTagsSection = true;
      }
    } else if (inTagsSection) {
      if (trimmed.startsWith('-')) {
        const cleanTag = trimmed.substring(1).trim().replace(/^['"]|['"]$/g, '');
        if (cleanTag) tags.push(cleanTag);
      } else if (trimmed.includes(':') && !trimmed.startsWith('-')) {
        inTagsSection = false;
      }
    }
  });

  // 預先計算閱讀時間 (與原 Jekyll kramdown 除以 300 邏輯對齊)
  const cleanContent = content.replace(/^---[\s\S]*?---/, '').replace(/<\/?[^>]+(>|$)/g, "").trim();
  const charCount = cleanContent.length;
  const minutes = charCount < 300 ? 1 : Math.floor(charCount / 300) + 1;
  const readTime = `閱讀時間約 ${minutes} 分鐘`;

  const id = path.parse(file).name;
  posts.push({
    id,
    title: metadata.title || id,
    subtitle: metadata.subtitle || '',
    date: metadata.date || '',
    background: metadata.background || '',
    tags: tags.filter(Boolean),
    readTime,
    markdownPath: `src/posts/${file}`
  });
});

// 依日期排序 (新 -> 舊)，與 Jekyll posts 排序方式一致
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(posts, null, 2), 'utf8');
console.log(`[build:metadata] Processed ${posts.length} posts. Generated JSON at ${OUTPUT_JSON}`);
