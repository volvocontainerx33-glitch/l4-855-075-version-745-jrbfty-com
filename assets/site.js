(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.getElementById('site-menu');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function rootPrefix() {
    const path = window.location.pathname;
    if (path.indexOf('/movies/') !== -1 || path.indexOf('/categories/') !== -1) {
      return '../';
    }
    return './';
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function renderSearch(form, query) {
    const panel = form.querySelector('[data-search-results]');
    if (!panel) {
      return;
    }
    const data = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];
    const prefix = rootPrefix();
    const keyword = normalize(query);
    panel.innerHTML = '';

    if (!keyword) {
      panel.classList.remove('is-open');
      return;
    }

    const matches = data.filter(function (item) {
      return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.category + ' ' + item.tags).indexOf(keyword) !== -1;
    }).slice(0, 10);

    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'search-result';
      empty.innerHTML = '<span></span><strong>没有找到匹配影片</strong><em></em>';
      panel.appendChild(empty);
      panel.classList.add('is-open');
      return;
    }

    matches.forEach(function (item) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = prefix + item.url;
      link.innerHTML = '<img src="' + prefix + item.cover + '" alt="">' +
        '<span><strong>' + item.title + '</strong><small>' + item.year + ' · ' + item.category + '</small></span>' +
        '<em>' + item.rating + '</em>';
      panel.appendChild(link);
    });

    panel.classList.add('is-open');
  }

  document.querySelectorAll('[data-global-search]').forEach(function (form) {
    const input = form.querySelector('input[type="search"]');
    if (!input) {
      return;
    }

    input.addEventListener('input', function () {
      renderSearch(form, input.value);
    });

    input.addEventListener('focus', function () {
      renderSearch(form, input.value);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch(form, input.value);
    });
  });

  document.addEventListener('click', function (event) {
    document.querySelectorAll('[data-global-search]').forEach(function (form) {
      if (!form.contains(event.target)) {
        const panel = form.querySelector('[data-search-results]');
        if (panel) {
          panel.classList.remove('is-open');
        }
      }
    });
  });

  const filterInput = document.querySelector('[data-card-filter]');
  const sortSelect = document.querySelector('[data-card-sort]');
  const cardList = document.querySelector('[data-card-list]');

  function filterCards() {
    if (!filterInput || !cardList) {
      return;
    }
    const keyword = normalize(filterInput.value);
    cardList.querySelectorAll('.searchable-card').forEach(function (card) {
      const text = normalize(card.getAttribute('data-search'));
      card.classList.toggle('is-filter-hidden', keyword && text.indexOf(keyword) === -1);
    });
  }

  function sortCards() {
    if (!sortSelect || !cardList) {
      return;
    }
    const mode = sortSelect.value;
    const cards = Array.from(cardList.querySelectorAll('.movie-card'));
    cards.sort(function (a, b) {
      if (mode === 'rating') {
        return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
      }
      if (mode === 'year') {
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      }
      return 0;
    });
    cards.forEach(function (card) {
      cardList.appendChild(card);
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', sortCards);
  }
})();
