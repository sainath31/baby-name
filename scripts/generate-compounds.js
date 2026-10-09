// Rule-based generator of constructed names: curated first elements (data/lexicon/lex-*-verdicts.json,
// use:true) x suffixes/modifiers (data/lexicon/suffixes.json), joined by Sanskrit sandhi rules.
// Output data/generated/constructed.json (gitignored; regenerate with `npm run generate`).
// Every record is labelled origin:"constructed" - these are pattern-composed, not attested names.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fromIast, toDevanagari, toLatin } from '../src/translit.js';
import { syllableCount } from '../src/sounds.js';
import { loadAll, norm } from './lib.js';

const dir = new URL('../data/lexicon/', import.meta.url);
const { suffixes, modifiers } = JSON.parse(readFileSync(new URL('suffixes.json', dir)));

const elements = new Map();
for (const f of readdirSync(dir).filter((x) => /^lex-\d+-verdicts\.json$/.test(x)).sort())
  for (const e of JSON.parse(readFileSync(new URL(f, dir)))) if (e.use && e.gloss && e.type) elements.set(e.iast, e);

const VOWELS = 'aāiīuūṛeo';
const endsVowel = (s) => /[aāiīuūṛeo]$/.test(s) || /(ai|au)$/.test(s);
const startsVowel = (s) => /^(ai|au|[aāiīuūṛeo])/.test(s);
const A_SANDHI = { a: 'ā', ā: 'ā', i: 'e', ī: 'e', u: 'o', ū: 'o', ṛ: 'ar', e: 'ai', ai: 'ai', o: 'au', au: 'au' };

// Returns the joined form or null when the join is outside the safe rules.
function join(a, b) {
  if (!startsVowel(b)) return endsVowel(a) ? a + b : null;       // vowel + consonant: plain concatenation
  if (/a$/.test(a) || /ā$/.test(a)) {                              // a/ā + vowel: guṇa/vṛddhi merge
    const m = b.match(/^(ai|au|[aāiīuūṛeo])/)[1];
    return a.slice(0, -1) + A_SANDHI[m] + b.slice(m.length);
  }
  return null;
}

const existing = new Set(loadAll({ all: true }).map((n) => norm(n.iast)));
const seen = new Set(), out = [];
const add = (iast, tpl, x, partB, typeNote) => {
  const key = norm(iast);
  if (existing.has(key) || seen.has(key)) return;
  const name = toLatin(iast);
  if (name.length > 14 || syllableCount(iast) > 6 || syllableCount(iast) < 2) return;
  const slp = fromIast(iast);
  if (!slp) return;
  seen.add(key);
  out.push({
    name, iast, devanagari: toDevanagari(slp), letter: name[0].toUpperCase(), syllable_count: syllableCount(iast),
    meaning_en: tpl.replace('{X}', x.gloss) + '.',
    components: [{ part: x.iast, gloss: x.gloss }, partB],
    pairs_with: { prefixes: [], suffixes: [] }, compounds: [], states: ['All India'],
    origin: 'constructed', kind: 'compound', era: 'classical', confidence: 'medium', curation: 'unreviewed',
    sources: [{ title: `Rule-generated from curated elements (${x.iast} + ${partB.part}); pattern attested in Sanskrit naming, name itself not attested`, license: 'original compilation' }],
  });
};

for (const x of elements.values()) {
  for (const s of suffixes) {
    if (!s.types.includes(x.type)) continue;
    const j = join(x.iast, s.iast);
    if (j) add(j, s.tpl, x, { part: s.iast, gloss: s.tpl.replace(' {X}', '').replace('{X}', '').trim() });
  }
  for (const m of modifiers) {
    if (!m.types.includes(x.type)) continue;
    const j = join(m.iast, x.iast);
    if (j) add(j, m.tpl, x, { part: m.iast, gloss: m.tpl.replace(' {X}', '') });
  }
}
out.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(new URL('../data/generated/constructed.json', import.meta.url), JSON.stringify(out));
console.log(`elements ${elements.size}, suffixes ${suffixes.length}, constructed names ${out.length}`);
console.log(out.filter((_, i) => i % Math.max(1, Math.floor(out.length / 12)) === 0).map((n) => `${n.name} | ${n.meaning_en}`).join('\n'));
