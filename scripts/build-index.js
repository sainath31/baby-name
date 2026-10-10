// Emits per-letter JSON shards + a small manifest under web/data/ (consumed by web/).
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { loadAll } from './lib.js';
import { toTelugu, toKannada } from '../src/indic-scripts.js';
import { nameNumber } from '../src/numerology.js';
import { initialSound } from '../src/sounds.js';

const names = loadAll();

// ---- suffix / prefix pairing, derived from the reviewed lexicon (data/lexicon) and suffix rules
import { readFileSync, readdirSync } from 'node:fs';
import { norm } from './lib.js';
const lexDir = new URL('../data/lexicon/', import.meta.url);
const { suffixes: SUF, modifiers: MOD } = JSON.parse(readFileSync(new URL('suffixes.json', lexDir)));
const ELEMENTS = new Map();
for (const f of readdirSync(lexDir).filter((x) => /^lex-\d+-verdicts\.json$/.test(x)))
  for (const e of JSON.parse(readFileSync(new URL(f, lexDir)))) if (e.use && e.type) ELEMENTS.set(norm(e.iast), e);
const toLatin = (s) => s.replace(/[āīū]/g, (c) => ({ ā: 'a', ī: 'i', ū: 'u' })[c]).replace(/[śṣ]/g, 'sh').replace(/ṛ/g, 'ri').replace(/[ṇṭḍṅñṃḥ]/g, (c) => ({ ṇ: 'n', ṭ: 't', ḍ: 'd', ṅ: 'n', ñ: 'n', ṃ: 'm', ḥ: 'h' })[c]);
const latinSuffix = (s) => toLatin(s).replace(/^./, (c) => c.toUpperCase());
// Which listed constructed names are built on each element (first component), as concrete examples.
const EXAMPLES = new Map();
for (const n of names) if (n.origin === 'constructed' && n.components?.length === 2) {
  const k = norm(n.components[0].part); (EXAMPLES.get(k) || EXAMPLES.set(k, []).get(k)).push(n.name);
}
const pairingFor = (n) => {
  const el = ELEMENTS.get(norm(n.stem || n.iast)) || ELEMENTS.get(norm(n.iast));
  if (!el) return null;
  return {
    type: el.type,
    suffixes: SUF.filter((s) => s.types.includes(el.type)).map((s) => latinSuffix(s.iast)),
    prefixes: MOD.filter((m) => m.types.includes(el.type)).map((m) => latinSuffix(m.iast)),
    examples: (EXAMPLES.get(norm(el.iast)) || []).slice(0, 8),
  };
};
const dir = new URL('../web/data/', import.meta.url);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

const THEMES = {
  'Strength and valour': /\b(strong|strength|valou?r|brave|hero|warrior|mighty|powerful|victor|conquer|invincible|courage)/i,
  'Light, sun and moon': /\b(sun|moon|light|radiant|bright|luminous|shining|splendou?r|dawn|star|lustre)/i,
  'Wisdom and learning': /\b(wise|wisdom|knowledge|learn|intellect|sage|scholar|knowing|understanding)/i,
  'Devotion and virtue': /\b(devot|pious|virtu|righteous|dharma|truth|pure|holy|worship)/i,
  'Nature': /\b(mountain|river|ocean|sea|lotus|flower|tree|forest|earth|sky|cloud|lion|elephant|ocean|water|wind)/i,
  'Prosperity': /\b(prosper|wealth|fortune|riches|auspicious|happy|happiness|bliss|joy|success)/i,
  'Protector': /\b(protect|guard|lord|king|ruler|sovereign|master|refuge|saviou?r|defend)/i,
};
const DEITIES = {
  Vishnu: /vishnu|narayana|hari\b/i, Shiva: /shiva|śiva|mahadeva|rudra|shankara|śaṅkara/i, Ganesha: /ganesh|ganapati|vinayaka/i,
  Rama: /\brama\b|rāma|ramayana|raghu/i, Krishna: /krishna|kṛṣṇa|govinda|gopala|mahabharata/i, Hanuman: /hanuman|māruti|maruti/i,
  'Devi (Goddess)': /\bdevi\b|durga|lakshmi|parvati|saraswati/i, Surya: /\bsurya\b|sūrya|aditya|\bsun\b/i,
  Indra: /\bindra\b/i, Brahma: /brahma/i, Kartikeya: /skanda|kartikeya|murugan|subrahman/i,
};
const tagsOf = (map, text) => Object.keys(map).filter((k) => map[k].test(text));
const compact = (n) => {
  const o = {
    n: n.name, d: n.devanagari, i: n.iast, s: n.syllable_count, m: n.meaning_en,
    c1: nameNumber(n.name, 'chaldean'), c2: nameNumber(n.name, 'pythagorean'),
    g: initialSound(n.iast)?.group || '', a: initialSound(n.iast)?.aspirated ? 1 : 0,
  };
  const dev = (n.devanagari || '').replace(/\s+/g, ' ').trim();
  const te = dev && toTelugu(dev), kn = dev && toKannada(dev);
  if (te) o.te = te; if (kn) o.kn = kn;
  const th = tagsOf(THEMES, n.meaning_en || ''); if (th.length) o.th = th;
  const dt = tagsOf(DEITIES, `${n.deity_epic_ref || ''} ${n.meaning_en || ''} ${n.name}`); if (dt.length) o.dt = dt;
  if (n.components?.length) o.co = n.components.map((c) => [c.part, c.gloss || '']);
  const p = n.pairs_with;
  if (p?.prefixes?.length || p?.suffixes?.length) o.pw = [p.prefixes || [], p.suffixes || []];
  const pr = pairingFor(n); if (pr) o.px = [pr.type, pr.prefixes, pr.suffixes, pr.examples];
  if (n.compounds?.length) o.cp = n.compounds.map((c) => [c.name, c.meaning || '']);
  if (n.states?.length) o.st = n.states;
  if (n.era) o.e = n.era;
  if (n.kind) o.k = n.kind;
  if (n.curation === 'unreviewed') o.u = 1;
  if (n.origin === 'constructed') o.cn = 1;
  if (n.alt_spellings?.length) o.al = n.alt_spellings;
  if (n.gender === 'unisex') o.gu = 1;
  if (n.gender === 'girl') o.gg = 1;
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
  themes: Object.keys(THEMES),
  deities: Object.keys(DEITIES),
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
