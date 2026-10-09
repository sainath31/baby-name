import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { nameNumber } from '../src/numerology.js';
import { initialSound } from '../src/sounds.js';

const names = JSON.parse(readFileSync(new URL('../data/names.json', import.meta.url)));
const out = names.map((n) => ({
  ...n,
  numerology: { chaldean: nameNumber(n.name, 'chaldean'), pythagorean: nameNumber(n.name, 'pythagorean') },
  sound: initialSound(n.iast),
})).sort((a, b) => a.name.localeCompare(b.name));
mkdirSync(new URL('../web/', import.meta.url), { recursive: true });
writeFileSync(new URL('../web/names.json', import.meta.url), JSON.stringify(out));
console.log(`Wrote web/names.json (${out.length})`);
