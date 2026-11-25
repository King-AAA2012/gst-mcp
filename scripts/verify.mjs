import { validateGstin, checkDigit } from '../lib/gstin.js';

const cases = [
  { gstin: '27AAACR5055K1Z7', valid: true, label: 'Reliance Maharashtra (real)' },
  { gstin: '29AAACI1195H1ZI', valid: true, label: 'Karnataka, check digit is a letter' },
  { gstin: '99AAACR5055KAZN', valid: true, label: 'Entity code A, state 99' },
  { gstin: '00AAACR5055K1ZN', valid: false, label: 'Valid checksum but state 00 never issued' },
  { gstin: '27AAACR5055K1Y7', valid: false, label: 'Position 14 not Z' },
  { gstin: '27AAACR5055K0Z7', valid: false, label: 'Entity code 0' },
  { gstin: '27AAACR50X5K1Z7', valid: false, label: 'Letter inside PAN digit block' },
  { gstin: '27aaacr5055k1z7', valid: true, label: 'Lowercase normalises' },
  { gstin: '27-AAACR-5055K1Z7', valid: true, label: 'Punctuation stripped' },
];

let pass = 0;
for (const c of cases) {
  const r = validateGstin(c.gstin);
  const ok = r.valid === c.valid;
  if (ok) pass++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.gstin}  expected=${c.valid}  got=${r.valid}  ${c.label}${ok ? '' : '  -> ' + (r.error || '')}`);
}

// Sanity: the documented check digit computations.
console.log('\ncheckDigit("27AAACR5055K1Z") =', checkDigit('27AAACR5055K1Z'), '(expect 7)');
console.log('checkDigit("29AAACI1195H1Z") =', checkDigit('29AAACI1195H1Z'), '(expect I)');

console.log(`\n${pass}/${cases.length} format checks passed`);
