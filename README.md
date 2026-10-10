# baby-name

A library of Hindu baby boy and girl names, indexed A-Z, with English meanings, sources and licenses, and filters
for state, syllables, sound group, nakshatra/rashi (with a birth date/time/place helper), and numerology.
Static website + JSON data. Names are checked by validators; an AI reviewer role plays a priest-scholar
(not a human priest). **Treat astrology, numerology and AI-reviewed meanings as aids, and verify important
choices with a family priest or panchang.**

## Status (updated each work pass)

_Last updated: 2026-10-10_

| Measure | Count |
|---|---|
| Names listed (shown to users) | 2,801 (boys 2,280, girls 509, gender-neutral 12) |
| - attested (found in texts, dictionaries or common use) | 1,709 |
| - constructed (rule-built from reviewed Sanskrit elements; shown only when the visitor asks) | 1,092 |
| Hidden candidate records kept in data | ~18,700 |
| Total records | 23,039 |
| Names read by the AI reviewer | ~6,700 (first round 694, shortlist 2,480, constructed 2,676, hand batches 130, fixes) |
| Tests | 20 passing |

**Goal:** 100,000 unique names. **Reality check:** about 990 attested and 750 constructed names survive review today.
Vetted attested names number in the low thousands at most; anything beyond that must come from rule-based generation.

### Done
- Data model, importer, quality gate (`src/quality.js`), validators (uniqueness, meaning, sources, script round-trip).
- Sources: hand-compiled names; Monier-Williams, Böhtlingk PW/PWG, Purāṇa Index and Monier-Williams 1872 via the
  Cologne CDSL (CC BY-SA 4.0); Vishnu Sahasranama epithets; deity/saint epithets; regional and modern names.
- AI priest-scholar review of 3,174 records (data/reviews/); scripted reviews that did not read each name were discarded.
- Mobile-first UI: per-letter data shards, Web Worker filtering, many filters, favourites, share links, dark mode.
- Astrology engine: date + time + place -> Moon sign, nakshatra, pada, naming syllable, lagna, using the vendored
  `panchang-ts` (MIT). Verified against published Sankranti and eclipse events and an independent ephemeris.
- Numerology (Chaldean and Pythagorean) and sound-group filters.
- Names store IAST as written (Neeraj = nīraj) plus the Sanskrit `stem` (nīraja); duplicates are matched on both.
- "Find names from birth details" panel at the top of the site: exact birth (date, time, place) or an expected date range
  (lists every nakshatra pada the Moon passes through and shows names for all their syllables).
- Gender filter (boys / girls / gender-neutral) and a "Making new names from this one" section on every name (which suffixes and prefixes it can take, from the reviewed word list).
- Spelling-variant search: Ishan finds Ishaan, Arav finds Aarav, Sidharth finds Siddharth, Rajiv finds Rajeev.
- Telugu/Kannada support: conversion, a validator (`scripts/check-name.js`) and Telugu/Kannada display in the UI.
- Live site: https://sainath31.github.io/baby-name/ (GitHub Pages, redeployed on every push).

- Compound-name generator (`npm run generate`): 265 reviewer-curated elements x 17 suffixes + 4 prefixes with Sanskrit
  joining rules. Reviewers read all ~2,000 generated names and rejected about 75%, so 505 survive. The generator was
  tightened using their feedback. The UI has an "Include constructed names" toggle (off by default).
- Reusable reviewer prompt (`data/reviews/REVIEWER_PROMPT.md`) and chunk maker (`scripts/make-review-chunks.js`).

### In progress
- Nothing running in the background.

### To do
- Widen the generator's lexicon: 265 elements yields about 500 surviving names; 100k would need roughly 10,000
  elements, or looser rules that produce odd names. Reviewer strictness varies between batches (keep rates 4-62%).
- Devotional lists not yet mined: Shiva, Lalita (masculine epithets), Ganesha, Hanuman sahasranamas and 108-name lists;
  Ramcharitmanas, Alvar, Nayanar and Bhakti poetry; more regional name sources.
- Human review (a real priest or Sanskrit scholar) of the final list; review the remaining ~14,900 hidden candidates.
- Service worker/offline mode, Lighthouse check, source-text and name-length filters.
- State coverage: most names are tagged "All India"; regional tagging needs real sources.

## Layout
- `data/names.json`, `data/batches/` - hand-compiled names (batches are merged by `scripts/import-batches.js`)
- `data/generated/` - dictionary-derived records (`curation: "unreviewed"` unless a reviewer verdict exists)
- `data/reviews/` - reviewer inputs and verdicts; `data/lexicon/` - compound-generator lexicon work
- `src/` - pure modules: filters, numerology, sounds, astrology, astro-engine, quality gate, indic-scripts, vendored libraries
- `scripts/` - ingest, import, validate, build, `check-name.js`
- `web/` - the static UI (`npm run build`, then `npm run serve`)

## Commands
`npm run validate` | `npm test` | `npm run build` | `npm run serve` | `node scripts/check-name.js "కృష్ణ"`

## Data sources and licenses
- `data/names.json` + `data/batches/`: hand-compiled names (original compilation).
- `data/generated/*-names.json`: masculine proper names from the Monier-Williams, Böhtlingk and Purāṇa Index
  dictionaries as digitised by the Cologne Digital Sanskrit Dictionaries (https://github.com/sanskrit-lexicon/csl-orig),
  **CC BY-SA 4.0**; derived data carries the same share-alike terms. Regenerate with
  `scripts/fetch-sources.sh` and the `scripts/ingest-*.js` scripts.
- `src/vendor/panchang-ts.js`: panchang-ts 5.4.0, MIT. `test/vendor/astronomy-engine.js`: astronomy-engine 2.1.19, MIT.

## Running the UI
`npm run build` emits per-letter shards and a manifest to `web/data/` and copies `src/` to `web/src/`
(both gitignored). Then `npm run serve` (or any static server on `web/`) and open the page.
Shards load lazily and filtering runs in a Web Worker (`web/worker.js`), so it scales to 100k names.
Filter state is kept in the URL query string; favourites live in localStorage. The birth-details
helper lazy-loads the vendored ephemeris and is a computed estimate to verify with a panchang.
