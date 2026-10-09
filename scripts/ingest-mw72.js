// Masculine proper names from the 1872 Monier-Williams (mw72, Cologne CDSL). Same rules as ingest-mw.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { isSlp1, toIast, toDevanagari, toLatin } from '../src/translit.js';
import { syllableCount } from '../src/sounds.js';

const text = readFileSync(new URL('../.cache/mw72.txt', import.meta.url), 'utf8');
const REJECT = /\b(mountain|hill|range|river|lake|country|town|city|village|district|region|island|forest|plant|tree|herb|grass|work|book|treatise|poem|drama|metre|hell|star|constellation|planet|year|month|sacrifice|mantra|hymn|Sāman|Sāma|chapter|section|weapon|arrow|bow|disease|ocean|sea|tirtha|Tīrtha|place|palace|chariot|horse|elephant|measure|sect|school|Upaniṣad|Purāṇa|Tantra|Sūtra|ritual|rite|festival|water|vessel|gem|jewel|bird|fish|animal|insect|dog|monkey|cow|worm|tribe|people|race)\b/i;
const PERSON = /\b(man|men|prince|king|sage|Ṛṣi|Rishi|teacher|poet|author|grammarian|Brahman|warrior|son|descendant|pupil|minister|hero|Asura|Daitya|Dānava|Rākṣasa|Yakṣa|Gandharva|Nāga|Manu|Buddha|Jina|Arhat|Tīrtha-?kara|commentator|physician|astronomer|philosopher|saint|disciple|brother|father|general|chief|ruler|emperor|Vidyādhara|Vasu|Rudra|Āditya|Marut|Sādhya|Ṛbhu|deity|god|mythical|Pāṇḍava|Kuru|Yādava|Cakravartin|Siddha|Bodhisattva)\b/i;
const DEITY = /\b(Śiva|Viṣṇu|Kṛṣṇa|Indra|Agni|Brahmā|Gaṇeśa|Skanda|Kārttikeya|Sūrya|Varuṇa|Yama|Kubera|Vāyu|Soma|Rāma|Hanumat|Garuḍa|Balarāma|Kāma|Śeṣa|Candra|Bṛhaspati|Nārāyaṇa|Rudra|Mahādeva|Vāsudeva)\b/;
const clean = (s) => s.replace(/<[^>]+>/g, '').replace(/\{%|%\}/g, '').replace(/\s+/g, ' ').trim();

const out = [], seen = new Set();
for (const e of text.split('<LEND>')) {
  const h = e.match(/<L>([^<]+)<pc>[^<]*<k1>([^<]+)<k2>/);
  if (!h) continue;
  const [, id, k1] = h;
  if (!isSlp1(k1) || k1.length < 3 || /[HM]$/.test(k1)) continue;
  const body = clean(e.slice(e.indexOf('¦') + 1));
  const m = body.match(/\bm\.,?\s*(?:\([^)]*\)\s*)?N\. of (.+?)(?:[;]|\.\s|$)/);
  if (!m) continue;
  const g = m[1].replace(/\s*(,\s*)?&c\.?/g, '').replace(/[,\s]+$/, '').trim();
  if (g.length < 3 || g.length > 120 || (REJECT.test(g) && !DEITY.test(g)) || (!PERSON.test(g) && !DEITY.test(g))) continue;
  const iast = toIast(k1), name = toLatin(iast);
  if (seen.has(name.toLowerCase())) continue;
  seen.add(name.toLowerCase());
  out.push({
    name, iast, devanagari: toDevanagari(k1), letter: name[0].toUpperCase(), syllable_count: syllableCount(iast),
    meaning_en: `Name of ${g.replace(/\.+$/, "")}.`, components: [{ part: iast, gloss: '' }],
    pairs_with: { prefixes: [], suffixes: [] }, compounds: [], states: ['All India'], origin: 'attested',
    era: 'classical', confidence: 'medium', curation: 'unreviewed',
    sources: [{ title: `Monier-Williams, A Sanskrit-English Dictionary (1872), Cologne CDSL (csl-orig), entry L${id}`, license: 'CC BY-SA 4.0' }],
  });
}
writeFileSync(new URL('../data/generated/mw72-names.json', import.meta.url), JSON.stringify(out));
console.log(`mw72: ${out.length} names`);
console.log(out.slice(0, 4).map((n) => `${n.name} | ${n.meaning_en}`).join('\n'));
