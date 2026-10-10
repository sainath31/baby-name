// Merges data/batches/*.json (rows: [name, iast, devanagari, meaning, "part:gloss; ...", state]) into data/names.json.
// Skips any name whose normalized IAST already exists, so names stay unique.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { syllableCount } from '../src/sounds.js';
import { spokenIast } from '../src/translit.js';

const path = new URL('../data/names.json', import.meta.url);
const names = JSON.parse(readFileSync(path));
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
// a boy's name and its feminine counterpart (Lalit / Lalita) are different names: the sound key is per gender group
const groups = (g) => (g === 'girl' ? ['f'] : g === 'unisex' ? ['m', 'f'] : ['m']);
const keysOf = (iast, stem, g) => [norm(iast), norm(iast).replace(/ /g, ''), ...(stem ? [norm(stem)] : [])].flatMap((k) => groups(g).map((x) => `${x}:${k}`));
const have = new Set(names.flatMap((n) => keysOf(n.iast, n.stem, n.gender)));
const BLOCKED = new Set(['Girish', 'Giridhar']);
const haveName = new Set(names.map((n) => n.name.toLowerCase().replace(/\s+/g, '')));   // same spelling, different spacing or IAST
let added = 0;
for (const f of readdirSync(new URL('../data/batches/', import.meta.url)).filter((x) => x.endsWith('.json')).sort()) {
  for (const [name, iast, dev, meaning, comps, state, ref, era, conf, gender] of JSON.parse(readFileSync(new URL(`../data/batches/${f}`, import.meta.url)))) {
    if (BLOCKED.has(name) || haveName.has(name.toLowerCase().replace(/\s+/g, ''))) continue;                       // names that are listed as compounds under a root (e.g. Girish under Giri)
    const gk = [...keysOf(iast, null, gender || 'boy'), ...keysOf(spokenIast(name, iast), null, gender || 'boy')];
    if (gk.some((k) => have.has(k))) continue;
    keysOf(iast, null, gender || 'boy').forEach((k) => have.add(k));
    haveName.add(name.toLowerCase().replace(/\s+/g, ''));
    names.push({
      name, iast: spokenIast(name, iast), ...(spokenIast(name, iast) !== iast ? { stem: iast } : {}),
      devanagari: dev, letter: name[0].toUpperCase(), syllable_count: syllableCount(spokenIast(name, iast)),
      meaning_en: meaning,
      components: comps.split('; ').map((c) => { const [part, gloss] = c.split(':'); return { part, gloss }; }),
      pairs_with: { prefixes: [], suffixes: [] }, compounds: [],
      states: [state], origin: 'attested', era: era || 'classical', confidence: conf || 'medium',
      ...(ref ? { deity_epic_ref: ref } : {}),
      gender: gender || 'boy',
      sources: [{ title: `Standard Sanskrit etymology (cf. Monier-Williams); compiled by hand, batch ${f}`, license: 'original compilation' }],
    });
    added++;
  }
}
writeFileSync(path, JSON.stringify(names, null, 2) + '\n');
console.log(`added ${added}, total ${names.length}`);
