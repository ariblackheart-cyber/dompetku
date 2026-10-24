# Dompetku

Web catat pengeluaran untuk dipakai berdua (suami-istri) atau sekeluarga, tersinkron langsung lewat Supabase.

## Fitur
- **Akun masing-masing**: daftar dengan email dan kata sandi sendiri.
- **Rumah tangga bersama**: satu orang membuat, pasangan bergabung dengan kode undangan.
- **Sinkron langsung**: catatan pasangan langsung muncul tanpa muat ulang.
- **Siapa mencatat apa**: label dan warna per orang, total per orang, dan filter riwayat.
- **Catat cepat**: ketik `kopi 25rb` atau `bensin 50rb kemarin`, kategori terisi otomatis.
- **5 kategori ringkas**: Dapur & Rumah, Transport, Tagihan & Cicilan, Tabungan & Investasi, Gaya Hidup & Lainnya.
- **Periode gajian**: anggaran dihitung dari tanggal gajian (bawaan 25) sampai sehari sebelum gajian berikutnya. Bisa diubah di bagian Rumah tangga.
- **Amplop anggaran bersama** per kategori, **aman dibelanjakan per hari**, dan **grafik harian**.

## Pemasangan (sekali saja)

### 1. Siapkan database
Supabase → **SQL Editor** → **New query** → tempel seluruh isi `schema.sql` → **Run**.
Aman dijalankan ulang kalau ada pembaruan.

### 2. Atur alamat web untuk email konfirmasi
Supabase → **Authentication** → **URL Configuration**:
- **Site URL**: `https://ariblackheart-cyber.github.io/dompetku/`
- **Redirect URLs**: tambahkan `https://ariblackheart-cyber.github.io/dompetku/`

Tanpa langkah ini, tautan di email konfirmasi dan reset kata sandi akan mengarah ke alamat yang salah.

### 3. Aktifkan GitHub Pages
Repo → **Settings** → **Pages** → **Deploy from a branch** → **main** / **(root)**.

## Cara pakai berdua
1. Suami (atau istri) membuka web, **Daftar**, konfirmasi email, lalu **Buat rumah tangga**.
2. Salin **kode undangan** di bagian bawah aplikasi dan kirim ke pasangan.
3. Pasangan **Daftar** dengan emailnya sendiri, lalu **Gabung** dengan kode itu.

## Keamanan
- Setiap tabel dilindungi **Row Level Security**: hanya anggota rumah tangga yang bisa melihat dan mengubah datanya. Orang lain, termasuk pengguna Supabase lain di project ini, tidak bisa membaca apa pun.
- Pengguna tidak bisa mencatat atas nama orang lain, dan kode undangan hanya bisa diganti lewat tombol di aplikasi.
- `config.js` hanya berisi **publishable key**, yang memang aman dipublikasikan. **Jangan pernah** menaruh secret key / service_role key di repo ini.
- Content Security Policy membatasi web hanya terhubung ke project Supabase ini.
