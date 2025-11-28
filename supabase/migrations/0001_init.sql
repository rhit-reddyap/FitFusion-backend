-- Profiles
create table if not exists public.profiles (
  id uuid primary key default auth.uid(),
  email text unique,
  display_name text,
  units text default 'metric',
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
create policy "profiles are viewable by owner" on public.profiles
  for select using ( auth.uid() = id );
create policy "profiles are updatable by owner" on public.profiles
  for update using ( auth.uid() = id );
create policy "insert own profile" on public.profiles
  for insert with check ( auth.uid() = id );

-- Workouts
create table if not exists public.workouts (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  name text not null,
  created_at timestamp with time zone default now()
);
alter table public.workouts enable row level security;
create policy "workouts owner" on public.workouts
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create table if not exists public.workout_sets (
  id bigserial primary key,
  workout_id bigint references public.workouts(id) on delete cascade,
  exercise text not null,
  set_index int not null,
  reps int not null,
  weight numeric not null
);
alter table public.workout_sets enable row level security;
create policy "workout_sets owner" on public.workout_sets
  using ( exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()) )
  with check ( exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()) );

-- Food
create table if not exists public.food_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  name text not null,
  grams numeric not null default 0,
  calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  created_at timestamp with time zone default now()
);
alter table public.food_logs enable row level security;
create policy "food owner" on public.food_logs
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- Analytics helpers
create table if not exists public.weight_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  weight_kg numeric not null
);
alter table public.weight_log enable row level security;
create policy "weight owner" on public.weight_log
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create table if not exists public.burn_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  burn_kcal numeric not null
);
alter table public.burn_logs enable row level security;
create policy "burn owner" on public.burn_logs
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- Subscriptions (Stripe)
create table if not exists public.subscriptions (
  email text primary key,
  stripe_customer_id text,
  status text check (status in ('active','past_due','canceled')) default 'active',
  updated_at timestamp with time zone default now()
);
alter table public.subscriptions enable row level security;
create policy "subscriptions read own" on public.subscriptions
  for select using ( auth.jwt() ->> 'email' = email );
