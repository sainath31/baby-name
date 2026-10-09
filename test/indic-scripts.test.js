import test from 'node:test';
import assert from 'node:assert/strict';
import { toTelugu, toKannada, iastTo, validateName } from '../src/indic-scripts.js';

test('Devanagari to Telugu/Kannada', () => {
  assert.equal(toTelugu('कृष्ण'), 'కృష్ణ');
  assert.equal(toKannada('कृष्ण'), 'ಕೃಷ್ಣ');
  assert.equal(toTelugu('राम'), 'రామ');
  assert.equal(toKannada('श्रीनिवास'), 'ಶ್ರೀನಿವಾಸ');
  assert.equal(iastTo('telugu', 'veṅkaṭeśa'), 'వేఙ్కటేశ');
});
test('valid names pass', () => {
  for (const n of ['కృష్ణ', 'రామ', 'వెంకటేశ', 'అర్జున', 'శ్రీనివాస']) assert.ok(validateName(n, 'telugu').valid, n);
  for (const n of ['ಕೃಷ್ಣ', 'ರಾಮ', 'ಮಂಜುನಾಥ', 'ಬಸವರಾಜ']) assert.ok(validateName(n, 'kannada').valid, n);
});
test('malformed names fail with a reason', () => {
  assert.equal(validateName('ా', 'telugu').valid, false);                 // vowel sign with no consonant
  const bare = validateName('రామ్', 'telugu');                              // bare consonant ending: valid but warned
  assert.equal(bare.valid, true); assert.equal(bare.warnings.length, 1);
  assert.equal(validateName('ರಾಮ', 'telugu').valid, false);              // Kannada text given as Telugu
  assert.equal(validateName('ಕಾಾ', 'kannada').valid, false);             // doubled vowel sign
  assert.equal(validateName('Rama', 'telugu').valid, false);              // Latin letters
  assert.equal(validateName('', 'kannada').valid, false);
});
test('round-trips back to Devanagari', () => {
  assert.equal(validateName('రామ', 'telugu').devanagari, 'राम');
  assert.equal(validateName('ಮಂಜುನಾಥ', 'kannada').devanagari, 'मंजुनाथ');
});
