-- ═══════════════════════════════════════════════
-- 📖 RENACER: CRÓNICAS DEL OTRO MUNDO — DB SCHEMA
-- ═══════════════════════════════════════════════
-- Este script define la estructura de tablas relacionales, relaciones de clave foránea, 
-- restricciones de integridad, índices de rendimiento y Políticas de Seguridad a Nivel de Fila (RLS)
-- para el backend de Supabase.
--
-- FASE 5: Supabase (Estructura de Base de Datos y Seguridad)

-- Habilitar la extensión UUID de PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════
// 1. TABLA: PROFILES (Perfiles de Usuario)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden leer su propio perfil" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- ═══════════════════════════════════════════════
// 2. TABLA: CHARACTERS (Personajes unificados)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    character_index INT NOT NULL DEFAULT 0,
    class_index INT NOT NULL DEFAULT 0,
    goddess_index INT NOT NULL DEFAULT 0,
    primary_stats JSONB NOT NULL,   -- { str, int, agi, vit, luck, will, cha }
    secondary_stats JSONB NOT NULL, -- { hp, maxHp, mp, maxMp, stamina, maxStamina, attack, defense, critical }
    skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en characters
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar su propio personaje" 
    ON public.characters FOR ALL 
    USING (auth.uid() = id);

-- ═══════════════════════════════════════════════
// 3. TABLA: INVENTORY (Mochila / Inventario del jugador)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_player_item UNIQUE (player_id, item_id)
);

-- Habilitar RLS en inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar su propio inventario" 
    ON public.inventory FOR ALL 
    USING (auth.uid() = player_id);

-- ═══════════════════════════════════════════════
// 4. TABLA: RELATIONSHIPS (Relaciones con NPCs)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    npc_id TEXT NOT NULL,
    trust INT NOT NULL DEFAULT 0,
    friendship INT NOT NULL DEFAULT 0,
    fear INT NOT NULL DEFAULT 0,
    memory TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_player_npc UNIQUE (player_id, npc_id)
);

-- Habilitar RLS en relationships
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus relaciones con NPCs" 
    ON public.relationships FOR ALL 
    USING (auth.uid() = player_id);

-- ═══════════════════════════════════════════════
// 5. TABLA: QUESTS (Misiones completadas o en curso)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_player_quest UNIQUE (player_id, quest_id)
);

-- Habilitar RLS en quests
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus misiones" 
    ON public.quests FOR ALL 
    USING (auth.uid() = player_id);

-- ═══════════════════════════════════════════════
// 6. TABLA: STORY_CHOICES (Registro de decisiones místicas)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.story_choices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    choice_text TEXT NOT NULL,
    next_node_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en story_choices
ALTER TABLE public.story_choices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden guardar sus decisiones narrativas" 
    ON public.story_choices FOR ALL 
    USING (auth.uid() = player_id);

-- ═══════════════════════════════════════════════
// 7. TABLA: GAMES (Partidas multijugador cooperativas)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
    current_node_id TEXT NOT NULL DEFAULT 'intro-1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Un jugador solo puede ver el juego si participa en él (como anfitrión)
CREATE POLICY "Permitir ver partidas de las que se es anfitrión" 
    ON public.games FOR SELECT 
    USING (auth.uid() = host_id);

-- ═══════════════════════════════════════════════
// 8. TABLA: GAME_PLAYERS (Jugadores en partidas cooperativas)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.game_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    character_id UUID,
    role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('host', 'guest')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_game_player UNIQUE (game_id, player_id)
);

-- Habilitar RLS en game_players
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los jugadores pueden ver sus propios registros de emparejamiento" 
    ON public.game_players FOR ALL 
    USING (auth.uid() = player_id);

-- ═══════════════════════════════════════════════
// 9. TABLA: WORLD_STATES (Estado del mapa y regiones)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.world_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    active_region_id TEXT NOT NULL,
    unlocked_regions TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_player_world UNIQUE (player_id)
);

-- Habilitar RLS en world_states
ALTER TABLE public.world_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus estados del mundo" 
    ON public.world_states FOR ALL 
    USING (auth.uid() = player_id);

-- ═══════════════════════════════════════════════
-- DISPARADORES GENERALES PARA REPLICACIÓN EN CALIENTE
-- ═══════════════════════════════════════════════

-- Automatización para que auth.users replique automáticamente a public.profiles al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
