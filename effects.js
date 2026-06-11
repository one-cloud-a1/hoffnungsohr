(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Reveal-on-scroll via IntersectionObserver
  var targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (targets.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
  }

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Hero parallax – tiny translate based on scroll
  var heroImg = document.querySelector('.hero-image');
  if (heroImg) {
    var ticking = false;
    var heroRaf = function () {
      var y = window.scrollY;
      heroImg.style.transform = 'translate3d(0,' + (y * 0.15) + 'px,0) scale(' + (1.04 + Math.min(y, 400) * 0.0002) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(heroRaf); ticking = true; }
    }, { passive: true });
  }
})();
