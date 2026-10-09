// Namakarana (naming-syllable) table: 27 nakshatras x 4 padas.
// Traditions vary slightly between almanacs; this is the commonly published set.
export const NAKSHATRAS = [
  ['Ashwini', ['Chu', 'Che', 'Cho', 'La']],
  ['Bharani', ['Li', 'Lu', 'Le', 'Lo']],
  ['Krittika', ['A', 'I', 'U', 'E']],
  ['Rohini', ['O', 'Va', 'Vi', 'Vu']],
  ['Mrigashira', ['Ve', 'Vo', 'Ka', 'Ki']],
  ['Ardra', ['Ku', 'Gha', 'Ng', 'Chha']],
  ['Punarvasu', ['Ke', 'Ko', 'Ha', 'Hi']],
  ['Pushya', ['Hu', 'He', 'Ho', 'Da']],
  ['Ashlesha', ['Di', 'Du', 'De', 'Do']],
  ['Magha', ['Ma', 'Mi', 'Mu', 'Me']],
  ['Purva Phalguni', ['Mo', 'Ta', 'Ti', 'Tu']],
  ['Uttara Phalguni', ['Te', 'To', 'Pa', 'Pi']],
  ['Hasta', ['Pu', 'Sha', 'Na', 'Tha']],
  ['Chitra', ['Pe', 'Po', 'Ra', 'Ri']],
  ['Swati', ['Ru', 'Re', 'Ro', 'Ta']],
  ['Vishakha', ['Ti', 'Tu', 'Te', 'To']],
  ['Anuradha', ['Na', 'Ni', 'Nu', 'Ne']],
  ['Jyeshtha', ['No', 'Ya', 'Yi', 'Yu']],
  ['Mula', ['Ye', 'Yo', 'Bha', 'Bhi']],
  ['Purva Ashadha', ['Bhu', 'Dha', 'Pha', 'Dha']],
  ['Uttara Ashadha', ['Bhe', 'Bho', 'Ja', 'Ji']],
  ['Shravana', ['Khi', 'Khu', 'Khe', 'Kho']],
  ['Dhanishta', ['Ga', 'Gi', 'Gu', 'Ge']],
  ['Shatabhisha', ['Go', 'Sa', 'Si', 'Su']],
  ['Purva Bhadrapada', ['Se', 'So', 'Da', 'Di']],
  ['Uttara Bhadrapada', ['Du', 'Tha', 'Jha', 'Na']],
  ['Revati', ['De', 'Do', 'Cha', 'Chi']],
];

export const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

const NAK_SPAN = 360 / 27;

// Moon's sidereal longitude (degrees, 0-360) -> nakshatra, pada, rashi, syllable.
export function fromSiderealLongitude(deg) {
  const d = ((deg % 360) + 360) % 360;
  const nIdx = Math.floor(d / NAK_SPAN);
  const pada = Math.floor((d % NAK_SPAN) / (NAK_SPAN / 4)) + 1;
  const [nakshatra, syllables] = NAKSHATRAS[nIdx];
  return {
    nakshatra,
    pada,
    rashi: RASHIS[Math.floor(d / 30)],
    syllable: syllables[pada - 1],
  };
}

export function syllablesForNakshatra(name) {
  const hit = NAKSHATRAS.find(([n]) => n.toLowerCase() === name.toLowerCase());
  return hit ? hit[1] : [];
}

export function syllablesForRashi(rashi) {
  const i = RASHIS.findIndex((r) => r.toLowerCase() === rashi.toLowerCase());
  if (i < 0) return [];
  // Each rashi spans 9 padas = 2.25 nakshatras.
  const out = [];
  for (let p = i * 9; p < i * 9 + 9; p++) out.push(NAKSHATRAS[Math.floor(p / 4)][1][p % 4]);
  return [...new Set(out)];
}
