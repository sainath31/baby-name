// SLP1 -> IAST / Devanagari / common Indian Latin spelling.
const IAST = { a:'a',A:'ā',i:'i',I:'ī',u:'u',U:'ū',f:'ṛ',F:'ṝ',x:'ḷ',X:'ḹ',e:'e',E:'ai',o:'o',O:'au',M:'ṃ',H:'ḥ',
  k:'k',K:'kh',g:'g',G:'gh',N:'ṅ',c:'c',C:'ch',j:'j',J:'jh',Y:'ñ',w:'ṭ',W:'ṭh',q:'ḍ',Q:'ḍh',R:'ṇ',
  t:'t',T:'th',d:'d',D:'dh',n:'n',p:'p',P:'ph',b:'b',B:'bh',m:'m',y:'y',r:'r',l:'l',v:'v',S:'ś',z:'ṣ',s:'s',h:'h',L:'ḻ' };
const VOW = { a:['अ',''],A:['आ','ा'],i:['इ','ि'],I:['ई','ी'],u:['उ','ु'],U:['ऊ','ू'],f:['ऋ','ृ'],F:['ॠ','ॄ'],
  x:['ऌ','ॢ'],X:['ॡ','ॣ'],e:['ए','े'],E:['ऐ','ै'],o:['ओ','ो'],O:['औ','ौ'] };
const CON = { k:'क',K:'ख',g:'ग',G:'घ',N:'ङ',c:'च',C:'छ',j:'ज',J:'झ',Y:'ञ',w:'ट',W:'ठ',q:'ड',Q:'ढ',R:'ण',
  t:'त',T:'थ',d:'द',D:'ध',n:'न',p:'प',P:'फ',b:'ब',B:'भ',m:'म',y:'य',r:'र',l:'ल',v:'व',S:'श',z:'ष',s:'स',h:'ह',L:'ळ' };

export const isSlp1 = (s) => /^[aAiIuUfFxXeEoOMHkKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzshL]+$/.test(s);
export const toIast = (s) => [...s].map((c) => IAST[c]).join('');

export function toDevanagari(s) {
  let out = '', afterCon = false;
  for (const c of s) {
    if (CON[c]) { if (afterCon) out += '्'; out += CON[c]; afterCon = true; }
    else if (VOW[c]) { out += afterCon ? VOW[c][1] : VOW[c][0]; afterCon = false; }
    else if (c === 'M') { out += 'ं'; afterCon = false; }
    else if (c === 'H') { out += 'ः'; afterCon = false; }
  }
  if (afterCon) out += '्';
  return out;
}

const LATIN = { ā:'a',ī:'i',ū:'u',ṛ:'ri',ṝ:'ri',ḷ:'l',ḹ:'l',ṃ:'m',ḥ:'h',ṅ:'n',ñ:'n',ṭ:'t',ḍ:'d',ṇ:'n',ś:'sh',ṣ:'sh',ḻ:'l' };
// Everyday Indian-English spelling: ś/ṣ -> sh, c -> ch, ch -> chh, ṛ -> ri, long vowels shortened.
export function toLatin(iast) {
  let s = iast.replace(/ch/g, '\u0001').replace(/c/g, 'ch').replace(/\u0001/g, 'chh');
  s = [...s].map((c) => LATIN[c] ?? c).join('');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// IAST -> SLP1 (inverse of toIast); returns null if a character is not recognised.
const SLP1_OF = Object.fromEntries(Object.entries(IAST).map(([k, v]) => [v, k]));
export function fromIast(iast) {
  const toks = Object.keys(SLP1_OF).sort((a, b) => b.length - a.length);
  let out = '', i = 0;
  while (i < iast.length) {
    const t = toks.find((x) => iast.startsWith(x, i));
    if (!t) return null;
    out += SLP1_OF[t]; i += t.length;
  }
  return out;
}
