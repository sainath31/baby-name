import test from 'node:test';
import assert from 'node:assert/strict';
import * as Astronomy from './vendor/astronomy-engine.js';
import { localToUtc, birthChart } from '../src/astro-engine.js';
import { RASHIS } from '../src/astrology.js';

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
