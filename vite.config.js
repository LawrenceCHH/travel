import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/travel/',
  plugins: [
    tailwindcss(),
    swPrecachePlugin(),
    watchPostsMetadataPlugin()
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

/**
 * 自訂 Vite 插件：在開發模式下監聽 src/posts/ 的變動，
 * 自動執行 npm run build:metadata 更新 posts.json，並觸發頁面重載。
 */
function watchPostsMetadataPlugin() {
  let timer = null;
  return {
    name: 'watch-posts-metadata',
    configureServer(server) {
      const postsDir = resolve(__dirname, 'src/posts');
      
      // 確保目錄存在
      if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
      }
      
      server.watcher.add(postsDir);
      
      const rebuildMetadata = (filePath) => {
        // 僅針對 md 與 html 文章變動進行反應
        if (!filePath.endsWith('.md') && !filePath.endsWith('.html')) return;
        
        // 使用防抖動限制，避免多個檔案同時變動（如複製整個資料夾）導致多次重複執行
        clearTimeout(timer);
        timer = setTimeout(() => {
          console.log(`[watch-posts-metadata] 文章變動: ${filePath}，正在重新編譯元資料...`);
          exec('node scripts/generate-posts-metadata.js', (err, stdout, stderr) => {
            if (err) {
              console.error('[watch-posts-metadata] 重新編譯失敗:', err);
              return;
            }
            if (stdout) console.log(stdout.trim());
            if (stderr) console.error(stderr.trim());
            
            // 觸發全頁熱重載
            server.ws.send({
              type: 'full-reload',
              path: '*'
            });
            console.log('[watch-posts-metadata] 索引已更新並完成熱重載。');
          });
        }, 200);
      };

      server.watcher.on('add', rebuildMetadata);
      server.watcher.on('change', rebuildMetadata);
      server.watcher.on('unlink', rebuildMetadata);
    }
  };
}

