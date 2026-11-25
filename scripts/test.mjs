import assert from 'node:assert';
import { validateGstin } from '../lib/gstin.js';

let passed = 0;
function ok(name, fn) {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

console.log('GSTIN validation tests:');

ok('rejects wrong length', () => {
  assert.strictEqual(validateGstin('29ABCPD1234C1Z').valid, false);
});

ok('rejects non-alphanumeric input', () => {
  assert.strictEqual(validateGstin('29ABCPD1234C1Z!').valid, false);
});

ok('rejects non-numeric state code', () => {
  const r = validateGstin('AB29ABCPD1234C1Z5'.slice(0, 15));
  assert.strictEqual(r.valid, false);
});

ok('accepts real Maharashtra GSTIN (27AAACR5055K1Z7)', () => {
  const r = validateGstin('27AAACR5055K1Z7');
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.parsed.stateCode, '27');
  assert.strictEqual(r.parsed.stateName, 'Maharashtra');
  assert.strictEqual(r.parsed.pan, 'AAACR5055K');
});

ok('accepts real Karnataka GSTIN with a letter check digit (29AAACI1195H1ZI)', () => {
  const r = validateGstin('29AAACI1195H1ZI');
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.parsed.stateName, 'Karnataka');
});

ok('accepts state 99 with entity code A (99AAACR5055KAZN)', () => {
  const r = validateGstin('99AAACR5055KAZN');
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.parsed.stateName, 'Centre Jurisdiction');
  assert.strictEqual(r.parsed.entityCode, 'A');
});

ok('rejects valid checksum but state 00 (never issued)', () => {
  const r = validateGstin('00AAACR5055K1ZN');
  assert.strictEqual(r.valid, false);
  assert.match(String(r.error), /State code/);
});

ok('rejects position 14 not being Z', () => {
  const r = validateGstin('27AAACR5055K1Y7');
  assert.strictEqual(r.valid, false);
  assert.match(String(r.error), /Z/);
});

ok('rejects entity code 0', () => {
  const r = validateGstin('27AAACR5055K0Z7');
  assert.strictEqual(r.valid, false);
  assert.match(String(r.error), /Entity code/);
});

ok('rejects a letter inside the PAN digit block', () => {
  const r = validateGstin('27AAACR50X5K1Z7');
  assert.strictEqual(r.valid, false);
  assert.match(String(r.error), /PAN/);
});

ok('accepts and normalises lowercase PAN (per gstinapi.com normalizeGstin)', () => {
  const r = validateGstin('27aaaCR5055K1Z7');
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.parsed.pan, 'AAACR5055K');
});

ok('trims and uppercases input', () => {
  const r = validateGstin('  27aaacr5055k1z7 ');
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.parsed.pan, 'AAACR5055K');
});

ok('strips punctuation between groups', () => {
  assert.strictEqual(validateGstin('27-AAACR-5055K1Z7').valid, true);
});

ok('reports the expected check digit for a wrong one', () => {
  const r = validateGstin('27AAACR5055K1Z8');
  assert.strictEqual(r.valid, false);
  assert.match(String(r.error), /must be '7'/);
});

ok('parsed object carries the raw GSTIN', () => {
  const r = validateGstin('27AAACR5055K1Z7');
  assert.strictEqual(r.parsed.gstin, '27AAACR5055K1Z7');
});

console.log(`\n${passed} passed, 0 failed`);
