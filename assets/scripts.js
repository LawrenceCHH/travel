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
  let matchMode = 'AND'; // 'AND' or 'OR'
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
    tagContainer.className = 'relative inline-block text-left';
    
    // Create Dropdown Button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'tag-dropdown-btn';
    btn.className = 'inline-flex w-48 justify-between items-center gap-x-1.5 rounded bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 cursor-pointer focus:outline-none';
    btn.innerHTML = `
      <span>篩選標籤 (<span id="selected-count">0</span>)</span>
      <svg class="h-4 w-4 text-gray-400 transition-transform duration-200" id="dropdown-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
      </svg>
    `;
    tagContainer.appendChild(btn);

    // Create Dropdown Menu Wrapper
    const menu = document.createElement('div');
    menu.id = 'tag-dropdown-menu';
    menu.className = 'hidden absolute left-0 z-50 mt-2 w-72 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-4 transition-all duration-200 opacity-0 scale-95';
    menu.style.transformOrigin = 'top left';
    
    // Dropdown Content
    menu.innerHTML = `
      <!-- Logic Mode Toggle -->
      <div class="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
        <span class="text-xs font-bold text-gray-500">比對模式：</span>
        <div class="flex items-center gap-3">
          <label class="inline-flex items-center text-xs font-semibold text-gray-700 cursor-pointer">
            <input type="radio" name="matchMode" value="AND" checked class="mr-1.5 text-primary focus:ring-primary cursor-pointer">
            全部符合 (AND)
          </label>
          <label class="inline-flex items-center text-xs font-semibold text-gray-700 cursor-pointer">
            <input type="radio" name="matchMode" value="OR" class="mr-1.5 text-primary focus:ring-primary cursor-pointer">
            任一符合 (OR)
          </label>
        </div>
      </div>
      
      <!-- Checkbox List -->
      <div class="max-h-60 overflow-y-auto space-y-2 pr-1" id="tag-checkbox-list">
      </div>
      
      <!-- Footer actions -->
      <div class="flex items-center justify-between border-t border-gray-100 pt-3 mt-3">
        <button type="button" id="clear-tags-btn" class="text-xs font-bold text-gray-500 hover:text-primary cursor-pointer focus:outline-none">清除全部</button>
        <span class="text-xs text-gray-400" id="total-tags-stat">共 ${tags.length} 個標籤</span>
      </div>
    `;
    tagContainer.appendChild(menu);

    const checkboxList = menu.querySelector('#tag-checkbox-list');

    // Populate Checkbox List
    tags.forEach(tag => {
      const label = document.createElement('label');
      label.className = 'flex items-center justify-between text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors duration-150';
      label.innerHTML = `
        <span class="flex items-center gap-2">
          <input type="checkbox" value="${tag}" class="tag-checkbox rounded text-primary focus:ring-primary cursor-pointer">
          <span>${tag}</span>
        </span>
        <span class="text-gray-400 font-mono">(${counts[tag]})</span>
      `;
      checkboxList.appendChild(label);
    });

    // Toggle Dropdown logic
    const arrow = btn.querySelector('#dropdown-arrow');
    function openDropdown() {
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

    // Checkbox changed event listener
    const checkboxes = Array.from(menu.querySelectorAll('.tag-checkbox'));
    const selectedCountSpan = btn.querySelector('#selected-count');

    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          selectedTags.add(cb.value);
        } else {
          selectedTags.delete(cb.value);
        }
        selectedCountSpan.textContent = selectedTags.size;
        applyFilters();
      });
    });

    // Match mode (radio) change listener
    const matchRadios = menu.querySelectorAll('input[name="matchMode"]');
    matchRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        matchMode = e.target.value;
        applyFilters();
      });
    });

    // Clear all button click listener
    const clearBtn = menu.querySelector('#clear-tags-btn');
    clearBtn.addEventListener('click', () => {
      checkboxes.forEach(cb => {
        cb.checked = false;
      });
      selectedTags.clear();
      selectedCountSpan.textContent = 0;
      applyFilters();
    });
  }

  function renderSearchBox(searchContainer) {
    searchContainer.innerHTML = `
      <div class="relative w-full max-w-xs">
        <input type="search" id="search-input" placeholder="搜尋文章標題..." class="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:border-primary focus:outline-none text-gray-800 shadow-sm">
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
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
    render(1);
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

  function render(page, isFirstLoad = false) {
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
      if (!isFirstLoad) {
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

