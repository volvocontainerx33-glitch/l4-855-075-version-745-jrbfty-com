(function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav-links');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startSlider() {
    if (slides.length < 2) return;
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      if (timer) window.clearInterval(timer);
      showSlide(i);
      startSlider();
    });
  });

  startSlider();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.js-card-search'));
  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
      cards.forEach(function (card) {
        var hay = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden', q && hay.indexOf(q) === -1);
      });
    });
  });
})();
