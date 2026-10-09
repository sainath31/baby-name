// Masculine proper names from Böhtlingk's Sanskrit-Wörterbuch (PW / PWG, Cologne CDSL).
// German glosses are translated through a small fixed phrase table; anything untranslatable
// falls back to a generic "Name of a person" so no meaning is invented.
// Usage: node scripts/ingest-pw.js pw|pwg
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { isSlp1, toIast, toDevanagari, toLatin } from '../src/translit.js';
import { syllableCount } from '../src/sounds.js';

const dict = process.argv[2] || 'pw';
const text = readFileSync(new URL(`../.cache/${dict}.txt`, import.meta.url), 'utf8');

const PHRASES = [
  [/eines Mannes/, 'a man'], [/eines Königs/, 'a king'], [/eines Fürsten/, 'a prince'], [/eines Sohnes/, 'a son'],
  [/eines Autors/, 'an author'], [/eines Lehrers/, 'a teacher'], [/eines Dichters/, 'a poet'],
  [/eines Schlangendämons/, 'a serpent-demon (Nāga)'], [/eines Scholiasten/, 'a commentator'],
  [/eines Grammatikers/, 'a grammarian'], [/eines Brahmanen/, 'a Brahman'], [/eines Gelehrten/, 'a scholar'],
  [/eines Schülers/, 'a pupil'], [/eines Dämons/, 'a demon'], [/eines Affen/, 'a monkey (vānara)'],
  [/eines Ministers/, 'a minister'], [/eines Astronomen/, 'an astronomer'], [/eines Arztes/, 'a physician'],
  [/eines Kriegers/, 'a warrior'], [/eines Liedverfassers/, 'a Vedic hymn-composer'], [/eines Verfassers/, 'an author'],
  [/eines mythischen (?:Wesens|Königs|Fürsten|Weisen)/, 'a mythical being'], [/eines Wesens/, 'a being'],
  [/eines Heiligen/, 'a saint'], [/eines Weisen/, 'a sage'], [/eines Gottes/, 'a god'], [/eines Asura/, 'an Asura'],
  [/eines Rākṣasa/, 'a Rākṣasa'], [/eines Yakṣa/, 'a Yakṣa'], [/eines Gandharva/, 'a Gandharva'],
  [/eines Buddha/, 'a Buddha'], [/eines Arhat/, 'an Arhat'], [/eines Jaina-Lehrers/, 'a Jain teacher'],
  [/verschiedener Männer/, 'various men'], [/verschiedener Fürsten/, 'various princes'],
];
const SKIP = /(Volkes|Flusses|Oertlichkeit|Berges|Stadt|Dorfes|Landes|Wallfahrtsortes|Gegend|Gebirges|Heiligthums|Geschlechts|Kriegerstammes|Werkes|Tochter|Gattin|Mutter|Frau|Frauenzimmers|Fürstin|Göttin|Metrums|Sterns|Waldes|Baumes|Sees|Weltgegend|Pflanze|Tirtha|Gottheit)/;

const out = [];
const byIast = new Map();
for (const e of text.split('<LEND>')) {
  const head = e.match(/<L>([^<]+)<pc>[^<]*<k1>([^<]+)<k2>([^<]*)/);
  if (!head) continue;
  const [, id, k1] = head;
  if (!isSlp1(k1) || k1.length < 3 || /[HM]$/.test(k1)) continue;
  const body = e.slice(e.indexOf('¦') + 1);
  const m = body.match(/<lex>m\.<\/lex>\s*<ab>N\. pr\.<\/ab>\s*([^<]*(?:<is>[^<]*<\/is>[^<]*)*)/);
  if (!m) continue;
  const de = m[1].replace(/<[^>]+>/g, '').replace(/^\s*(Name)?\s*/, '').trim();
  if (SKIP.test(de)) continue;
  let en = null;
  for (const [re, tr] of PHRASES) if (re.test(de)) { en = tr; break; }
  const son = de.match(/^ein Sohn(?:es)? (?:des |der )?(\S+)/);
  if (!en && son) en = `a son of ${son[1].replace(/ʼs$/, '')}`;
  if (!en) { if (!/^(eines|ein|des)\b|^$/.test(de) && !/Mann|König|Fürst/.test(de)) continue; en = 'a person'; }
  const rec = byIast.get(k1) || { k1, id, glosses: [] };
  if (!rec.glosses.includes(en)) rec.glosses.push(en);
  byIast.set(k1, rec);
}

const seen = new Set();
for (const { k1, id, glosses } of [...byIast.values()].sort((a, b) => a.k1.localeCompare(b.k1))) {
  const iast = toIast(k1), name = toLatin(iast);
  if (seen.has(name.toLowerCase())) continue;
  seen.add(name.toLowerCase());
  const generic = glosses.every((g) => g === 'a person');
  out.push({
    name, iast, devanagari: toDevanagari(k1), letter: name[0].toUpperCase(), syllable_count: syllableCount(iast),
    meaning_en: `Name of ${glosses.filter((g) => g !== 'a person').join(', also ') || 'a person'}.`,
    components: [{ part: iast, gloss: '' }], pairs_with: { prefixes: [], suffixes: [] }, compounds: [],
    states: ['All India'], origin: 'attested', era: 'classical', confidence: generic ? 'low' : 'medium', curation: 'unreviewed',
    sources: [{ title: `Böhtlingk, Sanskrit-Wörterbuch (${dict.toUpperCase()}), Cologne CDSL (csl-orig), entry L${id}`, license: 'CC BY-SA 4.0' }],
  });
}
mkdirSync(new URL('../data/generated/', import.meta.url), { recursive: true });
writeFileSync(new URL(`../data/generated/${dict}-names.json`, import.meta.url), JSON.stringify(out));
console.log(`${dict}: ${out.length} names`);
