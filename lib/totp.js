// Six-digit codes that change every 30 seconds (TOTP, RFC 6238): what Authy,
// Google Authenticator and Microsoft Authenticator show.
import crypto from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function newSecret() {
  return base32(crypto.randomBytes(20));
}

function base32(buf) {
  let bits = 0, value = 0, out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { out += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function unbase32(str) {
  let bits = 0, value = 0;
  const out = [];
  for (const ch of str.replace(/[\s=]/g, "").toUpperCase()) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) continue;
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

export function codeAt(secret, counter) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac("sha1", unbase32(secret)).update(msg).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1e6).padStart(6, "0");
}

const counterNow = () => Math.floor(Date.now() / 30000);

// The 30-second step the code belongs to (allowing one step either side for a
// phone clock that's slightly off), or -1. A step already used is refused, so
// a code seen over someone's shoulder can't be used again.
export function checkCode(secret, code, lastUsed = -1) {
  const c = String(code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return -1;
  const now = counterNow();
  for (const step of [now, now - 1, now + 1]) {
    if (step <= lastUsed) continue;
    const want = Buffer.from(codeAt(secret, step));
    if (crypto.timingSafeEqual(want, Buffer.from(c))) return step;
  }
  return -1;
}

export function otpauthUri(secret, label, issuer) {
  const l = encodeURIComponent(`${issuer}:${label}`);
  return `otpauth://totp/${l}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

// One-time backup codes like "4k7q-9z2m", for when the phone is lost.
export function newBackupCodes(n = 8) {
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: n }, () => {
    const b = crypto.randomBytes(8);
    const s = [...b].map((x) => abc[x % abc.length]).join("");
    return `${s.slice(0, 4)}-${s.slice(4)}`;
  });
}
export const hashCode = (code) => crypto.createHash("sha256").update(String(code).trim().toLowerCase()).digest("hex");
