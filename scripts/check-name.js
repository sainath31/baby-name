// Validate a name written in Telugu or Kannada script, and look it up in the library.
// Usage: node scripts/check-name.js "కృష్ణ"        (script is auto-detected)
import { validateName } from '../src/indic-scripts.js';
import { loadAll } from './lib.js';

const text = process.argv.slice(2).join(' ').trim();
if (!text) { console.error('usage: node scripts/check-name.js <name in Telugu or Kannada script>'); process.exit(2); }
const cp = text.codePointAt(0);
const script = cp >= 0x0c00 && cp < 0x0c80 ? 'telugu' : cp >= 0x0c80 && cp < 0x0d00 ? 'kannada' : null;
if (!script) { console.error('Not Telugu or Kannada script.'); process.exit(2); }
const r = validateName(text, script);
console.log(`${script}: ${r.valid ? 'well-formed' : 'NOT well-formed'}`);
r.errors.forEach((e) => console.log(' -', e));
(r.warnings || []).forEach((w) => console.log(' ! warning:', w));
// Treat a nasal + virama before a consonant as the anusvara spelling (मञ्जु = मंजु).
const normDev = (d) => d.replace(/[ङञणनम]\u094d(?=[\u0915-\u0939])/g, '\u0902').replace(/\s+/g, '');
const hit = loadAll({ all: true }).find((n) => normDev(n.devanagari || '') === normDev(r.devanagari));
console.log(hit ? `Library match: ${hit.name} (${hit.iast}) - ${hit.meaning_en}` : `No library match for ${r.devanagari}`);
process.exit(r.valid ? 0 : 1);
