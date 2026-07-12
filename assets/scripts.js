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
