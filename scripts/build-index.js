// Emits per-letter JSON shards + a small manifest under web/data/ (consumed by web/).
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { loadAll } from './lib.js';
import { nameNumber } from '../src/numerology.js';
import { initialSound } from '../src/sounds.js';

const names = loadAll();
const dir = new URL('../web/data/', import.meta.url);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

const compact = (n) => {
  const o = {
    n: n.name, d: n.devanagari, i: n.iast, s: n.syllable_count, m: n.meaning_en,
    c1: nameNumber(n.name, 'chaldean'), c2: nameNumber(n.name, 'pythagorean'),
    g: initialSound(n.iast)?.group || '',
  };
  if (n.components?.length) o.co = n.components.map((c) => [c.part, c.gloss || '']);
  const p = n.pairs_with;
  if (p?.prefixes?.length || p?.suffixes?.length) o.pw = [p.prefixes || [], p.suffixes || []];
  if (n.compounds?.length) o.cp = n.compounds.map((c) => [c.name, c.meaning || '']);
  if (n.states?.length) o.st = n.states;
  if (n.era) o.e = n.era;
  if (n.kind) o.k = n.kind;
  if (n.curation === 'unreviewed') o.u = 1;
  if (n.confidence) o.cf = n.confidence;
  if (n.deity_epic_ref) o.r = n.deity_epic_ref;
  if (n.sources?.length) o.so = n.sources.map((s) => [s.title, s.license || '']);
  return o;
};

const byLetter = new Map();
for (const n of names) {
  const l = (n.letter || n.name[0]).toUpperCase();
  if (!byLetter.has(l)) byLetter.set(l, []);
  byLetter.get(l).push(n);
}
const facet = (f) => [...new Set(names.flatMap((n) => [].concat(f(n) ?? [])))].filter(Boolean).sort();
const letters = [...byLetter.keys()].sort();
const manifest = {
  total: names.length,
  generated: new Date().toISOString(),
  letters: {},
  states: facet((n) => n.states),
  eras: facet((n) => n.era),
  kinds: facet((n) => n.kind),
  groups: facet((n) => initialSound(n.iast)?.group),
  maxSyllables: Math.max(...names.map((n) => n.syllable_count)),
};
for (const l of letters) {
  const arr = byLetter.get(l).sort((a, b) => a.name.localeCompare(b.name)).map(compact);
  const file = `${l}.json`;
  writeFileSync(new URL(file, dir), JSON.stringify(arr));
  manifest.letters[l] = { count: arr.length, file };
}
writeFileSync(new URL('manifest.json', dir), JSON.stringify(manifest));
console.log(`Wrote web/data/ manifest + ${letters.length} shards (${names.length} names)`);
