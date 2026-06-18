(function () {
  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(next);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initCardFilters() {
    var scope = document.querySelector('[data-filter-scope]');

    if (!scope) {
      return;
    }

    var input = scope.querySelector('[data-card-filter]');
    var list = document.querySelector('[data-card-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var yearButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-year-filter]'));
    var activeYear = 'all';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var year = card.getAttribute('data-year') || '';
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = activeYear === 'all' || year === activeYear;

        card.style.display = matchQuery && matchYear ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-year-filter') || 'all';
        yearButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + movie.url + '" class="card-media" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="card-duration">' + escapeHtml(movie.duration) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(truncate(movie.one_line || movie.summary || '', 88)) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '    <div class="card-meta">',
      '      <span>👁 ' + formatViews(movie.views) + '</span>',
      '      <span>⭐ ' + escapeHtml(movie.rating) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function truncate(value, length) {
    value = String(value || '');
    return value.length > length ? value.slice(0, length) + '…' : value;
  }

  function formatViews(value) {
    var number = Number(value) || 0;
    if (number >= 10000) {
      return (number / 10000).toFixed(1).replace('.0', '') + '万';
    }
    return String(number);
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var quickButtons = Array.prototype.slice.call(document.querySelectorAll('[data-quick-query]'));

    if (!form || !input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function runSearch(query) {
      query = String(query || '').trim().toLowerCase();
      input.value = query;

      var data = window.MOVIE_SEARCH_DATA || [];
      var matches = data.filter(function (movie) {
        if (!query) {
          return true;
        }

        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.one_line,
          movie.summary,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();

        return haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = matches.map(movieCardTemplate).join('');

      if (summary) {
        summary.textContent = query
          ? '搜索“' + query + '”找到 ' + matches.length + ' 条结果（最多显示 120 条）。'
          : '默认展示全部影片中的前 120 条，可输入关键词继续筛选。';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch(input.value);
      var url = new URL(window.location.href);
      url.searchParams.set('q', input.value.trim());
      window.history.replaceState({}, '', url.toString());
    });

    quickButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        runSearch(button.getAttribute('data-quick-query') || '');
      });
    });

    runSearch(initialQuery);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCardFilters();
    initSearchPage();
  });
})();
