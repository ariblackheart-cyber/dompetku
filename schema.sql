-- Dompetku: skema untuk dipakai bersama (suami-istri / keluarga)
-- Jalankan sekali di Supabase: SQL Editor -> New query -> tempel semua -> Run.

-- ========== Tabel ==========
create table if not exists public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Rumah Tangga' check (char_length(name) between 1 and 60),
  invite_code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 10)),
  budget      jsonb not null default '{"Makan":1500000,"Transport":500000,"Belanja":700000,"Cicilan":0,"Arisan":0,"Investasi":0,"Tagihan":800000,"Hiburan":300000,"Lainnya":200000}',
  created_by  uuid references auth.users on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households on delete cascade,
  user_id      uuid not null references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  joined_at    timestamptz not null default now(),
  primary key (household_id, user_id)
);
create unique index if not exists one_household_per_user on public.household_members (user_id);

create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households on delete cascade,
  user_id      uuid references auth.users on delete set null default auth.uid(),
  amount       bigint not null check (amount > 0 and amount < 1000000000000),
  note         text not null check (char_length(note) between 1 and 80),
  category     text not null,
  spent_at     timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
-- daftar kategori (diperbarui: tambah Cicilan, Arisan, Investasi)
alter table public.expenses drop constraint if exists expenses_category_check;
alter table public.expenses add constraint expenses_category_check
  check (category in ('Makan','Transport','Belanja','Cicilan','Arisan','Investasi','Tagihan','Hiburan','Lainnya'));
create index if not exists expenses_household_time on public.expenses (household_id, spent_at desc);

-- ========== Pengecekan anggota ==========
create or replace function public.is_member(h uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members where household_id = h and user_id = auth.uid());
$$;

-- ========== Row Level Security ==========
alter table public.households        enable row level security;
alter table public.household_members enable row level security;
alter table public.expenses          enable row level security;

-- Pengunjung tanpa login tidak bisa apa-apa; yang login dibatasi oleh policy di bawah
revoke all on public.households, public.household_members, public.expenses from anon;
grant usage on schema public to authenticated;
grant select on public.households, public.household_members to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant delete on public.household_members to authenticated;

-- Rumah tangga: anggota boleh lihat; hanya nama & anggaran yang boleh diubah
drop policy if exists hh_select on public.households;
create policy hh_select on public.households for select to authenticated using (public.is_member(id));
drop policy if exists hh_update on public.households;
create policy hh_update on public.households for update to authenticated using (public.is_member(id)) with check (public.is_member(id));
revoke insert, update, delete on public.households from authenticated;
grant update (name, budget) on public.households to authenticated;

-- Anggota: saling lihat; ubah nama sendiri; keluar sendiri
drop policy if exists hm_select on public.household_members;
create policy hm_select on public.household_members for select to authenticated using (public.is_member(household_id));
drop policy if exists hm_update on public.household_members;
create policy hm_update on public.household_members for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists hm_delete on public.household_members;
create policy hm_delete on public.household_members for delete to authenticated using (user_id = auth.uid());
revoke insert, update on public.household_members from authenticated;
grant update (display_name) on public.household_members to authenticated;

-- Pengeluaran: semua anggota rumah tangga boleh lihat, catat, ubah, hapus
drop policy if exists ex_select on public.expenses;
create policy ex_select on public.expenses for select to authenticated using (public.is_member(household_id));
drop policy if exists ex_insert on public.expenses;
create policy ex_insert on public.expenses for insert to authenticated with check (public.is_member(household_id) and user_id = auth.uid());
drop policy if exists ex_update on public.expenses;
create policy ex_update on public.expenses for update to authenticated using (public.is_member(household_id)) with check (public.is_member(household_id));
drop policy if exists ex_delete on public.expenses;
create policy ex_delete on public.expenses for delete to authenticated using (public.is_member(household_id));

-- ========== Fungsi: buat, gabung, ganti kode undangan ==========
create or replace function public.create_household(p_name text, p_display text)
returns uuid language plpgsql security definer set search_path = public as $$
declare h uuid;
begin
  if auth.uid() is null then raise exception 'Belum login'; end if;
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'Kamu sudah tergabung di rumah tangga lain';
  end if;
  insert into households (name, created_by) values (coalesce(nullif(trim(p_name), ''), 'Rumah Tangga'), auth.uid()) returning id into h;
  insert into household_members (household_id, user_id, display_name) values (h, auth.uid(), trim(p_display));
  return h;
end $$;

create or replace function public.join_household(p_code text, p_display text)
returns uuid language plpgsql security definer set search_path = public as $$
declare h uuid;
begin
  if auth.uid() is null then raise exception 'Belum login'; end if;
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'Kamu sudah tergabung di rumah tangga lain';
  end if;
  select id into h from households where invite_code = upper(trim(p_code));
  if h is null then raise exception 'Kode undangan tidak ditemukan'; end if;
  if (select count(*) from household_members where household_id = h) >= 6 then
    raise exception 'Rumah tangga ini sudah penuh';
  end if;
  insert into household_members (household_id, user_id, display_name) values (h, auth.uid(), trim(p_display));
  return h;
end $$;

create or replace function public.regenerate_invite(p_household uuid)
returns text language plpgsql security definer set search_path = public as $$
declare c text := upper(substr(md5(gen_random_uuid()::text), 1, 10));
begin
  if not public.is_member(p_household) then raise exception 'Bukan anggota'; end if;
  update households set invite_code = c where id = p_household;
  return c;
end $$;

revoke execute on function public.create_household(text, text), public.join_household(text, text), public.regenerate_invite(uuid), public.is_member(uuid) from public, anon;
grant execute on function public.create_household(text, text), public.join_household(text, text), public.regenerate_invite(uuid), public.is_member(uuid) to authenticated;

-- ========== Sinkron langsung ==========
do $$ begin
  begin alter publication supabase_realtime add table public.expenses; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.households; exception when duplicate_object then null; end;
end $$;
