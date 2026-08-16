-- ══════════════════════════════════════════════════════════════════
-- Migración 0002: catálogos de contenido (§78).
-- Los catálogos canónicos viven en el cliente (src/data) para que el
-- juego funcione offline; estas tablas los espejan para consultas
-- del lado servidor, herramientas de contenido y futuras validaciones.
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.content_catalog (
  kind text not null check (kind in ('class', 'goddess', 'character', 'item', 'skill', 'region', 'npc')),
  id text not null,
  data jsonb not null default '{}'::jsonb,
  version int not null default 1,
  primary key (kind, id)
);

alter table public.content_catalog enable row level security;
create policy "catalog: lectura pública autenticada" on public.content_catalog
  for select using (auth.role() = 'authenticated');

insert into public.content_catalog (kind, id, data) values
  ('class', 'warrior',    '{"tier":"base"}'),
  ('class', 'knight',     '{"tier":"base"}'),
  ('class', 'mage',       '{"tier":"base"}'),
  ('class', 'archer',     '{"tier":"base"}'),
  ('class', 'priest',     '{"tier":"base"}'),
  ('class', 'rogue',      '{"tier":"base"}'),
  ('class', 'summoner',   '{"tier":"base"}'),
  ('class', 'adventurer', '{"tier":"base"}'),
  ('goddess', 'aurelia',  '{"tags":["dawn","mercy","rebirth"]}'),
  ('goddess', 'nyxara',   '{"tags":["night","secrets","knowledge"]}'),
  ('goddess', 'sylvane',  '{"tags":["forest","freedom","wild"]}'),
  ('goddess', 'ferra',    '{"tags":["forge","war","honor"]}'),
  ('character', 'liria',  '{}'),
  ('character', 'kael',   '{}'),
  ('character', 'sera',   '{}'),
  ('character', 'dorn',   '{}'),
  ('character', 'mika',   '{}'),
  ('character', 'elara',  '{}'),
  ('character', 'ryn',    '{}'),
  ('character', 'thessa', '{}'),
  ('region', 'aldea_brumal',    '{"kind":"village"}'),
  ('region', 'bosque_susurros', '{"kind":"forest"}'),
  ('region', 'ciudad_petra',    '{"kind":"city"}'),
  ('region', 'ruinas_veloran',  '{"kind":"ruins"}'),
  ('region', 'templo_alba',     '{"kind":"temple"}'),
  ('region', 'tierras_ignotas', '{"kind":"unknown"}'),
  ('npc', 'marta',        '{"region":"aldea_brumal"}'),
  ('npc', 'joren',        '{"region":"aldea_brumal"}'),
  ('npc', 'pip',          '{"region":"aldea_brumal"}'),
  ('npc', 'capitan_bren', '{"region":"aldea_brumal"}'),
  ('npc', 'vendedora_lu', '{"region":"ciudad_petra"}')
on conflict (kind, id) do nothing;
