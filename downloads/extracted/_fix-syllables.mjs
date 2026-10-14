import fs from 'fs';
import { syllableCount } from '../../src/sounds.js';

const all = JSON.parse(fs.readFileSync('data/names.json', 'utf8'));
let fixed = 0;
for (const r of all) {
  if (r.review_status === 'pending') continue;
  const correct = syllableCount(r.iast);
  if (r.syllable_count !== correct) { r.syllable_count = correct; fixed++; }
}
fs.writeFileSync('data/names.json', JSON.stringify(all, null, 2) + '\n');
console.log('fixed syllable_count on', fixed, 'records');
