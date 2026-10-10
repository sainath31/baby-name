// Merges data/batches/*.json (rows: [name, iast, devanagari, meaning, "part:gloss; ...", state]) into data/names.json.
// Skips any name whose normalized IAST already exists, so names stay unique.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { syllableCount } from '../src/sounds.js';
import { spokenIast } from '../src/translit.js';

const path = new URL('../data/names.json', import.meta.url);
const names = JSON.parse(readFileSync(path));
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const have = new Set(names.map((n) => norm(n.iast)));
let added = 0;
for (const f of readdirSync(new URL('../data/batches/', import.meta.url)).filter((x) => x.endsWith('.json')).sort()) {
  for (const [name, iast, dev, meaning, comps, state, ref, era, conf] of JSON.parse(readFileSync(new URL(`../data/batches/${f}`, import.meta.url)))) {
    if (have.has(norm(iast)) || have.has(norm(spokenIast(name, iast)))) continue;
    have.add(norm(iast));
    names.push({
      name, iast: spokenIast(name, iast), ...(spokenIast(name, iast) !== iast ? { stem: iast } : {}),
      devanagari: dev, letter: name[0].toUpperCase(), syllable_count: syllableCount(spokenIast(name, iast)),
      meaning_en: meaning,
      components: comps.split('; ').map((c) => { const [part, gloss] = c.split(':'); return { part, gloss }; }),
      pairs_with: { prefixes: [], suffixes: [] }, compounds: [],
      states: [state], origin: 'attested', era: era || 'classical', confidence: conf || 'medium',
      ...(ref ? { deity_epic_ref: ref } : {}),
      sources: [{ title: `Standard Sanskrit etymology (cf. Monier-Williams); compiled by hand, batch ${f}`, license: 'original compilation' }],
    });
    added++;
  }
}
writeFileSync(path, JSON.stringify(names, null, 2) + '\n');
console.log(`added ${added}, total ${names.length}`);
