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
    var headerTicking = false;
    var onScroll = function () {
      if (!headerTicking) {
        window.requestAnimationFrame(function () {
          header.classList.toggle('is-scrolled', window.scrollY > 4);
          headerTicking = false;
        });
        headerTicking = true;
      }
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

  // Inject sticky phone button on all pages (shown on mobile via CSS)
  if (!document.querySelector('.sticky-phone')) {
    var sp = document.createElement('a');
    sp.href = 'tel:+4915678669304';
    sp.className = 'sticky-phone';
    sp.setAttribute('aria-label', 'Jetzt anrufen: 015678 669304');
    sp.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
      '<span class="sp-text">015678 669304</span>';
    document.body.appendChild(sp);
  }
})();

// Terminanfrage-Formular -> Google Apps Script (Sheet + E-Mail)
(function () {
  var forms = document.querySelectorAll('form.ho-form[data-endpoint]');
  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Honeypot: von Bots ausgefüllt -> still verwerfen
      if (form._gotcha && form._gotcha.value) { return; }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var status = form.querySelector('.ho-form-status');
      var btn = form.querySelector('button[type=submit]');
      var orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Wird gesendet …';
      status.className = 'ho-form-status';
      status.textContent = '';
      fetch(form.getAttribute('data-endpoint'), {
        method: 'POST',
        mode: 'no-cors',
        body: new FormData(form)
      }).then(function () {
        form.reset();
        status.className = 'ho-form-status is-ok';
        status.textContent = 'Vielen Dank! Wir haben Ihre Anfrage erhalten und melden uns zeitnah bei Ihnen.';
        btn.style.display = 'none';
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = orig;
        status.className = 'ho-form-status is-err';
        status.innerHTML = 'Leider ist etwas schiefgelaufen. Bitte rufen Sie uns direkt an: <a href="tel:+4915678669304">015678&nbsp;669304</a>.';
      });
    });
  });
})();
