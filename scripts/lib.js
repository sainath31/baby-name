import { readFileSync, readdirSync, existsSync } from 'node:fs';

const dataDir = new URL('../data/', import.meta.url);
export const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// Hand-curated names win; generated records that repeat a curated name (by IAST or spelling) are dropped.
export function loadAll() {
  const curated = JSON.parse(readFileSync(new URL('names.json', dataDir)));
  const seenIast = new Set(curated.map((n) => norm(n.iast)));
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
  return all;
}
