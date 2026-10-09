# baby-name

Unique Hindu baby boy names, indexed A-Z, with English meanings and filters
(state, syllables, sound group, nakshatra/rashi, numerology). Static site + JSON.

- `data/names.json` - source of truth (one record per root name; compounds live under the root)
- `src/` - pure modules: filters, numerology (Chaldean/Pythagorean), sounds, astrology
- `scripts/validate.js` - uniqueness, meaning, source/license checks
- `npm run build` then serve `web/` (e.g. `npx http-server web`)

Not yet built: source ingestion pipelines, birth date/time/place -> nakshatra
(needs an ephemeris library; `fromSiderealLongitude` is ready for it).

## Data sources and licenses
- `data/names.json` + `data/batches/`: hand-compiled names (original compilation).
- `data/generated/mw-names.json`: masculine proper names extracted from the Monier-Williams
  Sanskrit-English Dictionary as digitised by the Cologne Digital Sanskrit Dictionaries
  (https://github.com/sanskrit-lexicon/csl-orig), licensed **CC BY-SA 4.0**. Derived data
  therefore carries the same share-alike terms. Regenerate with
  `scripts/fetch-sources.sh && node scripts/ingest-mw.js`.
  Records are `curation: "unreviewed"`: many are obscure epic or historical figures and the
  meaning is the dictionary's own "Name of ..." gloss.

## Running the UI
`npm run build` emits per-letter shards and a manifest to `web/data/` and copies `src/` to `web/src/`
(both gitignored). Then `npm run serve` (or any static server on `web/`) and open the page.
Shards load lazily and filtering runs in a Web Worker (`web/worker.js`), so it scales to 100k names.
Filter state is kept in the URL query string; favourites live in localStorage. The birth-details
helper lazy-loads the vendored ephemeris and is a computed estimate to verify with a panchang.
