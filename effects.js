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
  // Dropdown navigation
  document.querySelectorAll('.nav-group-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var group = this.closest('.nav-group');
      var opening = !group.classList.contains('is-open');
      document.querySelectorAll('.nav-group.is-open').forEach(function(g){
        g.classList.remove('is-open');
        g.querySelector('.nav-group-btn').setAttribute('aria-expanded','false');
      });
      if(opening){
        group.classList.add('is-open');
        this.setAttribute('aria-expanded','true');
      }
    });
  });
  document.addEventListener('click', function(){
    document.querySelectorAll('.nav-group.is-open').forEach(function(g){
      g.classList.remove('is-open');
      g.querySelector('.nav-group-btn').setAttribute('aria-expanded','false');
    });
  });

  // Auto-mark current page link
  var page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav > a, .nav-group-menu a').forEach(function(a){
    if(a.getAttribute('href') === page){
      a.setAttribute('aria-current','page');
      var grp = a.closest('.nav-group');
      if(grp) grp.querySelector('.nav-group-btn').classList.add('active');
    }
  });
})();
