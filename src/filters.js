import { nameNumber } from './numerology.js';
import { initialSound, syllableCount } from './sounds.js';
import { syllablesForNakshatra, syllablesForRashi } from './astrology.js';

const lc = (s) => String(s).toLowerCase();
const anyOf = (vals) => (vals == null ? null : [].concat(vals).map(lc));

// query: { letter, states[], syllables[], soundGroup[], numerology:{system, numbers[]},
//          nakshatra, rashi, startSyllables[] }
// Values inside one filter are ORed; separate filters are ANDed.
export function filterNames(names, q = {}) {
  const letters = anyOf(q.letter);
  const states = anyOf(q.states);
  const groups = anyOf(q.soundGroup);
  const wantCounts = q.syllables ? [].concat(q.syllables).map(Number) : null;
  const starts = [
    ...(q.startSyllables || []),
    ...(q.nakshatra ? syllablesForNakshatra(q.nakshatra) : []),
    ...(q.rashi ? syllablesForRashi(q.rashi) : []),
  ].map(lc);
  const num = q.numerology;

  return names.filter((n) => {
    if (letters && !letters.includes(lc(n.letter))) return false;
    if (states && !(n.states || []).some((s) => lc(s) === 'all india' || states.includes(lc(s)))) return false;
    if (wantCounts && !wantCounts.includes(n.syllable_count)) return false;
    if (groups) {
      const snd = initialSound(n.iast);
      if (!snd || !groups.includes(lc(snd.group))) return false;
    }
    if (starts.length && !starts.some((s) => lc(n.name).startsWith(s))) return false;
    if (num?.numbers?.length) {
      if (!num.numbers.includes(nameNumber(n.name, num.system || 'chaldean'))) return false;
    }
    return true;
  });
}

export { syllableCount };
