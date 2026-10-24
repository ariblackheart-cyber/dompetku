# Dompetku

Web catat pengeluaran pribadi dengan kata sandi dan data terenkripsi.

## Fitur
- **Catat cepat**: ketik `kopi 25rb` atau `bensin 50rb kemarin`, kategori terisi otomatis.
- **Tombol rutin** untuk parkir, kopi, makan siang, bensin.
- **Amplop anggaran** per kategori, dengan peringatan saat hampir atau sudah lewat batas.
- **Aman dibelanjakan per hari**: sisa anggaran dibagi hari tersisa bulan ini.
- **Grafik harian** dengan garis jatah harian.

## Keamanan
- Masuk dengan kata sandi (minimal 8 karakter, harus cukup kuat).
- Semua catatan dienkripsi dengan **AES-GCM 256-bit**. Kuncinya dibuat dari kata sandi lewat **PBKDF2-SHA256 600.000 iterasi** dengan salt acak.
- Kata sandi tidak disimpan di mana pun. Yang tersimpan di browser hanya data terenkripsi.
- Terkunci otomatis setelah 5 menit tidak dipakai, dan ada tombol **Kunci sekarang**.
- Ada jeda yang makin lama setelah beberapa kali salah kata sandi.
- Content Security Policy ketat: tidak ada skrip dari luar dan tidak ada koneksi ke server mana pun.
- Data tidak pernah dikirim ke mana-mana. Repo ini hanya berisi kode, bukan datamu.

**Penting:** kalau lupa kata sandi, data tidak bisa dibuka oleh siapa pun. Unduh cadangan secara rutin (file cadangan juga terenkripsi).

## Pindah HP / browser
Data tersimpan per browser. Untuk pindah, pakai **Unduh cadangan** di perangkat lama, lalu **Pulihkan cadangan** di perangkat baru dengan kata sandi yang sama.

## Menjalankan
Aktifkan GitHub Pages: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
Web akan ada di `https://<username>.github.io/dompetku/`.

Enkripsi butuh https, jadi buka lewat GitHub Pages (bukan dengan klik dua kali file `index.html`).
