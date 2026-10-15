// Reusable: merge a pandit-review JSONL batch into data/names.json.
// Usage: node _merge-review-batch.mjs <path-to-jsonl>
// Only accept_high / accept_medium verdicts are merged (flip pending -> reviewed).
// low_confidence / reject are left as-is (pending stays pending, or just skipped).
import fs from 'fs';
import { syllableCount } from '../../src/sounds.js';

const jsonlPath = process.argv[2];
const lines = fs.readFileSync(jsonlPath, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
const latest = new Map();
for (const r of lines) latest.set(r.name.toLowerCase(), r); // last write wins (handles revision entries)

const all = JSON.parse(fs.readFileSync('data/names.json', 'utf8'));
const byName = new Map(all.map(r => [r.name.toLowerCase(), r]));

function sourceLicense(title) {
  if (/wikipedia/i.test(title)) return 'CC BY-SA 4.0';
  return 'web reference (secondary source, not independently licensed)';
}

// Coordinator overrides: names where the agent's verdict was reversed after merge
// (e.g. non-Sanskrit origin despite fame/naturalization) -- never re-apply these verdicts.
const COORDINATOR_OVERRIDE_SKIP = new Set(['jawahar', 'jawaharlal']);

let updated = 0, notFound = [], skippedVerdict = { low_confidence: 0, reject: 0, other: 0, coordinator_override: 0 };
for (const r of latest.values()) {
  if (COORDINATOR_OVERRIDE_SKIP.has(r.name.toLowerCase())) { skippedVerdict.coordinator_override++; continue; }
  if (r.verdict !== 'accept_high' && r.verdict !== 'accept_medium') {
    skippedVerdict[r.verdict] = (skippedVerdict[r.verdict] || 0) + 1;
    continue;
  }
  const rec = byName.get(r.name.toLowerCase());
  if (!rec) { notFound.push(r.name); continue; }
  if (rec.review_status !== 'pending') continue; // already reviewed/published, don't touch

  const sources = (r.sources || []).filter(s => s && s.title).map(s => ({
    title: s.url ? `${s.title} (${s.url})` : s.title,
    license: sourceLicense(s.title),
  }));
  if (!sources.length) { skippedVerdict.no_source = (skippedVerdict.no_source || 0) + 1; continue; } // no real citation: leave pending, don't publish on trust alone

  const components = (r.components || [])
    .map(c => (typeof c === 'string' ? { part: c, gloss: '' } : c))
    .filter(c => c && c.part);
  const gender = r.gender && ['boy', 'girl', 'unisex'].includes(r.gender.toLowerCase()) ? r.gender.toLowerCase() : undefined;

  rec.iast = (r.iast || rec.iast || '').toLowerCase();
  rec.devanagari = r.devanagari ?? rec.devanagari;
  rec.meaning_en = r.meaning_en;
  rec.components = components;
  rec.confidence = r.verdict === 'accept_high' ? 'high' : 'medium';
  rec.origin = 'attested';
  rec.sources = sources;
  if (gender) rec.gender = gender;
  if (r.alt_spellings?.length) rec.alt_spellings = [...new Set([...(rec.alt_spellings || []), ...r.alt_spellings])];
  delete rec.review_status;
  rec.syllable_count = rec.iast ? syllableCount(rec.iast) : rec.syllable_count;
  updated++;
}

fs.writeFileSync('data/names.json', JSON.stringify(all, null, 2) + '\n');
console.log('Updated (flipped to reviewed):', updated);
console.log('Not found in data/names.json:', notFound);
console.log('Skipped (stayed pending):', skippedVerdict);
