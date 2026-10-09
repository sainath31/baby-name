import { loadAll } from './lib.js';
import { fromIast, toDevanagari } from '../src/translit.js';
import { syllableCount } from '../src/sounds.js';

const names = loadAll({ all: true }).filter((n) => n.reject_reason !== 'duplicate-after-fix');
const errors = [];
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const seen = new Map();
const seenSpell = new Map();

for (const n of names) {
  const key = norm(n.iast || n.name);
  if (seen.has(key) || seenSpell.has(n.name.toLowerCase())) errors.push(`duplicate: ${n.name} / ${seen.get(key) || seenSpell.get(n.name.toLowerCase())}`);
  seen.set(key, n.name); seenSpell.set(n.name.toLowerCase(), n.name);
  if (!n.meaning_en) errors.push(`${n.name}: missing meaning_en`);
  if (!n.sources?.length) errors.push(`${n.name}: missing sources`);
  if (n.sources?.some((s) => !s.license)) errors.push(`${n.name}: source missing license`);
  if (n.letter !== n.name[0].toUpperCase()) errors.push(`${n.name}: letter mismatch`);
  if (n.syllable_count !== syllableCount(n.iast)) errors.push(`${n.name}: syllable_count ${n.syllable_count} != ${syllableCount(n.iast)}`);
  // compounds must not duplicate top-level names
  for (const c of n.compounds || []) if (seen.has(norm(c.name))) errors.push(`${c.name}: compound duplicates a top-level name`);
}
const top = new Set(names.map((m) => norm(m.name)));
for (const n of names) for (const c of n.compounds || []) if (top.has(norm(c.name))) errors.push(`${c.name}: listed as both compound and top-level`);

// Script consistency: Devanagari must be what the IAST spells (modern respellings like मयंक are warnings only).
let scriptMismatch = 0;
for (const n of names.filter((x) => x.listed)) {
  if (/[ṉṟḻ]/.test(n.iast || '')) continue;                  // Dravidian letters: no Sanskrit script round-trip
  const slp = fromIast((n.iast || '').replace(/\s+/g, ''));
  if (slp === null) { errors.push(`${n.name}: IAST has unrecognised characters (${n.iast})`); continue; }
  if (toDevanagari(slp) !== (n.devanagari || '').replace(/\s+/g, '')) {
    scriptMismatch++;
    if (n.curation) errors.push(`${n.name}: devanagari ${n.devanagari} != ${toDevanagari(slp)} from IAST ${n.iast}`);
    else console.warn(`warn: ${n.name}: devanagari ${n.devanagari} differs from IAST-derived ${toDevanagari(slp)}`);
  }
}
if (scriptMismatch) console.warn(`${scriptMismatch} listed names have Devanagari differing from their IAST (hand-compiled ones are warnings).`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${names.length} unique names (${names.filter((n) => n.listed).length} listed)`);
