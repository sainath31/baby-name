// Sound groups of the Devanagari varnamala, keyed by IAST initial.
// Longest-match first so digraphs (kh, gh, ch, ...) win over single letters.
const GROUPS = [
  ['vowel', ['a', 'ā', 'i', 'ī', 'u', 'ū', 'ṛ', 'e', 'ai', 'o', 'au']],
  ['ka-varga (velar)', ['kh', 'gh', 'k', 'g', 'ṅ']],
  ['ca-varga (palatal)', ['ch', 'jh', 'c', 'j', 'ñ']],
  ['ṭa-varga (retroflex)', ['ṭh', 'ḍh', 'ṭ', 'ḍ', 'ṇ']],
  ['ta-varga (dental)', ['th', 'dh', 't', 'd', 'n']],
  ['pa-varga (labial)', ['ph', 'bh', 'p', 'b', 'm']],
  ['semivowel', ['y', 'r', 'l', 'v']],
  ['sibilant/aspirate', ['ś', 'ṣ', 's', 'h']],
];
const ASPIRATED = new Set(['kh', 'gh', 'ch', 'jh', 'ṭh', 'ḍh', 'th', 'dh', 'ph', 'bh']);

export function initialSound(iast) {
  const s = iast.trim().toLowerCase();
  const all = GROUPS.flatMap(([g, list]) => list.map((x) => [x, g]));
  all.sort((a, b) => b[0].length - a[0].length);
  const hit = all.find(([x]) => s.startsWith(x));
  return hit ? { sound: hit[0], group: hit[1], aspirated: ASPIRATED.has(hit[0]) } : null;
}

// Counts vowel nuclei in IAST (each vowel cluster = one syllable).
export function syllableCount(iast) {
  const m = iast.toLowerCase().match(/ai|au|[aāiīuūṛṝḷeo]/g);
  return m ? m.length : 0;
}
