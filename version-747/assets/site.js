(function () {
  function rootPrefix() {
    var path = window.location.pathname.replace(/\\/g, "/");
    return path.indexOf("/movies/") >= 0 ? "../" : "./";
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initHeader() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (button && panel) {
      button.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initLocalSearch() {
    var input = document.querySelector("[data-local-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!input || cards.length === 0) {
      return;
    }
    input.addEventListener("input", function () {
      var keyword = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        card.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  function buildSearchItem(item) {
    var root = rootPrefix();
    var link = document.createElement("a");
    link.className = "search-item";
    link.href = root + item.url;

    var image = document.createElement("img");
    image.src = root + item.cover;
    image.alt = item.title;
    image.loading = "lazy";

    var text = document.createElement("span");
    var title = document.createElement("strong");
    var meta = document.createElement("em");
    title.textContent = item.title;
    meta.textContent = "★ " + item.rating + " · " + item.year + " · " + item.region;
    text.appendChild(title);
    text.appendChild(meta);
    link.appendChild(image);
    link.appendChild(text);
    return link;
  }

  function initGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
    if (!inputs.length || !window.SEARCH_MOVIES) {
      return;
    }
    inputs.forEach(function (input) {
      var box = input.parentElement.querySelector("[data-search-results]");
      if (!box) {
        return;
      }
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        box.innerHTML = "";
        if (!keyword) {
          box.classList.remove("is-open");
          return;
        }
        var results = window.SEARCH_MOVIES.filter(function (item) {
          var haystack = normalize([item.title, item.region, item.year, item.genre, item.category].join(" "));
          return haystack.indexOf(keyword) !== -1;
        }).slice(0, 12);
        results.forEach(function (item) {
          box.appendChild(buildSearchItem(item));
        });
        box.classList.toggle("is-open", results.length > 0);
      });
      document.addEventListener("click", function (event) {
        if (!input.parentElement.contains(event.target)) {
          box.classList.remove("is-open");
        }
      });
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("play-overlay");
    var hls = null;
    var ready = false;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function attach() {
      if (!ready) {
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }
      overlay.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    overlay.addEventListener("click", attach);
    video.addEventListener("click", function () {
      if (video.paused) {
        attach();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initHero();
    initLocalSearch();
    initGlobalSearch();
  });
})();
