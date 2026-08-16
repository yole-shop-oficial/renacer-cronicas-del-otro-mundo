# 📖✨ Renacer: Crónicas del Otro Mundo — Videojuego RPG Narrativo PWA

¡Bienvenidos a **Renacer: Crónicas del Otro Mundo**! Este es un videojuego web RPG narrativo modular diseñado bajo la filosofía **Local-First (Offline-First)** y empaquetado como una **PWA (Progressive Web App)** de alto rendimiento.

La aplicación está construida utilizando tecnologías nativas modernas (**HTML5, CSS3, ES6 Vanilla JS, IndexedDB, Web Crypto API**) para garantizar velocidad y soporte offline completo, integrándose con **Supabase** de manera idempotente para la sincronización de partidas en la nube.

---

## 🧩 Filosofía del Diseño: Local-First ➔ Cloud Sync

El juego está diseñado desde cero pensando en que la conexión a Internet puede desaparecer en cualquier momento:
1. **Estado persistente local:** Cada decisión, objeto obtenido o cambio en las relaciones de los personajes se guarda de inmediato de forma local en **IndexedDB**.
2. **Cifrado AES-GCM:** Los datos sensibles de tu partida se cifran utilizando la API nativa de **Web Crypto** en el navegador de forma ultra-segura basándose en tu contraseña de ingreso.
3. **Cola de Sincronización Idempotente:** Cuando juegas desconectado, cada acción relevante se acumula en una cola local (`sync_queue`). Al recuperar conexión, el motor de sincronización procesa cada acción con Supabase de manera idempotente (evitando duplicar oro, XP o misiones completadas accidentalmente).

---

## 🏃 Guía de Instalación y Ejecución Local

### Paso 1: Clonar el Repositorio
Clona este repositorio directamente en tu espacio de trabajo local:
```bash
git clone https://github.com/yole-shop-oficial/renacer-cronicas-otro-mundo.git
cd renacer-cronicas-otro-mundo
```

### Paso 2: Servir de forma Local
Como el juego utiliza módulos ESM (`import/export`) y Service Workers de PWA, el navegador requiere que se sirva sobre un protocolo `http/https` (no funciona abriendo el archivo `.html` directamente). Puedes servirlo con cualquier servidor estático ligero:

* **Con Node.js (Recomendado):**
  ```bash
  npm install -g serve
  serve .
  ```
* **Con Python:**
  ```bash
  python -o python3 -m http.server 8080
  ```
Abre la dirección `http://localhost:3000` o `http://localhost:8080` en tu navegador.

---

## 🗄️ Configuración de Supabase

Para conectar tu partida en la nube de Supabase, debes crear las siguientes tablas en el **SQL Editor** de tu panel de Supabase:

```sql
-- 1. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabla de Personajes
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    character_index INT NOT NULL,
    class_index INT NOT NULL,
    goddess_index INT NOT NULL,
    primary_stats JSONB NOT NULL,
    secondary_stats JSONB NOT NULL,
    skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla de Inventario de Objetos
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Habilitar Realtime para réplicas en caliente
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
```

### Configuración de Variables
Abre tu panel de Supabase, ve a **Project Settings ➔ API**, y copia las credenciales. Añádelas como variables globales en la cabecera de `index.html` o expónlas como variables de entorno de Vercel/Hosting:
* `NEXT_PUBLIC_SUPABASE_URL` = *(La URL de tu proyecto de Supabase)*
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` = *(La clave Anon de tu Supabase)*

---

## 📱 Cómo Probar el Modo Offline-First y PWA

1. **Instalación como PWA:** Abre la app en Chrome (Android/PC) o Safari (iPhone), haz clic en el botón de **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**. El juego se instalará y abrirá con una ventana auto-contenida sin barras de navegador.
2. **Prueba Offline:**
   * Entra al juego y crea tu personaje con Internet encendido.
   * Apaga tu WiFi o activa el **Modo Avión** en tu celular.
   * El indicador discreto de la esquina inferior cambiará automáticamente a: `🔴 Offline`.
   * **¡Sigue jugando!** Toma decisiones, equipa espadas, cura tus heridas espirituales. Todo se guardará y cifrará en tu IndexedDB local en segundo plano.
   * Enciende tu WiFi nuevamente. La app detectará la conexión recuperada, el indicador brillará como `🟠 Sincronizando` y enviará toda tu cola de decisiones a Supabase de manera secuencial, terminando con un check: `✓ Partida sincronizada correctamente.`

---

### 🍁 RENACER RESEARCH GROUP
*✨ Tu personaje no está siguiendo una historia. Está viviendo una. ✨*
