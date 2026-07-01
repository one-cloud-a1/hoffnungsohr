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

// Terminanfrage-Funnel (mehrstufig) -> Google Apps Script (Sheet + E-Mail)
(function () {
  var forms = document.querySelectorAll('form.ho-funnel[data-endpoint]');
  Array.prototype.forEach.call(forms, function (form) { initFunnel(form); });

  function initFunnel(form) {
    var steps = Array.prototype.slice.call(form.querySelectorAll('.funnel-step'));
    var bar = form.querySelector('.funnel-progress-bar');
    var count = form.querySelector('.funnel-count');
    var backBtn = form.querySelector('.funnel-back');
    var nextBtn = form.querySelector('.funnel-next');
    var submitBtn = form.querySelector('.funnel-submit');
    var status = form.querySelector('.ho-form-status');
    var done = form.querySelector('.funnel-done');
    var i = 0;

    function stepFields(step) {
      return Array.prototype.slice.call(step.querySelectorAll('input, select, textarea'));
    }
    function stepValid(step) {
      var ok = true;
      stepFields(step).forEach(function (el) {
        if (!el.checkValidity()) { if (ok) { el.reportValidity(); } ok = false; }
      });
      return ok;
    }
    function show(n) {
      i = n;
      steps.forEach(function (s, idx) { s.classList.toggle('is-active', idx === n); });
      bar.style.width = ((n + 1) / steps.length * 100) + '%';
      count.textContent = 'Schritt ' + (n + 1) + ' von ' + steps.length;
      backBtn.hidden = (n === 0);
      var last = (n === steps.length - 1);
      nextBtn.hidden = last;
      submitBtn.hidden = !last;
      var focusEl = steps[n].querySelector('input[type=text], input[type=tel], input[type=email], textarea');
      if (focusEl) { try { focusEl.focus({ preventScroll: true }); } catch (e) {} }
    }
    function goNext() {
      if (!stepValid(steps[i])) { return; }
      if (i < steps.length - 1) { show(i + 1); }
    }

    nextBtn.addEventListener('click', goNext);
    backBtn.addEventListener('click', function () { if (i > 0) { show(i - 1); } });

    // Auswahl-Optionen: Markierung setzen + automatisch weiter
    Array.prototype.forEach.call(form.querySelectorAll('.funnel-options'), function (group) {
      group.addEventListener('change', function () {
        Array.prototype.forEach.call(group.querySelectorAll('.funnel-opt'), function (opt) {
          opt.classList.toggle('is-selected', opt.querySelector('input').checked);
        });
        if (group.hasAttribute('data-autonext')) { setTimeout(goNext, 240); }
      });
    });

    // Enter = Weiter (außer im Textfeld mit mehreren Zeilen / letzter Schritt)
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && i < steps.length - 1) {
        e.preventDefault();
        goNext();
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form._gotcha && form._gotcha.value) { return; }   // Honeypot
      if (!stepValid(steps[i])) { return; }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet …';
      status.className = 'ho-form-status';
      status.textContent = '';
      fetch(form.getAttribute('data-endpoint'), {
        method: 'POST', mode: 'no-cors', body: new FormData(form)
      }).then(function () {
        steps.forEach(function (s) { s.classList.remove('is-active'); });
        form.querySelector('.funnel-progress').style.display = 'none';
        count.style.display = 'none';
        form.querySelector('.funnel-nav').style.display = 'none';
        done.hidden = false;
      }).catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Terminanfrage senden';
        status.className = 'ho-form-status is-err';
        status.innerHTML = 'Leider ist etwas schiefgelaufen. Bitte rufen Sie uns direkt an: <a href="tel:+4915678669304">015678&nbsp;669304</a>.';
      });
    });

    show(0);
  }
})();
