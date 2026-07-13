#!/usr/bin/env node
/*
 * Holt die 5 neuesten Google-Bewertungen und schreibt sie nach reviews.json.
 * Läuft im GitHub-Action (siehe .github/workflows/update-reviews.yml).
 *
 * Benötigt:  env GOOGLE_PLACES_API_KEY   (GitHub-Secret)
 * Optional:  env PLACE_ID                (sonst automatisch per Textsuche ermittelt)
 *
 * Nutzt die "Places API" (Place Details, Legacy) mit reviews_sort=newest —
 * das liefert genau die aktuellsten Bewertungen (Google gibt max. 5 zurück).
 */
import { writeFileSync } from 'node:fs';

const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) { console.error('Fehlt: GOOGLE_PLACES_API_KEY'); process.exit(1); }

const LANG = 'de';
// Identität des Betriebs (aus Google Maps) — nur nötig, falls keine PLACE_ID gesetzt ist.
const QUERY = 'Hoffnungsohr Hörgeräte, Hauptstr. 251, 51503 Rösrath';
let placeId = process.env.PLACE_ID || '';

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status + ' für ' + url);
  return res.json();
}

// 1) Place-ID auflösen (falls nicht vorgegeben)
if (!placeId) {
  const u = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  u.searchParams.set('input', QUERY);
  u.searchParams.set('inputtype', 'textquery');
  u.searchParams.set('fields', 'place_id,name');
  u.searchParams.set('language', LANG);
  u.searchParams.set('key', KEY);
  const fp = await getJson(u);
  if (fp.status !== 'OK' || !fp.candidates || !fp.candidates.length) {
    throw new Error('Find Place fehlgeschlagen: ' + fp.status + ' ' + (fp.error_message || ''));
  }
  placeId = fp.candidates[0].place_id;
  console.log('Ermittelte Place-ID:', placeId, '(' + fp.candidates[0].name + ')');
}

// 2) Details inkl. der neuesten Bewertungen holen
const d = new URL('https://maps.googleapis.com/maps/api/place/details/json');
d.searchParams.set('place_id', placeId);
d.searchParams.set('fields', 'name,rating,user_ratings_total,url,reviews');
d.searchParams.set('reviews_sort', 'newest');
d.searchParams.set('reviews_no_translations', 'true');
d.searchParams.set('language', LANG);
d.searchParams.set('key', KEY);
const det = await getJson(d);
if (det.status !== 'OK') {
  throw new Error('Place Details fehlgeschlagen: ' + det.status + ' ' + (det.error_message || ''));
}

const r = det.result || {};
const reviews = (r.reviews || []).slice(0, 5).map(v => ({
  author_name: v.author_name || '',
  author_url: v.author_url || '',
  profile_photo_url: v.profile_photo_url || '',
  rating: v.rating || 5,
  text: (v.text || '').trim(),
  relative_time: v.relative_time_description || '',
  time: v.time || 0
}));

const out = {
  updated: new Date().toISOString(),
  place_id: placeId,
  name: r.name || '',
  rating: r.rating || null,
  total: r.user_ratings_total || 0,
  url: r.url || '',
  reviews
};

writeFileSync('reviews.json', JSON.stringify(out, null, 2) + '\n');
console.log('reviews.json geschrieben:', reviews.length, 'Bewertungen · Schnitt', out.rating, '· gesamt', out.total);
