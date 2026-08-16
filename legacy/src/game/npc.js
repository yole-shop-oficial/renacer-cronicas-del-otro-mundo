/**
 * 👥 NPC & RELATIONSHIP LEVEL ENGINE
 * ===================================
 * Maneja el estado, variables de memoria y niveles numéricos de relación (confianza, amistad, miedo).
 * 
 * FASE 13: NPC y relaciones
 */

export const INITIAL_NPCS = [
  { id: 'npc-aria', name: 'Aria', age: 19, personality: 'Dulce, tímida', history: 'Una sacerdotisa devota del templo de la Diosa Eirene. Custodia las escrituras sagradas.', trust: 30, friendship: 40, fear: 0, state: 'idle', memory: [] },
  { id: 'npc-valeria', name: 'Valeria', age: 26, personality: 'Severa, estricta', history: 'Capitana de la Guardia de la Aldea. Su lealtad a Nemesis es indomable.', trust: 15, friendship: 10, fear: 10, state: 'guarding', memory: [] },
  { id: 'npc-leo', name: 'Leo', age: 10, personality: 'Aventurero, travieso', history: 'Un huérfano alegre que sueña con convertirse en héroe.', trust: 45, friendship: 50, fear: 0, state: 'playing', memory: [] }
];

// Actualiza los niveles numéricos de relación y verifica hitos importantes
export function modifyRelationship(npc, field, delta) {
  if (npc[field] === undefined) return npc;

  // Ajustar límites de las relaciones (entre 0 y 100)
  npc[field] = Math.max(0, Math.min(100, npc[field] + delta));
  
  let milestoneMessage = '';

  // Verificar hitos de confianza/amistad
  if (field === 'trust') {
    if (npc.trust >= 75 && !npc.memory.includes('trusted_friend')) {
      npc.memory.push('trusted_friend');
      milestoneMessage = `✓ ¡Has alcanzado el hito de Confianza Mayor con **${npc.name}**! Te revelará secretos íntimos.`;
    } else if (npc.trust < 20 && !npc.memory.includes('distrusted_enemy')) {
      npc.memory.push('distrusted_enemy');
      milestoneMessage = `⚠️ Advertencia: **${npc.name}** desconfía profundamente de ti. Se negará a cooperar.`;
    }
  }

  if (field === 'fear') {
    if (npc.fear >= 60 && !npc.memory.includes('terrified')) {
      npc.memory.push('terrified');
      milestoneMessage = `✓ **${npc.name}** te tiene un profundo terror. Obedecerá tus órdenes por miedo.`;
    }
  }

  return {
    updatedNpc: npc,
    message: milestoneMessage
  };
}

// Guarda un recuerdo en la memoria episódica del NPC
export function recordNpcMemory(npc, memoryKey, details) {
  if (!npc.memory.includes(memoryKey)) {
    npc.memory.push(memoryKey);
    return {
      updatedNpc: npc,
      message: `✓ **${npc.name}** recordará esto: "${details}"`
    };
  }
  return { updatedNpc: npc, message: '' };
}
