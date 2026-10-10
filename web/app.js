import { moolank, bhagyank } from './src/numerology.js';
import { NAKSHATRAS, RASHIS, syllablesForNakshatra, syllablesForRashi } from './src/astrology.js';

const PAGE = 30;
const $ = (id) => document.getElementById(id);
const h = (tag, props = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
};
const svgIcon = (d, cls) => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); if (cls) s.setAttribute('class', cls);
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); s.append(p); return s;
};
const HEART = 'M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21z';
const X = 'M6 6l12 12M18 6L6 18';
const fmt = (n) => n.toLocaleString('en-IN');

// ---- safe storage
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
let favs = new Set(store.get('bn.favs', []).filter((x) => typeof x === 'string'));

// ---- state
const fresh = () => ({ text: '', letters: new Set(), states: new Set(), eras: new Set(), syl: new Set(), groups: new Set(), nak: '', rashi: '', numSystem: 'chaldean', nums: new Set(), reviewedOnly: false, withConstructed: false, gender: '', themes: new Set(), deities: new Set(), asp: '', syls: new Set(), sort: 'az' });
let S = fresh();
let favView = false;
let manifest = null;
let qid = 0, shown = 0, total = 0, loading = false, doneLoading = false;
let lastCount = null;

// ---- worker
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
worker.onerror = (e) => showError(`Could not start the search worker (${e.message || 'unknown error'}).`);
const pendingGets = new Map();
worker.onmessage = (e) => {
  const m = e.data;
  if (m.type === 'ready') { manifest = m.manifest; init(); }
  else if (m.type === 'result' && m.id === qid) onResult(m);
  else if (m.type === 'page' && m.id === qid) { appendCards(m.items); shown = m.offset + m.items.length; updateMore(); }
  else if (m.type === 'record') { pendingGets.get(m.name)?.(m.rec); pendingGets.delete(m.name); }
  else if (m.type === 'error') showError(`Could not load names: ${m.message}. Check your connection and try again.`);
};
worker.postMessage({ type: 'init' });
const getRecord = (name) => new Promise((res) => { pendingGets.set(name, res); worker.postMessage({ type: 'get', name }); });

function showError(msg) { const el = $('error'); el.textContent = msg; el.hidden = false; $('count').textContent = 'Error'; }

// ---- query
function buildQuery() {
  if (favView) return { names: [...favs], sort: S.sort !== 'az' ? S.sort : undefined };
  const q = { text: S.text.trim() };
  if (S.sort !== 'az') q.sort = S.sort;
  if (S.themes.size) q.themes = [...S.themes];
  if (S.deities.size) q.deities = [...S.deities];
  if (S.asp) q.aspirated = S.asp;
  if (S.letters.size) q.letters = [...S.letters];
  if (S.states.size) q.states = [...S.states];
  if (S.eras.size) q.eras = [...S.eras];
  if (S.syl.size) q.syllables = [...S.syl].flatMap((v) => v === '9+' ? Array.from({ length: Math.max(1, (manifest.maxSyllables || 9) - 8) }, (_, i) => 9 + i) : [Number(v)]);
  if (S.groups.size) q.groups = [...S.groups];
  if (S.syls.size) q.startSyllables = [...S.syls];
  else { if (S.nak) q.nakshatra = S.nak; if (S.rashi) q.rashi = S.rashi; }
  if (S.nums.size) { q.numbers = [...S.nums].map(Number); q.numSystem = S.numSystem; }
  if (S.reviewedOnly) q.reviewedOnly = true;
  if (S.withConstructed) q.withConstructed = true;
  if (S.gender) q.gender = S.gender;
  return q;
}

function apply() {
  qid++;
  shown = 0; total = 0; loading = true; doneLoading = false;
  $('results').replaceChildren();
  $('empty').hidden = true; $('error').hidden = true;
  renderChips(); syncBadges(); writeUrl();
  worker.postMessage({ type: 'query', id: qid, q: buildQuery(), limit: PAGE });
  $('count').textContent = 'Searching…';
}

function onResult(m) {
  if (shown === 0 && m.items.length) { $('results').replaceChildren(); appendCards(m.items); shown = m.items.length; }
  else if (m.items.length > shown && shown < PAGE) { appendCards(m.items.slice(shown)); shown = m.items.length; }
  total = m.total; loading = m.loading; doneLoading = m.done;
  const label = favView ? (total === 1 ? '1 favourite' : `${fmt(total)} favourites`) : `${fmt(total)}${loading ? '+' : ''} ${total === 1 && !loading ? 'name' : 'names'}`;
  $('count').replaceChildren(label, loading ? h('small', { text: ` (loading ${m.loaded}/${m.of} sections)` }) : '');
  $('showBtn').textContent = loading ? `Show ${fmt(total)}+ names` : `Show ${fmt(total)} ${total === 1 ? 'name' : 'names'}`;
  $('empty').hidden = !(m.done && total === 0);
  // few matches for a birth star or moon sign: some naming syllables start very few Sanskrit names
  let few = $('fewHint');
  if (!few) { few = h('p', { class: 'hint', id: 'fewHint', hidden: true }); $('activeChips').after(few); }
  const bySyllable = S.nak || S.rashi || S.syls.size;
  few.hidden = !(m.done && bySyllable && total > 0 && total < 15);
  if (!few.hidden) few.textContent = `Only ${total} ${total === 1 ? 'name starts' : 'names start'} with these syllables in this library, because few names begin with some of these sounds. You can narrow to one syllable, switch to Include constructed names, or ask your family priest about alternative syllables.`;
  if (m.done && label !== lastCount) { $('live').textContent = `${label} found`; lastCount = label; }
  if (m.done) window.__lastQueryMs = m.ms;
  updateMore();
}

function updateMore() {
  const more = shown < total;
  $('moreBtn').hidden = !more;
  if (more) io.observe($('sentinel'));
}
function loadMore() {
  if (shown >= total) return;
  worker.postMessage({ type: 'more', id: qid, offset: shown, limit: PAGE });
  // prevent duplicate requests until page arrives
  shown = Math.min(total, shown + PAGE) ; pendingShown = true;
}
let pendingShown = false;
const io = new IntersectionObserver((entries) => {
  if (entries.some((e) => e.isIntersecting) && shown < total && !pendingShown) { loadMore(); }
}, { rootMargin: '600px' });

// ---- cards
function appendCards(items) {
  pendingShown = false;
  const frag = document.createDocumentFragment();
  for (const r of items) frag.append(card(r));
  $('results').append(frag);
  // sentinel may remain visible after append: re-observe
  io.unobserve($('sentinel')); io.observe($('sentinel'));
}
function tagsFor(r) {
  const t = [`${r.s} syllable${r.s === 1 ? '' : 's'}`];
  const st = r.st || []; if (st.length) t.push(st.length > 2 ? `${st[0]} +${st.length - 1}` : st.join(', '));
  if (r.e) t.push(r.e);
  return t;
}
function favButton(r, cls = 'fav') {
  const on = favs.has(r.n);
  const b = h('button', { type: 'button', class: `btn icon-btn ${cls}`, 'aria-pressed': String(on), 'aria-label': `Favourite ${r.n}`, 'data-fav': r.n }, svgIcon(HEART));
  return b;
}
function card(r) {
  return h('li', { class: 'card' },
    h('button', { type: 'button', class: 'card-main', 'data-name': r.n, 'aria-label': `${r.n}, ${r.m || ''}`.slice(0, 200) },
      h('span', { class: 'card-title' }, h('span', { class: 'card-name', text: r.n }), r.d && h('span', { class: 'deva', lang: 'sa', text: r.d }), r.te && h('span', { class: 'telu', lang: 'te', text: r.te }), r.kn && h('span', { class: 'knda', lang: 'kn', text: r.kn })),
      h('span', { class: 'iast', text: r.i }),
      h('span', { class: 'card-meaning', text: r.m || '' }),
      h('span', { class: 'tags' }, tagsFor(r).map((t) => h('span', { class: 'tag', text: t })), (r.cn ? h('span', { class: 'tag warn', text: 'Constructed' }) : r.u && h('span', { class: 'tag warn', text: 'Unreviewed' })))),
    favButton(r));
}
$('results').addEventListener('click', (e) => {
  const f = e.target.closest('[data-fav]');
  if (f) { toggleFav(f.dataset.fav); return; }
  const c = e.target.closest('[data-name]');
  if (c) openDetail(c.dataset.name, c);
});
$('moreBtn').addEventListener('click', () => { pendingShown = false; loadMore(); });

function toggleFav(name) {
  if (favs.has(name)) favs.delete(name); else favs.add(name);
  store.set('bn.favs', [...favs]);
  document.querySelectorAll('[data-fav]').forEach((b) => { if (b.dataset.fav === name) b.setAttribute('aria-pressed', String(favs.has(name))); });
  syncBadges();
  toast(favs.has(name) ? `${name} added to favourites` : `${name} removed from favourites`);
  if (favView && !favs.has(name)) {
    document.querySelectorAll(`#results [data-name]`).forEach((b) => { if (b.dataset.name === name && !$('detail').classList.contains('open')) b.closest('li').remove(); });
  }
}

// ---- A-Z strip
function buildAZ() {
  const strip = $('azStrip');
  for (let c = 65; c < 91; c++) {
    const L = String.fromCharCode(c);
    const info = manifest.letters[L];
    strip.append(h('button', { type: 'button', class: 'btn', 'data-letter': L, 'aria-pressed': 'false', disabled: !info, 'aria-label': info ? `${L}, ${fmt(info.count)} names` : `${L}, no names` , text: L }));
  }
  strip.addEventListener('click', (e) => {
    const b = e.target.closest('[data-letter]'); if (!b) return;
    const L = b.dataset.letter;
    S.letters.has(L) ? S.letters.delete(L) : S.letters.add(L);
    syncInputs(); apply();
  });
}

// ---- filters UI
const SYL = ['1', '2', '3', '4', '5', '6', '7', '8', '9+'];
function group(title, body, open = true) {
  return h('details', { class: 'fgroup', open }, h('summary', { text: title }), h('div', { class: 'fbody' }, body));
}
function checkList(name, values, extra) {
  return values.map((v) => h('label', { class: 'check' }, h('input', { type: 'checkbox', 'data-f': name, value: v }), h('span', { text: v })));
}
function chipOptions(name, values, type = 'checkbox', label = (v) => v) {
  return h('div', { class: 'opt-grid', role: 'group' }, values.map((v) => h('label', { class: 'opt' }, h('input', { type, 'data-f': name, value: v, name: type === 'radio' ? name : null }), h('span', { text: label(v) }))));
}
function buildFilters() {
  const body = $('filtersBody');
  const nakSel = h('select', { class: 'select', id: 'nakSel', 'data-sel': 'nak', 'aria-label': 'Nakshatra' }, h('option', { value: '', text: 'Any nakshatra' }), NAKSHATRAS.map(([n]) => h('option', { value: n, text: n })));
  const rashiSel = h('select', { class: 'select', id: 'rashiSel', 'data-sel': 'rashi', 'aria-label': 'Rashi' }, h('option', { value: '', text: 'Any rashi' }), RASHIS.map((n) => h('option', { value: n, text: n })));
  const sysSel = h('select', { class: 'select', id: 'sysSel', 'data-sel': 'numSystem', 'aria-label': 'Numerology system' }, h('option', { value: 'chaldean', text: 'Chaldean' }), h('option', { value: 'pythagorean', text: 'Pythagorean' }));
  const stateSearch = h('input', { type: 'search', id: 'stateSearch', placeholder: 'Search states', 'aria-label': 'Search states', autocomplete: 'off' });
  const stateList = h('div', { class: 'scroll-list', id: 'stateList' }, checkList('states', manifest.states));
  stateSearch.addEventListener('input', () => {
    const t = stateSearch.value.trim().toLowerCase();
    stateList.querySelectorAll('label').forEach((l) => { l.hidden = !!t && !l.textContent.toLowerCase().includes(t); });
  });
  body.append(
    h('div', { class: 'switch-row' },
      h('input', { type: 'checkbox', id: 'reviewed', 'data-f': 'reviewed' }),
      h('label', { for: 'reviewed' }, h('strong', { text: 'Reviewed names only' }), h('span', { text: 'Hide dictionary-imported names that nobody has checked yet. Off by default, so you see everything.' }))),
    h('div', { class: 'switch-row' },
      h('input', { type: 'checkbox', id: 'constructed', 'data-f': 'constructed' }),
      h('label', { for: 'constructed' }, h('strong', { text: 'Include constructed names' }), h('span', { text: 'Names built by rule from real Sanskrit elements (for example Hari + dasa). Not found in any text, and not yet reviewed. Off by default.' }))),
    group('Gender', h('div', {}, h('p', { class: 'hint', text: 'Names for boys, names for girls, or gender-neutral names that are used for any child across India.' }),
      h('div', { class: 'opt-grid' }, [['', 'All names'], ['boy', 'Boys'], ['girl', 'Girls'], ['unisex', 'Gender-neutral']].map(([v, l]) => h('label', { class: 'opt' }, h('input', { type: 'radio', name: 'gender', 'data-r': 'gender', value: v, checked: v === '' }), h('span', { text: l })))))),
    group('State or region', [stateSearch, stateList]),
    group('Era', h('div', {}, checkList('eras', manifest.eras))),
    group('Syllables', chipOptions('syl', SYL)),
    group('Starting sound', h('div', {}, h('p', { class: 'hint', text: 'Groups of the Devanagari alphabet (varnamala) by the name\'s first sound.' }), checkList('groups', manifest.groups),
      h('p', { class: 'hint', style: 'margin-top:8px', text: 'Aspirated first consonant (kh, gh, th, bh ...)' }),
      h('div', { class: 'opt-grid' }, [['', 'Either'], ['yes', 'Aspirated'], ['no', 'Not aspirated']].map(([v, l]) => h('label', { class: 'opt' }, h('input', { type: 'radio', name: 'asp', 'data-r': 'asp', value: v }), h('span', { text: l })))))),
    group('Meaning theme', chipOptions('themes', manifest.themes), false),
    group('Deity or epic association', h('div', {}, checkList('deities', manifest.deities)), false),
    group('Nakshatra and rashi', h('div', {},
      h('p', { class: 'hint', text: 'Traditional naming syllables for a birth star or moon sign. Choose one or both (names matching either are shown).' }),
      h('label', { for: 'nakSel', class: 'sr', text: 'Nakshatra' }), nakSel,
      h('div', { style: 'height:8px' }),
      h('label', { for: 'rashiSel', class: 'sr', text: 'Rashi' }), rashiSel,
      h('p', { class: 'hint', style: 'margin-top:8px', id: 'sylHint' }),
      h('div', { id: 'sylChips' }),
      h('p', { class: 'hint', style: 'margin-top:8px', text: 'Know the birth date and time, or only the expected due dates? Use "Find names from birth details" at the top of the page.' }))),
    group('Numerology', h('div', {},
      h('p', { class: 'hint', text: 'Name number from the letters of the name.' }),
      h('label', { for: 'sysSel', class: 'sr', text: 'System' }), sysSel,
      h('div', { style: 'height:8px' }),
      chipOptions('nums', ['1', '2', '3', '4', '5', '6', '7', '8', '9']),
      h('div', { class: 'soon', style: 'margin-top:12px' },
        h('strong', { text: 'Birth date helper' }),
        h('p', { class: 'hint', text: 'Enter a date of birth to see the traditional moolank (day number) and bhagyank (full date number).' }),
        h('label', { for: 'dob', class: 'sr', text: 'Date of birth' }), h('input', { type: 'date', id: 'dob' }),
        h('div', { id: 'dobOut', 'aria-live': 'polite' })))),
    group('Sort and display', h('div', {},
      h('label', { for: 'sortSel', class: 'sr', text: 'Sort order' }),
      h('select', { class: 'select', id: 'sortSel', 'data-sel': 'sort' }, h('option', { value: 'az', text: 'A to Z' }), h('option', { value: 'short', text: 'Shortest first' }), h('option', { value: 'long', text: 'Longest first' })),
      h('p', { class: 'hint', style: 'margin:12px 0 4px', text: 'Show names in' }),
      h('div', { class: 'opt-grid' }, [['all', 'All scripts'], ['deva', 'Devanagari'], ['telugu', 'Telugu'], ['kannada', 'Kannada'], ['iast', 'IAST'], ['latin', 'Latin only']].map(([v, l]) => h('label', { class: 'opt' }, h('input', { type: 'radio', name: 'script', 'data-script': v, checked: v === 'all' }), h('span', { text: l })))))),
  );
  body.addEventListener('input', (e) => {
    if (e.target.id !== 'dob' || !e.target.value) return;
    const [y, mo, d] = e.target.value.split('-').map(Number);
    const m1 = moolank(d), m2 = bhagyank(y, mo, d);
    const out = $('dobOut'); out.replaceChildren(h('p', { class: 'hint', text: `Moolank ${m1}, bhagyank ${m2}.` }),
      ...[...new Set([m1, m2])].map((n) => h('button', { type: 'button', class: 'btn', text: `Use number ${n}`, onclick: () => { S.nums.add(String(n)); syncInputs(); apply(); } })));
  });
  body.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.r) { S[t.dataset.r] = t.value; }
    else if (t.dataset.script) { document.body.dataset.script = t.dataset.script; return; }
    else if (t.dataset.f) {
      const f = t.dataset.f;
      if (f === 'reviewed') S.reviewedOnly = t.checked;
      else if (f === 'constructed') S.withConstructed = t.checked;
      else (t.checked ? S[f].add(t.value) : S[f].delete(t.value));
      if (f === 'syls') { /* manual syllable chips */ }
    } else if (t.dataset.sel) { S[t.dataset.sel] = t.value; if (t.dataset.sel === 'nak' || t.dataset.sel === 'rashi') S.syls.clear(); }
    else return;
    syncInputs(); apply();
  });
}

function syncInputs() {
  document.querySelectorAll('[data-f]').forEach((i) => { i.checked = i.dataset.f === 'reviewed' ? S.reviewedOnly : i.dataset.f === 'constructed' ? S.withConstructed : S[i.dataset.f].has(i.value); });
  document.querySelectorAll('[data-sel]').forEach((s) => { s.value = S[s.dataset.sel]; });
  document.querySelectorAll('[data-letter]').forEach((b) => b.setAttribute('aria-pressed', String(S.letters.has(b.dataset.letter))));
  document.querySelectorAll('[data-r]').forEach((i) => { i.checked = S[i.dataset.r] === i.value; });
  const syl = [...new Set([...(S.nak ? syllablesForNakshatra(S.nak) : []), ...(S.rashi ? syllablesForRashi(S.rashi) : [])])];
  const box = $('sylChips');
  const sig = syl.join();
  if (box.dataset.sig !== sig) { box.dataset.sig = sig; box.replaceChildren(...(syl.length ? [chipOptions('syls', syl)] : [])); }
  $('sylHint').textContent = syl.length ? 'Starting syllables (tap to narrow to specific ones):' : '';
  box.querySelectorAll('[data-f]').forEach((i) => { i.checked = S.syls.has(i.value); });
  if ($('q').value !== S.text) $('q').value = S.text;
}

function activeFilters() {
  const out = [];
  const add = (label, remove) => out.push({ label, remove });
  S.letters.forEach((v) => add(`Letter ${v}`, () => S.letters.delete(v)));
  S.states.forEach((v) => add(`State: ${v}`, () => S.states.delete(v)));
  S.eras.forEach((v) => add(`Era: ${v}`, () => S.eras.delete(v)));
  S.syl.forEach((v) => add(`${v} syllables`, () => S.syl.delete(v)));
  S.groups.forEach((v) => add(`Sound: ${v}`, () => S.groups.delete(v)));
  if (S.nak) add(`Nakshatra: ${S.nak}`, () => { S.nak = ''; });
  if (S.rashi) add(`Rashi: ${S.rashi}`, () => { S.rashi = ''; });
  S.themes.forEach((v) => add(`Theme: ${v}`, () => S.themes.delete(v)));
  S.deities.forEach((v) => add(`Deity: ${v}`, () => S.deities.delete(v)));
  S.syls.forEach((v) => add(`Starts with ${v}`, () => S.syls.delete(v)));
  if (S.asp) add(S.asp === 'yes' ? 'Aspirated start' : 'Not aspirated', () => { S.asp = ''; });
  S.nums.forEach((v) => add(`${S.numSystem === 'chaldean' ? 'Chaldean' : 'Pythagorean'} number ${v}`, () => S.nums.delete(v)));
  if (S.reviewedOnly) add('Reviewed only', () => { S.reviewedOnly = false; });
  if (S.withConstructed) add('Including constructed names', () => { S.withConstructed = false; });
  if (S.gender) add(S.gender === 'unisex' ? 'Gender-neutral' : S.gender === 'girl' ? 'Girls' : 'Boys', () => { S.gender = ''; });
  if (S.text.trim()) add(`Search: "${S.text.trim()}"`, () => { S.text = ''; });
  return out;
}
function renderChips() {
  const list = activeFilters();
  $('activeChips').replaceChildren(...list.map((f) => h('li', {}, h('button', { type: 'button', class: 'chip', 'aria-label': `Remove filter ${f.label}`, onclick: () => { f.remove(); syncInputs(); apply(); } }, f.label, svgIcon(X)))));
  $('clearAll').hidden = list.length === 0;
  $('clearAll2').hidden = list.length === 0;
}
function syncBadges() {
  const n = activeFilters().filter((f) => !f.label.startsWith('Search') && !f.label.startsWith('Letter')).length;
  $('filterCount').textContent = n; $('filterCount').hidden = !n;
  $('favCount').textContent = favs.size; $('favCount').hidden = !favs.size;
  $('favBtn').setAttribute('aria-pressed', String(favView));
  $('favBtn').setAttribute('aria-label', favView ? 'Hide favourites' : `Show favourites (${favs.size})`);
  $('favBanner').hidden = !favView;
}
const SETS = { l: 'letters', st: 'states', era: 'eras', syl: 'syl', grp: 'groups', num: 'nums', th: 'themes', dt: 'deities', ss: 'syls' };
function writeUrl() {
  const p = new URLSearchParams();
  if (S.text.trim()) p.set('q', S.text.trim());
  for (const [k, f] of Object.entries(SETS)) if (S[f].size) p.set(k, [...S[f]].join('|'));
  if (S.nak) p.set('nak', S.nak); if (S.rashi) p.set('rashi', S.rashi);
  if (S.nums.size) p.set('sys', S.numSystem);
  if (S.asp) p.set('asp', S.asp); if (S.reviewedOnly) p.set('rev', '1'); if (S.withConstructed) p.set('con', '1'); if (S.gender) p.set('g', S.gender);
  if (S.sort !== 'az') p.set('sort', S.sort); if (favView) p.set('fav', '1');
  const qs = p.toString();
  try { history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash); } catch { /* ignore */ }
}
function readUrl() {
  const p = new URLSearchParams(location.search);
  S.text = p.get('q') || '';
  for (const [k, f] of Object.entries(SETS)) if (p.get(k)) S[f] = new Set(p.get(k).split('|'));
  S.nak = p.get('nak') || ''; S.rashi = p.get('rashi') || ''; S.asp = p.get('asp') || '';
  if (p.get('sys') === 'pythagorean') S.numSystem = 'pythagorean';
  S.gender = ['boy', 'girl', 'unisex'].includes(p.get('g')) ? p.get('g') : ''; S.withConstructed = p.get('con') === '1'; S.reviewedOnly = p.get('rev') === '1'; S.sort = ['short', 'long'].includes(p.get('sort')) ? p.get('sort') : 'az';
  favView = p.get('fav') === '1';
}
function clearAll() { S = fresh(); favView = false; syncInputs(); apply(); }
$('clearAll').onclick = clearAll; $('clearAll2').onclick = clearAll; $('emptyClear').onclick = clearAll;
$('favBtn').onclick = () => { favView = !favView; apply(); };
$('favExit').onclick = () => { favView = false; apply(); };

// search
let t;
$('q').addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { S.text = $('q').value; if (favView) favView = false; apply(); }, 200); });
$('searchForm').addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(t); S.text = $('q').value; apply(); $('q').blur(); });

// ---- sheets (modal behaviour with focus trap)
const mq = window.matchMedia('(min-width: 900px)');
let openEl = null, opener = null;
const focusable = (root) => [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')].filter((e) => e.offsetParent !== null || e === document.activeElement);
function openSheet(el, from, scrimOn = true) {
  openEl = el; opener = from || document.activeElement;
  el.removeAttribute('inert'); el.classList.add('open');
  $('scrim').hidden = !scrimOn; document.body.classList.add('locked');
  setTimeout(() => (el.id === 'detail' ? $('detailClose') : $('filtersClose')).focus(), 30);
}
function closeSheet() {
  if (!openEl) return;
  const el = openEl; openEl = null;
  el.classList.remove('open'); el.setAttribute('inert', ''); $('scrim').hidden = true; document.body.classList.remove('locked');
  if (el.id === 'detail' && location.hash.startsWith('#n=')) history.replaceState(null, '', location.pathname + location.search);
  (opener && document.contains(opener) ? opener : $('filtersBtn')).focus?.();
}
$('scrim').onclick = closeSheet;
$('filtersClose').onclick = closeSheet; $('detailClose').onclick = closeSheet; $('showBtn').onclick = closeSheet;
$('filtersBtn').onclick = (e) => openSheet($('filters'), e.currentTarget);
document.addEventListener('keydown', (e) => {
  if (!openEl) return;
  if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
  if (e.key !== 'Tab') return;
  const f = focusable(openEl); if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && (document.activeElement === first || !openEl.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (document.activeElement === last || !openEl.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
});
function setFiltersMode() {
  const f = $('filters');
  if (mq.matches) { if (openEl === f) closeSheet(); f.removeAttribute('inert'); f.removeAttribute('aria-modal'); f.removeAttribute('role'); }
  else { f.setAttribute('role', 'dialog'); f.setAttribute('aria-modal', 'true'); f.setAttribute('aria-labelledby', 'filtersTitle'); if (openEl !== f) f.setAttribute('inert', ''); }
  document.documentElement.style.setProperty('--sticky-h', `${$('sticky').offsetHeight}px`);
}
mq.addEventListener('change', setFiltersMode);
window.addEventListener('resize', () => document.documentElement.style.setProperty('--sticky-h', `${$('sticky').offsetHeight}px`));

// ---- detail
let toastT;
function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }

async function openDetail(name, from) {
  const rec = await getRecord(name);
  if (!rec) { toast('Could not find that name'); return; }
  renderDetail(rec);
  history.replaceState(null, '', `#n=${encodeURIComponent(name)}`);
  if (openEl !== $('detail')) openSheet($('detail'), from);
  $('detailBody').scrollTop = 0;
}
function section(title, ...kids) { return h('section', { class: 'd-sec' }, h('h3', { text: title }), ...kids); }
function renderDetail(r) {
  const body = $('detailBody');
  const pw = r.pw || [[], []];
  const pairs = [...pw[0].map((p) => `${p} + ${r.n}`), ...pw[1].map((s) => `${r.n} + ${s}`)];
  const favBtn = h('button', { type: 'button', class: 'btn', 'aria-pressed': String(favs.has(r.n)), 'data-fav': r.n }, svgIcon(HEART, 'heart'), h('span', { text: 'Favourite' }));
  favBtn.addEventListener('click', () => { toggleFav(r.n); favBtn.setAttribute('aria-pressed', String(favs.has(r.n))); });
  const link = `${location.origin}${location.pathname}#n=${encodeURIComponent(r.n)}`;
  const shareBtn = h('button', { type: 'button', class: 'btn', onclick: async () => {
    try { if (navigator.share) { await navigator.share({ title: r.n, text: `${r.n}: ${r.m}`, url: link }); return; } } catch (e) { if (e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(link); toast('Link copied'); } catch { window.prompt('Copy this link', link); }
  } }, svgIcon('M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1'), h('span', { text: 'Share link' }));
  const meta = [`${r.s} syllable${r.s === 1 ? '' : 's'}`, r.e, r.k, r.cf && `${r.cf} confidence`].filter(Boolean);
  body.replaceChildren(...[
    h('h2', { class: 'd-name', id: 'detailName', text: r.n }),
    r.d && h('div', { class: 'd-deva', lang: 'sa', text: r.d }),
    (r.te || r.kn) && h('div', { class: 'd-regional' }, r.te && h('span', { lang: 'te', class: 'd-telu', text: `Telugu: ${r.te}` }), r.kn && h('span', { lang: 'kn', class: 'd-knda', text: `Kannada: ${r.kn}` })),
    h('div', { class: 'd-iast', text: r.i }),
    r.al?.length && h('div', { class: 'd-iast', text: `Also spelled: ${r.al.join(', ')}` }),
    h('p', { class: 'd-meaning', text: r.m || 'Meaning not recorded.' }),
    h('div', { class: 'tags' }, meta.map((t) => h('span', { class: 'tag', text: t })), (r.cn ? h('span', { class: 'tag warn', text: 'Constructed' }) : r.u && h('span', { class: 'tag warn', text: 'Unreviewed' }))),
    h('div', { class: 'd-actions' }, favBtn, shareBtn),
    r.st?.length && section('Used in', h('div', { class: 'pill-row' }, r.st.map((s) => h('span', { class: 'pill', text: s })))),
    r.r && section('Reference', h('p', { text: r.r })),
    r.co?.length && section('Components', h('dl', {}, r.co.flatMap(([p, g]) => [h('dt', { text: p }), h('dd', { text: g || '-' })]))),
    pairs.length && section('Prefix and suffix pairings', h('div', { class: 'pill-row' }, pairs.map((p) => h('span', { class: 'pill', text: p })))),
    section('Making new names from this one', r.px
      ? h('div', {},
        h('p', { class: 'hint', text: `Treated as a ${r.px[0]} word. It can take these suffixes (${r.px[2].length}): ${r.px[2].map((s) => `${r.n}${s.toLowerCase()}`).join(', ') || 'none'}; and these prefixes (${r.px[1].length}): ${r.px[1].map((p) => `${p}${r.n.toLowerCase()}`).join(', ') || 'none'}.` }),
        r.px[3].length ? h('p', { class: 'hint', text: `Reviewed examples: ${r.px[3].join(', ')}. Turn on "Include constructed names" to browse them.` }) : null)
      : r.rt ? h('p', { class: 'hint', text: `This name is built from parts. Its first part "${r.rt[0]}" (a ${r.rt[1]} word) can also take these suffixes to make other names: ${r.rt[2].map((x) => `${r.rt[0]}${x.toLowerCase()}`).join(', ')}.` })
      : h('p', { class: 'hint', text: /(nath|raj|dev|datt|das|pal|kumar|mohan|chandra|dhar|ish|esh|endra|pati|priya|kant|nandan|putra|mitra|sen|vardhan)$/i.test(r.n) ? 'This name already ends in a name-forming suffix, so it is a finished compound. Its first part may take other suffixes.' : 'Used as a complete name on its own. It was reviewed as a base for new names (a deity, virtue or nature word that takes suffixes like -datta or -natha) and was not judged one.' })),
    r.cp?.length && section('Compound names', h('ul', {}, r.cp.map(([n, m]) => h('li', {}, h('strong', { text: n }), m && ` - ${m}`)))),
    section('Numerology', h('div', { class: 'num-row' }, h('div', { class: 'num' }, h('b', { text: r.c1 }), h('small', { text: 'Chaldean' })), h('div', { class: 'num' }, h('b', { text: r.c2 }), h('small', { text: 'Pythagorean' })))),
    r.so?.length && section('Sources and license', h('ul', {}, r.so.map(([t, l]) => h('li', {}, t, l && h('span', { class: 'tag', style: 'margin-left:8px', text: l }))))),
  ].filter(Boolean));   // replaceChildren would print undefined/0 as text
}
window.addEventListener('hashchange', () => { const m = location.hash.match(/^#n=(.+)$/); if (m) openDetail(decodeURIComponent(m[1]), null); });

// ---- birth details panel (top of the page): exact birth, or an expected date range

// ---- time zone drop-down: common zones first, then every zone the browser knows
const COMMON_TZ = [['Asia/Kolkata', 'India'], ['Asia/Colombo', 'Sri Lanka'], ['Asia/Kathmandu', 'Nepal'], ['Asia/Dhaka', 'Bangladesh'], ['Asia/Karachi', 'Pakistan'],
  ['Asia/Dubai', 'UAE'], ['Asia/Muscat', 'Oman'], ['Asia/Qatar', 'Qatar'], ['Asia/Riyadh', 'Saudi Arabia'], ['Asia/Kuwait', 'Kuwait'], ['Asia/Singapore', 'Singapore'],
  ['Asia/Kuala_Lumpur', 'Malaysia'], ['Asia/Bangkok', 'Thailand'], ['Asia/Hong_Kong', 'Hong Kong'], ['Asia/Tokyo', 'Japan'], ['Australia/Sydney', 'Sydney'],
  ['Australia/Perth', 'Perth'], ['Pacific/Auckland', 'New Zealand'], ['Indian/Mauritius', 'Mauritius'], ['Africa/Johannesburg', 'South Africa'], ['Africa/Nairobi', 'Kenya'],
  ['Africa/Lagos', 'Nigeria'], ['Europe/London', 'United Kingdom'], ['Europe/Paris', 'Western Europe'], ['Europe/Berlin', 'Central Europe'], ['Europe/Moscow', 'Moscow'],
  ['America/New_York', 'US Eastern'], ['America/Chicago', 'US Central'], ['America/Denver', 'US Mountain'], ['America/Los_Angeles', 'US Pacific'],
  ['America/Toronto', 'Toronto'], ['America/Vancouver', 'Vancouver'], ['America/Sao_Paulo', 'Brazil']];
const tzOffset = (z) => { try { return new Intl.DateTimeFormat('en-US', { timeZone: z, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value.replace('GMT', 'UTC') || ''; } catch (e) { return ''; } };
function tzSelect(id, value) {
  const opt = (z, label) => h('option', { value: z, text: `${label || z.replace(/_/g, ' ')} (${tzOffset(z) || 'UTC'})`, selected: z === value });
  const common = new Set(COMMON_TZ.map(([z]) => z));
  let all = [];
  try { all = (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : []).filter((z) => !common.has(z)); } catch (e) { /* older browsers: the common list is enough */ }
  return h('select', { id }, h('optgroup', { label: 'Common time zones' }, COMMON_TZ.map(([z, l]) => opt(z, `${l} - ${z.split('/').pop().replace(/_/g, ' ')}`))),
    all.length ? h('optgroup', { label: 'All other time zones' }, all.map((z) => opt(z))) : null);
}

function buildBirthPanel() {
  const box = $('birthPanel');
  if (!box) return;
  const tab = (id, label, on) => h('button', { type: 'button', role: 'tab', class: 'tab', id: `tab-${id}`, 'aria-selected': String(on), 'aria-controls': `pane-${id}`, text: label });
  const field = (id, label, input) => h('label', { class: 'field', for: id }, h('span', { text: label }), input);
  box.append(
    h('details', { class: 'birth-panel', open: true },
      h('summary', {}, h('strong', { text: 'Find names from birth details' }), h('span', { class: 'hint', text: ' Nakshatra, rashi and naming syllables from a birth time, or from expected due dates' })),
      h('div', { class: 'tabs', role: 'tablist' }, tab('exact', 'Exact birth details', true), tab('range', 'Expected date range', false)),
      h('div', { class: 'pane', id: 'pane-exact', role: 'tabpanel', 'aria-labelledby': 'tab-exact' },
        h('div', { class: 'field-row' },
          field('bDate', 'Birth date', h('input', { type: 'date', id: 'bDate' })),
          field('bTime', 'Birth time', h('input', { type: 'time', id: 'bTime' })),
          field('bPlace', 'Birth place', h('input', { type: 'text', id: 'bPlace', list: 'cityList', placeholder: 'e.g. Chennai', autocomplete: 'off' }))),
        h('datalist', { id: 'cityList' }),
        h('details', { class: 'abroad' }, h('summary', { text: 'Born outside India? Enter coordinates and time zone' }),
          h('div', { class: 'field-row' },
            field('bLat', 'Latitude', h('input', { type: 'text', id: 'bLat', placeholder: 'e.g. 51.5', inputmode: 'decimal' })),
            field('bLon', 'Longitude', h('input', { type: 'text', id: 'bLon', placeholder: 'e.g. -0.12', inputmode: 'decimal' })),
            field('bTz', 'Time zone', tzSelect('bTz', 'Asia/Kolkata')))),
        h('p', { class: 'hint', text: 'No exact time? Leave it empty: 12:00 is assumed and the result is approximate.' }),
        h('button', { type: 'button', class: 'btn primary', id: 'bGo', text: 'Find names' }),
        h('div', { id: 'bOut', 'aria-live': 'polite' })),
      h('div', { class: 'pane', id: 'pane-range', role: 'tabpanel', 'aria-labelledby': 'tab-range', hidden: true },
        h('p', { class: 'hint', text: 'Expecting a baby? Enter the window of possible birth dates. The Moon changes nakshatra about once a day, so every pada it passes through in that window is listed, with names for all of them.' }),
        h('div', { class: 'field-row' },
          field('rFrom', 'From', h('input', { type: 'date', id: 'rFrom' })),
          field('rTo', 'To', h('input', { type: 'date', id: 'rTo' })),
          field('rTz', 'Time zone', tzSelect('rTz', 'Asia/Kolkata'))),
        h('button', { type: 'button', class: 'btn primary', id: 'rGo', text: 'Find possible names' }),
        h('div', { id: 'rOut', 'aria-live': 'polite' }))));
  box.addEventListener('click', (e) => {
    const t = e.target.closest('[role=tab]');
    if (!t) return;
    for (const id of ['exact', 'range']) {
      const on = t.id === `tab-${id}`;
      $(`tab-${id}`).setAttribute('aria-selected', String(on));
      $(`pane-${id}`).hidden = !on;
    }
  });
  import('./src/cities.js').then(({ CITIES }) => $('cityList').append(...CITIES.map((c) => h('option', { value: c[0], label: c[1] }))));
  const useSyllables = (syls, label) => { S.nak = ''; S.rashi = ''; S.syls = new Set(syls); syncInputs(); apply(); toast(label); $('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  $('bGo').addEventListener('click', async () => {
    const out = $('bOut'); const date = $('bDate').value; const time = $('bTime').value || '12:00';
    if (!date) { out.textContent = 'Please enter a birth date.'; return; }
    try {
      const { CITIES } = await import('./src/cities.js');
      let lat, lon, tz = 'Asia/Kolkata';
      if ($('bLat').value.trim() && $('bLon').value.trim()) { lat = parseFloat($('bLat').value); lon = parseFloat($('bLon').value); tz = $('bTz').value.trim() || tz; }
      else {
        const place = $('bPlace').value.trim();
        const c = CITIES.find((x) => x[0].toLowerCase() === place.toLowerCase());
        if (place && !c) { out.textContent = 'Pick a place from the list, or enter coordinates under "Born outside India".'; return; }
        if (c) { lat = c[2]; lon = c[3]; }
      }
      if (lat !== undefined && (!Number.isFinite(lat) || !Number.isFinite(lon))) { out.textContent = 'Latitude and longitude must be numbers.'; return; }
      out.textContent = 'Computing…';
      const { birthChart } = await import('./src/astro-engine.js');
      const r = await birthChart({ date, time, tz, lat, lon });
      out.replaceChildren(...[h('div', { class: 'num-row', style: 'margin-top:8px' },
        h('div', { class: 'num' }, h('b', { text: r.rashi }), h('small', { text: 'Rashi (Moon sign)' })),
        h('div', { class: 'num' }, h('b', { text: r.nakshatra }), h('small', { text: `Nakshatra, pada ${r.pada}` })),
        h('div', { class: 'num' }, h('b', { text: r.syllable }), h('small', { text: 'Naming syllable' })),
        r.lagna && h('div', { class: 'num' }, h('b', { text: String(r.lagna) }), h('small', { text: 'Lagna (ascendant)' }))),
        !r.lagna && h('p', { class: 'hint', text: 'Add a birth place to also see the lagna (ascendant).' }),
        r.nearPadaBoundary && h('p', { class: 'warn-box', text: 'The birth time is close to a pada change, so the syllable may differ with a slightly different time.' }),
        h('button', { type: 'button', class: 'btn primary', id: 'bUse', text: `Show names starting with "${r.syllable}"`, onclick: () => useSyllables([r.syllable], `Showing names for ${r.nakshatra} pada ${r.pada}`) }),
        h('button', { type: 'button', class: 'btn', text: `All syllables of ${r.nakshatra}`, onclick: () => { S.nak = r.nakshatra; S.rashi = ''; S.syls.clear(); syncInputs(); apply(); toast(`Showing names for ${r.nakshatra}`); } })].filter(Boolean));
      out.dataset.result = JSON.stringify({ n: r.nakshatra, p: r.pada, r: r.rashi, s: r.syllable });
    } catch (err) { out.textContent = `Could not compute: ${err.message}`; }
  });

  $('rGo').addEventListener('click', async () => {
    const out = $('rOut'); const from = $('rFrom').value; const to = $('rTo').value || from;
    if (!from) { out.textContent = 'Please enter the first possible date.'; return; }
    try {
      out.textContent = 'Computing…';
      const { rangeChart } = await import('./src/astro-engine.js');
      const r = await rangeChart({ from, to, tz: $('rTz').value.trim() || 'Asia/Kolkata' });
      const fmt = (iso) => new Date(iso).toLocaleString(undefined, { timeZone: r.tz, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
      out.replaceChildren(
        h('p', { class: 'hint', style: 'margin-top:8px', text: `${r.padas.length} padas across ${r.nakshatras.length} nakshatras and ${r.rashis.length} rashis between ${from} and ${to}.` }),
        h('button', { type: 'button', class: 'btn primary', id: 'rUse', text: `Show names for all ${r.syllables.length} syllables`, onclick: () => useSyllables(r.syllables, `Showing names for ${r.syllables.length} syllables`) }),
        h('details', { class: 'abroad' }, h('summary', { text: `Show day-by-day breakdown (${r.padas.length} padas)` }), h('div', { class: 'table-wrap' }, h('table', { class: 'range-table' },
          h('thead', {}, h('tr', {}, ...['From', 'Nakshatra', 'Pada', 'Rashi', 'Syllable', ''].map((t) => h('th', { text: t })))),
          h('tbody', {}, ...r.padas.map((p) => h('tr', {},
            h('td', { text: fmt(p.firstUtc) }), h('td', { text: p.nakshatra }), h('td', { text: String(p.pada) }), h('td', { text: p.rashi }), h('td', { text: p.syllable }),
            h('td', {}, h('button', { type: 'button', class: 'btn text-btn', text: 'Names', onclick: () => useSyllables([p.syllable], `Showing names starting with ${p.syllable}`) })))))))));
      out.dataset.result = JSON.stringify({ padas: r.padas.length, syllables: r.syllables });
    } catch (err) { out.textContent = `Could not compute: ${err.message}`; }
  });
}

// ---- init
function init() {
  buildAZ(); buildFilters(); setFiltersMode(); readUrl(); syncInputs();
  $('showBtn').textContent = 'Show names';
  apply();
  const m = location.hash.match(/^#n=(.+)$/); if (m) openDetail(decodeURIComponent(m[1]), $('q'));
  window.__ready = true;
}

// offline support: cache what has been loaded so the site opens without a connection
if ("serviceWorker" in navigator) { try { navigator.serviceWorker.register("./sw.js").catch(() => {}); } catch (e) { /* private mode etc. */ } }

// build the birth-details panel right away (it needs no data), so the page does not jump when the name list arrives
buildBirthPanel();
