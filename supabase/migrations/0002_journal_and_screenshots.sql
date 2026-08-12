-- 1. Screenshot Storage Bucket & Policies

insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', false)
on conflict (id) do nothing;

create policy "Users upload their own trade screenshots"
on storage.objects for insert
with check (bucket_id = 'trade-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users view their own trade screenshots"
on storage.objects for select
using (bucket_id = 'trade-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete their own trade screenshots"
on storage.objects for delete
using (bucket_id = 'trade-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Journal Entries Table & Policies

create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  content text,
  image_url text,
  mood smallint check (mood between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, entry_date)
);

alter table journal_entries enable row level security;

create policy "Users manage their own journal entries"
  on journal_entries for all using (auth.uid() = user_id);
