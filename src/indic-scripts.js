// Telugu and Kannada support: conversion from Devanagari/IAST and a well-formedness validator.
// Brahmic scripts share one layout, so Devanagari (U+0900..) maps to Telugu (+0x300) and Kannada (+0x380).
import { fromIast, toDevanagari } from './translit.js';

const SCRIPTS = {
  telugu: { name: 'Telugu', base: 0x0c00, offset: 0x0300 },
  kannada: { name: 'Kannada', base: 0x0c80, offset: 0x0380 },
  devanagari: { name: 'Devanagari', base: 0x0900, offset: 0 },
};
const inBlock = (cp, s) => cp >= s.base && cp < s.base + 0x80;

// Devanagari code points with no Telugu/Kannada counterpart (Hindi-only signs, candra vowels, nukta, etc.).
const NO_EQUIVALENT = new Set([0x0900, 0x0901, 0x0929, 0x0931, 0x0934, 0x093c, 0x0945, 0x0949, 0x0950, 0x0951, 0x0952,
  0x0953, 0x0954, 0x0955, 0x0956, 0x0957, 0x0958, 0x0959, 0x095a, 0x095b, 0x095c, 0x095d, 0x095e, 0x095f]);

export function convertFromDevanagari(dev, script) {
  const s = SCRIPTS[script];
  if (!s) throw new Error(`unknown script ${script}`);
  let out = '';
  for (const ch of dev) {
    const cp = ch.codePointAt(0);
    if (ch === ' ') { out += ch; continue; }
    if (cp === 0x0901) { out += String.fromCodePoint(0x0902 + s.offset); continue; }   // candrabindu -> anusvara
    if (NO_EQUIVALENT.has(cp) || !inBlock(cp, SCRIPTS.devanagari)) return null;
    out += String.fromCodePoint(cp + s.offset);
  }
  return out;
}
export const toTelugu = (dev) => convertFromDevanagari(dev, 'telugu');
export const toKannada = (dev) => convertFromDevanagari(dev, 'kannada');
export function iastTo(script, iast) {
  const slp = fromIast(iast.replace(/\s+/g, ''));
  return slp === null ? null : convertFromDevanagari(toDevanagari(slp), script);
}
export function toDevanagariFrom(text, script) {
  const s = SCRIPTS[script];
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    out += ch === ' ' ? ch : inBlock(cp, s) ? String.fromCodePoint(cp - s.offset) : '\ufffd';
  }
  return out;
}

// Offsets inside a block (relative to base), shared by Telugu and Kannada up to a few unassigned slots.
const rel = (cp, s) => cp - s.base;
const IS_CONSONANT = (r) => r >= 0x15 && r <= 0x39;
const IS_VOWEL = (r) => r >= 0x05 && r <= 0x14;
const IS_MATRA = (r) => r >= 0x3e && r <= 0x4c;
const IS_SIGN = (r) => r === 0x02 || r === 0x03;     // anusvara, visarga
const VIRAMA = 0x4d;

// Returns { valid, errors[], warnings[], devanagari } for a name typed in Telugu or Kannada script.
export function validateName(text, script) {
  const s = SCRIPTS[script];
  if (!s || script === 'devanagari') throw new Error('script must be telugu or kannada');
  const errors = [];
  const t = text.normalize('NFC').trim();
  if (!t) return { valid: false, errors: ['empty name'], script };
  const chars = [...t];
  let prev = null;                                    // kind of previous character
  const hiatus = [];
  chars.forEach((ch, i) => {
    const cp = ch.codePointAt(0);
    if (ch === ' ') { if (prev === 'virama') errors.push(`word ends in a dangling virama before space (position ${i})`); prev = 'space'; return; }
    if (!inBlock(cp, s)) { errors.push(`character U+${cp.toString(16).toUpperCase()} (${ch}) is not ${s.name}`); prev = 'bad'; return; }
    const r = rel(cp, s);
    let kind;
    if (IS_CONSONANT(r)) kind = 'consonant';
    else if (IS_VOWEL(r)) kind = 'vowel';
    else if (IS_MATRA(r)) kind = 'matra';
    else if (r === VIRAMA) kind = 'virama';
    else if (IS_SIGN(r)) kind = 'sign';
    else { errors.push(`unsupported ${s.name} character U+${cp.toString(16).toUpperCase()} (${ch}) at position ${i}`); prev = 'bad'; return; }
    if (kind === 'matra' && prev !== 'consonant') errors.push(`vowel sign at position ${i} must follow a consonant`);
    if (kind === 'virama' && prev !== 'consonant') errors.push(`virama at position ${i} must follow a consonant`);
    if (kind === 'sign' && !['consonant', 'vowel', 'matra'].includes(prev)) errors.push(`anusvara/visarga at position ${i} must follow a letter`);
    if (kind === 'vowel' && prev === 'consonant') errors.push(`independent vowel at position ${i} right after a consonant (expected a vowel sign)`);
    if (kind === 'vowel' && (prev === 'matra' || prev === 'vowel')) hiatus.push(i);   // vowel after vowel, e.g. साई / Sai: allowed
    if (kind === 'consonant' && prev === 'virama') { /* conjunct, fine */ }
    prev = kind;
  });
  const warnings = [];
  if (hiatus.length) warnings.push('two vowels side by side (hiatus); usual in names like Sai, but Telugu/Kannada often write a -y- glide instead (సాయి)');
  if (prev === 'virama') warnings.push('ends in a bare consonant (virama); in Telugu/Kannada such names usually take a final vowel, e.g. -u or -a');
  const dev = toDevanagariFrom(t, script);
  return { valid: errors.length === 0, errors, warnings, script, devanagari: dev };
}
