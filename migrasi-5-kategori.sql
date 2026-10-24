-- Jalankan sekali di SQL Editor Supabase untuk pindah ke 5 kategori.
-- ========== Kategori (5 kategori ringkas) ==========
-- Nama kategori bebas diatur dari aplikasi; database hanya membatasi panjangnya.
alter table public.expenses drop constraint if exists expenses_category_check;
update public.expenses set category = case category
  when 'Makan' then 'Dapur & Rumah'      when 'Belanja' then 'Dapur & Rumah'
  when 'Tagihan' then 'Tagihan & Cicilan' when 'Cicilan' then 'Tagihan & Cicilan' when 'Arisan' then 'Tagihan & Cicilan'
  when 'Investasi' then 'Tabungan & Investasi'
  when 'Hiburan' then 'Gaya Hidup & Lainnya' when 'Lainnya' then 'Gaya Hidup & Lainnya'
  else category end
where category in ('Makan','Belanja','Tagihan','Cicilan','Arisan','Investasi','Hiburan','Lainnya');
alter table public.expenses add constraint expenses_category_check check (char_length(category) between 1 and 40);

-- pindahkan anggaran lama ke kategori baru (dijumlahkan)
alter table public.households alter column budget set default '{"Dapur & Rumah":2200000,"Transport":500000,"Tagihan & Cicilan":800000,"Tabungan & Investasi":0,"Gaya Hidup & Lainnya":500000}';
update public.households set budget = jsonb_build_object(
  'Dapur & Rumah',        coalesce((budget->>'Makan')::bigint,0) + coalesce((budget->>'Belanja')::bigint,0),
  'Transport',            coalesce((budget->>'Transport')::bigint,0),
  'Tagihan & Cicilan',    coalesce((budget->>'Tagihan')::bigint,0) + coalesce((budget->>'Cicilan')::bigint,0) + coalesce((budget->>'Arisan')::bigint,0),
  'Tabungan & Investasi', coalesce((budget->>'Investasi')::bigint,0),
  'Gaya Hidup & Lainnya', coalesce((budget->>'Hiburan')::bigint,0) + coalesce((budget->>'Lainnya')::bigint,0))
where budget ? 'Makan';

