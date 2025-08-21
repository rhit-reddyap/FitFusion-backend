
-- Gamification schema

create table if not exists xp_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text not null,
  xp int not null,
  created_at timestamp default now()
);

create table if not exists leaderboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  total_xp int not null default 0
);

alter table badges add column if not exists xp_required int default 0;
