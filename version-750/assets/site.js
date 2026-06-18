(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    const wrap = rail.closest('.rail-wrap');
    const left = wrap ? wrap.querySelector('[data-rail-left]') : null;
    const right = wrap ? wrap.querySelector('[data-rail-right]') : null;

    function scrollByCard(direction) {
      rail.scrollBy({
        left: direction * 320,
        behavior: 'smooth'
      });
    }

    if (left) {
      left.addEventListener('click', function () {
        scrollByCard(-1);
      });
    }

    if (right) {
      right.addEventListener('click', function () {
        scrollByCard(1);
      });
    }
  });

  const filterInput = document.querySelector('[data-page-filter]');
  const filterList = document.querySelector('[data-filter-list]');
  const quickFilters = document.querySelector('[data-quick-filters]');

  if (filterInput && filterList) {
    const cards = Array.from(filterList.querySelectorAll('[data-search]'));
    let quickKey = '';

    function applyFilter() {
      const query = (filterInput.value || '').trim().toLowerCase();
      const combined = [query, quickKey].filter(Boolean);

      cards.forEach(function (card) {
        const content = card.getAttribute('data-search') || '';
        const visible = combined.every(function (part) {
          return content.indexOf(part.toLowerCase()) !== -1;
        });
        card.classList.toggle('is-hidden', !visible);
      });
    }

    if (filterInput.hasAttribute('data-query-sync')) {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q');
      if (query) {
        filterInput.value = query;
      }
    }

    filterInput.addEventListener('input', applyFilter);

    if (quickFilters) {
      quickFilters.addEventListener('click', function (event) {
        const button = event.target.closest('[data-filter-key]');
        if (!button) {
          return;
        }
        quickFilters.querySelectorAll('[data-filter-key]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        quickKey = button.getAttribute('data-filter-key') || '';
        applyFilter();
      });
    }

    applyFilter();
  }
}());
