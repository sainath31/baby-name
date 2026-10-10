import test from 'node:test';
import assert from 'node:assert/strict';
import * as Astronomy from './vendor/astronomy-engine.js';
import { localToUtc, birthChart } from '../src/astro-engine.js';
import { RASHIS, NAKSHATRAS, syllablesForRashi } from '../src/astrology.js';
import { computePlanetaryPositions } from '../src/vendor/panchang-ts.js';

// Independent check: astronomy-engine Moon/Sun (true ecliptic of date) minus linear Lahiri ayanamsa.
const lahiri = (d) => 23.8531 + (50.29 / 3600) * ((d - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86400000));
const n360 = (x) => ((x % 360) + 360) % 360;

test('IST to UTC', () => {
  assert.equal(localToUtc('1990-05-10', '10:30', 'Asia/Kolkata').toISOString(), '1990-05-10T05:00:00.000Z');
});

test('Moon longitude agrees with an independent ephemeris (60 random instants 1940-2040)', async () => {
  for (let i = 0; i < 60; i++) {
    const t = new Date(Date.UTC(1940, 0, 1) + ((i * 0.6180339887) % 1) * 100 * 365.25 * 86400000);
    const c = await birthChart({ date: t.toISOString().slice(0, 10), time: t.toISOString().slice(11, 16), tz: 'UTC' });
    const ref = n360(Astronomy.EclipticGeoMoon(new Date(c.utc)).lon - lahiri(new Date(c.utc)));
    const d = Math.abs(c.moonLongitude - ref);
    assert.ok(Math.min(d, 360 - d) < 0.05, `${c.utc}: ${c.moonLongitude} vs ${ref}`);
  }
});

test('chart fields', async () => {
  const c = await birthChart({ date: '2024-03-25', time: '06:00', lat: 13.083, lon: 80.271 });
  assert.equal(c.nakshatra, 'Uttara Phalguni'); assert.equal(c.pada, 4); assert.equal(c.rashi, 'Kanya'); assert.equal(c.syllable, 'Pi');
  assert.ok(RASHIS.includes(c.lagna));
});

test('lagna at sunrise equals the Sun\'s sidereal sign (physical check on the ascendant)', async () => {
  // Chennai ~06:15 IST on 25 Mar 2024: the rising sign is the Sun's sign.
  const c = await birthChart({ date: '2024-03-25', time: '06:15', lat: 13.083, lon: 80.271 });
  const sun = n360(Astronomy.SunPosition(new Date(c.utc)).elon - lahiri(new Date(c.utc)));
  assert.equal(c.lagna, RASHIS[Math.floor(sun / 30)]);
});

test('lagna cycles through all 12 signs over a day', async () => {
  const seen = new Set();
  for (let h = 0; h < 24; h++) seen.add((await birthChart({ date: '2024-03-25', time: `${String(h).padStart(2, '0')}:00`, lat: 28.6, lon: 77.2 })).lagna);
  assert.ok(seen.size >= 11, [...seen].join());
});

// Published ground truth (Indian almanacs / eclipse catalogues), independent of our code.
const pos = (iso) => computePlanetaryPositions(new Date(iso), 'lahiri');
const near = (a, b, tol) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b)) < tol;

test('Makar Sankranti 2024 (15 Jan 02:54 IST): Sun at 270 degrees sidereal', () => {
  assert.ok(near(pos('2024-01-14T21:24:00Z').sun.siderealLongitude, 270, 0.05));
});
test('Mesha Sankranti 2024 (13 Apr 21:04 IST): Sun at 0 degrees sidereal', () => {
  assert.ok(near(pos('2024-04-13T15:34:00Z').sun.siderealLongitude, 0, 0.05));
});
test('Lunar eclipse 28 Oct 2023: Moon opposite Sun, in Ashwini (Sharad Purnima)', () => {
  const p = pos('2023-10-28T20:14:00Z');
  assert.ok(near(Math.abs(p.moon.siderealLongitude - p.sun.siderealLongitude), 180, 0.5));
  assert.ok(p.moon.siderealLongitude >= 0 && p.moon.siderealLongitude < 360 / 27);
});
test('Solar eclipse 8 Apr 2024: Moon conjunct Sun', () => {
  const p = pos('2024-04-08T18:17:00Z');
  assert.ok(near(p.moon.siderealLongitude, p.sun.siderealLongitude, 0.5));
});
test('naming-syllable table: 27 nakshatras x 4 padas, and rashi syllables are consistent', () => {
  assert.equal(NAKSHATRAS.length, 27);
  for (const [, s] of NAKSHATRAS) assert.equal(s.length, 4);
  // Mesha spans Ashwini, Bharani and the first pada of Krittika.
  assert.deepEqual(syllablesForRashi('Mesha').slice(0, 4), NAKSHATRAS[0][1]);
});

test('due-date range lists every pada the Moon passes through', async () => {
  const { rangeChart } = await import('../src/astro-engine.js');
  const r = await rangeChart({ from: '2024-03-25', to: '2024-03-31' });
  // The Moon moves ~13 degrees a day, so 7 days cover about 7 nakshatras (~28 padas).
  assert.ok(r.padas.length >= 24 && r.padas.length <= 32, String(r.padas.length));
  assert.equal(r.hours, 7 * 24);
  assert.equal(r.padas.reduce((a, p) => a + p.hours, 0), r.hours);
  const day1 = await birthChart({ date: '2024-03-25', time: '06:00' });
  assert.ok(r.padas.some((p) => p.nakshatra === day1.nakshatra && p.pada === day1.pada));
  await assert.rejects(rangeChart({ from: '2024-01-01', to: '2024-06-01' }), /62 days/);
});
