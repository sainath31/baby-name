// Turns auditor results (data/reviews/audit/audit-NN-result.json) into one verdict file.
// Usage: node scripts/apply-audit.js <verdict-number> <audit-NN> [...]
// Audit "state" keys become "states"; iast-only fixes are dropped (iast is the spoken form, audited by script round-trip).
import { readFileSync, writeFileSync } from 'node:fs';
const [id, ...chunks] = process.argv.slice(2);
const out = [];
for (const c of chunks) {
  for (const x of JSON.parse(readFileSync(new URL(`../data/reviews/audit/${c}-result.json`, import.meta.url)))) {
    if (x.verdict === 'keep') continue;
    if (x.verdict === 'reject' && / /.test(x.name) && !process.env.ALLOW_TWOWORD_REJECT) continue;   // two-word names are deliberately allowed (user requirement)
    if (x.verdict === 'reject') { out.push({ name: x.name, verdict: 'reject', reason: x.reason }); continue; }
    const f = { ...(x.fix || {}) };
    if (f.state) { f.states = [f.state]; delete f.state; }
    if (f.iast && !f.devanagari) delete f.iast;
    if (Object.keys(f).length) out.push({ name: x.name, verdict: 'fix', reason: x.reason, fix: f });
  }
}
writeFileSync(new URL(`../data/reviews/review-${id}-verdicts.json`, import.meta.url), JSON.stringify(out, null, 1));
console.log(`${out.length} audit verdicts -> review-${id}-verdicts.json`);
