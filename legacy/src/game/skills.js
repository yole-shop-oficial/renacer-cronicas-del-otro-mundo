/**
 * 🔮 SKILLS DATABASE & SYSTEM RULE ENGINE
 * ========================================
 * Definición modular de habilidades mágicas, sociales y físicas con validadores de costos.
 * 
 * FASE 12: Habilidades
 */

export const SKILLS_DATABASE = [
  { id: 'analyze', name: 'Analizar', desc: 'Permite inspeccionar criaturas, bloques de órdenes e identificar debilidades secretas.', type: 'intelligence', cost_mp: 5, cost_stamina: 0, req: { int: 10 }, effect: 'Revela información oculta y desbloquea opciones de diálogo analíticas.' },
  { id: 'persuade', name: 'Persuasión', desc: 'Utiliza la elocuencia y el carisma para convencer a NPCs sin recurrir a la violencia.', type: 'charisma', cost_mp: 0, cost_stamina: 10, req: { cha: 11 }, effect: 'Desbloquea opciones de diálogo persuasivas que aumentan la confianza del interlocutor.' },
  { id: 'intimidate', name: 'Intimidación', desc: 'Usa la fuerza física o voluntad imponente para forzar a NPCs o rivales.', type: 'strength', cost_mp: 0, cost_stamina: 15, req: { str: 12 }, effect: 'Desbloquea opciones de diálogo coercitivas. Puede aumentar el miedo o romper la confianza.' },
  { id: 'heal', name: 'Curación', desc: 'Canaliza luz divina para curar heridas y recuperar puntos de vida (HP).', type: 'will', cost_mp: 15, cost_stamina: 0, req: { will: 12 }, effect: 'Recupera 50 puntos de HP del personaje.' },
  { id: 'fireball', name: 'Bola de Fuego', desc: 'Lanza una densa esfera de llamas incandescentes para causar daño elemental.', type: 'intelligence', cost_mp: 20, cost_stamina: 0, req: { int: 13 }, effect: 'Causa 45 de daño mágico en encuentros narrativos.' },
  { id: 'stealth', name: 'Sigilo', desc: 'Moverse en silencio absoluto para evitar el combate u obtener ventajas en emboscadas.', type: 'agility', cost_mp: 0, cost_stamina: 15, req: { agi: 12 }, effect: 'Desbloquea opciones de infiltración sigilosas.' },
  { id: 'detect_magic', name: 'Detectar Magia', desc: 'Siente las corrientes de maná circundantes para localizar tesoros ocultos o trampas.', type: 'intelligence', cost_mp: 8, cost_stamina: 0, req: { int: 11 }, effect: 'Localiza flujos de magia y objetos ocultos.' },
  { id: 'summon', name: 'Invocación', desc: 'Invoca un espíritu guardián del éter para asistir en batallas o exploraciones.', type: 'will', cost_mp: 25, cost_stamina: 0, req: { will: 13 }, effect: 'Llama a un espíritu protector para que absorba el próximo impacto de daño.' }
];

// Valida si el personaje cumple con los requisitos y tiene recursos para usar la habilidad
export function canCast(skill, characterStats) {
  const pStats = characterStats.primary;
  const sStats = characterStats.secondary;

  // 1. Verificar requisitos de atributos primarios
  if (skill.req) {
    for (const [stat, reqVal] of Object.entries(skill.req)) {
      if ((pStats[stat] || 0) < reqVal) {
        return { valid: false, reason: `Se requiere ${stat.toUpperCase()} de nivel ${reqVal} (Tienes ${pStats[stat] || 0}).` };
      }
    }
  }

  // 2. Verificar recursos secundarios (MP / Stamina)
  if (skill.cost_mp > 0 && sStats.mp < skill.cost_mp) {
    return { valid: false, reason: `Puntos de Maná (MP) insuficientes (Coste: ${skill.cost_mp} MP, Tienes: ${sStats.mp} MP).` };
  }

  if (skill.cost_stamina > 0 && sStats.stamina < skill.cost_stamina) {
    return { valid: false, reason: `Estamina insuficiente (Coste: ${skill.cost_stamina} Stamina, Tienes: ${sStats.stamina} Stamina).` };
  }

  return { valid: true };
}

// Ejecuta el uso de una habilidad y reduce los recursos correspondientes
export function useSkill(skill, characterStats) {
  const check = canCast(skill, characterStats);
  if (!check.valid) return { success: false, reason: check.reason };

  // Reducir recursos
  if (skill.cost_mp > 0) characterStats.secondary.mp -= skill.cost_mp;
  if (skill.cost_stamina > 0) characterStats.secondary.stamina -= skill.cost_stamina;

  // Aplicar efecto de curación si es el caso
  if (skill.id === 'heal') {
    const healAmount = 50;
    characterStats.secondary.hp = Math.min(
      characterStats.secondary.maxHp,
      characterStats.secondary.hp + healAmount
    );
  }

  return {
    success: true,
    message: `¡Usaste la habilidad: **${skill.name}**! ${skill.effect}`,
    updatedStats: characterStats
  };
}
