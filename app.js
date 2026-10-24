"use strict";
const CATS = [
  { k: "Makan", kw: ["makan","kopi","nasi","bakso","mie","sarapan","jajan","snack","minum","teh","gofood","grabfood","ayam","sate","martabak","roti","warung"] },
  { k: "Transport", kw: ["bensin","parkir","ojek","gojek","grab","tol","bus","kereta","krl","angkot","taksi","pertalite","pertamax","servis"] },
  { k: "Belanja", kw: ["belanja","sabun","shopee","tokopedia","baju","sepatu","indomaret","alfamart","sayur","beras","minyak","galon","pasar"] },
  { k: "Tagihan", kw: ["listrik","pln","token","air","pdam","wifi","internet","pulsa","kuota","kos","sewa","cicilan","bpjs","netflix","spotify","langganan"] },
  { k: "Hiburan", kw: ["nonton","bioskop","game","main","karaoke","konser","jalan","liburan","hadiah","kado"] },
  { k: "Lainnya", kw: [] }
];
const DEFAULT_BUDGET = { Makan: 1500000, Transport: 500000, Belanja: 700000, Tagihan: 800000, Hiburan: 300000, Lainnya: 200000 };
const PRESETS = [["Parkir", 2000, "Transport"], ["Kopi", 18000, "Makan"], ["Makan siang", 25000, "Makan"], ["Bensin", 30000, "Transport"]];
const IDLE_MS = 5 * 60 * 1000;

const state = { items: [], budget: { ...DEFAULT_BUDGET }, view: new Date(), selCat: null };
state.view.setDate(1);

const rp = n => "Rp" + Math.round(n).toLocaleString("id-ID");
const short = n => n >= 1e6 ? (n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "jt" : n >= 1e3 ? Math.round(n / 1e3) + "rb" : String(n);
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let currentUser = "";
const secret = (u, p) => u.trim().toLowerCase() + "\n" + p;
const vaultData = () => ({ items: state.items, budget: state.budget });

/* ---------- parsing ---------- */
function guessCat(text) {
  const t = text.toLowerCase();
  for (const c of CATS) if (c.kw.some(w => t.includes(w))) return c.k;
  return "Lainnya";
}
function parse(raw) {
  let t = " " + raw.trim() + " ", day = 0;
  if (/\bkemarin\b/i.test(t)) { day = -1; t = t.replace(/\bkemarin\b/ig, " "); }
  t = t.replace(/\b(tadi|pagi|siang|sore|malam|hari ini)\b/ig, " ");
  const m = t.match(/(\d+(?:[.,]\d+)*)\s*(rb|ribu|k|jt|juta)?\b/i);
  if (!m) return null;
  const s = m[1], unit = (m[2] || "").toLowerCase();
  let n;
  if (unit) { n = parseFloat(s.replace(/\./g, "").replace(",", ".")); n *= (unit === "jt" || unit === "juta") ? 1e6 : 1e3; }
  else n = parseFloat(s.replace(/[.,]/g, ""));
  if (!n || n <= 0 || n > 1e12) return null;
  const note = (t.replace(m[0], " ").replace(/\s+/g, " ").trim() || "Pengeluaran").slice(0, 80);
  const d = new Date(); d.setDate(d.getDate() + day); if (day) d.setHours(12, 0, 0, 0);
  return { amt: Math.round(n), note: note.charAt(0).toUpperCase() + note.slice(1), cat: state.selCat || guessCat(note), ts: d.getTime() };
}

/* ---------- render ---------- */
function monthItems() {
  const y = state.view.getFullYear(), mo = state.view.getMonth();
  return state.items.filter(i => { const d = new Date(i.ts); return d.getFullYear() === y && d.getMonth() === mo; }).sort((a, b) => b.ts - a.ts);
}
function render() {
  const y = state.view.getFullYear(), mo = state.view.getMonth(), now = new Date();
  $("mlabel").textContent = MONTHS[mo] + " " + y;
  const items = monthItems();
  const spent = items.reduce((s, i) => s + i.amt, 0);
  const totalBudget = Object.values(state.budget).reduce((a, b) => a + b, 0);
  const left = totalBudget - spent;
  const dim = new Date(y, mo + 1, 0).getDate();
  const isNow = y === now.getFullYear() && mo === now.getMonth();
  const daysLeft = isNow ? dim - now.getDate() + 1 : (state.view > now ? dim : 0);
  const perDay = daysLeft > 0 ? left / daysLeft : 0;
  const neg = v => v < 0 ? "−" + rp(-v) : rp(v);

  const safe = daysLeft > 0
    ? `<div class="safe${left < 0 ? " over" : ""}"><div class="label">Aman dibelanjakan per hari</div><div class="big num">${left < 0 ? "Rp0" : rp(perDay)}</div><small>${left < 0 ? `Lewat anggaran ${rp(-left)}` : `untuk ${daysLeft} hari tersisa bulan ini`}</small></div>`
    : `<div class="safe${left < 0 ? " over" : ""}"><div class="label">Hasil bulan ini</div><div class="big num">${neg(left)}</div><small>${left < 0 ? "melewati anggaran" : "sisa dari anggaran"}</small></div>`;
  $("summary").innerHTML = safe +
    `<div><div class="label">Terpakai</div><div class="big num">${rp(spent)}</div></div>` +
    `<div><div class="label">Sisa anggaran</div><div class="big num" style="color:${left < 0 ? "var(--bad)" : "inherit"}">${neg(left)}</div></div>`;

  const byCat = {}; items.forEach(i => byCat[i.cat] = (byCat[i.cat] || 0) + i.amt);
  const elapsed = isNow ? now.getDate() / dim : 1;
  $("env").innerHTML = CATS.map(c => {
    const b = state.budget[c.k] || 0, u = byCat[c.k] || 0, p = b ? u / b : (u ? 1.01 : 0);
    const cls = p > 1 ? "bad" : p > Math.min(1, elapsed + .15) && p > .6 ? "warn" : "";
    const pill = p > 1 ? `<span class="pill bad">lewat ${rp(u - b)}</span>` : cls === "warn" ? `<span class="pill warn">${Math.round(p * 100)}%</span>` : "";
    return `<div class="erow"><div class="name">${c.k}${pill}</div>
      <div class="amt num"><span>${rp(u)}</span> / <button data-edit="${c.k}" aria-label="Ubah anggaran ${c.k}">${rp(b)}</button></div>
      <div class="bar ${cls}"><i style="width:${Math.min(100, p * 100)}%"></i></div></div>`;
  }).join("");

  const daily = Array(dim).fill(0); items.forEach(i => daily[new Date(i.ts).getDate() - 1] += i.amt);
  const W = 360, H = 150, pl = 30, pb = 18, pt = 10, bw = (W - pl) / dim, max = Math.max(1, ...daily);
  const avgPerDay = totalBudget / dim;
  const ceil = Math.max(max, avgPerDay);
  const step = ceil > 500000 ? 250000 : ceil > 200000 ? 100000 : ceil > 100000 ? 50000 : ceil > 40000 ? 20000 : 10000;
  const top = Math.ceil(ceil / step) * step, sy = v => pt + (H - pt - pb) * (1 - v / top);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik pengeluaran harian">`;
  for (let v = 0; v <= top; v += step) svg += `<line x1="${pl}" x2="${W}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--line)" stroke-width="0.6"/><text x="${pl - 4}" y="${sy(v) + 3}" text-anchor="end">${v ? short(v) : "0"}</text>`;
  svg += `<line x1="${pl}" x2="${W}" y1="${sy(avgPerDay)}" y2="${sy(avgPerDay)}" stroke="var(--warn)" stroke-dasharray="3 3" stroke-width="1"/><text x="${W - 2}" y="${sy(avgPerDay) - 3}" text-anchor="end" style="fill:var(--warn)">jatah harian ${short(Math.round(avgPerDay))}</text>`;
  daily.forEach((v, i) => {
    const x = pl + i * bw + bw * .15, today = isNow && i === now.getDate() - 1;
    if (v) svg += `<rect x="${x}" y="${sy(v)}" width="${bw * .7}" height="${Math.max(1, H - pb - sy(v))}" rx="1.5" fill="${v > avgPerDay ? "var(--warn)" : "var(--accent)"}" opacity="${today ? 1 : .8}"><title>${i + 1} ${MONTHS[mo]}: ${rp(v)}</title></rect>`;
    if (i === 0 || (i + 1) % 5 === 0 || today) svg += `<text x="${x + bw * .35}" y="${H - 5}" text-anchor="middle" style="${today ? "fill:var(--ink);font-weight:600" : ""}">${i + 1}</text>`;
  });
  $("chart").innerHTML = svg + "</svg>";

  if (!items.length) {
    $("list").innerHTML = `<div class="empty">${state.items.length ? "Belum ada catatan di bulan ini." : "Belum ada catatan. Ketik pengeluaran pertamamu di atas, misalnya \"makan siang 25rb\"."}</div>`;
  } else {
    const groups = {}; items.forEach(i => { const k = new Date(i.ts).toDateString(); (groups[k] = groups[k] || []).push(i); });
    let html = "";
    for (const key in groups) {
      const d = new Date(key), g = groups[key], tot = g.reduce((s, i) => s + i.amt, 0);
      html += `<div class="day"><span>${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}</span><span class="num">${rp(tot)}</span></div>`;
      g.forEach(i => { html += `<div class="item"><div class="note">${esc(i.note)}<div class="cat">${esc(i.cat)}</div></div><div class="num">${rp(i.amt)}</div><button class="del" data-del="${esc(i.id)}" aria-label="Hapus ${esc(i.note)}">×</button></div>`; });
    }
    $("list").innerHTML = html;
  }
}
function renderChips() {
  $("cats").innerHTML = `<button class="chip" data-cat="" aria-pressed="${state.selCat === null}">Otomatis</button>` +
    CATS.map(c => `<button class="chip" data-cat="${c.k}" aria-pressed="${state.selCat === c.k}">${c.k}</button>`).join("");
  $("presets").innerHTML = PRESETS.map((p, i) => `<button class="chip preset" data-preset="${i}">+ ${p[0]} ${short(p[1])}</button>`).join("");
}
function updatePreview() {
  const p = parse($("q").value);
  $("add").disabled = !p;
  if (!$("q").value.trim()) { $("preview").textContent = 'Ketik nama dan nominal. Bisa pakai rb, k, jt, atau "kemarin".'; return; }
  if (!p) { $("preview").textContent = "Tambahkan nominal, misalnya 25rb atau 25000."; return; }
  const today = new Date().toDateString() === new Date(p.ts).toDateString();
  $("preview").innerHTML = `<b>${esc(p.note)}</b> · <b class="num">${rp(p.amt)}</b> · ${p.cat} · ${today ? "hari ini" : "kemarin"}`;
}

/* ---------- penyimpanan terenkripsi ---------- */
let saving = Promise.resolve();
function persist() { saving = saving.then(() => Vault.save(vaultData())).catch(() => { $("secMsg").textContent = "Gagal menyimpan. Periksa ruang penyimpanan browser."; }); return saving; }
function load(data) {
  state.items = Array.isArray(data && data.items) ? data.items.filter(i => i && typeof i.amt === "number") : [];
  state.budget = { ...DEFAULT_BUDGET, ...(data && data.budget) };
}
async function addItem(it) {
  state.items.push({ ...it, id: Date.now().toString(36) + crypto.getRandomValues(new Uint32Array(1))[0].toString(36) });
  render(); await persist();
}

/* ---------- kunci & sesi ---------- */
let idleTimer = null;
function resetIdle() { clearTimeout(idleTimer); idleTimer = setTimeout(lockNow, IDLE_MS); }
function showApp() {
  $("lockScreen").hidden = true; $("app").hidden = false;
  ["pass", "newPass", "newPass2", "restoreLock-pass", "restoreLock-user"].forEach(id => $(id).value = "");
  renderChips(); updatePreview(); render(); resetIdle();
}
function lockNow() {
  clearTimeout(idleTimer); Vault.lock(); currentUser = "";
  state.items = []; state.budget = { ...DEFAULT_BUDGET };
  $("app").hidden = true; $("lockScreen").hidden = false;
  ["list", "env", "summary", "chart"].forEach(id => $(id).innerHTML = "");
  ["oldPass", "chPass", "chPass2", "restoreApp-pass", "restoreApp-user"].forEach(id => $(id).value = "");
  $("changeForm").hidden = true; $("restoreApp").hidden = true; $("secMsg").textContent = "";
  showLockForm();
}
function showLockForm() {
  const has = Vault.exists();
  $("setupForm").hidden = has; $("loginForm").hidden = !has;
  $("restoreLock").hidden = true; $("resetPanel").hidden = true;
  setTimeout(() => (has ? ($("user").value ? $("pass") : $("user")) : $("newUser")).focus(), 0);
}
function strength(p) {
  let s = 0; if (p.length >= 8) s++; if (p.length >= 12) s++; if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
function checkNew(p, p2) {
  if (p.length < 8) return "Kata sandi minimal 8 karakter.";
  if (strength(p) < 3) return "Kata sandi terlalu mudah ditebak. Tambahkan huruf besar, angka, atau simbol.";
  if (p !== p2) return "Kedua kata sandi tidak sama.";
  return "";
}

// jeda bertambah setelah salah kata sandi
let fails = 0, waitUntil = 0;
try { const f = JSON.parse(localStorage.getItem("dompetku-fails") || "{}"); fails = f.n || 0; waitUntil = f.until || 0; } catch (e) {}
function saveFails() { try { localStorage.setItem("dompetku-fails", JSON.stringify({ n: fails, until: waitUntil })); } catch (e) {} }

$("newPass").addEventListener("input", e => {
  const s = strength(e.target.value), bar = $("strengthBar");
  bar.style.width = (s / 5 * 100) + "%";
  bar.style.background = s < 3 ? "var(--bad)" : s < 4 ? "var(--warn)" : "var(--accent)";
});
$("setupForm").addEventListener("submit", async e => {
  e.preventDefault();
  const u = $("newUser").value.trim(), p = $("newPass").value;
  const err = u.length < 3 ? "Nama pengguna minimal 3 karakter." : checkNew(p, $("newPass2").value);
  $("setupErr").textContent = err; if (err) return;
  $("setupErr").textContent = "Mengamankan…";
  currentUser = u;
  await Vault.create(secret(u, p), { items: [], budget: { ...DEFAULT_BUDGET } });
  load({}); $("setupErr").textContent = ""; showApp();
});
$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const wait = waitUntil - Date.now();
  if (wait > 0) { $("loginErr").textContent = `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(wait / 1000)} detik.`; return; }
  $("loginBtn").disabled = true; $("loginErr").textContent = "Membuka…";
  const data = await Vault.unlock(secret($("user").value, $("pass").value));
  $("loginBtn").disabled = false;
  if (!data) {
    fails++; if (fails >= 3) waitUntil = Date.now() + Math.min(300, 15 * 2 ** (fails - 3)) * 1000; saveFails();
    $("loginErr").textContent = "Nama pengguna atau kata sandi salah."; $("pass").select(); return;
  }
  fails = 0; waitUntil = 0; saveFails();
  currentUser = $("user").value.trim(); $("loginErr").textContent = ""; load(data); showApp();
});
$("forgot").addEventListener("click", () => { $("resetPanel").hidden = !$("resetPanel").hidden; });
$("resetConfirm").addEventListener("input", e => { $("resetBtn").disabled = e.target.value.trim() !== "HAPUS"; });
$("resetBtn").addEventListener("click", () => { Vault.wipe(); $("resetConfirm").value = ""; $("resetBtn").disabled = true; showLockForm(); });

document.querySelectorAll("[data-toggle]").forEach(b => b.addEventListener("click", () => { const el = $(b.dataset.toggle); el.hidden = !el.hidden; }));
document.querySelectorAll("form.restore").forEach(form => form.addEventListener("submit", async e => {
  e.preventDefault();
  const id = form.id, msg = id === "restoreLock" ? $("setupErr") : $("secMsg");
  const file = $(id + "-file").files[0]; if (!file) return;
  let blob; try { blob = JSON.parse(await file.text()); } catch (er) { msg.textContent = "File bukan cadangan Dompetku."; return; }
  msg.textContent = "Membuka cadangan…";
  const data = await Vault.importBlob(blob, secret($(id + "-user").value, $(id + "-pass").value));
  if (data) currentUser = $(id + "-user").value.trim();
  $(id + "-pass").value = "";
  if (!data) { msg.textContent = "Nama pengguna, kata sandi, atau file cadangan salah."; return; }
  load(data); form.hidden = true; msg.textContent = id === "restoreLock" ? "" : "Cadangan dipulihkan.";
  if (id === "restoreLock") showApp(); else render();
}));

$("lockBtn").addEventListener("click", lockNow);
$("exportBtn").addEventListener("click", async () => {
  await saving;
  const blob = new Blob([JSON.stringify(Vault.exportBlob())], { type: "application/json" });
  const a = document.createElement("a"), d = new Date();
  a.href = URL.createObjectURL(blob); a.download = `cadangan-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.dompetku`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  $("secMsg").textContent = "Cadangan terenkripsi diunduh. Untuk membukanya perlu kata sandimu.";
});
$("changeBtn").addEventListener("click", () => { $("changeForm").hidden = !$("changeForm").hidden; });
$("changeForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!(await Vault.verify(secret(currentUser, $("oldPass").value)))) { $("secMsg").textContent = "Kata sandi lama salah."; return; }
  const p = $("chPass").value, err = checkNew(p, $("chPass2").value);
  if (err) { $("secMsg").textContent = err; return; }
  await saving; await Vault.rekey(secret(currentUser, p), vaultData());
  ["oldPass", "chPass", "chPass2"].forEach(id => $(id).value = "");
  $("changeForm").hidden = true; $("secMsg").textContent = "Kata sandi diganti.";
});

/* ---------- interaksi aplikasi ---------- */
$("q").addEventListener("input", updatePreview);
$("qform").addEventListener("submit", async e => { e.preventDefault(); const p = parse($("q").value); if (!p) return; $("q").value = ""; updatePreview(); await addItem(p); });
$("cats").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (!b) return; state.selCat = b.dataset.cat || null; renderChips(); updatePreview(); });
$("presets").addEventListener("click", async e => { const b = e.target.closest("[data-preset]"); if (!b) return; const [n, a, c] = PRESETS[b.dataset.preset]; await addItem({ note: n, amt: a, cat: c, ts: Date.now() }); });
$("list").addEventListener("click", async e => { const b = e.target.closest("[data-del]"); if (!b) return; state.items = state.items.filter(i => i.id !== b.dataset.del); render(); await persist(); });
$("env").addEventListener("click", e => {
  const b = e.target.closest("[data-edit]"); if (!b) return; const k = b.dataset.edit;
  const inp = document.createElement("input"); inp.id = "budget-" + k; inp.inputMode = "numeric"; inp.value = state.budget[k] || 0;
  b.replaceWith(inp); inp.focus(); inp.select();
  let done = false;
  const finish = async ok => {
    if (done) return; done = true;
    if (ok) { const v = parseInt(inp.value.replace(/\D/g, ""), 10); if (!isNaN(v) && v !== state.budget[k]) { state.budget[k] = v; render(); await persist(); return; } }
    render();
  };
  inp.addEventListener("keydown", ev => { if (ev.key === "Enter") finish(true); if (ev.key === "Escape") finish(false); });
  inp.addEventListener("blur", () => finish(true));
});
$("prev").onclick = () => { state.view.setMonth(state.view.getMonth() - 1); render(); };
$("next").onclick = () => { state.view.setMonth(state.view.getMonth() + 1); render(); };
["pointerdown", "keydown", "scroll"].forEach(ev => document.addEventListener(ev, () => { if (!$("app").hidden) resetIdle(); }, { passive: true }));

/* ---------- mulai ---------- */
if (!Vault.supported()) {
  $("unsupported").textContent = "Browser ini tidak mendukung enkripsi. Buka lewat https (misalnya GitHub Pages) dengan browser terbaru.";
  $("setupForm").hidden = $("loginForm").hidden = true;
} else showLockForm();
