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

function initPagination({ containerId, paginationId, tagContainerId, pageSize, itemSelector, forceShow = false }) {
  console.log("initPagination invoked:", { containerId, paginationId, tagContainerId, pageSize, itemSelector, forceShow });
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
  let activeTag = null;

  // Render Tag Filter Bar if tagContainerId is provided
  if (tagContainerId) {
    const tagContainer = document.getElementById(tagContainerId);
    if (tagContainer) {
      // Gather unique tags
      const tagSet = new Set();
      allItems.forEach(item => {
        const dataTags = item.getAttribute('data-tags');
        if (dataTags) {
          dataTags.split(',').forEach(tag => {
            const trimmed = tag.trim();
            if (trimmed) tagSet.add(trimmed);
          });
        }
      });
      
      const uniqueTags = Array.from(tagSet).sort();
      if (uniqueTags.length > 0) {
        renderTagFilter(tagContainer, uniqueTags);
      }
    }
  }

  function renderTagFilter(tagContainer, tags) {
    tagContainer.innerHTML = '';
    tagContainer.className = 'flex flex-wrap gap-2 mb-8 justify-center';
    
    // Add "All" button
    const allBtn = createTagButton('全部', null, true);
    tagContainer.appendChild(allBtn);
    
    tags.forEach(tag => {
      const btn = createTagButton(tag, tag, false);
      tagContainer.appendChild(btn);
    });

    function createTagButton(label, tagValue, isDefaultActive) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      
      const activeClass = 'px-3 py-1.5 text-xs font-semibold rounded-full bg-primary text-white transition-colors duration-200 cursor-pointer';
      const inactiveClass = 'px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 cursor-pointer';
      
      btn.className = isDefaultActive ? activeClass : inactiveClass;
      
      btn.addEventListener('click', () => {
        // Toggle active style
        Array.from(tagContainer.querySelectorAll('button')).forEach(b => {
          b.className = inactiveClass;
        });
        btn.className = activeClass;
        
        // Filter items
        activeTag = tagValue;
        if (activeTag) {
          filteredItems = allItems.filter(item => {
            const dataTags = item.getAttribute('data-tags') || '';
            const itemTags = dataTags.split(',').map(t => t.trim());
            return itemTags.includes(activeTag);
          });
        } else {
          filteredItems = allItems;
        }
        
        // Recalculate pagination properties
        totalItems = filteredItems.length;
        totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        
        // Hide all items first, then render page 1 of the filtered items
        allItems.forEach(item => item.style.display = 'none');
        
        // Reset query page to 1
        setPageUrl(1);
        render(1);
      });
      
      return btn;
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

