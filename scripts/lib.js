import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { assess } from '../src/quality.js';
import { syllableCount } from '../src/sounds.js';

const dataDir = new URL('../data/', import.meta.url);
export const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// Hand-curated names win; generated records that repeat a curated name (by IAST or spelling) are dropped.
// Reviewer verdicts (data/reviews/*-verdicts.json) override the automatic quality gate.
function loadVerdicts() {
  const dir = new URL('reviews/', dataDir);
  const map = new Map();
  if (!existsSync(dir)) return map;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('-verdicts.json')).sort())
    for (const v of JSON.parse(readFileSync(new URL(f, dir)))) map.set(v.name, v);
  return map;
}

// opts.all: also return unlisted records (used by the validator).
export function loadAll(opts = {}) {
  const curated = JSON.parse(readFileSync(new URL('names.json', dataDir)));
  const seenIast = new Set(curated.flatMap((n) => [norm(n.iast), ...(n.stem ? [norm(n.stem)] : [])]));
  const seenName = new Set(curated.map((n) => n.name.toLowerCase()));
  const all = [...curated];
  const genDir = new URL('generated/', dataDir);
  if (existsSync(genDir)) {
    for (const f of readdirSync(genDir).filter((x) => x.endsWith('.json')).sort()) {
      for (const n of JSON.parse(readFileSync(new URL(f, genDir)))) {
        if (seenIast.has(norm(n.iast)) || seenName.has(n.name.toLowerCase())) continue;
        seenIast.add(norm(n.iast)); seenName.add(n.name.toLowerCase());
        all.push(n);
      }
    }
  }
  const verdicts = loadVerdicts();
  for (const n of all) {
    const v = verdicts.get(n.name);
    if (v?.verdict === 'fix' && v.fix) {
      Object.assign(n, v.fix);
      n.letter = n.name[0].toUpperCase();
      if (v.fix.iast) { n.iast = v.fix.iast.trim().toLowerCase(); n.syllable_count = syllableCount(n.iast); }
    }
    if (v?.verdict === 'reject') { n.listed = false; n.reject_reason = v.reason; }
    else if (v) { n.listed = true; n.reviewed = 'ai-purohit-review-001'; }
    else { const q = assess(n); n.listed = q.listed; if (!q.listed) n.reject_reason = q.reason; }
  }
  // Fixes can make two records identical; keep the first (hand-compiled before generated).
  const si = new Set(), sn = new Set();
  // A boy's name and its feminine counterpart (Lalit / Lalita) share a stem but are different names, so the stem key is per gender group.
  const groups = (n) => (n.gender === 'girl' ? ['f'] : n.gender === 'unisex' ? ['m', 'f'] : ['m']);
  for (const n of all) {
    const g = groups(n), kn = n.name.toLowerCase();
    const keys = [norm(n.iast), ...(n.stem ? [norm(n.stem)] : [])].flatMap((k) => g.map((x) => `${x}:${k}`));
    if (sn.has(kn) || keys.some((k) => si.has(k))) { n.listed = false; n.reject_reason = 'duplicate-after-fix'; continue; }
    sn.add(kn); keys.forEach((k) => si.add(k));
  }
  return opts.all ? all : all.filter((n) => n.listed);
}
