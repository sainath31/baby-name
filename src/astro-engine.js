// Built-in Vedic astrology engine: birth date + time + place -> Moon sign (rashi), nakshatra, pada,
// naming syllable and ascendant (lagna). Uses the vendored panchang-ts library (MIT, sidereal Lahiri)
// for planetary positions and lagna, and our namakarana table (astrology.js) for the naming syllable.
// Works offline in the browser or Node. Verify against a panchang for ceremonies.
import { fromSiderealLongitude } from './astrology.js';

let lib;                                    // loaded on first use so the 640 KB library is lazy
const load = async () => (lib ||= await import('./vendor/panchang-ts.js'));

// Local civil time in an IANA zone (default India) -> UTC Date. Handles DST/historical offsets via Intl.
export function localToUtc(dateStr, timeStr, tz = 'Asia/Kolkata') {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi, s = 0] = timeStr.split(':').map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi, s);
  const offsetAt = (ms) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
      .formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms;
  };
  let guess = asUtc - offsetAt(asUtc);
  guess = asUtc - offsetAt(guess);
  return new Date(guess);
}

// birth: { date:'YYYY-MM-DD', time:'HH:MM', tz?:'Asia/Kolkata', lat?, lon? }  (lat/lon needed for lagna)
export async function birthChart(birth) {
  const { computePlanetaryPositions, computeLagna } = await load();
  const utc = localToUtc(birth.date, birth.time, birth.tz || 'Asia/Kolkata');
  const moon = computePlanetaryPositions(utc, 'lahiri').moon;
  const moonLon = moon.siderealLongitude;
  const base = fromSiderealLongitude(moonLon);
  const padaSpan = 360 / 27 / 4;
  const edge = Math.min(moonLon % padaSpan, padaSpan - (moonLon % padaSpan));
  const chart = { ...base, moonLongitude: +moonLon.toFixed(4), utc: utc.toISOString(),
    percentThroughNakshatra: Math.round(moon.nakshatra.completionPercentage),
    nearPadaBoundary: edge < 0.2,                          // within ~25 minutes of a pada change
    engine: 'panchang-ts 5.4.0 (Lahiri)' };
  if (typeof birth.lat === 'number' && typeof birth.lon === 'number') {
    const lg = computeLagna(utc, { latitude: birth.lat, longitude: birth.lon }, 'lahiri');
    chart.lagna = lg.rashi.name;
    chart.lagnaLongitude = +lg.siderealLongitude.toFixed(3);
  }
  return chart;
}

// Expected-date range (e.g. a due-date window): step through the range hour by hour and list every
// nakshatra pada the Moon passes through, with how many hours of the window it covers.
// from/to: 'YYYY-MM-DD' (inclusive, local dates in tz). Ranges are capped at 62 days.
export async function rangeChart({ from, to, tz = 'Asia/Kolkata', stepHours = 1 }) {
  const { computePlanetaryPositions } = await load();
  const start = localToUtc(from, '00:00', tz);
  const end = new Date(localToUtc(to, '00:00', tz).getTime() + 24 * 3600 * 1000);
  if (!(end > start)) throw new Error('The end date must be on or after the start date.');
  if ((end - start) / 86400000 > 62) throw new Error('Please choose a range of at most 62 days.');
  const step = stepHours * 3600 * 1000;
  const byKey = new Map();
  let total = 0;
  for (let t = start.getTime(); t < end.getTime(); t += step) {
    const at = new Date(t);
    const p = fromSiderealLongitude(computePlanetaryPositions(at, 'lahiri').moon.siderealLongitude);
    const key = `${p.nakshatra}|${p.pada}`;
    const e = byKey.get(key) || { ...p, hours: 0, firstUtc: at.toISOString() };
    e.hours += stepHours; total += stepHours;
    byKey.set(key, e);
  }
  const padas = [...byKey.values()].sort((a, b) => a.firstUtc.localeCompare(b.firstUtc));
  return { from, to, tz, hours: total, padas, syllables: [...new Set(padas.map((p) => p.syllable))],
    nakshatras: [...new Set(padas.map((p) => p.nakshatra))], rashis: [...new Set(padas.map((p) => p.rashi))] };
}
