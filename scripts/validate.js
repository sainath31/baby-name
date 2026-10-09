import { readFileSync } from 'node:fs';
import { syllableCount } from '../src/sounds.js';

const names = JSON.parse(readFileSync(new URL('../data/names.json', import.meta.url)));
const errors = [];
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const seen = new Map();

for (const n of names) {
  const key = norm(n.iast || n.name);
  if (seen.has(key)) errors.push(`duplicate: ${n.name} / ${seen.get(key)}`);
  seen.set(key, n.name);
  if (!n.meaning_en) errors.push(`${n.name}: missing meaning_en`);
  if (!n.sources?.length) errors.push(`${n.name}: missing sources`);
  if (n.sources?.some((s) => !s.license)) errors.push(`${n.name}: source missing license`);
  if (n.letter !== n.name[0].toUpperCase()) errors.push(`${n.name}: letter mismatch`);
  if (n.syllable_count !== syllableCount(n.iast)) errors.push(`${n.name}: syllable_count ${n.syllable_count} != ${syllableCount(n.iast)}`);
  // compounds must not duplicate top-level names
  for (const c of n.compounds || []) if (seen.has(norm(c.name))) errors.push(`${c.name}: compound duplicates a top-level name`);
}
for (const n of names) for (const c of n.compounds || []) if (names.some((m) => norm(m.name) === norm(c.name))) errors.push(`${c.name}: listed as both compound and top-level`);

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${names.length} unique names`);
