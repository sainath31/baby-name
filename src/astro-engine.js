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
