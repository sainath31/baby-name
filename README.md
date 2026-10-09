# baby-name

Unique Hindu baby boy names, indexed A-Z, with English meanings and filters
(state, syllables, sound group, nakshatra/rashi, numerology). Static site + JSON.

- `data/names.json` - source of truth (one record per root name; compounds live under the root)
- `src/` - pure modules: filters, numerology (Chaldean/Pythagorean), sounds, astrology
- `scripts/validate.js` - uniqueness, meaning, source/license checks
- `npm run build` then serve `web/` (e.g. `npx http-server web`)

Not yet built: source ingestion pipelines, birth date/time/place -> nakshatra
(needs an ephemeris library; `fromSiderealLongitude` is ready for it).
