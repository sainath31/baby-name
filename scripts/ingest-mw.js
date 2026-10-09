// Extracts masculine proper names ("m. N. of ...") from Monier-Williams (Cologne CDSL, CC BY-SA 4.0)
// into data/generated/mw-names.json. Run scripts/fetch-sources.sh first.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { isSlp1, toIast, toDevanagari, toLatin } from '../src/translit.js';
import { syllableCount } from '../src/sounds.js';

const text = readFileSync(new URL('../.cache/mw.txt', import.meta.url), 'utf8');
const entries = text.split('<LEND>');

// Things that are not people/deities: skipped even when the entry is "m. N. of ...".
const REJECT = /\b(mountain|hill|range|river|lake|country|town|city|village|district|region|island|forest|plant|tree|herb|grass|work|book|treatise|poem|drama|metre|hell|star|constellation|planet|year|month|sacrifice|mantra|hymn|Sāman|Sāma|chapter|section|weapon|arrow|bow|disease|ocean|sea|tirtha|Tīrtha|place|palace|chariot|horse|elephant|measure|sect|school|Upaniṣad|Purāṇa|Tantra|Sūtra|ritual|rite|festival|water|vessel|gem|jewel|bird|fish|animal|insect|dog|monkey|cow|worm|tribe|people|race)\b/i;
const PERSON = /\b(man|men|prince|king|sage|Ṛṣi|Rishi|teacher|poet|author|grammarian|Brahman|warrior|son|descendant|pupil|minister|hero|Asura|Daitya|Dānava|Rākṣasa|Yakṣa|Gandharva|Nāga|Manu|Buddha|Jina|Arhat|Tīrtha-?kara|commentator|physician|astronomer|philosopher|saint|disciple|brother|father|general|chief|ruler|emperor|Vidyādhara|Vasu|Rudra|Āditya|Marut|Sādhya|Ṛbhu|deity|god|mythical|Pāṇḍava|Kuru|Yādava|Cakravartin|Siddha|Bodhisattva)\b/i;
const DEITY = /<s1>(Śiva|Viṣṇu|Kṛṣṇa|Indra|Agni|Brahmā|Gaṇeśa|Skanda|Kārttikeya|Sūrya|Varuṇa|Yama|Kubera|Vāyu|Soma|Rāma|Hanumat|Garuḍa|Balarāma|Kāma|Śeṣa|Candra|Bṛhaspati|Nārāyaṇa|Rudra|Mahādeva|Vāsudeva|Dhanvantari)<\/s1>/;

const clean = (s) => s
  .replace(/<ab>N\.<\/ab>/g, 'Name').replace(/<ab>([^<]*)<\/ab>/g, '$1')
  .replace(/<ls>[^<]*<\/ls>/g, '').replace(/<info[^>]*\/>/g, '').replace(/<srs\/>/g, '')
  .replace(/<s1?>([^<]*)<\/s1?>/g, '$1').replace(/<[^>]+>/g, '')
  .replace(/\([^)]*\bg\.[^)]*\)/g, '').replace(/\(m\. pl\.\)/g, '')
  .replace(/\s*(,\s*)?(&c\.?)\s*/g, ' ').replace(/\s+/g, ' ').replace(/[,;\s]+$/, '').trim();

const byStem = new Map();
for (const e of entries) {
  const head = e.match(/<L>([^<]+)<pc>[^<]*<k1>([^<]+)<k2>([^<]*)/);
  if (!head) continue;
  const [, id, k1, k2] = head;
  const body = e.slice(e.indexOf('¦') + 1);
  const m = body.match(/<lex>m\.<\/lex>\s*<ab>N\.<\/ab>\s*of\s+([^]*?)(?:<info|$)/);
  if (!m) continue;
  const tail = m[1];
  const plain = clean(tail);
  if (REJECT.test(plain) && !DEITY.test(tail)) continue;
  if (!PERSON.test(plain) && !DEITY.test(tail)) continue;
  if (!isSlp1(k1) || k1.length < 3 || /[HM]$/.test(k1) || /^[^aAiIuUfeEoO]*$/.test(k1)) continue;
  const rec = byStem.get(k1) || { k1, k2, ids: [], glosses: [] };
  rec.ids.push(id);
  if (!rec.glosses.includes(plain) && rec.glosses.length < 3) rec.glosses.push(plain);
  byStem.set(k1, rec);
}

const out = [];
const seenName = new Set();
for (const { k1, k2, ids, glosses } of [...byStem.values()].sort((a, b) => a.k1.localeCompare(b.k1))) {
  const iast = toIast(k1);
  const name = toLatin(iast);
  const key = name.toLowerCase();
  if (seenName.has(key)) continue;
  seenName.add(key);
  const slp = k2.split(/[-—]/).filter(isSlp1);
  const parts = slp.map(toIast);
  const compParts = slp.length > 1 ? slp : [k1];
  // Component glosses from first-sense lookups proved unreliable (homonyms), so only the split is kept.
  const comps = compParts.map((p) => ({ part: toIast(p), gloss: '' }));
  out.push({
    name, iast, devanagari: toDevanagari(k1), letter: name[0].toUpperCase(), syllable_count: syllableCount(iast),
    meaning_en: `Name of ${glosses.join('; also name of ')}.`.replace(/^Name of Name of /, 'Name of ').replace(/\.+$/, '.'),
    components: comps,
    pairs_with: { prefixes: [], suffixes: [] }, compounds: [],
    states: ['All India'], origin: 'attested', era: 'classical', confidence: 'medium', curation: 'unreviewed',
    sources: [{ title: `Monier-Williams Sanskrit-English Dictionary, Cologne CDSL (csl-orig), entry L${ids[0]}`, license: 'CC BY-SA 4.0' }],
  });
}
mkdirSync(new URL('../data/generated/', import.meta.url), { recursive: true });
writeFileSync(new URL('../data/generated/mw-names.json', import.meta.url), JSON.stringify(out));
console.log(`stems ${byStem.size}, names ${out.length}`);
console.log(out.slice(0, 3).map((n) => `${n.name} | ${n.devanagari} | ${n.meaning_en}`).join('\n'));
