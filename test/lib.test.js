import test from 'node:test';
import assert from 'node:assert/strict';
import { nameNumber } from '../src/numerology.js';
import { initialSound, syllableCount } from '../src/sounds.js';
import { fromSiderealLongitude, syllablesForRashi } from '../src/astrology.js';
import { filterNames } from '../src/filters.js';
import { readFileSync } from 'node:fs';

const names = JSON.parse(readFileSync(new URL('../data/names.json', import.meta.url)));

test('numerology', () => {
  assert.equal(nameNumber('A', 'chaldean'), 1);
  assert.equal(nameNumber('Giri', 'chaldean'), 7); // 3+1+2+1
  assert.equal(nameNumber('Rama', 'pythagorean'), 6); // 9+1+4+1=15 -> 6

});
test('sounds', () => {
  assert.equal(initialSound('dhruva').group, 'ta-varga (dental)');
  assert.equal(initialSound('dhruva').aspirated, true);
  assert.equal(syllableCount('viṣṇuvardhana'), 5);
});
test('nakshatra from longitude', () => {
  const r = fromSiderealLongitude(0.5);
  assert.deepEqual(r, { nakshatra: 'Ashwini', pada: 1, rashi: 'Mesha', syllable: 'Chu' });
  assert.ok(syllablesForRashi('Mesha').includes('Chu'));
});
test('filters combine with AND', () => {
  assert.deepEqual(filterNames(names, { letter: 'A' }).map((n) => n.name), names.filter((n) => n.letter === 'A').map((n) => n.name));
  assert.deepEqual(filterNames(names, { letter: 'D', states: ['Karnataka'] }).map((n) => n.name), names.filter((n) => n.letter === 'D').map((n) => n.name)); // All India matches any state
  assert.deepEqual(filterNames(names, { states: ['Karnataka'], syllables: [4, 5] }).map((n) => n.name).sort(), ['Krishnamurthy', 'Vishnuvardhan']);
  assert.deepEqual(filterNames(names, { startSyllables: ['Dh'] }).map((n) => n.name), names.filter((n) => n.name.startsWith('Dh')).map((n) => n.name));
});
