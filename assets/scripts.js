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
    btn.className = 'inline-flex w-full justify-between items-center gap-x-1.5 rounded bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm border border-sand hover:bg-sand/30 cursor-pointer focus:outline-none';
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
    menu.className = 'hidden absolute left-0 z-50 mt-2 w-64 max-w-[calc(100vw-2.5rem)] origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-4 transition-all duration-200 opacity-0 scale-95';
    menu.style.transformOrigin = 'top left';

    // Dropdown Content (Scrollable checkbox list, capped at roughly 6 items height)
    menu.innerHTML = `
      <div class="max-h-48 overflow-y-auto space-y-2 pr-1" id="tag-checkbox-list">
      </div>
      
      <!-- Footer actions (Clear on left, Confirm on right) -->
      <div class="flex items-center justify-between border-t border-sand pt-3 mt-3">
        <button type="button" id="clear-tags-btn" class="text-xs font-bold text-muted-text hover:text-primary cursor-pointer focus:outline-none">清除標籤</button>
        <button type="button" id="confirm-tags-btn" class="text-xs font-bold text-muted-text hover:text-primary cursor-pointer focus:outline-none">確定</button>
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
          <input type="checkbox" value="${tag}" class="tag-checkbox rounded text-primary focus:ring-primary cursor-pointer">
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
      <div class="w-full">
        <input type="text" id="search-input" placeholder="搜尋標題 🔍︎" class="w-full rounded border border-sand bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none text-ink shadow-sm">
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
    
    // Hide all items first
    allItems.forEach(item => item.style.display = 'none');
    
    // Reset query page to 1
    setPageUrl(1);
    // Filtering keeps the user where they are (e.g. still typing in the search box
    // above the list) — only explicit pagination navigation should scroll the page.
    render(1, false, false);
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
        baseClass += 'text-gray-300 cursor-not-allowed';
      } else if (isActive) {
        baseClass += 'bg-primary text-white font-bold cursor-default';
      } else {
        baseClass += 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 hover:text-primary active:bg-gray-200';
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
          dots.className = 'px-2 py-2 text-gray-400 text-sm select-none';
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

// 文章大綱 (TOC)：桌機固定側欄 + Scroll Spy／手機頂部速覽 + 浮動按鈕 + 底部抽屜
function initTOC(contentContainer) {
  // 需與 CSS 裡 heading 的 scroll-margin-top 一致，用來扣除 sticky navbar 高度
  const NAV_OFFSET = 96;

  const headings = Array.from(contentContainer.querySelectorAll('h2, h3'));
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
    h.style.scrollMarginTop = '6rem';
  });

  const toc = headings.map(h => ({
    id: h.id,
    text: h.textContent.trim(),
    level: h.tagName === 'H2' ? 2 : 3,
    el: h,
  }));

  buildDesktopSidebar(toc);
  buildMobileOutlineAndSheet(toc, contentContainer);

  // --- 桌機固定側欄 + Scroll Spy（僅在 xl 以上顯示，1024-1279px 沿用行動版） ---
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
      sidebar.appendChild(a);
    });

    document.body.appendChild(sidebar);

    const sidebarLinks = Array.from(sidebar.querySelectorAll('.toc-link'));

    // IntersectionObserver 只當觸發器，真正的「目前章節」由幾何位置重算決定，
    // 避免短小節或多標題同時可見時，用單純 isIntersecting 誤判。
    function updateActive() {
      let currentId = toc[0].id;
      for (const item of toc) {
        if (item.el.getBoundingClientRect().top - NAV_OFFSET <= 0) {
          currentId = item.id;
        } else {
          break;
        }
      }
      // 捲到頁面最底時強制高亮最後一項，避免最後一段太短永遠選不到
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        currentId = toc[toc.length - 1].id;
      }
      sidebarLinks.forEach(a => {
        a.classList.toggle('is-active', a.getAttribute('href') === `#${currentId}`);
      });
    }

    const io = new IntersectionObserver(updateActive, {
      rootMargin: `-${NAV_OFFSET}px 0px -70% 0px`,
      threshold: 0,
    });
    toc.forEach(item => io.observe(item.el));
    // IO 只在標題跨越 rootMargin 邊界時觸發，大幅捲動（例如點擊分頁跳轉、瀏覽器還原捲動位置）
    // 可能在下一次跨越前不會重算，故額外掛一個被動 scroll 監聽當保險，兩者共用同一份幾何判斷。
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
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
      <div class="flex items-center justify-between px-4 pb-2">
        <p class="text-base font-bold text-ink">本文章節</p>
        <button type="button" class="toc-sheet-close p-1 text-muted-text hover:text-primary cursor-pointer" aria-label="關閉">&#10005;</button>
      </div>
      <ul class="toc-sheet-list space-y-1"></ul>
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
      li.appendChild(a);
      sheetList.appendChild(li);
    });

    function openSheet() {
      scrim.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeSheet() {
      scrim.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    fab.addEventListener('click', openSheet);
    sheet.querySelector('.toc-sheet-close').addEventListener('click', closeSheet);
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
});
