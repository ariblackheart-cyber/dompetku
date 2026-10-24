"use strict";
/* ================= Konfigurasi ================= */
const CATS = [
  { k: "Makan", kw: ["makan","kopi","nasi","bakso","mie","sarapan","jajan","snack","minum","teh","gofood","grabfood","ayam","sate","martabak","roti","warung"] },
  { k: "Transport", kw: ["bensin","parkir","ojek","gojek","grab","tol","bus","kereta","krl","angkot","taksi","pertalite","pertamax","servis"] },
  { k: "Belanja", kw: ["belanja","sabun","shopee","tokopedia","baju","sepatu","indomaret","alfamart","sayur","beras","minyak","galon","pasar","susu","popok"] },
  { k: "Cicilan", kw: ["cicilan","angsuran","kredit","kpr","paylater","pay later","leasing","pinjaman","utang","hutang","dp motor","dp mobil"] },
  { k: "Arisan", kw: ["arisan"] },
  { k: "Investasi", kw: ["investasi","invest","saham","reksadana","reksa dana","emas","logam mulia","deposito","obligasi","sbn","sukuk","crypto","kripto","bitcoin","tabungan","nabung","dana darurat"] },
  { k: "Tagihan", kw: ["listrik","pln","token","air","pdam","wifi","internet","pulsa","kuota","kos","sewa","bpjs","asuransi","netflix","spotify","langganan","sekolah","spp"] },
  { k: "Hiburan", kw: ["nonton","bioskop","game","main","karaoke","konser","jalan","liburan","hadiah","kado"] },
  { k: "Lainnya", kw: [] }
];
const DEFAULT_BUDGET = { Makan: 1500000, Transport: 500000, Belanja: 700000, Cicilan: 0, Arisan: 0, Investasi: 0, Tagihan: 800000, Hiburan: 300000, Lainnya: 200000 };
const PRESETS = [["Parkir", 2000, "Transport"], ["Kopi", 18000, "Makan"], ["Makan siang", 25000, "Makan"], ["Bensin", 30000, "Transport"]];
const PERSON_COLORS = ["#0e8a72", "#c0567f", "#3d7bd9", "#b7791f", "#7a5cc7", "#6b7a76"];
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

/* ================= Utilitas ================= */
const $ = id => document.getElementById(id);
const rp = n => "Rp" + Math.round(n).toLocaleString("id-ID");
const short = n => n >= 1e6 ? (n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "jt" : n >= 1e3 ? Math.round(n / 1e3) + "rb" : String(n);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const monthKey = d => d.getFullYear() + "-" + d.getMonth();
const redirectUrl = () => location.origin + location.pathname;

function show(screen) {
  ["loading", "authScreen", "resetScreen", "hhScreen", "app"].forEach(id => $(id).hidden = id !== screen);
}
function friendlyError(e) {
  const m = (e && (e.message || e.error_description || String(e))) || "";
  if (/Invalid login credentials/i.test(m)) return "Email atau kata sandi salah.";
  if (/Email not confirmed/i.test(m)) return "Email belum dikonfirmasi. Buka email dari Supabase lalu ketuk tautan konfirmasinya.";
  if (/already registered|already been registered/i.test(m)) return "Email ini sudah terdaftar. Silakan masuk.";
  if (/rate limit|too many/i.test(m)) return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  if (/Failed to fetch|NetworkError|network/i.test(m)) return "Tidak tersambung ke internet. Periksa koneksimu.";
  if (/weak|Password should/i.test(m)) return "Kata sandi terlalu lemah. Pakai minimal 8 karakter dengan angka dan simbol.";
  if (/JWT|session/i.test(m)) return "Sesi berakhir. Silakan masuk lagi.";
  return m || "Terjadi kesalahan. Coba lagi.";
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

/* ================= Supabase ================= */
if (!window.supabase || !window.DOMPETKU_CONFIG) {
  $("loading").querySelector("p").textContent = "Gagal memuat. Periksa koneksi internet lalu muat ulang halaman.";
  throw new Error("supabase-js tidak termuat");
}
const sb = window.supabase.createClient(DOMPETKU_CONFIG.url, DOMPETKU_CONFIG.key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const state = {
  user: null, hh: null, members: [], items: new Map(), loaded: new Set(),
  view: (() => { const d = new Date(); d.setDate(1); return d; })(), selCat: null, who: "all", channel: null
};
const nameOf = uid => (state.members.find(m => m.user_id === uid) || {}).display_name || "Mantan anggota";
const colorOf = uid => { const i = state.members.findIndex(m => m.user_id === uid); return PERSON_COLORS[(i < 0 ? 5 : i) % PERSON_COLORS.length]; };
const fromRow = r => ({ id: r.id, uid: r.user_id, amt: Number(r.amount), note: r.note, cat: r.category, ts: new Date(r.spent_at).getTime() });

/* ================= Alur masuk ================= */
let mode = "login", routing = false, recovering = false;
function setMode(m) {
  mode = m;
  $("tabLogin").setAttribute("aria-selected", m === "login"); $("tabSignup").setAttribute("aria-selected", m === "signup");
  $("pass2Field").hidden = m === "login"; $("forgotBtn").hidden = m !== "login";
  $("authBtn").textContent = m === "login" ? "Masuk" : "Daftar";
  $("password").autocomplete = m === "login" ? "current-password" : "new-password";
  $("authErr").textContent = ""; $("authErr").className = "err";
}
$("tabLogin").onclick = () => setMode("login");
$("tabSignup").onclick = () => setMode("signup");

$("authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("email").value.trim(), pw = $("password").value, msg = $("authErr");
  msg.className = "err";
  if (mode === "signup") { const err = checkNew(pw, $("password2").value); if (err) { msg.textContent = err; return; } }
  $("authBtn").disabled = true; msg.textContent = mode === "login" ? "Masuk…" : "Mendaftar…";
  try {
    if (mode === "login") {
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      msg.textContent = "";
    } else {
      const { data, error } = await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: redirectUrl() } });
      if (error) throw error;
      if (!data.session) {
        msg.className = "err ok";
        msg.textContent = "Pendaftaran berhasil. Cek email " + email + " dan ketuk tautan konfirmasi, lalu kembali ke sini untuk masuk.";
      } else msg.textContent = "";
    }
  } catch (er) { msg.textContent = friendlyError(er); }
  $("authBtn").disabled = false;
});
$("forgotBtn").addEventListener("click", async () => {
  const email = $("email").value.trim(), msg = $("authErr");
  if (!email) { msg.className = "err"; msg.textContent = "Isi email dulu, lalu ketuk Lupa kata sandi."; return; }
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() });
  msg.className = error ? "err" : "err ok";
  msg.textContent = error ? friendlyError(error) : "Tautan untuk membuat kata sandi baru sudah dikirim ke " + email + ".";
});
$("resetScreen").addEventListener("submit", async e => {
  e.preventDefault();
  const p = $("newPw").value, err = checkNew(p, $("newPw2").value);
  if (err) { $("resetErr").textContent = err; return; }
  const { error } = await sb.auth.updateUser({ password: p });
  if (error) { $("resetErr").textContent = friendlyError(error); return; }
  $("newPw").value = $("newPw2").value = "";
  recovering = false; history.replaceState(null, "", redirectUrl()); route();
});
document.querySelectorAll("[data-logout]").forEach(b => b.addEventListener("click", async () => {
  if (state.channel) { sb.removeChannel(state.channel); state.channel = null; }
  await sb.auth.signOut();
}));

/* ================= Rumah tangga ================= */
function needName() {
  const n = $("displayName").value.trim();
  if (!n) { $("hhErr").textContent = "Isi nama panggilanmu dulu."; $("displayName").focus(); }
  return n;
}
$("createForm").addEventListener("submit", async e => {
  e.preventDefault(); const n = needName(); if (!n) return;
  $("hhErr").textContent = "Membuat…";
  const { error } = await sb.rpc("create_household", { p_name: $("hhName").value.trim(), p_display: n });
  if (error) { $("hhErr").textContent = friendlyError(error); return; }
  $("hhErr").textContent = ""; route();
});
$("joinForm").addEventListener("submit", async e => {
  e.preventDefault(); const n = needName(); if (!n) return;
  $("hhErr").textContent = "Bergabung…";
  const { error } = await sb.rpc("join_household", { p_code: $("joinCode").value.trim(), p_display: n });
  if (error) { $("hhErr").textContent = friendlyError(error); return; }
  $("hhErr").textContent = ""; route();
});

async function route() {
  if (routing || recovering) return; routing = true;
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { state.user = null; show("authScreen"); setMode(mode); return; }
    state.user = session.user;
    const { data: mem, error } = await sb.from("household_members").select("household_id").eq("user_id", state.user.id).maybeSingle();
    if (error) throw error;
    if (!mem) { show("hhScreen"); return; }
    await openHousehold(mem.household_id);
  } catch (er) {
    show("authScreen"); $("authErr").className = "err"; $("authErr").textContent = friendlyError(er);
  } finally { routing = false; }
}

async function openHousehold(hid) {
  const [hh, mem] = await Promise.all([
    sb.from("households").select("id,name,invite_code,budget").eq("id", hid).single(),
    sb.from("household_members").select("user_id,display_name,joined_at").eq("household_id", hid).order("joined_at")
  ]);
  if (hh.error) throw hh.error; if (mem.error) throw mem.error;
  state.hh = { ...hh.data, budget: { ...DEFAULT_BUDGET, ...hh.data.budget } };
  state.members = mem.data;
  state.items = new Map(); state.loaded = new Set();
  show("app"); renderChips(); updatePreview(); renderHousehold();
  await loadMonth(state.view, true);
  subscribe(hid);
}

async function loadMonth(d, force) {
  const key = monthKey(d);
  if (!force && state.loaded.has(key)) { render(); return; }
  const start = new Date(d.getFullYear(), d.getMonth(), 1), end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const { data, error } = await sb.from("expenses").select("id,user_id,amount,note,category,spent_at")
    .eq("household_id", state.hh.id).gte("spent_at", start.toISOString()).lt("spent_at", end.toISOString())
    .order("spent_at", { ascending: false }).limit(2000);
  if (error) { $("secMsg").textContent = friendlyError(error); render(); return; }
  for (const [id, it] of state.items) { const t = new Date(it.ts); if (monthKey(t) === key && !String(id).startsWith("tmp-")) state.items.delete(id); }
  data.forEach(r => state.items.set(r.id, fromRow(r)));
  state.loaded.add(key); render();
}

function subscribe(hid) {
  if (state.channel) sb.removeChannel(state.channel);
  state.channel = sb.channel("hh-" + hid)
    .on("postgres_changes", { event: "*", schema: "public", table: "expenses", filter: "household_id=eq." + hid }, p => {
      if (p.eventType === "DELETE") state.items.delete(p.old.id);
      else state.items.set(p.new.id, fromRow(p.new));
      render();
    })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "expenses" }, p => { if (state.items.delete(p.old.id)) render(); })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "households", filter: "id=eq." + hid }, p => {
      state.hh = { ...state.hh, ...p.new, budget: { ...DEFAULT_BUDGET, ...p.new.budget } };
      renderHousehold(); render();
    })
    .subscribe(status => {
      $("syncState").textContent = status === "SUBSCRIBED" ? "Tersinkron langsung dengan pasangan." :
        status === "CHANNEL_ERROR" || status === "TIMED_OUT" ? "Sinkron langsung terputus. Data dimuat ulang saat kamu kembali ke halaman ini." : "Menyambungkan…";
    });
}
// muat ulang saat kembali ke aplikasi, untuk menangkap perubahan yang terlewat
document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState !== "visible" || !state.hh) return;
  const mem = await sb.from("household_members").select("user_id,display_name,joined_at").eq("household_id", state.hh.id).order("joined_at");
  if (!mem.error) { state.members = mem.data; renderHousehold(); }
  loadMonth(state.view, true);
});

/* ================= Catat & ubah ================= */
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
  if (!n || n <= 0 || n >= 1e12) return null;
  const note = (t.replace(m[0], " ").replace(/\s+/g, " ").trim() || "Pengeluaran").slice(0, 80);
  const d = new Date(); d.setDate(d.getDate() + day); if (day) d.setHours(12, 0, 0, 0);
  return { amt: Math.round(n), note: note.charAt(0).toUpperCase() + note.slice(1), cat: state.selCat || guessCat(note), ts: d.getTime() };
}
async function addItem(it) {
  const tmp = "tmp-" + Date.now() + Math.random();
  state.items.set(tmp, { ...it, id: tmp, uid: state.user.id }); render();
  const { data, error } = await sb.from("expenses")
    .insert({ household_id: state.hh.id, user_id: state.user.id, amount: it.amt, note: it.note, category: it.cat, spent_at: new Date(it.ts).toISOString() })
    .select("id,user_id,amount,note,category,spent_at").single();
  state.items.delete(tmp);
  if (error) { $("secMsg").textContent = "Gagal menyimpan \"" + it.note + "\": " + friendlyError(error); }
  else state.items.set(data.id, fromRow(data));
  render();
}
async function deleteItem(id) {
  const old = state.items.get(id); if (!old || String(id).startsWith("tmp-")) return;
  state.items.delete(id); render();
  const { error } = await sb.from("expenses").delete().eq("id", id);
  if (error) { state.items.set(id, old); render(); $("secMsg").textContent = "Gagal menghapus: " + friendlyError(error); }
}
async function saveBudget(k, v) {
  const prev = state.hh.budget[k];
  state.hh.budget = { ...state.hh.budget, [k]: v }; render();
  const { error } = await sb.from("households").update({ budget: state.hh.budget }).eq("id", state.hh.id);
  if (error) { state.hh.budget[k] = prev; render(); $("secMsg").textContent = "Gagal menyimpan anggaran: " + friendlyError(error); }
}

/* ================= Tampilan ================= */
function monthItems() {
  const key = monthKey(state.view);
  return [...state.items.values()].filter(i => monthKey(new Date(i.ts)) === key).sort((a, b) => b.ts - a.ts);
}
function renderHousehold() {
  $("hhLabel").textContent = state.hh.name;
  $("inviteCode").textContent = state.hh.invite_code;
  $("memberList").innerHTML = "Anggota: " + state.members.map(m =>
    `<span class="by"><span class="dot" style="background:${colorOf(m.user_id)}"></span>${esc(m.display_name)}${m.user_id === state.user.id ? " (kamu)" : ""}</span>`).join(", ");
  const opts = [["all", "Semua"], ...state.members.map(m => [m.user_id, m.user_id === state.user.id ? "Saya" : m.display_name])];
  if (!opts.some(o => o[0] === state.who)) state.who = "all";
  $("whoFilter").innerHTML = state.members.length > 1 ? opts.map(([v, l]) => `<button class="chip" data-who="${esc(v)}" aria-pressed="${state.who === v}">${esc(l)}</button>`).join("") : "";
}
function render() {
  if (!state.hh) return;
  const y = state.view.getFullYear(), mo = state.view.getMonth(), now = new Date();
  $("mlabel").textContent = MONTHS[mo] + " " + y;
  const items = monthItems();
  const spent = items.reduce((s, i) => s + i.amt, 0);
  const budget = state.hh.budget;
  const totalBudget = Object.values(budget).reduce((a, b) => a + Number(b || 0), 0);
  const left = totalBudget - spent;
  const dim = new Date(y, mo + 1, 0).getDate();
  const isNow = y === now.getFullYear() && mo === now.getMonth();
  const daysLeft = isNow ? dim - now.getDate() + 1 : (state.view > now ? dim : 0);
  const perDay = daysLeft > 0 ? left / daysLeft : 0;
  const neg = v => v < 0 ? "−" + rp(-v) : rp(v);

  const safe = daysLeft > 0
    ? `<div class="safe${left < 0 ? " over" : ""}"><div class="label">Aman dibelanjakan per hari (berdua)</div><div class="big num">${left < 0 ? "Rp0" : rp(perDay)}</div><small>${left < 0 ? `Lewat anggaran ${rp(-left)}` : `untuk ${daysLeft} hari tersisa bulan ini`}</small></div>`
    : `<div class="safe${left < 0 ? " over" : ""}"><div class="label">Hasil bulan ini</div><div class="big num">${neg(left)}</div><small>${left < 0 ? "melewati anggaran" : "sisa dari anggaran"}</small></div>`;
  $("summary").innerHTML = safe +
    `<div><div class="label">Terpakai</div><div class="big num">${rp(spent)}</div></div>` +
    `<div><div class="label">Sisa anggaran</div><div class="big num" style="color:${left < 0 ? "var(--bad)" : "inherit"}">${neg(left)}</div></div>`;

  // per orang
  const byUser = {}; items.forEach(i => byUser[i.uid] = (byUser[i.uid] || 0) + i.amt);
  $("people").innerHTML = state.members.length > 1 ? state.members.map(m => {
    const v = byUser[m.user_id] || 0;
    return `<div class="person"><div class="who"><span class="dot" style="background:${colorOf(m.user_id)}"></span>${esc(m.display_name)}</div><div class="num">${rp(v)}</div><div class="share">${spent ? Math.round(v / spent * 100) : 0}% dari total</div></div>`;
  }).join("") : `<div class="person"><div class="who">Belum ada pasangan</div><div class="share">Bagikan kode undangan di bagian bawah supaya pasanganmu bisa bergabung.</div></div>`;

  // amplop
  const byCat = {}; items.forEach(i => byCat[i.cat] = (byCat[i.cat] || 0) + i.amt);
  const elapsed = isNow ? now.getDate() / dim : 1;
  $("env").innerHTML = CATS.map(c => {
    const b = Number(budget[c.k] || 0), u = byCat[c.k] || 0, p = b ? u / b : (u ? 1.01 : 0);
    const cls = p > 1 ? "bad" : p > Math.min(1, elapsed + .15) && p > .6 ? "warn" : "";
    const pill = p > 1 ? `<span class="pill bad">lewat ${rp(u - b)}</span>` : cls === "warn" ? `<span class="pill warn">${Math.round(p * 100)}%</span>` : "";
    return `<div class="erow"><div class="name">${c.k}${pill}</div>
      <div class="amt num"><span>${rp(u)}</span> / <button data-edit="${c.k}" aria-label="Ubah anggaran ${c.k}">${rp(b)}</button></div>
      <div class="bar ${cls}"><i style="width:${Math.min(100, p * 100)}%"></i></div></div>`;
  }).join("");

  // grafik
  const daily = Array(dim).fill(0); items.forEach(i => daily[new Date(i.ts).getDate() - 1] += i.amt);
  const W = 360, H = 150, pl = 30, pb = 18, pt = 10, bw = (W - pl) / dim, max = Math.max(1, ...daily);
  const avgPerDay = totalBudget / dim, ceil = Math.max(max, avgPerDay);
  const step = ceil > 500000 ? 250000 : ceil > 200000 ? 100000 : ceil > 100000 ? 50000 : ceil > 40000 ? 20000 : 10000;
  const top = Math.ceil(ceil / step) * step, sy = v => pt + (H - pt - pb) * (1 - v / top);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik pengeluaran harian">`;
  for (let v = 0; v <= top; v += step) svg += `<line x1="${pl}" x2="${W}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--line)" stroke-width="0.6"/><text x="${pl - 4}" y="${sy(v) + 3}" text-anchor="end">${v ? short(v) : "0"}</text>`;
  if (avgPerDay > 0) svg += `<line x1="${pl}" x2="${W}" y1="${sy(avgPerDay)}" y2="${sy(avgPerDay)}" stroke="var(--warn)" stroke-dasharray="3 3" stroke-width="1"/><text x="${W - 2}" y="${sy(avgPerDay) - 3}" text-anchor="end" style="fill:var(--warn)">jatah harian ${short(Math.round(avgPerDay))}</text>`;
  daily.forEach((v, i) => {
    const x = pl + i * bw + bw * .15, today = isNow && i === now.getDate() - 1;
    if (v) svg += `<rect x="${x}" y="${sy(v)}" width="${bw * .7}" height="${Math.max(1, H - pb - sy(v))}" rx="1.5" fill="${v > avgPerDay ? "var(--warn)" : "var(--accent)"}" opacity="${today ? 1 : .8}"><title>${i + 1} ${MONTHS[mo]}: ${rp(v)}</title></rect>`;
    if (i === 0 || (i + 1) % 5 === 0 || today) svg += `<text x="${x + bw * .35}" y="${H - 5}" text-anchor="middle" style="${today ? "fill:var(--ink);font-weight:600" : ""}">${i + 1}</text>`;
  });
  $("chart").innerHTML = svg + "</svg>";

  // riwayat
  const shown = state.who === "all" ? items : items.filter(i => i.uid === state.who);
  if (!shown.length) {
    $("list").innerHTML = `<div class="empty">${items.length ? "Tidak ada catatan dari orang ini bulan ini." : "Belum ada catatan bulan ini. Ketik pengeluaran pertama di atas, misalnya \"makan siang 25rb\"."}</div>`;
  } else {
    const groups = {}; shown.forEach(i => { const k = new Date(i.ts).toDateString(); (groups[k] = groups[k] || []).push(i); });
    let html = "";
    for (const key in groups) {
      const d = new Date(key), g = groups[key], tot = g.reduce((s, i) => s + i.amt, 0);
      html += `<div class="day"><span>${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}</span><span class="num">${rp(tot)}</span></div>`;
      g.forEach(i => {
        const pending = String(i.id).startsWith("tmp-");
        html += `<div class="item"${pending ? ' style="opacity:.55"' : ""}><div class="note">${esc(i.note)}<div class="cat">${esc(i.cat)} · <span class="by"><span class="dot" style="background:${colorOf(i.uid)}"></span>${esc(i.uid === state.user.id ? "Saya" : nameOf(i.uid))}</span>${pending ? " · menyimpan…" : ""}</div></div><div class="num">${rp(i.amt)}</div><button class="del" data-del="${esc(i.id)}" aria-label="Hapus ${esc(i.note)}"${pending ? " disabled" : ""}>×</button></div>`;
      });
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

/* ================= Interaksi ================= */
$("q").addEventListener("input", updatePreview);
$("qform").addEventListener("submit", e => { e.preventDefault(); const p = parse($("q").value); if (!p) return; $("q").value = ""; updatePreview(); addItem(p); });
$("cats").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (!b) return; state.selCat = b.dataset.cat || null; renderChips(); updatePreview(); });
$("presets").addEventListener("click", e => { const b = e.target.closest("[data-preset]"); if (!b) return; const [n, a, c] = PRESETS[b.dataset.preset]; addItem({ note: n, amt: a, cat: c, ts: Date.now() }); });
$("list").addEventListener("click", e => { const b = e.target.closest("[data-del]"); if (b) deleteItem(b.dataset.del); });
$("whoFilter").addEventListener("click", e => { const b = e.target.closest("[data-who]"); if (!b) return; state.who = b.dataset.who; renderHousehold(); render(); });
$("env").addEventListener("click", e => {
  const b = e.target.closest("[data-edit]"); if (!b) return; const k = b.dataset.edit;
  const inp = document.createElement("input"); inp.id = "budget-" + k; inp.inputMode = "numeric"; inp.value = state.hh.budget[k] || 0;
  b.replaceWith(inp); inp.focus(); inp.select();
  let done = false;
  const finish = ok => {
    if (done) return; done = true;
    const v = parseInt(inp.value.replace(/\D/g, ""), 10);
    if (ok && !isNaN(v) && v !== Number(state.hh.budget[k])) saveBudget(k, v); else render();
  };
  inp.addEventListener("keydown", ev => { if (ev.key === "Enter") finish(true); if (ev.key === "Escape") finish(false); });
  inp.addEventListener("blur", () => finish(true));
});
$("prev").onclick = () => { state.view.setMonth(state.view.getMonth() - 1); loadMonth(state.view); };
$("next").onclick = () => { state.view.setMonth(state.view.getMonth() + 1); loadMonth(state.view); };
$("copyCode").addEventListener("click", async () => {
  const code = state.hh.invite_code;
  try { await navigator.clipboard.writeText(code); $("secMsg").className = "err ok"; $("secMsg").textContent = "Kode undangan disalin."; }
  catch (e) { const r = document.createRange(); r.selectNodeContents($("inviteCode")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); $("secMsg").className = "err"; $("secMsg").textContent = "Kode sudah dipilih, salin secara manual."; }
});
let confirmNew = 0;
$("newCode").addEventListener("click", async () => {
  if (Date.now() - confirmNew > 4000) { confirmNew = Date.now(); $("newCode").textContent = "Ketuk lagi untuk ganti"; setTimeout(() => $("newCode").textContent = "Buat kode baru", 4000); return; }
  confirmNew = 0; $("newCode").textContent = "Buat kode baru";
  const { data, error } = await sb.rpc("regenerate_invite", { p_household: state.hh.id });
  $("secMsg").className = error ? "err" : "err ok";
  if (error) { $("secMsg").textContent = friendlyError(error); return; }
  state.hh.invite_code = data; renderHousehold(); $("secMsg").textContent = "Kode lama tidak berlaku lagi.";
});

/* ================= Mulai ================= */
sb.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") { recovering = true; show("resetScreen"); return; }
  if (event === "SIGNED_OUT") {
    state.hh = null; state.members = []; state.items = new Map();
    $("password").value = ""; show("authScreen"); setMode("login"); return;
  }
  if (event === "INITIAL_SESSION") setTimeout(route, 0);
  // SIGNED_IN juga muncul saat tab kembali aktif; hanya pindah layar kalau belum di dalam aplikasi
  if (event === "SIGNED_IN" && !state.hh) setTimeout(route, 0);
});
