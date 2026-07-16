import { registerCardExtensions } from './markdown-cards.js';
if (typeof window !== 'undefined' && window.marked) registerCardExtensions(window.marked);

function toggleNav() {
  var nav = document.getElementById('navbarResponsive');
  var button = document.querySelector('[aria-controls="navbarResponsive"]');
  var isHidden = nav.classList.contains('hidden');

  if (isHidden) {
    nav.classList.remove('hidden');
    nav.classList.add('flex');
  } else {
    nav.classList.add('hidden');
    nav.classList.remove('flex');
  }

  if (button) {
    button.setAttribute('aria-expanded', String(isHidden));
  }
}
window.toggleNav = toggleNav;

function initPagination({ containerId, paginationId, tagContainerId, searchContainerId, pageSize, itemSelector, forceShow = false }) {
  console.log("initPagination invoked:", { containerId, paginationId, tagContainerId, searchContainerId, pageSize, itemSelector, forceShow });
  const container = document.getElementById(containerId);
  const paginationContainer = document.getElementById(paginationId);
  if (!container) {
    console.warn("initPagination: Container not found:", containerId);
    return;
  }
  if (!paginationContainer) {
    console.warn("initPagination: Pagination container not found:", paginationId);
    return;
  }

  const allItems = Array.from(container.querySelectorAll(itemSelector));
  let filteredItems = allItems;
  let totalItems = filteredItems.length;
  let totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // State for filtering
  let selectedTags = new Set();
  let matchMode = 'OR'; // Multi-select defaults to OR logic
  let searchQuery = '';

  // 1. Gather all unique tags and count their frequency
  const tagCounts = {};
  allItems.forEach(item => {
    // Add data-title attribute dynamically if not present for faster keyword search
    if (!item.getAttribute('data-title')) {
      const link = item.querySelector('a');
      if (link) {
        item.setAttribute('data-title', link.textContent.trim().toLowerCase());
      } else {
        item.setAttribute('data-title', item.textContent.trim().toLowerCase());
      }
    }

    const dataTags = item.getAttribute('data-tags');
    if (dataTags) {
      dataTags.split(',').forEach(tag => {
        const trimmed = tag.trim();
        if (trimmed) {
          tagCounts[trimmed] = (tagCounts[trimmed] || 0) + 1;
        }
      });
    }
  });

  const sortedTags = Object.keys(tagCounts).sort();

  // 2. Render Tag Dropdown if tagContainerId is provided
  if (tagContainerId && sortedTags.length > 0) {
    const tagContainer = document.getElementById(tagContainerId);
    if (tagContainer) {
      renderTagDropdown(tagContainer, sortedTags, tagCounts);
    }
  }

  // 3. Render Search Box if searchContainerId is provided
  if (searchContainerId) {
    const searchContainer = document.getElementById(searchContainerId);
    if (searchContainer) {
      renderSearchBox(searchContainer);
    }
  }

  function renderTagDropdown(tagContainer, tags, counts) {
    tagContainer.innerHTML = '';
    tagContainer.className = 'relative inline-block w-full';
    
    // Create Dropdown Button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'tag-dropdown-btn';
    btn.className = 'inline-flex w-full justify-between items-center gap-x-1.5 rounded bg-surface px-3 py-2 text-sm font-semibold text-ink shadow-sm border border-sand hover:bg-sand/30 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-primary';
    btn.innerHTML = `
      <span>篩選標籤 (<span id="selected-count">0</span>)</span>
      <svg class="h-4 w-4 text-muted-text transition-transform duration-200" id="dropdown-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
      </svg>
    `;
    tagContainer.appendChild(btn);

    // Create Dropdown Menu Wrapper
    const menu = document.createElement('div');
    menu.id = 'tag-dropdown-menu';
    menu.className = 'hidden absolute left-0 z-50 mt-2 w-64 max-w-[calc(100vw-2.5rem)] origin-top-left rounded-md bg-surface shadow-lg ring-1 ring-sand/40 focus:outline-none p-4 transition-all duration-200 opacity-0 scale-95';
    menu.style.transformOrigin = 'top left';

    // Dropdown Content (Scrollable checkbox list, capped at roughly 6 items height)
    menu.innerHTML = `
      <div class="max-h-48 overflow-y-auto space-y-2 pr-1" id="tag-checkbox-list">
      </div>
      
      <!-- Footer actions (Clear on left, Confirm on right) -->
      <div class="flex items-center justify-between border-t border-sand pt-3 mt-3">
        <button type="button" id="clear-tags-btn" class="text-xs font-bold text-muted-text hover:text-primary cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-primary">清除標籤</button>
        <button type="button" id="confirm-tags-btn" class="text-xs font-bold text-muted-text hover:text-primary cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-primary">確定</button>
      </div>
    `;
    tagContainer.appendChild(menu);

    const checkboxList = menu.querySelector('#tag-checkbox-list');

    // Populate Checkbox List
    tags.forEach(tag => {
      const label = document.createElement('label');
      label.className = 'flex items-center justify-between text-xs font-semibold text-ink cursor-pointer hover:bg-sand/30 p-1.5 rounded transition-colors duration-150';
      label.innerHTML = `
        <span class="flex items-center gap-2">
          <input type="checkbox" value="${tag}" class="tag-checkbox rounded text-primary focus:ring-primary cursor-pointer focus-visible:ring-1 focus-visible:ring-primary">
          <span>${tag}</span>
        </span>
        <span class="text-muted-text font-mono">(${counts[tag]})</span>
      `;
      checkboxList.appendChild(label);
    });

    const checkboxes = Array.from(menu.querySelectorAll('.tag-checkbox'));
    const selectedCountSpan = btn.querySelector('#selected-count');

    // Toggle Dropdown logic
    const arrow = btn.querySelector('#dropdown-arrow');
    function openDropdown() {
      // Sync checkbox UI with actual confirmed selectedTags
      checkboxes.forEach(cb => {
        cb.checked = selectedTags.has(cb.value);
      });

      menu.classList.remove('hidden');
      // Force repaint
      menu.offsetHeight;
      menu.classList.remove('opacity-0', 'scale-95');
      menu.classList.add('opacity-100', 'scale-100');
      arrow.style.transform = 'rotate(180deg)';
    }

    function closeDropdown() {
      menu.classList.remove('opacity-100', 'scale-100');
      menu.classList.add('opacity-0', 'scale-95');
      arrow.style.transform = '';
      setTimeout(() => {
        if (menu.classList.contains('opacity-0')) {
          menu.classList.add('hidden');
        }
      }, 200);
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = menu.classList.contains('hidden');
      if (isHidden) {
        openDropdown();
      } else {
        closeDropdown();
      }
    });

    // Prevent closing when clicking inside the menu
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close when clicking outside
    document.addEventListener('click', () => {
      if (!menu.classList.contains('hidden')) {
        closeDropdown();
      }
    });

    // Confirm button click listener
    const confirmBtn = menu.querySelector('#confirm-tags-btn');
    confirmBtn.addEventListener('click', () => {
      selectedTags.clear();
      checkboxes.forEach(cb => {
        if (cb.checked) {
          selectedTags.add(cb.value);
        }
      });
      selectedCountSpan.textContent = selectedTags.size;
      closeDropdown();
      applyFilters();
    });

    // Clear tag button click listener
    const clearBtn = menu.querySelector('#clear-tags-btn');
    clearBtn.addEventListener('click', () => {
      checkboxes.forEach(cb => {
        cb.checked = false;
      });
    });
  }

  function renderSearchBox(searchContainer) {
    searchContainer.innerHTML = `
      <div class="relative w-full">
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="7"></circle>
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"></path>
        </svg>
        <input type="text" id="search-input" placeholder="標題" class="w-full rounded border border-sand bg-surface pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none text-ink shadow-sm">
      </div>
    `;

    const searchInput = searchContainer.querySelector('#search-input');
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  function applyFilters() {
    // Apply tag logic AND keyword search
    filteredItems = allItems.filter(item => {
      // 1. Tag Match
      let tagMatch = true;
      if (selectedTags.size > 0) {
        const itemTagsAttr = item.getAttribute('data-tags') || '';
        const itemTags = itemTagsAttr.split(',').map(t => t.trim()).filter(Boolean);
        
        if (matchMode === 'AND') {
          // All selected tags must be present in itemTags
          tagMatch = Array.from(selectedTags).every(tag => itemTags.includes(tag));
        } else {
          // At least one selected tag must be present in itemTags
          tagMatch = Array.from(selectedTags).some(tag => itemTags.includes(tag));
        }
      }

      // 2. Keyword Match
      let keywordMatch = true;
      if (searchQuery) {
        const title = item.getAttribute('data-title') || '';
        keywordMatch = title.includes(searchQuery);
      }

      return tagMatch && keywordMatch;
    });

    // Recalculate pagination properties
    totalItems = filteredItems.length;
    totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    updateResultCount();

    // Hide all items first
    allItems.forEach(item => item.style.display = 'none');
    
    // Reset query page to 1
    setPageUrl(1);
    // Filtering keeps the user where they are (e.g. still typing in the search box
    // above the list) — only explicit pagination navigation should scroll the page.
    render(1, false, false);
  }

  function updateResultCount() {
    const countEl = document.getElementById('result-count');
    if (countEl) {
      countEl.textContent = filteredItems.length;
    }
  }

  function getCurrentPage() {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;
    return Math.max(1, Math.min(page, totalPages));
  }

  function setPageUrl(page) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.history.pushState({ page }, '', url.pathname + url.search);
  }

  function render(page, isFirstLoad = false, shouldScroll = true) {
    // 1. Loading Pattern: Smooth transitions (fade out, then fade in)
    container.style.transition = 'opacity 0.2s ease-in-out';
    container.style.opacity = '0';

    setTimeout(() => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = page * pageSize;

      // Hide all items
      allItems.forEach(item => item.style.display = 'none');

      // Show only filtered items on the current page
      filteredItems.forEach((item, index) => {
        if (index >= startIndex && index < endIndex) {
          item.style.display = '';
        }
      });

      // Empty state: clear any previous empty-row first, then inject if no results
      const existingEmptyRow = container.querySelector('.toc-empty-row');
      if (existingEmptyRow) existingEmptyRow.remove();
      if (filteredItems.length === 0) {
        container.insertAdjacentHTML('beforeend', `
          <tr class="toc-empty-row"><td class="py-16 text-center text-muted-text" colspan="2">
            <p class="text-base">找不到符合的文章</p>
            <p class="text-sm mt-1">試試調整標籤或清除搜尋關鍵字</p>
          </td></tr>
        `);
      }

      updateResultCount();

      // 2. Scroll Reset
      if (!isFirstLoad && shouldScroll) {
        const offsetTop = container.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: Math.max(0, offsetTop), behavior: 'smooth' });
      }

      container.style.opacity = '1';
      renderPaginationControls(page);
    }, isFirstLoad ? 0 : 200);
  }

  function renderPaginationControls(currentPage) {
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1 && !forceShow) {
      return;
    }
    
    const nav = document.createElement('nav');
    nav.className = 'flex items-center justify-center space-x-1 md:space-x-2 my-8';

    function createButton(label, targetPage, isDisabled, isActive = false) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = label;
      
      let baseClass = 'px-3 py-2 text-sm font-medium rounded transition-colors duration-200 focus:outline-none cursor-pointer ';
      
      if (isDisabled) {
        btn.disabled = true;
        baseClass += 'text-muted opacity-40 cursor-not-allowed';
      } else if (isActive) {
        baseClass += 'bg-primary text-paper font-bold cursor-default';
      } else {
        baseClass += 'text-ink bg-surface border border-sand hover:bg-sand/30 hover:text-primary active:bg-sand/50';
      }

      btn.className = baseClass;

      if (!isDisabled && !isActive) {
        btn.addEventListener('click', () => {
          setPageUrl(targetPage);
          render(targetPage);
        });
      }
      return btn;
    }

    // Boundary Buttons & Directional Buttons
    // << (First), < (Previous)
    nav.appendChild(createButton('&laquo;', 1, currentPage === 1));
    nav.appendChild(createButton('&lsaquo;', currentPage - 1, currentPage === 1));

    const delta = 2;
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }
    
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);
    
    let lastNum = 0;
    uniqueRange.forEach(i => {
      if (lastNum) {
        if (i - lastNum > 1) {
          const dots = document.createElement('span');
          dots.className = 'px-2 py-2 text-muted-text text-sm select-none';
          dots.innerText = '...';
          nav.appendChild(dots);
        }
      }
      
      const isCurrent = (i === currentPage);
      nav.appendChild(createButton(i.toString(), i, false, isCurrent));
      lastNum = i;
    });

    // > (Next), >> (Last)
    nav.appendChild(createButton('&rsaquo;', currentPage + 1, currentPage === totalPages));
    nav.appendChild(createButton('&raquo;', totalPages, currentPage === totalPages));

    paginationContainer.appendChild(nav);
  }

  window.addEventListener('popstate', () => {
    render(getCurrentPage());
  });

  render(getCurrentPage(), true);
}
window.initPagination = initPagination;

/**
 * 將每個 Day 的 H3 章節標題及該天底下的所有景點區塊（.spot-card）
 * 動態打包進一個統一的 .day-section 圓角大卡片容器中，以提升區塊分隔感。
 */
function groupDaySections(container) {
  const children = Array.from(container.children);
  let currentGroup = null;

  for (const child of children) {
    // 檢查是否為 H3 且文字為 Day 開頭，如 "Day 1"
    if (child.tagName === 'H3' && /^Day\s*/i.test(child.textContent.trim())) {
      currentGroup = document.createElement('div');
      currentGroup.className = 'day-section';
      container.insertBefore(currentGroup, child);
      currentGroup.appendChild(child);
    } else if (currentGroup) {
      if (child.tagName === 'HR') {
        // 移除 Day 與 Day 之間的 <hr> 分割線，改用大卡片邊界作為分割
        child.remove();
        currentGroup = null;
      } else if (child.tagName === 'H2') {
        // 遇上主標題 H2（如 美食推薦）時中止群組
        currentGroup = null;
      } else {
        // 將其他景點等內容塞進目前天數的大卡片中
        currentGroup.appendChild(child);
      }
    }
  }
}

// 文章大綱 (TOC)：桌機固定側欄 + Scroll Spy／手機頂部速覽 + 浮動按鈕 + 底部抽屜
function initTOC(contentContainer) {
  // 需與 CSS 裡 heading 的 scroll-margin-top 一致，用來扣除 sticky navbar 高度
  const NAV_OFFSET = 96;

  // 頂部常駐章節分頁列（chapter bar）暫時停用：文章已拆短，右下角 FAB 抽屜已足夠。
  // 程式碼保留，日後要恢復把此旗標改回 true 即可（buildChapterBar 內部邏輯完整未動）。
  const ENABLE_CHAPTER_BAR = false;

  // 僅收「文章區塊層級」的章節標題：Markdown 產生的 h2/h3 是 contentContainer 的直接子節點，
  // 而卡片元件（.emergency-card / .alert-box 等）內部自帶的 <h3> 標題是巢狀子孫，不應混入大綱，
  // 否則像「緊急應變」這種一節內含多張卡片時，TOC 會被救護車/警局/各醫院等卡片標題灌爆。
  const headings = Array.from(contentContainer.querySelectorAll(':scope > h2, :scope > h3'));
  if (headings.length < 2) return; // 0 或 1 個標題時，大綱沒有意義，整組不渲染

  // 1. 指派繁中安全、全域唯一的 slug id（若標題已有 id 則尊重原值不覆寫）
  const usedIds = new Set();
  headings.forEach(h => { if (h.id) usedIds.add(h.id); });

  function slugify(text, index) {
    const base = (text || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}-]+/gu, '') // 保留 Unicode 文字（含中日韓）與數字
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
    let slug = base || `heading-${index}`;
    let unique = slug;
    let n = 1;
    while (usedIds.has(unique)) {
      unique = `${slug}-${n++}`;
    }
    usedIds.add(unique);
    return unique;
  }

  headings.forEach((h, i) => {
    if (!h.id) h.id = slugify(h.textContent, i);
    // scroll-margin-top 改為動態計算（見下方 updateScrollMargins），因為行動版章節
    // 分頁列出現時，標題還需多讓出分頁列的高度，否則會被「navbar + 分頁列」蓋住。
  });

  const toc = headings.map(h => ({
    id: h.id,
    text: h.textContent.trim(),
    level: h.tagName === 'H2' ? 2 : 3,
    el: h,
  }));

  // 所有需要反映「目前章節」高亮的清單（桌機側欄／手機底部抽屜）共用同一份幾何判斷，
  // 避免各自掛 IntersectionObserver／scroll listener 重複計算。
  const activeUpdaters = [];

  function computeCurrentId() {
    let currentId = toc[0].id;
    // 判定門檻須與 scroll-margin 落點一致（見 stickyOffset）：行動版章節分頁列常駐時
    // 要一併扣掉分頁列高度，否則點擊跳轉落地瞬間高亮會慢半拍、停在前一章節。
    const spyOffset = stickyOffset();
    for (const item of toc) {
      // 容許 2px 誤差：錨點跳轉後瀏覽器套用 scroll-margin-top 定位常有次像素捨入
      // （例如落在 96.6px 而非精確 96px），嚴格的 <= 0 會讓剛跳轉抵達的目標標題
      // 判定為「還沒到」，導致抽屜重新開啟時反白停留在前一個標題。
      if (item.el.getBoundingClientRect().top - spyOffset <= 2) {
        currentId = item.id;
      } else {
        break;
      }
    }
    // 捲到頁面最底時強制高亮最後一項，避免最後一段太短永遠選不到
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      currentId = toc[toc.length - 1].id;
    }
    return currentId;
  }

  function updateActive() {
    const currentId = computeCurrentId();
    activeUpdaters.forEach(fn => fn(currentId));
  }

  // 攔截 TOC 連結點擊，改用 scrollIntoView 平滑捲動到定位點（取代瀏覽器原生錨點
  // 瞬間跳轉），並尊重 prefers-reduced-motion；保留 Ctrl/Cmd/Shift 等修飾鍵點擊
  // 開新分頁的原生行為不受影響。
  function smoothJump(e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = e.currentTarget.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  }

  buildDesktopSidebar(toc);
  buildMobileOutlineAndSheet(toc, contentContainer);
  const chapterBar = buildChapterBar(toc);

  // 章節分頁列常駐時，navbar + 分頁列一起佔住視窗頂端。scroll-margin（錨點跳轉落點）
  // 與 scroll-spy 的「目前章節」判定門檻都改用這個實際偏移量，兩者一致 → 點擊跳轉落地即
  // 正確高亮。桌機（>=1280px，分頁列隱藏）維持只需閃避 navbar 的 NAV_OFFSET（96）。
  function stickyOffset() {
    const isDesktop = window.matchMedia('(min-width: 1280px)').matches;
    if (isDesktop || !chapterBar) return NAV_OFFSET;
    const navEl = document.getElementById('mainNav');
    const navHeight = navEl ? navEl.offsetHeight : 64;
    const barHeight = chapterBar.offsetHeight || 0;
    return navHeight + barHeight + 12;
  }

  // 依 stickyOffset() 動態設定所有標題的 scroll-margin-top，避免行動版標題被
  // 「navbar + 分頁列」一起遮住。
  function updateScrollMargins() {
    const marginPx = stickyOffset();
    toc.forEach(item => { item.el.style.scrollMarginTop = `${marginPx}px`; });
  }
  updateScrollMargins();
  window.addEventListener('load', updateScrollMargins);
  window.addEventListener('resize', updateScrollMargins);
  // navbar 是 fetch 注入的非同步元件，initTOC 執行當下高度可能還是 0，補一次延遲重算
  setTimeout(updateScrollMargins, 300);

  // IntersectionObserver 只當觸發器，真正的「目前章節」由幾何位置重算決定，
  // 避免短小節或多標題同時可見時，用單純 isIntersecting 誤判。
  const io = new IntersectionObserver(updateActive, {
    rootMargin: `-${NAV_OFFSET}px 0px -70% 0px`,
    threshold: 0,
  });
  toc.forEach(item => io.observe(item.el));
  // IO 只在標題跨越 rootMargin 邊界時觸發，大幅捲動（例如點擊分頁跳轉、瀏覽器還原捲動位置）
  // 可能在下一次跨越前不會重算，故額外掛一個被動 scroll 監聽當保險，兩者共用同一份幾何判斷。
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  // --- 桌機固定側欄（僅在 xl 以上顯示，1024-1279px 沿用行動版） ---
  function buildDesktopSidebar(toc) {
    const sidebar = document.createElement('nav');
    sidebar.className = 'toc-sidebar hidden xl:block';
    sidebar.setAttribute('aria-label', '本文章節');

    const label = document.createElement('p');
    label.className = 'mb-2 text-xs font-bold tracking-wide text-muted-text';
    label.textContent = '本文章節';
    sidebar.appendChild(label);

    toc.forEach(item => {
      const a = document.createElement('a');
      a.className = 'toc-link';
      a.dataset.level = String(item.level);
      a.href = `#${item.id}`;
      a.textContent = item.text;
      a.addEventListener('click', smoothJump);
      sidebar.appendChild(a);
    });

    document.body.appendChild(sidebar);

    // 側欄預設以 position: absolute 貼在 Banner 下緣（隨頁面捲動），避免一開始就以
    // fixed 蓋在 Banner 文字上；捲動超過該休息位置後才切到 fixed 固定於左側，
    // 效果等同 position: sticky，但因側欄掛載在 document.body、不在文章的 flow
    // 子節點內，無法直接用原生 sticky，故以 scroll 監聽手動切換。
    const masthead = document.querySelector('.masthead');
    const REST_GAP = 32; // Banner 下緣與側欄的間距（px）

    function updatePinnedState() {
      if (!masthead) return;
      const restTop = masthead.getBoundingClientRect().bottom + window.scrollY + REST_GAP;

      // 取得 footer 頂部界線 (優先尋找前面的 HR 分隔線)
      const footerEl = document.querySelector('footer');
      let footerBoundary = footerEl;
      if (footerEl && footerEl.previousElementSibling && footerEl.previousElementSibling.tagName === 'HR') {
        footerBoundary = footerEl.previousElementSibling;
      }

      let isBlockedByFooter = false;
      let blockedTop = 0;

      if (footerBoundary) {
        const footerBoundaryAbsoluteTop = footerBoundary.getBoundingClientRect().top + window.scrollY;
        const sidebarHeight = sidebar.offsetHeight;
        const currentSidebarBottomAbsolute = window.scrollY + NAV_OFFSET + sidebarHeight;
        const limitBottomAbsolute = footerBoundaryAbsoluteTop - REST_GAP;

        if (currentSidebarBottomAbsolute > limitBottomAbsolute) {
          isBlockedByFooter = true;
          blockedTop = limitBottomAbsolute - sidebarHeight;
        }
      }

      if (isBlockedByFooter) {
        sidebar.classList.remove('is-pinned');
        sidebar.style.position = 'absolute';
        sidebar.style.top = `${blockedTop}px`;
      } else {
        const shouldPin = window.scrollY + NAV_OFFSET >= restTop;
        sidebar.classList.toggle('is-pinned', shouldPin);
        if (shouldPin) {
          sidebar.style.position = '';
          sidebar.style.top = '';
        } else {
          sidebar.style.position = 'absolute';
          sidebar.style.top = `${restTop}px`;
        }
      }
    }

    updatePinnedState();
    window.addEventListener('scroll', updatePinnedState, { passive: true });
    window.addEventListener('resize', updatePinnedState);

    const sidebarLinks = Array.from(sidebar.querySelectorAll('.toc-link'));
    activeUpdaters.push(currentId => {
      sidebarLinks.forEach(a => {
        const isActive = a.getAttribute('href') === `#${currentId}`;
        a.classList.toggle('is-active', isActive);
        if (isActive) {
          // 當前項目高亮時，自動滾動側欄以確保其顯示在可見範圍內
          const containerTop = sidebar.scrollTop;
          const containerBottom = containerTop + sidebar.clientHeight;
          const elemTop = a.offsetTop;
          const elemBottom = elemTop + a.offsetHeight;

          if (elemTop < containerTop) {
            sidebar.scrollTop = elemTop;
          } else if (elemBottom > containerBottom) {
            sidebar.scrollTop = elemBottom - sidebar.clientHeight;
          }
        }
      });
    });
  }

  // --- 手機/平板（<1280px）：頂部速覽區塊 + 浮動按鈕 + 底部抽屜 ---
  function buildMobileOutlineAndSheet(toc, contentContainer) {
    const topLevelItems = toc.filter(item => item.level === 2);

    // 1. 文章開頭的靜態大綱區塊（僅列 h2，無巢狀、無 scroll-spy）
    let outline = null;
    if (topLevelItems.length > 0) {
      outline = document.createElement('nav');
      outline.className = 'toc-outline not-prose my-2 rounded-md border border-sand bg-paper/60 p-4 xl:hidden';
      outline.setAttribute('aria-label', '章節速覽');

      const label = document.createElement('p');
      label.className = 'mb-2 text-sm font-bold text-ink';
      label.textContent = '本文章節';
      outline.appendChild(label);

      const list = document.createElement('ul');
      list.className = 'space-y-1';
      topLevelItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'text-sm text-primary no-underline hover:underline';
        a.href = `#${item.id}`;
        a.textContent = item.text;
        a.addEventListener('click', smoothJump);
        li.appendChild(a);
        list.appendChild(li);
      });
      outline.appendChild(list);

      contentContainer.insertBefore(outline, contentContainer.firstChild);
    }

    // 2. 浮動按鈕：捲過大綱區塊後淡入
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'toc-fab xl:hidden';
    fab.setAttribute('aria-label', '開啟章節目錄');
    fab.innerHTML = `
      <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"></path>
      </svg>
    `;
    document.body.appendChild(fab);

    const fabSentinel = outline || toc[0].el;
    const fabIO = new IntersectionObserver(([entry]) => {
      const scrolledPast = entry.boundingClientRect.bottom < NAV_OFFSET;
      fab.classList.toggle('is-visible', !entry.isIntersecting && scrolledPast);
    }, { threshold: 0 });
    fabIO.observe(fabSentinel);

    // 3. 底部抽屜 (Bottom Sheet)：完整 h2+h3 清單
    const scrim = document.createElement('div');
    scrim.className = 'toc-sheet-scrim xl:hidden';
    scrim.setAttribute('role', 'dialog');
    scrim.setAttribute('aria-modal', 'true');
    scrim.setAttribute('aria-label', '本文章節');

    const sheet = document.createElement('div');
    sheet.className = 'toc-sheet';
    sheet.innerHTML = `
      <div class="flex justify-center pt-3 pb-1">
        <span class="h-1.5 w-10 rounded-full bg-sand"></span>
      </div>
      <div class="px-5 pb-3">
        <p class="text-base font-bold text-ink">本文章節</p>
      </div>
      <ul class="toc-sheet-list"></ul>
    `;
    scrim.appendChild(sheet);
    document.body.appendChild(scrim);

    const sheetList = sheet.querySelector('.toc-sheet-list');
    toc.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'toc-link';
      a.dataset.level = String(item.level);
      a.href = `#${item.id}`;
      a.textContent = item.text;
      a.addEventListener('click', smoothJump);
      li.appendChild(a);
      sheetList.appendChild(li);
    });

    const sheetLinks = Array.from(sheetList.querySelectorAll('.toc-link'));
    activeUpdaters.push(currentId => {
      sheetLinks.forEach(a => {
        a.classList.toggle('is-active', a.getAttribute('href') === `#${currentId}`);
      });
    });

    function openSheet() {
      scrim.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      // 開啟時把目前章節（.is-active）捲到清單中央，免得使用者剛從分頁列跳轉過來、
      // 開抽屜卻停在頂端還要手動找。先 updateActive() 確保 is-active 反映當前捲動位置，
      // 再用 rect 相對差值置中（對 sheet 的 translateY 平移免疫）。
      updateActive();
      requestAnimationFrame(() => {
        const active = sheetList.querySelector('.toc-link.is-active');
        if (!active) return;
        const linkRect = active.getBoundingClientRect();
        const listRect = sheetList.getBoundingClientRect();
        const delta = (linkRect.top - listRect.top)
          - (sheetList.clientHeight - active.offsetHeight) / 2;
        sheetList.scrollTop += delta;
      });
    }
    function closeSheet() {
      scrim.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    fab.addEventListener('click', openSheet);
    // 已移除 X 關閉按鈕，頂端 grabber 拖曳條為主要關閉提示（下滑手勢）
    // 關閉方式 1：點擊遮罩本體（不含 sheet 自身冒泡上來的點擊）
    scrim.addEventListener('click', (e) => {
      if (e.target === scrim) closeSheet();
    });
    // 關閉方式 2：點擊任一連結，跳轉交給預設 hash 行為
    sheetList.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeSheet();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && scrim.classList.contains('is-open')) closeSheet();
    });

    // 關閉方式 3：下滑手勢（僅在清單已捲到頂端時才允許拖曳關閉，避免與內部捲動衝突）
    let startY = null;
    sheet.addEventListener('touchstart', (e) => {
      if (sheetList.scrollTop > 0) {
        startY = null;
        return;
      }
      startY = e.touches[0].clientY;
      sheet.style.transition = 'none';
    }, { passive: true });
    sheet.addEventListener('touchmove', (e) => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    sheet.addEventListener('touchend', (e) => {
      if (startY === null) return;
      const dy = e.changedTouches[0].clientY - startY;
      sheet.style.transition = '';
      sheet.style.transform = '';
      if (dy > 80) closeSheet();
      startY = null;
    });
  }

  // --- 行動版/平板（<1280px）：常駐章節分頁列（navbar 正下方橫向捲動膠囊列） ---
  // 與桌機側欄互斥（>=1280px 用 xl:hidden 隱藏），與手機頂部靜態速覽／FAB／Bottom Sheet
  // 並存不衝突：分頁列固定在頂部、FAB 固定在右下，z-index（40）低於 Bottom Sheet 的
  // scrim/sheet（50），抽屜開啟時仍蓋在分頁列之上。
  function buildChapterBar(toc) {
    if (!ENABLE_CHAPTER_BAR) return null;
    const chapterItems = toc.filter(item => item.level === 2);
    if (chapterItems.length < 2) return null; // 少於 2 個 H2 時分頁列沒有意義，不建立

    // H2 原文任一超過 6 字，代表這篇的章節標題是長句/編號式（如「1. 緒論」「🛑 第一部分：…」），
    // 不適合塞進橫向膠囊分頁列（會被 shortLabel 砍成「1.」「🛑」這類無意義標籤），整條不建立，
    // 手機版仍有頂部靜態速覽＋FAB 抽屜可用。量測 H2 原文而非 shortLabel 輸出（見 current.md 說明）。
    const TAB_MAX_CHARS = 6;
    if (chapterItems.some(item => [...item.text.trim()].length > TAB_MAX_CHARS)) return null;

    // 由 H2 全文衍生短標籤：去掉全形/半形括號附註，並只取空白或｜/| 分隔前的第一段，
    // 通用規則、不寫死任何本篇文字（例如「出發前準備（主辦人專區）」→「出發前準備」）。
    function shortLabel(text) {
      const stripped = text
        .replace(/[（(][^）)]*[）)]/g, '')
        .split(/[\s｜|]/)[0]
        .trim();
      return stripped || text;
    }

    const bar = document.createElement('nav');
    bar.className = 'chapter-bar bg-surface/90 backdrop-blur-sm border-b border-sand xl:hidden';
    bar.setAttribute('aria-label', '本文章節分頁');

    const scroller = document.createElement('div');
    scroller.className = 'chapter-bar-scroller flex items-center gap-2 overflow-x-auto mx-auto max-w-3xl px-5 py-2.5';
    bar.appendChild(scroller);

    chapterItems.forEach(item => {
      const a = document.createElement('a');
      a.className = 'chapter-pill';
      a.href = `#${item.id}`;
      a.textContent = shortLabel(item.text);
      a.addEventListener('click', smoothJump);
      scroller.appendChild(a);
    });

    document.body.appendChild(bar);

    // 定位：fixed 貼在 navbar 下緣。navbar 是 DOMContentLoaded 後才 fetch 注入的元件，
    // initTOC 執行當下 offsetHeight 可能還是 0，故用 measure() 搭配 load/resize/延遲重算。
    function measure() {
      const navEl = document.getElementById('mainNav');
      const navHeight = navEl ? navEl.offsetHeight : 64; // 找不到 navbar 時的合理預設值
      bar.style.top = `${navHeight}px`;
    }
    measure();
    window.addEventListener('load', measure);
    window.addEventListener('resize', measure);
    setTimeout(measure, 300);

    // 捲過 Banner（.masthead）下緣後才淡入，避免一開始就疊在 Hero 標題上；
    // 找不到 masthead（理論上文章頁一定有）則退回一個固定門檻。
    const masthead = document.querySelector('.masthead');
    const APPEAR_FALLBACK = 200;
    function updateVisibility() {
      const threshold = masthead
        ? masthead.getBoundingClientRect().bottom + window.scrollY
        : APPEAR_FALLBACK;
      bar.classList.toggle('is-visible', window.scrollY > threshold);
    }
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);

    // 目前章節高亮：computeCurrentId() 可能回傳 h3 的 id，分頁列只有 H2，
    // 故往回找 toc 陣列中最近的前一個 level===2 項目對應的膠囊。
    const pills = Array.from(scroller.querySelectorAll('.chapter-pill'));
    activeUpdaters.push(currentId => {
      const currentIndex = toc.findIndex(item => item.id === currentId);
      let parentH2Id = chapterItems[0].id;
      for (let i = currentIndex; i >= 0; i--) {
        if (toc[i].level === 2) {
          parentH2Id = toc[i].id;
          break;
        }
      }
      pills.forEach(a => {
        const isActive = a.getAttribute('href') === `#${parentH2Id}`;
        a.classList.toggle('is-active', isActive);
        if (isActive) {
          // 比照桌機側欄的作法，讓 active 膠囊自動水平捲入可見範圍
          const containerLeft = scroller.scrollLeft;
          const containerRight = containerLeft + scroller.clientWidth;
          const elemLeft = a.offsetLeft;
          const elemRight = elemLeft + a.offsetWidth;
          if (elemLeft < containerLeft) {
            scroller.scrollLeft = elemLeft;
          } else if (elemRight > containerRight) {
            scroller.scrollLeft = elemRight - scroller.clientWidth;
          }
        }
      });
    });

    return bar;
  }

  // 3. 動態群組天數與景點為日式大卡片區塊
  groupDaySections(contentContainer);
}
window.initTOC = initTOC;

// 附加元件動態載入與 PWA 註冊邏輯
document.addEventListener("DOMContentLoaded", function() {
  const base = '/travel/';
  
  // 1. 動態加載導航列
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    fetch(`${base}components/navbar.html`)
      .then(res => {
        if (!res.ok) throw new Error('Navbar load failed');
        return res.text();
      })
      .then(html => {
        navbarPlaceholder.outerHTML = html;
        // 反白當前頁面連結
        const currentPath = window.location.pathname;
        document.querySelectorAll('#mainNav a').forEach(link => {
          const href = link.getAttribute('href');
          if (href && (currentPath === href || currentPath === href + 'index.html')) {
            link.classList.add('text-primary');
          }
        });
      })
      .catch(err => console.error(err));
  }

  // 2. 動態加載頁尾
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    fetch(`${base}components/footer.html`)
      .then(res => {
        if (!res.ok) throw new Error('Footer load failed');
        return res.text();
      })
      .then(html => {
        footerPlaceholder.outerHTML = html;
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
          yearSpan.textContent = new Date().getFullYear();
        }
        // 動態加載完成後，觸發 scroll 事件以使 TOC 重新計算與 footer 的相對位置
        window.dispatchEvent(new Event('scroll'));
      })
      .catch(err => console.error(err));
  }

  // 3. 註冊與清理 PWA Service Worker
  if ('serviceWorker' in navigator) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // 本地開發環境：自動註銷已存在的 Service Worker，防止快取干擾 Vite HMR
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
          registration.unregister().then(function(success) {
            if (success) {
              console.log("[Dev Mode] Unregistered legacy service worker to prevent caching issues.");
              // 清除所有舊快取
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (let name of names) {
                    caches.delete(name);
                  }
                });
              }
              // 自動重載以載入全新資源
              window.location.reload();
            }
          });
        }
      });
    } else {
      // 生產環境：正常註冊 Service Worker
      navigator.serviceWorker.register(`${base}sw.js`).catch(err => {
        console.warn("ServiceWorker registration failed:", err);
      });
    }
  }

  // 4. 自動展開被點擊錨點的 <details> 區塊，並支援直接連結跳轉
  document.addEventListener('click', function(e) {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href')?.startsWith('#')) {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        const details = target.tagName === 'DETAILS' ? target : target.closest('details');
        if (details) {
          details.open = true;
        }
      }
    }
  });

  const initialHash = window.location.hash;
  if (initialHash) {
    const targetId = initialHash.slice(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const details = targetEl.tagName === 'DETAILS' ? targetEl : targetEl.closest('details');
      if (details) {
        details.open = true;
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }
});
