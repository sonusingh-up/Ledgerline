-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles (mirrors auth.users, extends with app-specific fields)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz default now()
);

-- Accounts: one row per retail account OR prop-firm challenge/funded account
create table accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,                        -- e.g. "FTMO Challenge — $100K"
  account_type text not null check (account_type in ('retail', 'prop')),
  start_balance numeric not null,
  currency text default 'USD',

  -- Prop-firm rule fields (null when account_type = 'retail')
  prop_firm_name text,                         -- e.g. 'FTMO', 'Topstep', 'Apex', 'custom'
  daily_loss_limit_pct numeric,                -- e.g. 5.0
  max_drawdown_pct numeric,                    -- e.g. 10.0
  profit_target_pct numeric,                   -- e.g. 8.0
  drawdown_type text check (drawdown_type in ('trailing', 'static')),

  archived boolean default false,
  created_at timestamptz default now()
);

-- Trades
create table trades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,

  trade_date date not null,
  symbol text not null,
  asset_type text check (asset_type in ('fx', 'metal', 'index', 'crypto', 'stock', 'futures', 'other')),
  side text not null check (side in ('long', 'short')),
  entry_price numeric not null,
  exit_price numeric,
  size numeric not null,
  pnl numeric,                                  -- computed at save time, stored for fast aggregation
  r_multiple numeric,

  setup_tag text,                               -- e.g. 'Breakout', 'Pullback'
  notes text,
  screenshot_url text,                          -- future: chart screenshot upload

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index trades_user_account_date_idx on trades (user_id, account_id, trade_date desc);

-- Row Level Security
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table trades enable row level security;

create policy "Users manage their own profile"
  on profiles for all using (auth.uid() = id);

create policy "Users manage their own accounts"
  on accounts for all using (auth.uid() = user_id);

create policy "Users manage their own trades"
  on trades for all using (auth.uid() = user_id);

-- Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to hook on auth creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
