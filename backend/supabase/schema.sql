
-- Core user profiles
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  created_at timestamp default now()
);

-- Workouts
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  date date not null,
  data jsonb not null,
  created_at timestamp default now()
);

-- Food logs
create table if not exists food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  date date not null,
  food jsonb not null,
  created_at timestamp default now()
);

-- Communities
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp default now()
);

create table if not exists community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id),
  user_id uuid references users(id),
  joined_at timestamp default now()
);

-- Messages
create table if not exists community_messages (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id),
  user_id uuid references users(id),
  message text not null,
  created_at timestamp default now()
);
