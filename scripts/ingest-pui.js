// Person names from the Purāṇa Index (PUI, English; Cologne CDSL). Only entries whose gloss
// says the person is a male figure (king, sage, son of, Asura, ...) are kept.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { isSlp1, toIast, toDevanagari, toLatin } from '../src/translit.js';
import { syllableCount } from '../src/sounds.js';

const text = readFileSync(new URL('../.cache/pui.txt', import.meta.url), 'utf8');
const MALE = /\b(king|sage|ṛṣi|rishi|son of|a son|father|brother|prince|asura|daitya|dānava|rākṣasa|yakṣa|gandharva|nāga|kādraveya|deva\b|god|monkey|vānara|brahmin|brāhmaṇa|warrior|hero|yādava|disciple|minister|ancestor|devotee|avatāra|preceptor|teacher|emperor|sūta|muni|manu|bhārgava|āṅgirasa|vasu|āditya|rudra|marut|sādhya|viśvedeva|grandson|descendant|charioteer|general|chief|ruler|vidyādhara|siddha|cāraṇa|kiṃnara|danu|kāśyapa)\b/i;
const NOT = /\b(daughter|wife|queen|apsaras|goddess|mother|sister|princess|river|mountain|kingdom|country|city|town|forest|lake|tīrtha|weapon|village|island|sea|ocean|mantra|weapon|a hell|a region|a mountain|a place|a forest|kingdom|capital|Śakti|plant|tree|herb|gem|a bird|a fish)\b/i;

const clean = (s) => s.replace(/<sup>[^<]*<\/sup>/g, '').replace(/<[^>]+>/g, '').replace(/\{%|%\}/g, '').replace(/\s+/g, ' ').trim();
const out = [], seen = new Set();
for (const e of text.split('<LEND>')) {
  const h = e.match(/<L>([^<]+)<pc>[^<]*<k1>([^<]+)<k2>/);
  if (!h) continue;
  const [, id, k1] = h;
  if (!isSlp1(k1) || k1.length < 3 || /[HM]$/.test(k1)) continue;
  const i = e.indexOf('¦');
  const first = clean(e.slice(i + 1).split(/<F>|<div n="P"|<div n="1"/)[0]);
  const m = first.match(/^—\s*(?:\([^)]*\)\s*)?(.+?)(?:[:.]|$)/);
  if (!m) continue;
  const g = m[1].replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  if (g.length < 4 || g.length > 120 || !MALE.test(g) || NOT.test(g)) continue;
  const iast = toIast(k1), name = toLatin(iast);
  if (seen.has(name.toLowerCase())) continue;
  seen.add(name.toLowerCase());
  out.push({
    name, iast, devanagari: toDevanagari(k1), letter: name[0].toUpperCase(), syllable_count: syllableCount(iast),
    meaning_en: `Name of ${/^(a|an|the|one)\b/i.test(g) ? g.replace(/^(a|an|the)\s+/i, (x) => x.toLowerCase()) : g}.`,
    components: [{ part: iast, gloss: '' }], pairs_with: { prefixes: [], suffixes: [] }, compounds: [],
    deity_epic_ref: 'Purāṇas (per Purāṇa Index)', states: ['All India'], origin: 'attested', era: 'classical',
    confidence: 'medium', curation: 'unreviewed',
    sources: [{ title: `Purāṇa Index (PUI), Cologne CDSL (csl-orig), entry L${id}`, license: 'CC BY-SA 4.0' }],
  });
}
mkdirSync(new URL('../data/generated/', import.meta.url), { recursive: true });
writeFileSync(new URL('../data/generated/pui-names.json', import.meta.url), JSON.stringify(out));
console.log(`pui: ${out.length} names`);
console.log(out.slice(0, 5).map((n) => `${n.name} | ${n.meaning_en}`).join('\n'));
