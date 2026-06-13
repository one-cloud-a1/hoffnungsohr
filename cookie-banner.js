(function () {
  var STORAGE_KEY = 'hs_cookie_consent';

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function removeBanner(banner) {
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(20px)';
    setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 350);
  }

  function createBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-Einstellungen');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML =
      '<div id="cookie-banner-inner">' +
        '<div id="cookie-banner-text">' +
          '<strong>Cookies & Datenschutz</strong>' +
          '<p>Diese Website verwendet Cookies, um Ihnen die bestmögliche Nutzererfahrung zu bieten. ' +
          'Notwendige Cookies sind immer aktiv. Optionale Cookies (z.&nbsp;B. Statistiken) setzen wir nur mit Ihrer Zustimmung. ' +
          'Mehr erfahren Sie in unserer <a href="datenschutz.html">Datenschutzerklärung</a>.</p>' +
        '</div>' +
        '<div id="cookie-banner-actions">' +
          '<button id="cookie-accept" class="btn btn-primary">Alle akzeptieren</button>' +
          '<button id="cookie-reject" class="btn btn-outline">Nur notwendige</button>' +
        '</div>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent =
      '#cookie-banner{' +
        'position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
        'background:#fff;border-top:2px solid #ff2b0a;' +
        'box-shadow:0 -4px 24px rgba(0,0,0,.12);' +
        'padding:1.25rem 1.5rem;' +
        'transition:opacity .35s ease,transform .35s ease;' +
        'opacity:0;transform:translateY(20px);' +
      '}' +
      '#cookie-banner.visible{opacity:1;transform:translateY(0)}' +
      '#cookie-banner-inner{' +
        'max-width:1100px;margin:0 auto;' +
        'display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;' +
      '}' +
      '#cookie-banner-text{flex:1;min-width:260px}' +
      '#cookie-banner-text strong{display:block;font-size:1rem;margin-bottom:.35rem}' +
      '#cookie-banner-text p{margin:0;font-size:.875rem;line-height:1.55;color:#444}' +
      '#cookie-banner-text a{color:#ff2b0a;text-decoration:underline}' +
      '#cookie-banner-actions{display:flex;gap:.75rem;flex-shrink:0;flex-wrap:wrap}' +
      '#cookie-reject{border-color:#ccc;color:#333}' +
      '#cookie-reject:hover{border-color:#ff2b0a;color:#ff2b0a}' +
      '@media(max-width:600px){' +
        '#cookie-banner-inner{flex-direction:column;align-items:stretch}' +
        '#cookie-banner-actions{flex-direction:column}' +
      '}';

    document.head.appendChild(style);
    document.body.appendChild(banner);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('visible'); });
    });

    document.getElementById('cookie-accept').addEventListener('click', function () {
      setConsent('accepted');
      removeBanner(banner);
    });

    document.getElementById('cookie-reject').addEventListener('click', function () {
      setConsent('rejected');
      removeBanner(banner);
    });
  }

  if (!getConsent()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createBanner);
    } else {
      createBanner();
    }
  }
})();
