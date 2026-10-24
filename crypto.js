// Brankas terenkripsi: PBKDF2-SHA256 (600.000 iterasi) -> kunci AES-GCM 256-bit.
// Kata sandi dan kunci hanya ada di memori; yang tersimpan hanya data terenkripsi.
"use strict";
const Vault = (() => {
  const KEY = "dompetku-vault-v1";
  const ITER = 600000;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

  async function deriveKey(password, salt, iter) {
    const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }

  async function seal(key, salt, iter, data) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(data)));
    return { v: 1, kdf: "PBKDF2-SHA256", iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
  }

  async function open(blob, password) {
    const salt = unb64(blob.salt);
    const key = await deriveKey(password, salt, blob.iter);
    try {
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(blob.iv) }, key, unb64(blob.ct));
      return { key, salt, iter: blob.iter, data: JSON.parse(dec.decode(pt)) };
    } catch (e) { return null; } // kata sandi salah atau data rusak
  }

  function read() { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function write(blob) { localStorage.setItem(KEY, JSON.stringify(blob)); }

  let session = null; // {key, salt, iter}

  return {
    exists: () => !!read(),
    supported: () => !!(window.crypto && crypto.subtle && window.isSecureContext),
    async create(password, data) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await deriveKey(password, salt, ITER);
      write(await seal(key, salt, ITER, data));
      session = { key, salt, iter: ITER };
    },
    async unlock(password) {
      const blob = read(); if (!blob) return null;
      const r = await open(blob, password); if (!r) return null;
      session = { key: r.key, salt: r.salt, iter: r.iter };
      return r.data;
    },
    async save(data) {
      if (!session) throw new Error("terkunci");
      write(await seal(session.key, session.salt, session.iter, data));
    },
    async verify(password) { const blob = read(); return !!(blob && await open(blob, password)); },
    async rekey(password, data) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await deriveKey(password, salt, ITER);
      write(await seal(key, salt, ITER, data));
      session = { key, salt, iter: ITER };
    },
    exportBlob: () => read(),
    async importBlob(blob, password) {
      if (!blob || blob.v !== 1 || !blob.ct) return null;
      const r = await open(blob, password); if (!r) return null;
      write(blob); session = { key: r.key, salt: r.salt, iter: r.iter };
      return r.data;
    },
    lock() { session = null; },
    wipe() { session = null; try { localStorage.removeItem(KEY); } catch (e) {} }
  };
})();
