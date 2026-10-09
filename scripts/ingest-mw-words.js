// Everyday Sanskrit words (m. nouns / mfn. adjectives) from Monier-Williams whose dictionary
// meaning is a recognised name-like quality (brave, radiant, victorious, lord, sun, ...).
// Records are flagged kind:"word" and curation:"unreviewed"; the meaning is the dictionary's own gloss.
import { readFileSync, writeFileSync } from 'node:fs';
import { isSlp1, toIast, toDevanagari, toLatin } from '../src/translit.js';
import { syllableCount } from '../src/sounds.js';

const text = readFileSync(new URL('../.cache/mw.txt', import.meta.url), 'utf8');
const GOOD = /\b(brave|bold|hero|heroic|valiant|victorious|victory|conquer\w*|invincible|unconquered|strong|mighty|powerful|splendid|splendour|radiant|bright|brilliant|shining|luminous|light|lustre|beautiful|handsome|charming|lovely|pleasant|agreeable|delightful|auspicious|fortunate|prosperous|noble|excellent|best|good|virtuous|righteous|pure|holy|sacred|wise|learned|intelligent|clever|skilful|truthful|true|faithful|steadfast|firm|steady|fearless|gentle|kind|compassionate|friend\w*|beloved|dear|joy\w*|happy|bliss\w*|glad|famous|fame|glory|glorious|illustrious|renowned|lord|king|ruler|sovereign|protector|guardian|leader|chief|sun|moon|star|fire|wind|ocean|lotus|golden|gold|jewel|gem|truth|dharma|love|devoted|generous|liberal|immortal|eternal|ancient|young|youthful)\b/i;
const BAD = /(disease|sick|demon|enemy|foe|death|dead|kill|slay|poison|snake|serpent|hell|sin\b|wicked|evil|bad\b|cruel|fierce|terrible|dreadful|thief|robber|fool|stupid|blind|deaf|lame|dumb|weak|poor|mad\b|drunk|woman|female|wife|girl|daughter|mother|menstru|semen|urine|excrement|filth|dung|impure|low\b|vile|contempt|cheat|liar|false|Vedic|gram\.|ritual|sacrifice|Soma|verse|metre|mantra|hymn|plant|tree|herb|grass|bird|fish|insect|animal|cow|horse|elephant|camel|lion|tiger|rice|barley|food|drink|cloth|garment|house|town|village|country|river|mountain|name of|wheel|chariot|cart|weapon|arrow|bow\b|sword|water|rain|cloud|body|limb|hand|foot|ear\b|eye\b|nose|mouth|tongue|belly|hair|bone|blood|skin|breast|face|head\b|neck|tooth|fat\b|oil|ghee|milk|fruit|flower|seed|root|leaf|branch|stone|iron|copper|silver)/i;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const clean = (s) => s.replace(/<ls>[^<]*<\/ls>/g, '').replace(/<info[^>]*\/>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const found = new Map();
for (const e of text.split('<LEND>')) {
  const h = e.match(/<L>([^<]+)<pc>[^<]*<k1>([^<]+)<k2>([^<]*)/);
  if (!h) continue;
  const [, id, k1, k2] = h;
  if (found.has(k1) || !isSlp1(k1) || k1.length < 4 || k1.length > 14 || /[HM]$/.test(k1)) continue;
  if (!/[aAiIuUfeEoO]/.test(k1[k1.length - 1]) && !/(n|t|s)$/.test(k1)) continue;
  const body = e.slice(e.indexOf('¦') + 1);
  const m = body.match(/<lex>(m\.|mfn\.)<\/lex>\s*([^<]*(?:<(?:s|s1|ab|lang|etym)[^>]*>[^<]*<\/(?:s|s1|ab|lang|etym)>[^<]*)*)/);
  if (!m) continue;
  const g = clean(m[2]).replace(/[‘’“”]/g, '').split(/[;,(\[]/)[0].replace(/\.$/, '').trim();
  if (g.length < 3 || g.length > 40 || g.split(' ').length > 3) continue;
  if (/^(a kind|a sort|N\.|the em|with|having|possessed|one who|belonging|relating|consisting|made of|son of|born|being|full of|abounding|endowed)|[˚\u00b0\u2014]|\bworm\b|\bpāṭha\b/i.test(g)) continue;
  if (/\b(of|the|a|an|to|with|in|for|by|on|and|or)$/i.test(g) || /^(a|an)\s+(learned|young|good|wise|noble|strong|brave|pure|holy|kind)$/i.test(g)) continue;
  if (!GOOD.test(g) || BAD.test(g) || /[=|]|^(see|a prefix|name)/i.test(g)) continue;
  found.set(k1, { id, k2, g, kind: m[1] });
}
const out = [];
const seen = new Set();
for (const [k1, { id, k2, g }] of [...found].sort((a, b) => a[0].localeCompare(b[0]))) {
  const iast = toIast(k1), name = toLatin(iast);
  if (seen.has(name.toLowerCase())) continue;
  seen.add(name.toLowerCase());
  const slp = k2.split(/[-—]/).filter(isSlp1);
  out.push({
    name, iast, devanagari: toDevanagari(k1), letter: name[0].toUpperCase(), syllable_count: syllableCount(iast),
    meaning_en: `${cap(g)}.`,
    components: (slp.length > 1 ? slp : [k1]).map((p) => ({ part: toIast(p), gloss: '' })),
    pairs_with: { prefixes: [], suffixes: [] }, compounds: [],
    states: ['All India'], origin: 'attested', kind: 'word', era: 'classical', confidence: 'medium', curation: 'unreviewed',
    sources: [{ title: `Monier-Williams Sanskrit-English Dictionary, Cologne CDSL (csl-orig), entry L${id}`, license: 'CC BY-SA 4.0' }],
  });
}
writeFileSync(new URL('../data/generated/mw-words.json', import.meta.url), JSON.stringify(out));
console.log(`words: ${out.length}`);
console.log(out.filter((_, i) => i % Math.ceil(out.length / 14) === 0).map((n) => `${n.name} | ${n.meaning_en}`).join('\n'));
