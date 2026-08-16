/**
 * 🛰️ ONBOARDING & SIGNUP/SIGNIN VIEWCONTROLLER
 * ============================================
 * Maneja las interfaces de inicio de sesión, registro offline-first, creación de personaje y selección divina.
 * 
 * FASE 3: Autenticación & FASE 8: Creación de Personaje
 */

import { INITIAL_CHARACTERS, CHARACTER_CLASSES, GODDESS_DEITIES, calculateSecondaryStats } from '../game/character.js';

// Renderiza la pantalla inicial de bienvenida/login
export function renderWelcomeScreen(onAction) {
  const root = document.getElementById('onboarding-root');
  if (!root) return;

  root.innerHTML = `
    <div class="max-w-md w-full p-6 text-center space-y-6 animate-fadeIn">
      <div class="relative w-24 h-24 mx-auto bg-stone-900 border-2 border-purple-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-purple-500/10">
        📖
      </div>
      
      <div class="space-y-1.5">
        <h1 class="text-2xl font-black tracking-widest uppercase font-mono text-[#06b6d4]">RENACER</h1>
        <p class="text-[9px] font-bold text-purple-400 tracking-[0.25em] uppercase font-mono">Crónicas del Otro Mundo</p>
      </div>

      <p class="text-xs text-stone-400 leading-relaxed font-medium">
        Un libro de fantasía interactivo, aventura RPG narrativa y mundo persistente Local-First.
      </p>

      <div class="space-y-2.5 pt-4">
        <button id="btn-goto-signin" class="magic-button w-full py-3.5 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98]">
          Iniciar Sesión
        </button>
        <button id="btn-goto-signup" class="magic-button w-full py-3.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98]">
          Crear Cuenta Nueva
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-goto-signin')?.addEventListener('click', () => onAction('signin_view'));
  document.getElementById('btn-goto-signup')?.addEventListener('click', () => onAction('signup_view'));
}

// Pantalla para creación de cuenta (Sign Up)
export function renderSignUpScreen(onSubmit, onBack) {
  const root = document.getElementById('onboarding-root');
  if (!root) return;

  root.innerHTML = `
    <div class="max-w-md w-full p-6 space-y-5 animate-fadeIn">
      <div class="flex items-center gap-3">
        <button id="btn-back" class="p-2 rounded-xl bg-stone-900 border border-stone-850 text-stone-400 hover:text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
        <div>
          <h2 class="text-md font-black uppercase tracking-wider text-[#06b6d4]">Crear Cuenta</h2>
          <p class="text-[8px] text-stone-500 font-bold uppercase tracking-widest font-mono">Registro en Supabase</p>
        </div>
      </div>

      <form id="signup-form" class="space-y-4 pt-2">
        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500 pl-1 font-mono">Correo Electrónico</label>
          <input type="email" id="email" required class="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-900 text-xs font-bold text-white focus:outline-none focus:border-purple-500" />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500 pl-1 font-mono">Contraseña de Partida</label>
          <input type="password" id="password" required class="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-900 text-xs font-bold text-white focus:outline-none focus:border-purple-500" />
        </div>
        
        <p class="text-[9px] text-stone-500 leading-normal font-medium font-sans">
          ✓ Se requiere conexión a Internet para el registro inicial. Tus partidas se cifrarán localmente usando tu contraseña.
        </p>

        <button type="submit" class="magic-button w-full py-3.5 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-transform">
          Crear Cuenta & Renacer
        </button>
      </form>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', onBack);
  document.getElementById('signup-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    onSubmit(email, password);
  });
}

// Pantalla para inicio de sesión (Sign In)
export function renderSignInScreen(onSubmit, onBack) {
  const root = document.getElementById('onboarding-root');
  if (!root) return;

  root.innerHTML = `
    <div class="max-w-md w-full p-6 space-y-5 animate-fadeIn">
      <div class="flex items-center gap-3">
        <button id="btn-back" class="p-2 rounded-xl bg-stone-900 border border-stone-855 text-stone-400 hover:text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
        <div>
          <h2 class="text-md font-black uppercase tracking-wider text-[#06b6d4]">Iniciar Sesión</h2>
          <p class="text-[8px] text-stone-500 font-bold uppercase tracking-widest font-mono">Soporte Offline</p>
        </div>
      </div>

      <form id="signin-form" class="space-y-4 pt-2">
        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500 pl-1 font-mono">Correo Electrónico</label>
          <input type="email" id="email" required class="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-900 text-xs font-bold text-white focus:outline-none" />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500 pl-1 font-mono">Contraseña</label>
          <input type="password" id="password" required class="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-900 text-xs font-bold text-white focus:outline-none" />
        </div>

        <button type="submit" class="magic-button w-full py-3.5 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white font-black text-xs uppercase tracking-widest">
          Iniciar Inferencia
        </button>
      </form>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', onBack);
  document.getElementById('signin-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    onSubmit(email, password);
  });
}

// Pantalla interactiva del Creador de Personaje (Fase 8)
export function renderCharacterCreator(onComplete) {
  const root = document.getElementById('onboarding-root');
  if (!root) return;

  let selectedCharIdx = 0;
  let selectedClassIdx = 0;
  let selectedGoddessIdx = 0;

  function redraw() {
    const char = INITIAL_CHARACTERS[selectedCharIdx];
    const cls = CHARACTER_CLASSES[selectedClassIdx];
    const god = GODDESS_DEITIES[selectedGoddessIdx];
    const statsObj = calculateSecondaryStats(char, cls, god);

    root.innerHTML = `
      <div class="max-w-md w-full p-6 space-y-6 scrollable-y h-full animate-fadeIn pb-12 font-sans">
        <div class="text-center space-y-1">
          <h2 class="text-md font-black uppercase tracking-wider text-purple-400 font-mono">Creación de Personaje</h2>
          <p class="text-[8px] text-stone-500 font-bold uppercase tracking-widest font-mono">Renacerás con tu decisión</p>
        </div>

        {/* 1. Seleccionar Personaje */}
        <div class="space-y-3.5">
          <label class="text-[10px] font-black uppercase tracking-wider text-stone-400 font-mono">1. Selecciona tu Personaje Inicial</label>
          <div class="flex gap-2 justify-center">
            ${INITIAL_CHARACTERS.map((c, i) => `
              <button onclick="window.setCreatorValue('char', ${i})" class="w-11 h-11 rounded-xl bg-stone-900 text-lg flex items-center justify-center border transition-all ${
                selectedCharIdx === i ? 'border-[#06b6d4] scale-105' : 'border-stone-850'
              }">${c.name[0]}</button>
            `).join('')}
          </div>
          <div class="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-900 space-y-1">
            <h4 class="font-extrabold text-white text-xs">${char.name}</h4>
            <p class="text-[10px] text-stone-400 leading-normal font-medium">${char.desc}</p>
            <p class="text-[9px] text-stone-500 font-semibold italic">Talento: "${char.talent}"</p>
          </div>
        </div>

        {/* 2. Seleccionar Clase */}
        <div class="space-y-3">
          <label class="text-[10px] font-black uppercase tracking-wider text-stone-400 font-mono">2. Selecciona tu Oficio/Clase</label>
          <div class="grid grid-cols-4 gap-2">
            ${CHARACTER_CLASSES.map((c, i) => `
              <button onclick="window.setCreatorValue('class', ${i})" class="py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                selectedClassIdx === i ? 'bg-[#06b6d4] text-black border-transparent' : 'bg-stone-900 border-stone-850 text-stone-400'
              }">${c.name}</button>
            `).join('')}
          </div>
        </div>

        {/* 3. Seleccionar Diosa */}
        <div class="space-y-3">
          <label class="text-[10px] font-black uppercase tracking-wider text-stone-400 font-mono">3. Selecciona tu Diosa Patrona</label>
          <div class="grid grid-cols-3 gap-2">
            ${GODDESS_DEITIES.map((g, i) => `
              <button onclick="window.setCreatorValue('goddess', ${i})" class="py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                selectedGoddessIdx === i ? 'bg-[#a855f7] text-white border-transparent' : 'bg-stone-900 border-stone-850 text-stone-400'
              }">${g.name}</button>
            `).join('')}
          </div>
          <div class="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-900 space-y-1">
            <h4 class="font-extrabold text-white text-xs">Diosa ${god.name}</h4>
            <p class="text-[10px] text-stone-400 leading-normal font-medium">${god.desc}</p>
            <p class="text-[9px] text-[#06b6d4] font-bold uppercase font-mono">Bendición: ${god.blessing} (${god.bonus})</p>
          </div>
        </div>

        {/* 4. Resumen de Estadísticas Derivadas */}
        <div class="p-4 bg-stone-950/90 rounded-[22px] border border-stone-900 space-y-2.5 font-mono text-[9px] font-bold uppercase tracking-wider">
          <h4 class="text-[10px] font-black text-purple-400">Atributos del Despertar</h4>
          <div class="grid grid-cols-2 gap-2 text-stone-300">
            <div>Fuerza (STR): <span class="text-white">${statsObj.primary.str}</span></div>
            <div>Inteligencia (INT): <span class="text-white">${statsObj.primary.int}</span></div>
            <div>HP Máximo: <span class="text-emerald-400">${statsObj.secondary.maxHp} HP</span></div>
            <div>MP Máximo: <span class="text-cyan-400">${statsObj.secondary.maxMp} MP</span></div>
          </div>
        </div>

        <button id="btn-creator-complete" class="w-full py-3.5 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white font-black text-xs uppercase tracking-widest shadow">
          Confirmar & Renacer en el Otro Mundo
        </button>
      </div>
    `;

    document.getElementById('btn-creator-complete')?.addEventListener('click', () => {
      onComplete({
        characterIndex: selectedCharIdx,
        classIndex: selectedClassIdx,
        goddessIndex: selectedGoddessIdx,
        stats: statsObj,
        characterName: char.name
      });
    });
  }

  // Vincular clics de selección a variables globales
  window.setCreatorValue = (type, val) => {
    if (type === 'char') selectedCharIdx = val;
    if (type === 'class') selectedClassIdx = val;
    if (type === 'goddess') selectedGoddessIdx = val;
    redraw();
  };

  redraw();
}
