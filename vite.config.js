import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://lawrencechh.github.io/travel/';

export default defineConfig({
  base: '/travel/',
  plugins: [
    tailwindcss(),
    swPrecachePlugin(),
    watchPostsMetadataPlugin(),
    generatePostPagesPlugin(),
    generateSeoFilesPlugin(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contact: resolve(__dirname, 'contact.html'),
        notFound: resolve(__dirname, '404.html'),
        posts: resolve(__dirname, 'posts/index.html'),
        detail: resolve(__dirname, 'posts/detail.html'),
      },
    },
  },
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

      // 1. 更新 sw.js 預快取清單與 CACHE_NAME
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        const cssFile = files.find((f) => f.endsWith('.css'));
        const jsFile = files.find((f) => f.startsWith('scripts') && f.endsWith('.js'));

        const cssPath = cssFile ? `assets/${cssFile}` : 'assets/tailwind.css';
        const jsPath = jsFile ? `assets/${jsFile}` : 'assets/scripts.js';

        // 2026-07-26 / 2026-09-25：CACHE_NAME 不再手動遞增版本號，改由打包產出實際衍生出短雜湊當版本後綴。
        // 雜湊來源涵蓋：
        // 1. 打包後 CSS/JS 檔名（含 Vite 內容雜湊）
        // 2. public/img/ 全部檔案內容（避免換圖未改名時訪客卡在 cache-first 舊圖）
        // 3. src/posts/ 全部文章 Markdown 內容與檔名（文章新增或修改時自動換版）
        // 4. public/data/posts.json 索引資料內容（確保標題/日期/元資料更新時自動換版）
        const hash = crypto.createHash('md5');
        hash.update(`${cssFile || ''}|${jsFile || ''}`);
        hashDirectoryInto(hash, resolve(__dirname, 'public/img'));
        hashDirectoryInto(hash, resolve(__dirname, 'src/posts'));
        const postsJsonPath = resolve(__dirname, 'public/data/posts.json');
        if (fs.existsSync(postsJsonPath)) {
          hash.update(fs.readFileSync(postsJsonPath));
        }
        const cacheHash = hash.digest('hex').slice(0, 8);
        const cacheName = `clean-blog-${cacheHash}`;

        const swPath = resolve(distDir, 'sw.js');
        if (fs.existsSync(swPath)) {
          let swContent = fs.readFileSync(swPath, 'utf8');
          swContent = swContent.replace(/const CACHE_NAME = '[^']*';/, `const CACHE_NAME = '${cacheName}';`);
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
];`,
          );
          fs.writeFileSync(swPath, swContent, 'utf8');
          console.log(`[swPrecachePlugin] sw.js precache list and CACHE_NAME (${cacheName}) updated successfully.`);
        }
      }

      // 2. 複製 src/posts 原始文章檔案至 dist/src/posts 供動態 fetch() 使用
      const srcPostsDir = resolve(__dirname, 'src/posts');
      const distPostsDir = resolve(distDir, 'src/posts');
      if (fs.existsSync(srcPostsDir)) {
        fs.mkdirSync(distPostsDir, { recursive: true });
        fs.readdirSync(srcPostsDir).forEach((file) => {
          fs.copyFileSync(resolve(srcPostsDir, file), resolve(distPostsDir, file));
        });
        console.log(`[swPrecachePlugin] Copied static posts to ${distPostsDir}`);
      }
    },
  };
}

/**
 * 遞迴讀取目錄下所有檔案內容，餵進同一個 hash 物件（依檔名排序，確保結果穩定可重現）。
 */
function hashDirectoryInto(hash, dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      hashDirectoryInto(hash, entryPath);
    } else {
      hash.update(entry.name);
      hash.update(fs.readFileSync(entryPath));
    }
  }
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c],
  );
}

/**
 * 自訂 Vite 插件：建置完成後，為每篇文章多產生一份靜態頁 dist/posts/<id>.html，
 * 複製自已打包完成的 dist/posts/detail.html（已含正確雜湊化 CSS/JS 連結），並注入該篇文章
 * 真實的 <title>/description/OG/Twitter meta 與已知封面圖。社群爬蟲（LINE/FB/Twitter）不
 * 執行 JS，讀不到原本要等 posts.json fetch 完成才動態寫入的內容，見 doc/project.md 第一部分
 * 「SEO／社群分享中繼資料」一節。真人訪客走的仍是與 detail.html 完全相同的 client-side
 * 渲染邏輯，只是文章 id 改由注入的 window.__PRESET_POST_ID__ 提供，不必依賴 ?id= 查詢字串；
 * 舊的 detail.html?id=xxx 連結格式不受影響，繼續正常運作。
 */
function generatePostPagesPlugin() {
  return {
    name: 'generate-post-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || '';
        const [pathname, search] = rawUrl.split('?');
        let decodedPathname;
        try {
          decodedPathname = decodeURIComponent(pathname);
        } catch {
          decodedPathname = pathname;
        }

        const match = decodedPathname.match(/^(?:\/travel)?\/posts\/([^/]+)\.html$/);
        if (match) {
          const id = match[1];
          if (id !== 'index' && id !== 'detail') {
            req.url = `/travel/posts/detail.html${search ? `?${search}` : ''}`;
          }
        }
        next();
      });
    },
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const detailPath = resolve(distDir, 'posts/detail.html');
      const postsJsonPath = resolve(distDir, 'data/posts.json');
      if (!fs.existsSync(detailPath) || !fs.existsSync(postsJsonPath)) return;

      const template = fs.readFileSync(detailPath, 'utf8');
      const posts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf8'));

      posts.forEach((post) => {
        const title = escapeHtml(post.title);
        const description = escapeHtml(post.subtitle || `${post.title} — 旅遊指南文章`);
        const pageUrl = `${SITE_URL}posts/${encodeURIComponent(post.id)}.html`;
        // 逐段 encode 路徑（保留 /），避免中文檔名（如 img/posts/三清洞.jpg）在社群爬蟲的
        // HTTP client 端被當成非法字元；瀏覽器對 CSS url() 較寬容，但爬蟲多半用嚴格的 URL parser。
        const imageUrl = post.background
          ? `${SITE_URL}${post.background.replace(/^\//, '').split('/').map(encodeURIComponent).join('/')}`
          : '';

        let html = template.replace(
          '<title>文章載入中... - 旅遊指南</title>',
          [
            `<title>${title} - 旅遊指南</title>`,
            `<meta name="description" content="${description}">`,
            `<link rel="canonical" href="${pageUrl}">`,
            '<meta property="og:type" content="article">',
            `<meta property="og:title" content="${title}">`,
            `<meta property="og:description" content="${description}">`,
            `<meta property="og:url" content="${pageUrl}">`,
            imageUrl ? `<meta property="og:image" content="${imageUrl}">` : '',
            `<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}">`,
          ]
            .filter(Boolean)
            .join('\n  '),
        );

        // 已知封面圖，直接寫死 header 背景，取代原本要等 fetch 完成才套用的邏輯，
        // 順便讓這個頁面不再需要 detail.html 開頭那段搶跑用的 bg query string inline script。
        if (imageUrl) {
          html = html.replace("url('/travel/img/bg-post.jpg')", `url('${imageUrl}')`);
        }

        // 注意：此時讀的是「Vite build 完成後」的 detail.html，<script type="module"
        // src="/assets/scripts.js"> 早已被改寫成帶雜湊檔名與 crossorigin 屬性的實際標籤
        // （如 <script type="module" crossorigin src="/travel/assets/scripts-XXXX.js">），
        // 逐字比對會找不到而靜默失敗、注入不到 preset id；改成插在 <body> 開頭，不依賴
        // Vite 產生的確切標籤字串。
        html = html.replace(
          '<body>',
          `<body>\n  <script>window.__PRESET_POST_ID__ = ${JSON.stringify(post.id)};</script>`,
        );

        fs.writeFileSync(resolve(distDir, 'posts', `${post.id}.html`), html, 'utf8');
      });

      console.log(`[generatePostPagesPlugin] Generated ${posts.length} static post pages with OG meta.`);
    },
  };
}

/**
 * 自訂 Vite 插件：建置完成後產生 dist/sitemap.xml（列出首頁／文章目錄／聯絡頁／每篇文章的
 * posts/<id>.html 專屬網址）與 dist/robots.txt（允許全站爬取＋指向 sitemap）。
 */
function generateSeoFilesPlugin() {
  return {
    name: 'generate-seo-files',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const postsJsonPath = resolve(distDir, 'data/posts.json');
      if (!fs.existsSync(postsJsonPath)) return;

      const posts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf8'));

      const staticUrls = [SITE_URL, `${SITE_URL}posts/`, `${SITE_URL}contact.html`];
      const postUrls = posts.map((post) => `${SITE_URL}posts/${encodeURIComponent(post.id)}.html`);
      const urlEntries = [...staticUrls, ...postUrls]
        .map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`)
        .join('\n');

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
      fs.writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap, 'utf8');

      const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`;
      fs.writeFileSync(resolve(distDir, 'robots.txt'), robots, 'utf8');

      console.log(`[generateSeoFilesPlugin] Generated sitemap.xml (${postUrls.length} posts) and robots.txt.`);
    },
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
              path: '*',
            });
            console.log('[watch-posts-metadata] 索引已更新並完成熱重載。');
          });
        }, 200);
      };

      server.watcher.on('add', rebuildMetadata);
      server.watcher.on('change', rebuildMetadata);
      server.watcher.on('unlink', rebuildMetadata);
    },
  };
}
