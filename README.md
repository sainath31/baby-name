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
| Names listed (shown to users) | 4,009 (boys 2,798, girls 1,169, gender-neutral 42) |
| - attested (found in texts, dictionaries or common use) | 2,547 |
| - constructed (rule-built from reviewed Sanskrit elements; shown only when the visitor asks) | 1,188 |
| Hidden candidate records kept in data | ~18,700 |
| Total records | 23,398 |
| Names read by the AI reviewer | ~6,700 (first round 694, shortlist 2,480, constructed 2,676, hand batches 130, fixes) |
| Tests | 20 passing |

**Goal:** 100,000 unique names. **Reality check:** about 1,860 attested and 744 constructed names survive review today.
Vetted attested names number in the low thousands at most; anything beyond that must come from rule-based generation.

### Done
- Data model, importer, quality gate (`src/quality.js`), validators (uniqueness, meaning, sources, script round-trip).
- Sources: hand-compiled names; Monier-Williams, Böhtlingk PW/PWG, Purāṇa Index and Monier-Williams 1872 via the
  Cologne CDSL (CC BY-SA 4.0); Vishnu Sahasranama epithets; deity/saint epithets; regional and modern names.
- AI priest-scholar review of every listed name, plus a second independent audit of all of them (data/reviews/); scripted reviews that did not read each name were discarded.
- Mobile-first UI: per-letter data shards, Web Worker filtering, many filters, favourites, share links, dark mode.
- Astrology engine: date + time + place -> Moon sign, nakshatra, pada, naming syllable, lagna, using the vendored
  `panchang-ts` (MIT). Verified against published Sankranti and eclipse events and an independent ephemeris.
- Numerology (Chaldean and Pythagorean) and sound-group filters.
- Names store IAST as written (Neeraj = nīraj) plus the Sanskrit `stem` (nīraja); duplicates are matched on both.
- "Find names from birth details" panel at the top of the site: exact birth (date, time, place) or an expected date range
  (lists every nakshatra pada the Moon passes through and shows names for all their syllables).
- Gender filter (boys / girls / gender-neutral) and a "Making new names from this one" section on every name (which suffixes and prefixes it can take, from the reviewed word list).
- Two-word names (Sai Krishna, Ram Charan, Sri Lakshmi): about 380 listed after review and a full audit; honorific tails (Devi, Rani, Das, Pal, Nath), worshipful addresses (Sri + deity) and doubled deities are excluded.
- Boy/girl counterparts (Lalit / Lalita, Vedik / Vedika) are now kept as separate names; duplicate checks work within a gender group.
- Spelling-variant search: Ishan finds Ishaan, Arav finds Aarav, Sidharth finds Siddharth, Rajiv finds Rajeev.
- Telugu/Kannada support: conversion, a validator (`scripts/check-name.js`) and Telugu/Kannada display in the UI.
- Suffix/prefix notes: names that are bases show their suffixes and prefixes (317 names); compounds show the pairings of their first part (329 more); the rest say they are complete names on their own.
- Thin-syllable hint: when a birth star or syllable matches fewer than 15 names, the app says so and suggests narrowing, constructed names, or asking a priest (Shravana currently shows 5 names).
- Time zone is a drop-down (common zones first, then all zones) in both birth-details tabs.
- Offline mode: a service worker caches what has been visited (network first, so new deploys show at once); the site opens and searches offline after the first visit.
- Lighthouse (mobile, local run): performance 96, accessibility 100, best practices 100, SEO 100. Fonts load without blocking; the birth panel is built at once and space is reserved for the list to avoid layout jumps.
- Live site: https://sainath31.github.io/baby-name/ (GitHub Pages, redeployed on every push).

- Compound-name generator (`npm run generate`): 554 reviewer-curated elements x 17 masculine and 7 feminine suffixes + 4 prefixes with
  Sanskrit joining rules. Reviewers read every generated name; about 1,210 survive review and audit. The UI has an "Include constructed names" toggle (off by default).
- Reusable reviewer prompt (`data/reviews/REVIEWER_PROMPT.md`) and chunk maker (`scripts/make-review-chunks.js`).

### In progress
- Nothing running in the background.

### Recently added
- Girl names: gender filter (Boys / Girls / Gender-neutral), about 300 reviewed attested girl names plus reviewed feminine compounds (-vati, -mayi, -nandini, -sundari, -dasi, -priya).
- Astrology syllable coverage check: every naming syllable should have names; a few (Ng, Cho, Vo, Ho, Yi) are rare sounds at the start of Sanskrit names and stay thin.

### Quality audit (done)
- Every listed attested name (1,959) was re-read by an independent AI auditor (not a human priest). About 13% (261) had a problem: wrong or non-meaning, invented etymology, wrong script or spelling, wrong gender or state tag, or an unsuitable name. All were corrected or removed (reviews 394-398). The rule-built names were audited the same way: about 34% were rejected or fixed (reviews 399-400), mostly forced pairings, "Shri" stacked on a deity's own name, -dasi names for girls, and inauspicious readings.

### To do
- Human review (a real priest or Sanskrit scholar) of the final list. All checking so far was done by AI reviewers.
- Names are close to saturated for the sources reachable from here: the last hand-compiled batches added 0-20 new names each, and
  the hidden dictionary pool (~16,000 records) yields under 5% usable names. 100,000 vetted names is not reachable this way.
- Real source texts (Sahasranamas, Ramcharitmanas, Alvar and Nayanar poetry, regional name lists) would need hosts the build sandbox cannot reach.
- Source-text and name-length filters.
- State coverage: most names are tagged "All India"; regional tagging needs real sources. Andhra Pradesh and Telangana share Telugu names, so a name tagged for one appears under both.
- Known weak spots: Telugu/Kannada forms are generated by script conversion and a few end in a bare consonant;
  state tags and Devanagari-only spellings for Perso-Arabic-derived names (Roshan, Khushi) are judgement calls.

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
