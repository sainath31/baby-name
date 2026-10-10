// Writes reviewer input files for names that no verdict covers yet.
// Usage: node scripts/make-review-chunks.js <constructed|batch|listed-generated> [size=250]
//   constructed -> data/reviews/constructed/cons-NN-input.json ; others -> data/reviews/pending/pend-NN-input.json
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { loadAll } from './lib.js';

const [mode = 'constructed', sizeArg = '250'] = process.argv.slice(2);
const size = Number(sizeArg);
const reviewed = new Set();
for (const f of readdirSync(new URL('../data/reviews/', import.meta.url)).filter((x) => x.endsWith('-verdicts.json')))
  for (const v of JSON.parse(readFileSync(new URL(`../data/reviews/${f}`, import.meta.url)))) reviewed.add(v.name);

const all = loadAll({ all: true }).filter((n) => n.reject_reason !== 'duplicate-after-fix');
let pool;
if (mode === 'constructed') pool = all.filter((n) => n.origin === 'constructed');
else if (mode === 'batch') pool = all.filter((n) => !n.curation);
else pool = all.filter((n) => n.listed && n.curation && n.origin !== 'constructed');
pool = pool.filter((n) => !reviewed.has(n.name)).sort((a, b) => a.name.localeCompare(b.name));

const dir = mode === 'constructed' ? 'constructed' : 'pending';
const prefix = mode === 'constructed' ? 'cons' : 'pend';
mkdirSync(new URL(`../data/reviews/${dir}/`, import.meta.url), { recursive: true });
let i = 0;
for (let s = 0; s < pool.length; s += size) {
  i++;
  writeFileSync(new URL(`../data/reviews/${dir}/${prefix}-${String(i).padStart(2, '0')}-input.json`, import.meta.url),
    JSON.stringify(pool.slice(s, s + size).map((n) => ({
      name: n.name, gender: n.gender || 'boy', devanagari: n.devanagari, iast: n.iast, meaning_en: n.meaning_en,
      parts: (n.components || []).map((c) => c.part).join(' + '),
      source: n.origin === 'constructed' ? 'rule-built compound' : (n.curation ? 'dictionary-generated' : 'hand-compiled'),
    }))));
}
console.log(`${pool.length} unreviewed ${mode} records -> ${i} files in data/reviews/${dir}/`);
