"use strict";
/* ================= Konfigurasi ================= */
const OTHER = "Gaya Hidup & Lainnya";
// Kata kunci per kategori. Kata yang tidak dikenali masuk ke OTHER.
// Kalau beberapa kata kunci cocok, yang paling panjang menang ("tiket nonton" mengalahkan "tiket").
const CATS = [
  { k: "Dapur & Rumah", kw: [
    "makan","makan siang","makan malam","sarapan","nasi","nasi bungkus","lauk","lauk pauk","sayur","sayuran","buah","buah buahan",
    "beras","minyak","minyak goreng","telur","ayam","ikan","daging","tahu","tempe","bumbu","cabai","cabe","bawang","gula","garam","kecap","tepung",
    "susu","susu formula","roti","mie instan","indomie","kopi bubuk","kopi sachet","teh celup",
    "air mineral","aqua","le minerale","air minum","air galon","galon","isi galon","gas","elpiji","lpg","tabung gas",
    "jajan","jajanan","snack","camilan","cemilan","bakso","soto","sate","mie ayam","nasi goreng","nasi padang","warteg","ayam taliwang","plecing",
    "sabun","sabun cuci","sabun mandi","sampo","shampo","deterjen","pewangi","odol","pasta gigi","sikat gigi","popok","pampers","tisu","pembalut","obat nyamuk",
    "belanja","belanjaan","belanja bulanan","sembako","dapur","pasar","warung","toko kelontong","indomaret","alfamart","alfamidi","superindo","hypermart","lottemart","transmart",
    "gofood","grabfood","shopeefood","catering","katering","perabot","alat dapur","peralatan rumah","lampu"] },
  { k: "Transport", kw: [
    "tiket","bensin","isi bensin","bbm","pertalite","pertamax","pertamax turbo","solar","dexlite",
    "parkir","ojek","ojol","gojek","goride","gocar","grab","grabbike","grabcar","maxim","indrive","taksi","bluebird",
    "tol","e toll","etoll","bus","damri","travel","shuttle","kereta","krl","mrt","lrt","angkot","bemo","cidomo",
    "pesawat","tiket pesawat","bagasi","bandara","kapal","kapal laut","tiket kapal","pelni","feri","ferry","kapal feri","speedboat","fastboat","fast boat","penyeberangan","pelabuhan",
    "servis","service","servis motor","servis mobil","bengkel","oli","ganti oli","ban","tambal ban","aki","cuci motor","cuci mobil",
    "sewa motor","sewa mobil","rental mobil","pajak motor","pajak mobil","pajak kendaraan","stnk","sim"] },
  { k: "Tagihan & Cicilan", kw: [
    "listrik","pln","token","token listrik","tagihan listrik","pdam","tagihan air","bayar air","air pdam",
    "telpon","telepon","telkom","wifi","internet","indihome","biznet","myrepublic","first media",
    "pulsa","kuota","paket data","telkomsel","xl","indosat","im3","tri","axis","smartfren",
    "kos","kost","sewa","sewa rumah","kontrakan","ipl","iuran","iuran rt","iuran sampah","sampah","keamanan",
    "bpjs","bpjs ketenagakerjaan","asuransi","premi","pajak","pbb",
    "cicilan","angsuran","kredit","kartu kredit","kpr","paylater","pay later","spaylater","gopaylater","kredivo","akulaku","leasing","pinjaman","pinjol","utang","hutang","bayar utang",
    "arisan","langganan","netflix","spotify","youtube premium","disney","vidio","icloud","google one"] },
  { k: "Pendidikan", kw: [
    "spp","sekolah","uang sekolah","biaya sekolah","uang gedung","daftar ulang","pendaftaran sekolah","tk","paud","sd","smp","sma","smk",
    "kuliah","uang kuliah","ukt","semester","kampus","skripsi","wisuda","pondok","pesantren","mondok","tpq","tpa","ngaji","mengaji",
    "les","les privat","bimbel","kursus","kursus bahasa","daycare","ekskul","study tour","karyawisata",
    "buku","buku pelajaran","buku tulis","lks","alat tulis","atk","pensil","pulpen","tas sekolah","sepatu sekolah","seragam","seragam sekolah",
    "uang saku","uang jajan sekolah","fotokopi","print tugas","laptop sekolah"] },
  { k: "Kesehatan", kw: [
    "obat","obat batuk","obat demam","apotek","apotik","kimia farma","k24","dokter","dokter gigi","dokter anak","dokter kandungan","bidan",
    "klinik","puskesmas","rumah sakit","rs","igd","opname","rawat inap","rawat jalan","periksa","cek lab","lab","laboratorium","rontgen","usg",
    "vitamin","suplemen","imunisasi","vaksin","kacamata","lensa kontak","cabut gigi","tambal gigi","behel","terapi","fisioterapi",
    "halodoc","alodokter","bpjs kesehatan","asuransi kesehatan","masker","hand sanitizer","minyak kayu putih","termometer"] },
  { k: "Hadiah & Sumbangan", kw: [
    "hadiah","kado","bingkisan","parsel","hampers","kondangan","nikahan","undangan nikah","amplop nikah","sumbangan","nyumbang",
    "sedekah","infaq","infak","donasi","zakat","zakat fitrah","zakat mal","kurban","qurban","wakaf","jumat berkah",
    "angpao","angpau","thr","salam tempel","takziah","melayat","duka","jenguk","besuk","oleh oleh","ulang tahun","ultah","syukuran","aqiqah","khitanan","sunatan",
    "kiriman orang tua","kirim ortu","kirim orang tua","uang ortu","transfer ortu","kirim mertua","bantu saudara"] },
  { k: "Tabungan & Investasi", kw: [
    "tabungan","nabung","menabung","setor tabungan","investasi","invest","saham","reksadana","reksa dana",
    "emas","logam mulia","antam","tabungan emas","deposito","obligasi","sbn","sbr","sukuk","crypto","kripto","bitcoin",
    "dana darurat","tabungan pendidikan","dana pendidikan","dana pensiun","dplk","bibit","ajaib","pluang","tabungan haji","tabungan umroh"] },
  { k: OTHER, kw: [
    "kopi","ngopi","cafe","kafe","starbucks","boba","nonton","bioskop","tiket nonton","tiket bioskop","tiket konser","konser","karaoke",
    "game","top up game","voucher game","liburan","wisata","tiket wisata","hotel","penginapan","villa","staycation","jalan jalan",
    "baju","celana","sepatu","sandal","tas","jam tangan","kosmetik","skincare","makeup","parfum","salon","potong rambut","barbershop","pangkas rambut","spa","gym","fitness",
    "hobi","mainan","shopee","tokopedia","lazada","tiktok shop","rokok","pijat","urut","laundry","cuci baju","potong kuku"] }
];
const DEFAULT_BUDGET = { "Dapur & Rumah": 2200000, "Transport": 500000, "Tagihan & Cicilan": 800000, "Pendidikan": 0, "Kesehatan": 0, "Hadiah & Sumbangan": 0, "Tabungan & Investasi": 0, [OTHER]: 500000 };
const ICONS = { "Dapur & Rumah": "🍳", "Transport": "🛵", "Tagihan & Cicilan": "🧾", "Pendidikan": "🎓", "Kesehatan": "💊", "Hadiah & Sumbangan": "🎁", "Tabungan & Investasi": "🌱", [OTHER]: "🎉" };
const icon = k => ICONS[k] || "💸";
const WALLET = `<svg class="wm" viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="14" width="52" height="40" rx="10" class="w"/><rect x="34" y="28" width="24" height="16" rx="8" class="p"/><circle cx="43" cy="36" r="4.2" class="c"/><circle cx="51" cy="36" r="4.2" class="c"/></svg>`;
const PRESETS = [["Parkir", 2000, "Transport"], ["Kopi", 18000, OTHER], ["Makan siang", 25000, "Dapur & Rumah"], ["Bensin", 30000, "Transport"]];
const PERSON_COLORS = ["#0e8a72", "#c0567f", "#3d7bd9", "#b7791f", "#7a5cc7", "#6b7a76"];
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

/* ================= Utilitas ================= */
const $ = id => document.getElementById(id);
const rp = n => "Rp" + Math.round(n).toLocaleString("id-ID");
const short = n => n >= 1e6 ? (n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "jt" : n >= 1e3 ? Math.round(n / 1e3) + "rb" : String(n);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* ----- periode gajian: dari tanggal gajian sampai sehari sebelum gajian berikutnya ----- */
const MON3 = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const DAY = 864e5;
const payday = () => Math.min(28, Math.max(1, parseInt(state.hh && state.hh.budget && state.hh.budget._tgl_gajian, 10) || 25));
function periodStart(d) { const s = new Date(d.getFullYear(), d.getMonth(), payday()); if (d < s) s.setMonth(s.getMonth() - 1); return s; }
const periodEnd = s => new Date(s.getFullYear(), s.getMonth() + 1, s.getDate());
const monthKey = d => { const s = periodStart(d); return s.getFullYear() + "-" + s.getMonth(); };
const dayIndex = (d, s) => Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - s) / DAY);
function periodLabel(s) {
  if (s.getDate() === 1) return MONTHS[s.getMonth()] + " " + s.getFullYear();
  const e = new Date(periodEnd(s) - DAY);
  return `${s.getDate()} ${MON3[s.getMonth()]} – ${e.getDate()} ${MON3[e.getMonth()]} ${e.getFullYear()}`;
}
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
  view: (() => { const d = new Date(); d.setDate(1); return d; })(), selCat: null, selDay: null, who: "all", channel: null
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
  state.view = periodStart(new Date());
  show("app"); renderChips(); updatePreview(); renderHousehold();
  await loadMonth(state.view, true);
  subscribe(hid);
}

const REPORT_PERIODS = 6;
const shiftStart = (s, n) => new Date(s.getFullYear(), s.getMonth() + n, payday());
async function loadMonth(d, force) {
  const view = periodStart(d);
  const starts = Array.from({ length: REPORT_PERIODS }, (_, i) => shiftStart(view, i - REPORT_PERIODS + 1));
  const missing = force ? starts : starts.filter(st => !state.loaded.has(monthKey(st)));
  if (!missing.length) { render(); return; }
  const from = missing[0], to = periodEnd(missing[missing.length - 1]);
  const { data, error } = await sb.from("expenses").select("id,user_id,amount,note,category,spent_at")
    .eq("household_id", state.hh.id).gte("spent_at", from.toISOString()).lt("spent_at", to.toISOString())
    .order("spent_at", { ascending: false }).limit(10000);
  if (error) { toast(friendlyError(error)); render(); return; }
  for (const [id, it] of state.items) if (it.ts >= +from && it.ts < +to && !String(id).startsWith("tmp-")) state.items.delete(id);
  data.forEach(r => state.items.set(r.id, fromRow(r)));
  for (let st = from; st < to; st = shiftStart(st, 1)) state.loaded.add(monthKey(st));
  render();
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
      const before = payday();
      state.hh = { ...state.hh, ...p.new, budget: { ...DEFAULT_BUDGET, ...p.new.budget } };
      renderHousehold();
      if (payday() !== before) resetPeriod(); else render();
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
const norm = x => " " + x.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() + " ";
// urutan saat panjang kata kunci sama
const PRIORITY = ["Tabungan & Investasi", "Kesehatan", "Pendidikan", "Hadiah & Sumbangan", "Tagihan & Cicilan", "Transport", "Dapur & Rumah", OTHER];
function guessCat(text) {
  const t = norm(text);
  let best = OTHER, bestLen = 0, bestRank = 99;
  for (const c of CATS) {
    const rank = PRIORITY.indexOf(c.k);
    for (const w of c.kw) {
      const n = norm(w).trim();
      if (t.includes(" " + n + " ") && (n.length > bestLen || (n.length === bestLen && rank < bestRank))) { best = c.k; bestLen = n.length; bestRank = rank; }
    }
  }
  return best;
}
// Tanggal dari teks: "kemarin", "3 hari lalu", "senin", "tgl 20", "20/10". Mengembalikan selisih hari (0 = hari ini, negatif = lalu).
const HARI = { minggu: 0, ahad: 0, senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, "jum'at": 5, sabtu: 6 };
function takeDate(t) {
  const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = d => Math.round((d - today) / 864e5);
  let m;
  if ((m = t.match(/\b(kemarin\s+lusa)\b/i))) return { t: t.replace(m[0], " "), day: -2 };
  if ((m = t.match(/\bkemarin\b/i))) return { t: t.replace(m[0], " "), day: -1 };
  if ((m = t.match(/\b(\d{1,2})\s*(hari|hr|minggu|mgg)\s*(yang\s*)?(lalu|lalu|kemarin)\b/i))) return { t: t.replace(m[0], " "), day: -(+m[1]) * (/^m/i.test(m[2]) ? 7 : 1) };
  if ((m = t.match(/\b(tgl|tanggal)\.?\s*(\d{1,2})\b/i)) || (m = t.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/))) {
    let dd, mm, yy;
    if (/^t/i.test(m[1])) { dd = +m[2]; mm = today.getMonth(); yy = today.getFullYear(); }
    else { dd = +m[1]; mm = +m[2] - 1; yy = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : today.getFullYear(); }
    if (dd >= 1 && dd <= 31 && mm >= 0 && mm <= 11) {
      let d = new Date(yy, mm, dd);
      if (d > today && !m[3]) d = /^t/i.test(m[1]) ? new Date(yy, mm - 1, dd) : new Date(yy - 1, mm, dd);
      if (d <= today) return { t: t.replace(m[0], " "), day: diff(d) };
    }
  }
  if ((m = t.match(/\b(hari\s+)?(minggu|ahad|senin|selasa|rabu|kamis|jum'?at|sabtu)(\s+(kemarin|lalu))?\b/i))) {
    const w = HARI[m[2].toLowerCase().replace("jum'at", "jumat")]; let back = (today.getDay() - w + 7) % 7;
    if (m[3] && back === 0) back = 7;
    return { t: t.replace(m[0], " "), day: -back };
  }
  return { t, day: 0 };
}
function parse(raw) {
  let { t, day } = takeDate(" " + raw.trim() + " ");
  if (state.selDay != null) day = state.selDay;
  t = t.replace(/\btadi\b|\bhari ini\b/ig, " ").replace(/(\bmakan\s+)?\b(pagi|siang|sore|malam)\b/ig, (m, mk) => mk ? m : " ");
  const m = t.match(/(\d+(?:[.,]\d+)*)\s*(rb|ribu|k|jt|juta)?\b/i);
  if (!m) return null;
  const s = m[1], unit = (m[2] || "").toLowerCase();
  let n;
  if (unit) { n = parseFloat(s.replace(/\./g, "").replace(",", ".")); n *= (unit === "jt" || unit === "juta") ? 1e6 : 1e3; }
  else n = parseFloat(s.replace(/[.,]/g, ""));
  if (!n || n <= 0 || n >= 1e12) return null;
  const note = (t.replace(m[0], " ").replace(/\s+/g, " ").trim() || "Pengeluaran").slice(0, 80);
  const d = new Date(); d.setDate(d.getDate() + day); if (day) d.setHours(12, 0, 0, 0);
  return { amt: Math.round(n), note: note.charAt(0).toUpperCase() + note.slice(1), cat: state.selCat || guessCat(note), ts: d.getTime(), day };
}
function dayText(ts) {
  const d = new Date(ts), now = new Date(), t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const n = Math.round((t0 - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
  return n === 0 ? "hari ini" : n === 1 ? "kemarin" : `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}${d.getFullYear() !== now.getFullYear() ? " " + d.getFullYear() : ""}`;
}
async function addItem(it) {
  const tmp = "tmp-" + Date.now() + Math.random();
  state.items.set(tmp, { ...it, id: tmp, uid: state.user.id }); render();
  const { data, error } = await sb.from("expenses")
    .insert({ household_id: state.hh.id, user_id: state.user.id, amount: it.amt, note: it.note, category: it.cat, spent_at: new Date(it.ts).toISOString() })
    .select("id,user_id,amount,note,category,spent_at").single();
  state.items.delete(tmp);
  if (error) { toast("Gagal menyimpan \"" + it.note + "\": " + friendlyError(error)); }
  else { state.items.set(data.id, fromRow(data)); toast(`${icon(it.cat)} ${it.note} ${rp(it.amt)} tersimpan${dayText(it.ts) === "hari ini" ? "" : " untuk " + dayText(it.ts)}`, () => deleteItem(data.id)); }
  render();
}
/* notifikasi kecil dengan tombol urungkan */
let toastTimer = null, toastUndo = null;
function toast(text, undo) {
  $("toastText").textContent = text; toastUndo = undo || null; $("toastUndo").hidden = !undo; $("toast").hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { $("toast").hidden = true; toastUndo = null; }, undo ? 6000 : 4000);
}
async function deleteItem(id) {
  const old = state.items.get(id); if (!old || String(id).startsWith("tmp-")) return;
  state.items.delete(id); render();
  const { error } = await sb.from("expenses").delete().eq("id", id);
  if (error) { state.items.set(id, old); render(); toast("Gagal menghapus: " + friendlyError(error)); }
}
async function saveBudget(k, v) {
  const prev = state.hh.budget[k];
  state.hh.budget = { ...state.hh.budget, [k]: v }; render();
  const { error } = await sb.from("households").update({ budget: state.hh.budget }).eq("id", state.hh.id);
  if (error) { state.hh.budget[k] = prev; render(); toast("Gagal menyimpan anggaran: " + friendlyError(error)); }
}

function resetPeriod() {
  state.loaded = new Set();
  state.view = periodStart(new Date());
  loadMonth(state.view, true);
}
function shiftPeriod(n) {
  const s = periodStart(state.view);
  state.view = new Date(s.getFullYear(), s.getMonth() + n, payday());
  loadMonth(state.view);
}

/* ================= Tampilan ================= */
function monthItems() {
  const key = monthKey(state.view);
  return [...state.items.values()].filter(i => monthKey(new Date(i.ts)) === key).sort((a, b) => b.ts - a.ts);
}
function renderHousehold() {
  $("hhLabel").textContent = state.hh.name;
  $("inviteCode").textContent = state.hh.invite_code;
  if (document.activeElement !== $("payday")) $("payday").value = payday();
  $("memberList").innerHTML = "Anggota: " + state.members.map(m =>
    `<span class="by"><span class="dot" style="background:${colorOf(m.user_id)}"></span>${esc(m.display_name)}${m.user_id === state.user.id ? " (kamu)" : ""}</span>`).join(", ");
  const opts = [["all", "Semua"], ...state.members.map(m => [m.user_id, m.user_id === state.user.id ? "Saya" : m.display_name])];
  if (!opts.some(o => o[0] === state.who)) state.who = "all";
  $("whoFilter").innerHTML = state.members.length > 1 ? opts.map(([v, l]) => `<button class="chip" data-who="${esc(v)}" aria-pressed="${state.who === v}">${esc(l)}</button>`).join("") : "";
}
function render() {
  if (!state.hh) return;
  const now = new Date(), start = periodStart(state.view), end = periodEnd(start);
  $("mlabel").textContent = periodLabel(start);
  const items = monthItems();
  const spent = items.reduce((s, i) => s + i.amt, 0);
  const budget = state.hh.budget;
  const totalBudget = CATS.reduce((a, c) => a + Number(budget[c.k] || 0), 0);
  const left = totalBudget - spent;
  const dim = Math.round((end - start) / DAY);
  const isNow = now >= start && now < end;
  const todayIdx = isNow ? dayIndex(now, start) : -1;
  const daysLeft = isNow ? dim - todayIdx : (start > now ? dim : 0);
  const untilText = payday() === 1 ? "tersisa bulan ini" : (daysLeft === 1 ? "lagi, besok gajian" : "lagi sampai gajian");
  const perDay = daysLeft > 0 ? left / daysLeft : 0;
  const neg = v => v < 0 ? "−" + rp(-v) : rp(v);

  const usedPct = totalBudget ? Math.min(100, spent / totalBudget * 100) : 0, dayPct = isNow ? (todayIdx + 1) / dim * 100 : (start > now ? 0 : 100);
  const meter = totalBudget ? `<div class="meter" aria-label="Terpakai ${Math.round(spent / totalBudget * 100)}% anggaran, hari ke-${isNow ? todayIdx + 1 : dim} dari ${dim}">
      <div class="track"><span class="fill" style="width:${usedPct}%"></span>${isNow ? `<span class="today" style="left:${dayPct}%" title="hari ini"></span>` : ""}</div>
      <div class="legend"><span>Terpakai ${Math.round(spent / totalBudget * 100)}% anggaran</span><span>${isNow ? `hari ke-${todayIdx + 1} dari ${dim}` : `${dim} hari`}</span></div></div>` : "";
  const safe = daysLeft > 0
    ? `<div class="safe${left < 0 ? " over" : ""}">${WALLET}<div class="label">Aman dibelanjakan per hari (berdua)</div><div class="big num">${left < 0 ? "Rp0" : rp(perDay)}</div><small>${left < 0 ? `Lewat anggaran ${rp(-left)}` : `untuk ${daysLeft} hari ${untilText}`}</small>${meter}</div>`
    : `<div class="safe${left < 0 ? " over" : ""}">${WALLET}<div class="label">Hasil periode ini</div><div class="big num">${neg(left)}</div><small>${left < 0 ? "melewati anggaran" : "sisa dari anggaran"}</small>${meter}</div>`;
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
  const elapsed = isNow ? (todayIdx + 1) / dim : 1;
  $("env").innerHTML = CATS.map(c => {
    const b = Number(budget[c.k] || 0), u = byCat[c.k] || 0, p = b ? u / b : (u ? 1.01 : 0);
    const cls = p > 1 ? "bad" : p > Math.min(1, elapsed + .15) && p > .6 ? "warn" : "";
    const pill = p > 1 ? `<span class="pill bad">lewat ${rp(u - b)}</span>` : cls === "warn" ? `<span class="pill warn">${Math.round(p * 100)}%</span>` : "";
    const rest = b - u, restTxt = !b ? (u ? "tanpa anggaran" : "–") : rest >= 0 ? "sisa " + rp(rest) : "lewat " + rp(-rest);
    return `<div class="erow"><span class="ic" aria-hidden="true">${icon(c.k)}</span><div class="name">${esc(c.k)}${pill}</div>
      <div class="amt num"><span>${rp(u)}</span> / <button data-edit="${esc(c.k)}" aria-label="Ubah anggaran ${esc(c.k)}">${rp(b)}</button></div>
      <div class="left"><div class="bar ${cls}"><i style="width:${Math.min(100, p * 100)}%"></i></div><span class="rest num${rest < 0 && b ? " bad" : ""}">${restTxt}</span></div></div>`;
  }).join("");

  // grafik
  const daily = Array(dim).fill(0); items.forEach(i => { const k = dayIndex(new Date(i.ts), start); if (k >= 0 && k < dim) daily[k] += i.amt; });
  const W = 360, H = 150, pl = 30, pb = 18, pt = 10, bw = (W - pl) / dim, max = Math.max(1, ...daily);
  const avgPerDay = totalBudget / dim, ceil = Math.max(max, avgPerDay);
  const step = ceil > 500000 ? 250000 : ceil > 200000 ? 100000 : ceil > 100000 ? 50000 : ceil > 40000 ? 20000 : 10000;
  const top = Math.ceil(ceil / step) * step, sy = v => pt + (H - pt - pb) * (1 - v / top);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik pengeluaran harian">`;
  for (let v = 0; v <= top; v += step) svg += `<line x1="${pl}" x2="${W}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--line)" stroke-width="0.6"/><text x="${pl - 4}" y="${sy(v) + 3}" text-anchor="end">${v ? short(v) : "0"}</text>`;
  if (avgPerDay > 0) svg += `<line x1="${pl}" x2="${W}" y1="${sy(avgPerDay)}" y2="${sy(avgPerDay)}" stroke="var(--warn)" stroke-dasharray="3 3" stroke-width="1"/><text x="${W - 2}" y="${sy(avgPerDay) - 3}" text-anchor="end" style="fill:var(--warn)">jatah harian ${short(Math.round(avgPerDay))}</text>`;
  daily.forEach((v, i) => {
    const x = pl + i * bw + bw * .15, today = i === todayIdx;
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), dd = day.getDate();
    if (v) svg += `<rect x="${x}" y="${sy(v)}" width="${bw * .7}" height="${Math.max(1, H - pb - sy(v))}" rx="1.5" fill="${v > avgPerDay ? "var(--warn)" : "var(--accent)"}" opacity="${today ? 1 : .8}"><title>${dd} ${MONTHS[day.getMonth()]}: ${rp(v)}</title></rect>`;
    const near = todayIdx >= 0 && Math.abs(i - todayIdx) <= 1 && !today;
    if (i === 0 || today || (dd % 5 === 0 && i > 1 && !near)) svg += `<text x="${x + bw * .35}" y="${H - 5}" text-anchor="middle" style="${today ? "fill:var(--ink);font-weight:600" : ""}">${dd}</text>`;
  });
  $("chart").innerHTML = svg + "</svg>";

  renderReport(start, items, spent, totalBudget, todayIdx);

  // riwayat
  const shown = state.who === "all" ? items : items.filter(i => i.uid === state.who);
  if (!shown.length) {
    $("list").innerHTML = `<div class="empty">${items.length ? "Tidak ada catatan dari orang ini di periode ini." : "Belum ada catatan di periode ini. Ketik pengeluaran pertama di atas, misalnya \"makan siang 25rb\"."}</div>`;
  } else {
    const groups = {}; shown.forEach(i => { const k = new Date(i.ts).toDateString(); (groups[k] = groups[k] || []).push(i); });
    let html = "";
    for (const key in groups) {
      const d = new Date(key), g = groups[key], tot = g.reduce((s, i) => s + i.amt, 0);
      html += `<div class="day"><span>${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}</span><span class="num">${rp(tot)}</span></div>`;
      g.forEach(i => {
        const pending = String(i.id).startsWith("tmp-");
        html += `<div class="item"${pending ? ' style="opacity:.55"' : ""}><span class="ic" aria-hidden="true">${icon(i.cat)}</span><div class="note">${esc(i.note)}<div class="cat">${esc(i.cat)} · <span class="by"><span class="dot" style="background:${colorOf(i.uid)}"></span>${esc(i.uid === state.user.id ? "Saya" : nameOf(i.uid))}</span>${pending ? " · menyimpan…" : ""}</div></div><div class="num">${rp(i.amt)}</div><button class="del" data-del="${esc(i.id)}" aria-label="Hapus ${esc(i.note)}"${pending ? " disabled" : ""}>×</button></div>`;
      });
    }
    $("list").innerHTML = html;
  }
}
function itemsOf(start) {
  const key = monthKey(start);
  return [...state.items.values()].filter(i => monthKey(new Date(i.ts)) === key);
}
const sum = arr => arr.reduce((s, i) => s + i.amt, 0);
const shortPeriod = st => payday() === 1 ? MON3[st.getMonth()] : st.getDate() + " " + MON3[st.getMonth()];
function pct(a, b) { return b ? Math.round((a - b) / b * 100) : null; }
function diffPill(now, before, label) {
  const p = pct(now, before);
  if (p === null) return `<span class="foot">${label}: belum ada data</span>`;
  if (p === 0) return `<span class="pill">sama dengan ${label}</span>`;
  return p > 0 ? `<span class="pill bad">${p}% lebih boros dari ${label}</span>` : `<span class="pill good">${-p}% lebih hemat dari ${label}</span>`;
}
function renderReport(start, items, spent, totalBudget, todayIdx) {
  const prevStart = shiftStart(start, -1), prev = itemsOf(prevStart), prevTotal = sum(prev);
  const days = Math.round((periodEnd(start) - start) / DAY);
  const ran = todayIdx >= 0 ? todayIdx + 1 : days;
  const prevSameDay = sum(prev.filter(i => dayIndex(new Date(i.ts), prevStart) < ran));
  const loadedPrev = state.loaded.has(monthKey(prevStart));

  // ringkasan
  let html = `<div class="rep-top">
    <div><div class="label">Rata-rata per hari</div><div class="num big2">${rp(spent / ran)}</div><div class="foot">dari ${ran} hari berjalan</div></div>
    <div><div class="label">Periode lalu (${shortPeriod(prevStart)})</div><div class="num big2">${loadedPrev ? rp(prevTotal) : "…"}</div>
      <div>${!loadedPrev ? "" : todayIdx >= 0 ? diffPill(spent, prevSameDay, "hari ke-" + ran + " periode lalu") : diffPill(spent, prevTotal, "periode lalu")}</div></div>
  </div>`;

  // per kategori
  const byNow = {}, byPrev = {};
  items.forEach(i => byNow[i.cat] = (byNow[i.cat] || 0) + i.amt);
  prev.forEach(i => byPrev[i.cat] = (byPrev[i.cat] || 0) + i.amt);
  const rows = CATS.map(c => c.k).concat(Object.keys({ ...byNow, ...byPrev }).filter(k => !CATS.some(c => c.k === k)))
    .filter(k => byNow[k] || byPrev[k]).sort((a, b) => (byNow[b] || 0) - (byNow[a] || 0));
  if (rows.length) {
    const top = rows[0];
    if (byNow[top]) html += `<p class="insight">Pengeluaran terbesar periode ini ada di <b>${esc(top)}</b>, ${spent ? Math.round(byNow[top] / spent * 100) : 0}% dari total.</p>`;
    html += `<div class="tbl-wrap"><table class="rep-table"><thead><tr><th>Kategori</th><th>Periode ini</th><th>Periode lalu</th><th>Selisih</th></tr></thead><tbody>` +
      rows.map(k => {
        const a = byNow[k] || 0, b = byPrev[k] || 0, d = a - b;
        return `<tr><td>${esc(k)}</td><td class="num">${rp(a)}</td><td class="num">${rp(b)}</td><td class="num ${d > 0 ? "up" : d < 0 ? "down" : ""}">${d === 0 ? "–" : (d > 0 ? "+" : "−") + rp(Math.abs(d))}</td></tr>`;
      }).join("") +
      `</tbody><tfoot><tr><td>Total</td><td class="num">${rp(spent)}</td><td class="num">${rp(prevTotal)}</td><td class="num ${spent > prevTotal ? "up" : spent < prevTotal ? "down" : ""}">${spent === prevTotal ? "–" : (spent > prevTotal ? "+" : "−") + rp(Math.abs(spent - prevTotal))}</td></tr></tfoot></table></div>`;
  }

  // tren 6 periode
  const starts = Array.from({ length: REPORT_PERIODS }, (_, i) => shiftStart(start, i - REPORT_PERIODS + 1));
  const totals = starts.map(st => state.loaded.has(monthKey(st)) ? sum(itemsOf(st)) : null);
  const W = 360, H = 140, pl = 34, pb = 20, pt = 12, bw = (W - pl) / starts.length;
  const max = Math.max(1, totalBudget, ...totals.map(v => v || 0));
  const step = [50000, 100000, 250000, 500000, 1000000, 2000000, 2500000, 5000000, 10000000].find(x => max / x <= 5) || 20000000;
  const topV = Math.ceil(max / step) * step, sy = v => pt + (H - pt - pb) * (1 - v / topV);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tren total pengeluaran ${REPORT_PERIODS} periode">`;
  for (let v = 0; v <= topV; v += step) svg += `<line x1="${pl}" x2="${W}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--line)" stroke-width="0.6"/><text x="${pl - 4}" y="${sy(v) + 3}" text-anchor="end">${v ? short(v) : "0"}</text>`;
  if (totalBudget > 0) svg += `<line x1="${pl}" x2="${W}" y1="${sy(totalBudget)}" y2="${sy(totalBudget)}" stroke="var(--warn)" stroke-dasharray="3 3"/><text x="${W - 2}" y="${sy(totalBudget) - 3}" text-anchor="end" style="fill:var(--warn)">anggaran ${short(totalBudget)}</text>`;
  totals.forEach((v, i) => {
    const x = pl + i * bw + bw * .2, cur = i === starts.length - 1;
    if (v) svg += `<rect x="${x}" y="${sy(v)}" width="${bw * .6}" height="${Math.max(1, H - pb - sy(v))}" rx="2" fill="${totalBudget && v > totalBudget ? "var(--bad)" : "var(--accent)"}" opacity="${cur ? 1 : .55}"><title>${periodLabel(starts[i])}: ${rp(v)}</title></rect>`;
    if (v) svg += `<text x="${x + bw * .3}" y="${sy(v) - 3}" text-anchor="middle" style="fill:var(--ink)">${short(v)}</text>`;
    svg += `<text x="${x + bw * .3}" y="${H - 6}" text-anchor="middle" style="${cur ? "fill:var(--ink);font-weight:600" : ""}">${shortPeriod(starts[i])}</text>`;
  });
  html += `<h3>Tren ${REPORT_PERIODS} periode</h3><div class="chart">${svg}</svg></div>`;

  // pengeluaran terbesar
  const big = [...items].filter(i => !String(i.id).startsWith("tmp-")).sort((a, b) => b.amt - a.amt).slice(0, 5);
  if (big.length) html += `<h3>5 pengeluaran terbesar</h3><ol class="biglist">` + big.map(i => {
    const d = new Date(i.ts);
    return `<li><span class="note">${esc(i.note)}<span class="cat">${esc(i.cat)} · ${d.getDate()} ${MON3[d.getMonth()]}</span></span><span class="num">${rp(i.amt)}</span></li>`;
  }).join("") + `</ol>`;

  $("report").innerHTML = html;
}

function renderChips() {
  $("cats").innerHTML = `<button class="chip" data-cat="" aria-pressed="${state.selCat === null}">Otomatis</button>` +
    CATS.map(c => `<button class="chip" data-cat="${esc(c.k)}" aria-pressed="${state.selCat === c.k}">${icon(c.k)} ${esc(c.k)}</button>`).join("");
  $("presets").innerHTML = PRESETS.map((p, i) => `<button class="chip preset" data-preset="${i}">+ ${p[0]} ${short(p[1])}</button>`).join("");
}
function updatePreview() {
  const p = parse($("q").value);
  $("add").disabled = !p;
  if (!$("q").value.trim()) { $("preview").textContent = 'Ketik nama dan nominal. Bisa pakai rb, k, jt. Lupa catat? Tambahkan "kemarin", "senin", "3 hari lalu", atau "tgl 20".'; return; }
  if (!p) { $("preview").textContent = "Tambahkan nominal, misalnya 25rb atau 25000."; return; }
  $("preview").innerHTML = `${icon(p.cat)} <b>${esc(p.note)}</b> · <b class="num">${rp(p.amt)}</b> · ${esc(p.cat)} · <b>${dayText(p.ts)}</b>`;
}

/* ================= Ekspor Excel ================= */
function download(bytes, filename) {
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const H = v => ({ v, s: "bold" }), R = v => ({ v, s: "rp" }), RB = v => ({ v, s: "boldrp" });
function noteRows(list) {
  const rows = [[H("Tanggal"), H("Catatan"), H("Kategori"), H("Dicatat oleh"), H("Jumlah")]];
  [...list].sort((a, b) => a.ts - b.ts).forEach(i => rows.push([{ v: Xlsx.excelDate(i.ts), s: "date" }, i.note, i.cat, nameOf(i.uid), R(i.amt)]));
  rows.push([], [null, H("Total"), null, null, RB(sum(list))]);
  return rows;
}
async function exportExcel(scope) {
  const msg = $("exportMsg"); msg.className = "err"; msg.textContent = "Menyiapkan file…";
  try {
    const budget = state.hh.budget;
    if (scope === "period") {
      const start = periodStart(state.view), list = itemsOf(start).filter(i => !String(i.id).startsWith("tmp-"));
      const byCat = {}; list.forEach(i => byCat[i.cat] = (byCat[i.cat] || 0) + i.amt);
      const byUser = {}; list.forEach(i => byUser[i.uid] = (byUser[i.uid] || 0) + i.amt);
      const tb = CATS.reduce((a, c) => a + Number(budget[c.k] || 0), 0);
      const sumRows = [[H("Periode"), periodLabel(start)], [], [H("Kategori"), H("Anggaran"), H("Terpakai"), H("Sisa")]];
      CATS.forEach(c => { const b = Number(budget[c.k] || 0), u = byCat[c.k] || 0; sumRows.push([c.k, R(b), R(u), R(b - u)]); });
      Object.keys(byCat).filter(k => !CATS.some(c => c.k === k)).forEach(k => sumRows.push([k, R(0), R(byCat[k]), R(-byCat[k])]));
      sumRows.push([H("Total"), RB(tb), RB(sum(list)), RB(tb - sum(list))], [], [H("Dicatat oleh"), H("Jumlah")]);
      state.members.forEach(m => sumRows.push([m.display_name, R(byUser[m.user_id] || 0)]));
      const e = new Date(periodEnd(start) - DAY), f = d => d.getDate() + MON3[d.getMonth()];
      download(Xlsx.makeXlsx([
        { name: "Catatan", cols: [17, 34, 22, 16, 15], rows: noteRows(list) },
        { name: "Ringkasan", cols: [24, 16, 16, 16], rows: sumRows }
      ]), `dompetku-${f(start)}-${f(e)}-${e.getFullYear()}.xlsx`);
    } else {
      const { data, error } = await sb.from("expenses").select("id,user_id,amount,note,category,spent_at")
        .eq("household_id", state.hh.id).order("spent_at", { ascending: true }).limit(20000);
      if (error) throw error;
      const list = data.map(fromRow);
      if (!list.length) { msg.textContent = "Belum ada catatan untuk diunduh."; return; }
      const cats = CATS.map(c => c.k).concat([...new Set(list.map(i => i.cat))].filter(k => !CATS.some(c => c.k === k)));
      const per = new Map();
      list.forEach(i => { const st = periodStart(new Date(i.ts)), k = +st; if (!per.has(k)) per.set(k, { st, by: {} }); const o = per.get(k).by; o[i.cat] = (o[i.cat] || 0) + i.amt; });
      const perRows = [[H("Periode"), ...cats.map(H), H("Total")]];
      [...per.values()].sort((a, b) => a.st - b.st).forEach(({ st, by }) => perRows.push([periodLabel(st), ...cats.map(k => R(by[k] || 0)), RB(cats.reduce((a, k) => a + (by[k] || 0), 0))]));
      const d = new Date();
      download(Xlsx.makeXlsx([
        { name: "Semua catatan", cols: [17, 34, 22, 16, 15], rows: noteRows(list) },
        { name: "Per periode", cols: [26, ...cats.map(() => 15), 16], rows: perRows }
      ]), `dompetku-semua-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.xlsx`);
    }
    msg.className = "err ok"; msg.textContent = "File Excel diunduh.";
  } catch (er) { msg.className = "err"; msg.textContent = "Gagal membuat file: " + friendlyError(er); }
}

/* ================= Menu ================= */
document.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("[data-tab]").forEach(x => x === b ? x.setAttribute("aria-current", "page") : x.removeAttribute("aria-current"));
  document.querySelectorAll("[data-page]").forEach(pg => pg.hidden = pg.dataset.page !== b.dataset.tab);
  window.scrollTo({ top: 0 });
}));
$("toastUndo").addEventListener("click", () => { const u = toastUndo; $("toast").hidden = true; toastUndo = null; if (u) { u(); toast("Catatan dibatalkan."); } });

/* ================= Interaksi ================= */
$("exportPeriod").addEventListener("click", () => exportExcel("period"));
$("exportAll").addEventListener("click", () => exportExcel("all"));
$("q").addEventListener("input", updatePreview);
$("qform").addEventListener("submit", e => { e.preventDefault(); const p = parse($("q").value); if (!p) return; $("q").value = ""; setDay(null); addItem(p); });
// pilih tanggal lewat kalender
function setDay(n) {
  state.selDay = n;
  const b = $("dayBtn");
  if (n == null) { b.textContent = "📅 Hari ini"; b.classList.remove("on"); $("dayPick").value = ""; }
  else { const d = new Date(); d.setDate(d.getDate() + n); b.textContent = "📅 " + dayText(d.getTime()); b.classList.add("on"); }
  updatePreview();
}
$("dayPick").addEventListener("change", e => {
  const v = e.target.value; if (!v) return setDay(null);
  const [y, m, d] = v.split("-").map(Number), now = new Date(), t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const n = Math.round((new Date(y, m - 1, d) - t0) / 864e5);
  setDay(n >= 0 ? null : n);
});
// batas maksimal = hari ini, diperbarui setiap kali kalender akan dibuka
function setDayMax() { const d = new Date(), pad = x => String(x).padStart(2, "0"); $("dayPick").max = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
["focus", "pointerdown", "touchstart"].forEach(ev => $("dayPick").addEventListener(ev, setDayMax, { passive: true }));
setDayMax();
$("cats").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (!b) return; state.selCat = b.dataset.cat || null; renderChips(); updatePreview(); });
$("presets").addEventListener("click", e => { const b = e.target.closest("[data-preset]"); if (!b) return; const [n, a, c] = PRESETS[b.dataset.preset]; const d = new Date(); if (state.selDay != null) { d.setDate(d.getDate() + state.selDay); d.setHours(12, 0, 0, 0); } addItem({ note: n, amt: a, cat: c, ts: d.getTime() }); setDay(null); });
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
$("prev").onclick = () => shiftPeriod(-1);
$("next").onclick = () => shiftPeriod(1);
$("paydayForm").addEventListener("submit", async e => {
  e.preventDefault();
  const v = parseInt($("payday").value, 10), msg = $("secMsg");
  if (!(v >= 1 && v <= 28)) { msg.className = "err"; msg.textContent = "Isi tanggal gajian antara 1 sampai 28."; return; }
  if (v === payday()) { msg.className = "err ok"; msg.textContent = "Tanggal gajian sudah " + v + "."; return; }
  const prev = state.hh.budget._tgl_gajian;
  state.hh.budget = { ...state.hh.budget, _tgl_gajian: v }; resetPeriod();
  const { error } = await sb.from("households").update({ budget: state.hh.budget }).eq("id", state.hh.id);
  if (error) { state.hh.budget._tgl_gajian = prev; resetPeriod(); msg.className = "err"; msg.textContent = "Gagal menyimpan: " + friendlyError(error); return; }
  msg.className = "err ok"; msg.textContent = "Periode anggaran sekarang mulai tanggal " + v + ".";
});
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
