// 建立一份已註冊卡片 DSL（markdown-cards.js）與純 Markdown 形狀轉換層
// （markdown-sections.js）擴充的 Marked 實例。Node（generate-posts-metadata.js／
// verify-post-render.mjs）與瀏覽器（scripts.js）三處都呼叫這裡建立各自的實例，
// 避免各自重複維護一份「new Marked() + 兩個 register 呼叫」的樣板（doc/project.md 待辦 S3）。
import { Marked } from 'marked';
import { registerCardExtensions } from './markdown-cards.js';
import { registerSectionExtensions } from './markdown-sections.js';

export function createMarked() {
  const marked = new Marked();
  registerCardExtensions(marked);
  registerSectionExtensions(marked);
  return marked;
}
