/* Lädt reviews.json (vom täglichen GitHub-Action erzeugt) und rendert die
 * neuesten Google-Bewertungen in die Sektion ".testi-grid".
 * Progressive Enhancement: schlägt der Abruf fehl, bleiben die statischen
 * Bewertungen im HTML als Fallback stehen. */
(function () {
  var grid = document.querySelector('.testi-grid');
  if (!grid || !window.fetch) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function stars(n) {
    n = Math.max(0, Math.min(5, Math.round(n || 5)));
    return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
  }

  fetch('reviews.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (data) {
      if (!data || !data.reviews || !data.reviews.length) return;

      grid.innerHTML = data.reviews.slice(0, 5).map(function (v) {
        var text = (v.text || '').trim();
        if (text.length > 320) text = text.slice(0, 300).replace(/\s+\S*$/, '') + ' …';
        var avatar = v.profile_photo_url
          ? '<img class="testi-avatar" src="' + esc(v.profile_photo_url) + '" alt="" width="40" height="40" loading="lazy" referrerpolicy="no-referrer">'
          : '';
        var when = v.relative_time ? ' · ' + esc(v.relative_time) : '';
        return '<div class="testi-card">' +
                 '<div class="testi-stars" aria-label="' + esc(v.rating || 5) + ' von 5 Sternen">' + stars(v.rating) + '</div>' +
                 '<p class="testi-text">„' + esc(text) + '"</p>' +
                 '<div class="testi-meta">' + avatar +
                   '<div><p class="testi-author">' + esc(v.author_name) + '</p>' +
                   '<span class="testi-source">Google' + when + '</span></div>' +
                 '</div>' +
               '</div>';
      }).join('');

      // Google-Badge mit echtem Schnitt/Anzahl aktualisieren
      if (data.rating) {
        var gt = document.querySelector('.testi-google-badge .g-text');
        if (gt) gt.textContent = String(data.rating).replace('.', ',') + ' Sterne auf Google';
      }
      if (data.total) {
        var gsub = document.querySelector('.testi-google-badge .g-sub');
        if (gsub) gsub.textContent = 'Hoffnungsohr · Rösrath · ' + data.total + ' Bewertungen ansehen →';
      }
    })
    .catch(function () { /* Fallback: statische Bewertungen bleiben stehen */ });
})();
