// Cryptographic vendor secret - must match the backend offline verification key
const VENDOR_SECRET = 'DENTAL_HMS_OFFLINE_SECURE_KEY_2026_PRO_LIFETIME';

function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Determine the license key prefix for a given software category / machine ID.
 * Future-proof: automatically derives <PREFIX>-LIC for any new product Machine ID (e.g. MFMS- -> MEDFLOW-LIC, AYUR- -> AYUR-LIC).
 */
export function getLicensePrefix(category?: string, machineId?: string): string {
  const cat = (category || '').trim().toUpperCase();
  const mid = (machineId || '').trim().toUpperCase();

  // 1. Known explicit mappings
  if (cat.includes('MEDFLOW') || mid.startsWith('MFMS-')) {
    return 'MEDFLOW-LIC';
  }
  if (cat.includes('DENTAL') || mid.startsWith('DHMS-')) {
    return 'DHMS-LIC';
  }

  // 2. Dynamic prefix from Machine ID for any future product (e.g. AYUR-XXXX-... -> AYUR-LIC)
  const midPrefixMatch = mid.match(/^([A-Z0-9]{2,10})-/);
  if (midPrefixMatch) {
    return `${midPrefixMatch[1]}-LIC`;
  }

  // 3. Fallback from category name (e.g. "AYURVED HMS" -> "AYURVED-LIC")
  const catPrefix = cat.replace(/[^A-Z0-9]/g, '').slice(0, 8);
  if (catPrefix) {
    return `${catPrefix}-LIC`;
  }

  return 'DHMS-LIC';
}

/**
 * Generate a cryptographically signed Lifetime License Key in the browser.
 * Uses Web Crypto API (HMAC-SHA256) matching the HMS backend verification.
 */
export async function generateLicenseKey(
  clinicName: string,
  machineId: string,
  planType: 'LIFETIME' | 'TRIAL' = 'LIFETIME',
  category?: string
): Promise<string> {
  const normalizedMid = machineId.trim().toUpperCase();
  const cleanClinic = clinicName.trim();
  const issuedAt = new Date().toISOString().split('T')[0];

  const payload = {
    clinicName: cleanClinic,
    machineId: normalizedMid,
    planType,
    issuedAt,
  };

  const payloadJson = JSON.stringify(payload);
  const base64Payload = base64UrlEncode(payloadJson);

  // Compute HMAC-SHA256 signature via Web Crypto API
  const enc = new TextEncoder();
  const keyData = enc.encode(VENDOR_SECRET);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    enc.encode(base64Payload)
  );

  const fullSigHex = bufferToHex(signatureBuffer);
  const signature32 = fullSigHex.slice(0, 32);
  const prefix = getLicensePrefix(category, normalizedMid);

  return `${prefix}.${base64Payload}.${signature32}`;
}

/**
 * Decode a signed license key's payload without verifying signature (for reading client details)
 */
export function decodeLicensePayload(licenseKey: string): {
  clinicName: string;
  machineId: string;
  planType: 'LIFETIME' | 'TRIAL';
  issuedAt: string;
} | null {
  try {
    const parts = licenseKey.trim().split('.');
    if (parts.length !== 3 || !parts[0].endsWith('-LIC')) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}


