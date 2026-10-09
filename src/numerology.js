// Name numerology. Traditional systems differ, so both are provided.
const CHALDEAN = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

const pythagorean = (ch) => ((ch.charCodeAt(0) - 65) % 9) + 1;

export function reduce(n, keepMaster = false) {
  while (n > 9 && !(keepMaster && (n === 11 || n === 22 || n === 33))) {
    n = String(n).split('').reduce((a, d) => a + Number(d), 0);
  }
  return n;
}

export function nameNumber(name, system = 'chaldean', keepMaster = false) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  let total = 0;
  for (const ch of letters) total += system === 'chaldean' ? CHALDEAN[ch] : pythagorean(ch);
  return reduce(total, keepMaster);
}

// Birth-date number (moolank = day, bhagyank = full date), reduced to 1-9.
export function moolank(day) { return reduce(day); }
export function bhagyank(year, month, day) {
  return reduce(`${year}${month}${day}`.split('').reduce((a, d) => a + Number(d), 0));
}
