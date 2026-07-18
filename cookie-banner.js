(function () {
  var STORAGE_KEY = 'hs_cookie_consent';
  var GTM_ID = 'GTM-MTG98V2M';
  var gtmLoaded = false;

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  // Lädt den Google Tag Manager erst NACH ausdrücklicher Einwilligung (Opt-in).
  function loadGTM() {
    if (gtmLoaded || !GTM_ID) return;
    gtmLoaded = true;
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);
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
          '<p>Wir verwenden nur technisch notwendige Cookies. Zusätzlich möchten wir mit dem ' +
          '<strong>Google Tag Manager</strong> statistische Reichweiten­messung (Google-Dienste) einsetzen – ' +
          'dabei können Cookies gesetzt und Daten an Google übermittelt werden. Diese optionalen Dienste ' +
          'laden wir erst mit Ihrer Einwilligung. Sie können Ihre Wahl jederzeit in der ' +
          '<a href="datenschutz.html">Datenschutzerklärung</a> ändern.</p>' +
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
        'background:#fff;border-top:2px solid #C4A46A;' +
        'box-shadow:0 -4px 24px rgba(15,31,46,.12);' +
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
      '#cookie-banner-text strong{display:block;font-size:1rem;margin-bottom:.35rem;color:#0F1F2E}' +
      '#cookie-banner-text p{margin:0;font-size:.875rem;line-height:1.55;color:#5A6470}' +
      '#cookie-banner-text a{color:#0F1F2E;font-weight:600;text-decoration:underline}' +
      '#cookie-banner-actions{display:flex;gap:.75rem;flex-shrink:0;flex-wrap:wrap}' +
      '#cookie-reject{border-color:#E3DFD7;color:#0F1F2E}' +
      '#cookie-reject:hover{border-color:#0F1F2E;background:#0F1F2E;color:#fff}' +
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
      loadGTM();
      removeBanner(banner);
    });

    document.getElementById('cookie-reject').addEventListener('click', function () {
      setConsent('rejected');
      removeBanner(banner);
    });
  }

  // Bereits erteilte Einwilligung: GTM sofort nachladen.
  if (getConsent() === 'accepted') {
    loadGTM();
  }

  // Noch keine Entscheidung getroffen: Banner anzeigen.
  if (!getConsent()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createBanner);
    } else {
      createBanner();
    }
  }

  // Widerruf / erneute Auswahl: setzt die Einwilligung zurück und zeigt das Banner wieder an.
  // In der Datenschutzerklärung verlinkt, damit der Widerruf so einfach ist wie die Einwilligung.
  window.hsResetCookieConsent = function () {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    location.reload();
  };
})();
