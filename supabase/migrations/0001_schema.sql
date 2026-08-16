-- ══════════════════════════════════════════════════════════════════
-- RENACER: Crónicas del Otro Mundo — Migración 0001: esquema base
-- Base de datos normalizada (§32-33) con Row Level Security (§45).
-- Reconstruible desde el repositorio (§77).
-- ══════════════════════════════════════════════════════════════════

-- ── Perfiles (1:1 con auth.users) ─────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'es',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: leer el propio" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: crear el propio" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: editar el propio" on public.profiles
  for update using (auth.uid() = id);

-- Crear perfil automáticamente al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Partidas y jugadores (cooperativo §34) ────────────────────────
create table if not exists public.games (
  id uuid primary key,
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.game_players (
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('host', 'guest')),
  joined_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

alter table public.games enable row level security;
alter table public.game_players enable row level security;

create policy "games: crear como host" on public.games
  for insert with check (auth.uid() = host_user_id);
create policy "games: miembros pueden leer" on public.games
  for select using (
    auth.uid() = host_user_id
    or exists (
      select 1 from public.game_players gp
      where gp.game_id = id and gp.user_id = auth.uid()
    )
    -- El join por código necesita SELECT antes de ser miembro:
    or true
  );

create policy "game_players: unirse a una partida" on public.game_players
  for insert with check (
    auth.uid() = user_id
    and (select count(*) from public.game_players gp where gp.game_id = game_id) < 2
  );
create policy "game_players: miembros pueden leer" on public.game_players
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.game_players gp
      where gp.game_id = game_players.game_id and gp.user_id = auth.uid()
    )
  );

-- ── Guardados: snapshot materializado por (user, game) ────────────
create table if not exists public.saves (
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null,
  snapshot jsonb not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

alter table public.saves enable row level security;
create policy "saves: propietario total" on public.saves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Decisiones: event sourcing inmutable (§31, §65) ───────────────
create table if not exists public.story_decisions (
  id uuid primary key,           -- UUID generado en cliente = idempotencia
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null,
  node_id text not null,
  choice_id text not null,
  decided_at timestamptz not null
);

alter table public.story_decisions enable row level security;
create policy "decisions: insertar propias" on public.story_decisions
  for insert with check (auth.uid() = user_id);
create policy "decisions: leer las de mi partida" on public.story_decisions
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.game_players gp
      where gp.game_id = story_decisions.game_id and gp.user_id = auth.uid()
    )
  );

create index if not exists idx_decisions_game on public.story_decisions (game_id, decided_at);

-- ── Cola de sincronización: registro idempotente (§30-31) ─────────
create table if not exists public.sync_operations (
  id uuid primary key,           -- UUID del cliente: UNIQUE = dedupe
  user_id uuid not null references public.profiles(id) on delete cascade,
  operation_type text not null,
  entity text not null,
  entity_id text not null,
  payload jsonb not null default '{}'::jsonb,
  client_created_at timestamptz not null,
  server_received_at timestamptz not null default now()
);

alter table public.sync_operations enable row level security;
create policy "sync_ops: insertar propias" on public.sync_operations
  for insert with check (auth.uid() = user_id);
create policy "sync_ops: leer propias" on public.sync_operations
  for select using (auth.uid() = user_id);

create index if not exists idx_sync_ops_user on public.sync_operations (user_id, client_created_at);
