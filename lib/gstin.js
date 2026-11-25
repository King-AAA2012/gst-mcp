/**
 * Offline GSTIN validation.
 *
 * A GSTIN is 15 characters: SS AAAAA9999Z YYY C
 *   1–2  State code (digits, 01–38 plus 96/97/99)
 *   3–12 PAN of the registered entity (5 letters, 4 digits, 1 letter)
 *   13   Entity code (1–9 then A–Z; never 0)
 *   14   Reserved, always the literal letter "Z"
 *   15   Check digit (any of 0–9 / A–Z), computed with a modulus-36 Luhn variant
 *
 * This module validates format and the check digit with no network call.
 * Live registration/active status requires a GSTINAPI_KEY (see index.js).
 *
 * Reference: https://gstinapi.com/blog/gstin-checksum-algorithm
 */

const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Numeric value of a GSTIN character in the base-36 alphabet. */
function valueOf(ch) {
  return CHARSET.indexOf(ch);
}

/**
 * Compute the modulus-36 check digit for the first 14 characters of a GSTIN.
 * @param {string} first14
 * @returns {string} the expected 15th character
 */
function checkDigit(first14) {
  let total = 0;
  for (let i = 0; i < 14; i++) {
    const product = valueOf(first14[i]) * (i % 2 === 0 ? 1 : 2);
    total += Math.floor(product / 36) + (product % 36);
  }
  return CHARSET[(36 - (total % 36)) % 36];
}

/**
 * Validate a GSTIN offline (format + check digit).
 * @param {string} gstin
 * @returns {{ valid: boolean, error?: string, parsed?: object }}
 */
function validateGstin(gstin) {
  if (typeof gstin !== 'string') {
    return { valid: false, error: 'GSTIN must be a string' };
  }

  const g = gstin.trim().replace(/[-\s]/g, '').toUpperCase();

  if (g.length !== 15) {
    return { valid: false, error: 'GSTIN must be exactly 15 characters' };
  }
  if (!/^[0-9A-Z]{15}$/.test(g)) {
    return { valid: false, error: 'GSTIN may only contain characters 0-9 and A-Z' };
  }

  const stateCode = g.slice(0, 2);
  const pan = g.slice(2, 12);
  const entityCode = g[12];
  const reserved = g[13];
  const checkChar = g[14];

  // State code: two digits, in the issued ranges.
  if (!/^\d{2}$/.test(stateCode)) {
    return { valid: false, error: 'State code (chars 1-2) must be two digits' };
  }
  const stateNum = Number(stateCode);
  const issuedStates = new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
    96, 97, 99,
  ]);
  if (!issuedStates.has(stateNum)) {
    return {
      valid: false,
      error: `State code ${stateCode} is not one the government issues`,
    };
  }

  // PAN: 5 letters, 4 digits, 1 letter.
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    return { valid: false, error: 'PAN (chars 3-12) must be 5 letters, 4 digits, 1 letter' };
  }

  // Entity code: 1-9 then A-Z, never 0.
  if (entityCode === '0') {
    return { valid: false, error: 'Entity code (char 13) is never 0' };
  }
  if (!/^[1-9A-Z]$/.test(entityCode)) {
    return { valid: false, error: 'Entity code (char 13) must be 1-9 or A-Z' };
  }

  // Reserved position 14 is always the literal letter Z.
  if (reserved !== 'Z') {
    return { valid: false, error: 'Character 14 must be the letter Z' };
  }

  // Check digit (char 15) must match the modulus-36 computation.
  const expected = checkDigit(g.slice(0, 14));
  if (checkChar !== expected) {
    return {
      valid: false,
      error: `Check digit must be '${expected}', not '${checkChar}'`,
    };
  }

  return {
    valid: true,
    parsed: {
      gstin: g,
      stateCode,
      stateName: stateNameForCode(stateCode),
      pan,
      entityCode,
      checkChar,
    },
  };
}

/**
 * Map a two-digit state code to a state name.
 * Source: the authoritative GSTIN state-code table from the official
 * @dlminds/gstin-api package (gstinapi.com's own client).
 *
 * Code 27 = Maharashtra, 29 = Karnataka, 32 = Kerala, 33 = Tamil Nadu, etc.
 * 96/97/99 are non-geographic codes (foreign territory / UT / centre).
 */
function stateNameForCode(code) {
  const names = {
    '01': 'Jammu and Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '25': 'Daman and Diu (merged)',
    '26': 'Dadra and Nagar Haveli and Daman and Diu',
    '27': 'Maharashtra',
    '28': 'Andhra Pradesh (pre-bifurcation)',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh',
    '38': 'Ladakh',
    '96': 'Other Country',
    '97': 'Other Territory',
    '99': 'Centre Jurisdiction',
  };
  return names[code] || null;
}

export { validateGstin, checkDigit, stateNameForCode };

/**
 * Fetch live GSTIN registration data from gstinapi.com.
 * @param {string} gstin
 * @param {string} apiKey
 * @returns {Promise<object>} parsed taxpayer_data (or an error object)
 */
export async function fetchTaxpayerInfo(gstin, apiKey) {
  if (!apiKey) {
    throw new Error('GSTINAPI_KEY is not set');
  }
  const url = `https://gstinapi.com/api/get-taxpayer-info/${gstin}`;
  const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
  const body = await res.json();
  if (!res.ok || !body.success) {
    const message =
      body?.message || body?.error || body?.detail || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return body.taxpayer_data ?? body;
}
