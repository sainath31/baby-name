// Filtering worker: lazily loads per-letter shards and filters off the main thread.
import { filterNames } from './src/filters.js';

const DATA = new URL('./data/', import.meta.url);
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
// Fold common Indian-English spelling variants so Ishan finds Ishaan, Arav finds Aarav, Sidharth finds Siddharth.
const fold = (s) => s.replace(/w/g, 'v').replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/(s|t|d|b|k|g|p|c)h/g, '$1').replace(/([a-z])\1+/g, '$1');

let manifest = null;
const shards = new Map(); // letter -> Promise<{recs, qs}>
let current = 0;
let cur = null; // { matches }

function load(letter) {
  if (!shards.has(letter)) {
    const p = fetch(new URL(manifest.letters[letter].file, DATA)).then((r) => {
      if (!r.ok) throw new Error(`Shard ${letter}: HTTP ${r.status}`);
      return r.json();
    }).then((recs) => {
      const qs = new Array(recs.length);
      recs.forEach((r, i) => {
        r.name = r.n; r.letter = letter; r.syllable_count = r.s; r.states = r.st || []; r.iast = r.i; r._i = i;
        qs[i] = fold(norm(`${r.n} ${r.i} ${(r.al || []).join(' ')} ${r.m || ''}`)) + ' ' + (r.d || '') + ' ' + fold(norm(r.n)).replace(/ /g, '');   // compact form so 'saikrishna' finds 'Sai Krishna'
      });
      return { recs, qs };
    });
    p.catch(() => shards.delete(letter));
    shards.set(letter, p);
  }
  return shards.get(letter);
}

function filterShard({ recs, qs }, q) {
  const base = {};
  if (q.states?.length) base.states = q.states;
  if (q.syllables?.length) base.syllables = q.syllables;
  if (q.nakshatra) base.nakshatra = q.nakshatra;
  if (q.rashi) base.rashi = q.rashi;
  if (q.startSyllables?.length) base.startSyllables = q.startSyllables;
  let list = Object.keys(base).length ? filterNames(recs, base) : recs;
  const eras = q.eras?.length ? new Set(q.eras) : null;
  const groups = q.groups?.length ? new Set(q.groups) : null;
  const nums = q.numbers?.length ? new Set(q.numbers) : null;
  const key = q.numSystem === 'pythagorean' ? 'c2' : 'c1';
  const themes = q.themes?.length ? q.themes : null;
  const deities = q.deities?.length ? q.deities : null;
  const names = q.names ? new Set(q.names) : null;
  const terms = q.text ? fold(norm(q.text)).split(' ').filter(Boolean) : null;
  return list.filter((r) => {
    if (q.reviewedOnly && r.u) return false;
    if (q.gender === 'unisex' && !r.gu) return false;
    if (q.gender === 'boy' && (r.gu || r.gg)) return false;
    if (q.gender === 'girl' && !r.gg) return false;
    if (r.cn && !q.withConstructed) return false;          // constructed names only when asked for
    if (eras && !eras.has(r.e || '')) return false;
    if (groups && !groups.has(r.g)) return false;
    if (nums && !nums.has(r[key])) return false;
    if (themes && !themes.some((t) => r.th?.includes(t))) return false;
    if (deities && !deities.some((t) => r.dt?.includes(t))) return false;
    if (q.aspirated === 'yes' && !r.a) return false;
    if (q.aspirated === 'no' && r.a) return false;
    if (names && !names.has(r.n)) return false;
    if (terms) { const s = qs[r._i]; if (!terms.every((t) => s.includes(t)) && !s.includes(terms.join(''))) return false; }
    return true;
  });
}

async function run(m) {
  const id = (current = m.id);
  const q = m.q;
  const all = Object.keys(manifest.letters);
  let letters = q.letters?.length ? q.letters.filter((l) => manifest.letters[l]) : all;
  if (q.names) letters = [...new Set(q.names.map((n) => n[0].toUpperCase()))].filter((l) => manifest.letters[l]);
  const matches = [];
  cur = { id, matches };
  let last = 0;
  const t0 = performance.now();
  for (let i = 0; i < letters.length; i++) {
    let shard;
    try { shard = await load(letters[i]); } catch (e) { postMessage({ type: 'error', id, message: String(e.message || e) }); return; }
    if (current !== id) return;
    const part = filterShard(shard, q);
    for (const r of part) matches.push(r);
    const done = i === letters.length - 1;
    if (done && q.sort && q.sort !== 'az') {
      const len = (r) => r.n.length;
      matches.sort(q.sort === 'short' ? (a, b) => len(a) - len(b) || a.n.localeCompare(b.n) : (a, b) => len(b) - len(a) || a.n.localeCompare(b.n));
    }
    const sorted = !q.sort || q.sort === 'az' || done;
    const now = performance.now();
    if (done || i === 0 || now - last > 120) {
      last = now;
      postMessage({ type: 'result', id, total: matches.length, items: sorted ? matches.slice(0, m.limit) : [], loading: !done, done, ms: Math.round(now - t0), loaded: i + 1, of: letters.length });
    }
  }
  if (!letters.length) postMessage({ type: 'result', id, total: 0, items: [], loading: false, done: true, ms: 0, loaded: 0, of: 0 });
}

onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === 'init') {
      manifest = await (await fetch(new URL('manifest.json', DATA))).json();
      postMessage({ type: 'ready', manifest });
    } else if (m.type === 'query') run(m);
    else if (m.type === 'more') {
      if (cur && cur.id === m.id) postMessage({ type: 'page', id: m.id, offset: m.offset, items: cur.matches.slice(m.offset, m.offset + m.limit), total: cur.matches.length });
    } else if (m.type === 'get') {
      const l = m.name[0].toUpperCase();
      let rec = null;
      if (manifest.letters[l]) rec = (await load(l)).recs.find((r) => r.n === m.name) || null;
      postMessage({ type: 'record', name: m.name, rec });
    }
  } catch (err) {
    postMessage({ type: 'error', id: m.id, message: String(err.message || err) });
  }
};
