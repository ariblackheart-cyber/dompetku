-- Jalankan sekali di SQL Editor Supabase setelah update 8 kategori.
-- Memindahkan catatan lama yang jelas termasuk Pendidikan, Kesehatan, atau Hadiah & Sumbangan.
-- Aman dijalankan ulang; catatan yang kategorinya kamu pilih sendiri di luar dua kategori lama tidak disentuh.

update public.expenses set category = 'Pendidikan'
where category in ('Tagihan & Cicilan', 'Gaya Hidup & Lainnya')
  and note ~* '\m(spp|sekolah|kuliah|ukt|semester|les|bimbel|kursus|daycare|paud|pesantren|pondok|buku pelajaran|seragam|alat tulis|atk|study tour)\M';

update public.expenses set category = 'Kesehatan'
where category in ('Tagihan & Cicilan', 'Gaya Hidup & Lainnya')
  and note ~* '\m(obat|apotek|apotik|dokter|klinik|puskesmas|rumah sakit|bidan|vitamin|periksa|imunisasi|vaksin|bpjs kesehatan|asuransi kesehatan)\M'
  and note !~* '\mobat nyamuk\M';

update public.expenses set category = 'Hadiah & Sumbangan'
where category in ('Tagihan & Cicilan', 'Gaya Hidup & Lainnya')
  and note ~* '\m(hadiah|kado|kondangan|nikahan|sumbangan|sedekah|infaq|infak|donasi|zakat|kurban|qurban|angpao|angpau|takziah|melayat|oleh oleh|kirim ortu|kiriman orang tua|kirim orang tua)\M';
