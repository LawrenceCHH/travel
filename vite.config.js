import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/travel/',
  plugins: [
    tailwindcss(),
    swPrecachePlugin()
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        posts: resolve(__dirname, 'posts/index.html'),
        detail: resolve(__dirname, 'posts/detail.html')
      }
    }
  }
});

/**
 * 自訂 Vite 插件：在打包完成時，動態將雜湊化的 tailwind.css 與 scripts.js 寫入 sw.js 中，
 * 並將 src/posts/ 的文章原檔複製到 dist/src/posts/ 以供前端 runtime 讀取。
 */
function swPrecachePlugin() {
  return {
    name: 'sw-precache-plugin',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const assetsDir = resolve(distDir, 'assets');
      
      // 1. 更新 sw.js 預快取清單
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        const cssFile = files.find(f => f.endsWith('.css'));
        const jsFile = files.find(f => f.startsWith('scripts') && f.endsWith('.js'));
        
        const cssPath = cssFile ? `assets/${cssFile}` : 'assets/tailwind.css';
        const jsPath = jsFile ? `assets/${jsFile}` : 'assets/scripts.js';
        
        const swPath = resolve(distDir, 'sw.js');
        if (fs.existsSync(swPath)) {
          let swContent = fs.readFileSync(swPath, 'utf8');
          swContent = swContent.replace(
            /const PRECACHE_URLS = \[[\s\S]*?\];/,
            `const PRECACHE_URLS = [
  BASE,
  BASE + '${cssPath}',
  BASE + '${jsPath}',
  BASE + 'manifest.json',
  BASE + 'components/navbar.html',
  BASE + 'components/footer.html',
  BASE + 'data/posts.json'
];`
          );
          fs.writeFileSync(swPath, swContent, 'utf8');
          console.log(`[swPrecachePlugin] sw.js precache list updated successfully.`);
        }
      }

      // 2. 複製 src/posts 原始文章檔案至 dist/src/posts 供動態 fetch() 使用
      const srcPostsDir = resolve(__dirname, 'src/posts');
      const distPostsDir = resolve(distDir, 'src/posts');
      if (fs.existsSync(srcPostsDir)) {
        fs.mkdirSync(distPostsDir, { recursive: true });
        fs.readdirSync(srcPostsDir).forEach(file => {
          fs.copyFileSync(resolve(srcPostsDir, file), resolve(distPostsDir, file));
        });
        console.log(`[swPrecachePlugin] Copied static posts to ${distPostsDir}`);
      }
    }
  };
}
