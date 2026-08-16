/**
 * 🗺️ WORLD REGIONS MAPS ENGINE
 * =============================
 * Definición modular de mapas y ubicaciones de exploración táctil.
 * 
 * FASE 14: Mundo
 */

export const INITIAL_REGIONS = [
  { id: 'start-village', name: 'Refugio de Eirene', desc: 'Una aldea tranquila, rodeada de praderas doradas. Custodiada por la Iglesia de la Paz.', unlocked: true, difficulty: 'Nivel 1' },
  { id: 'deep-forest', name: 'Bosque de las Hojas Susurrantes', desc: 'Un bosque espeso envuelto en una niebla plateada. Abundan las bestias salvajes y los materiales.', unlocked: true, difficulty: 'Nivel 3' },
  { id: 'imperial-city', name: 'Puerta de Tyche', desc: 'La gran capital del reino. Llena de comercios, palacios, intrigas y riquezas.', unlocked: false, difficulty: 'Nivel 5' },
  { id: 'ancient-ruins', name: 'Ruinas de Nemesis', desc: 'Templos derruidos donde los custodios de la balanza mística duermen custodiando artefactos.', unlocked: false, difficulty: 'Nivel 8' },
  { id: 'unknown-gate', name: 'Templo del Fin del Mundo', desc: 'Un portal dimensional sellado por las tres Diosas. Alberga el portal de regreso.', unlocked: false, difficulty: 'Nivel 12' }
];

// Desbloquea una región mística en el progreso del juego
export function unlockRegion(regionId, regionsState) {
  const updated = [...regionsState];
  const r = updated.find(reg => reg.id === regionId);
  if (r && !r.unlocked) {
    r.unlocked = true;
    return {
      updatedRegions: updated,
      message: `✓ ¡Has desbloqueado la región: **${r.name}**! Ya puedes viajar allí desde el mapa.`
    };
  }
  return { updatedRegions: regionsState, message: '' };
}

// Viajar a una nueva región y cambiar el estado del mapa
export function changeActiveRegion(regionId, regionsState) {
  const r = regionsState.find(reg => reg.id === regionId);
  if (!r) return { success: false, reason: 'Ubicación no mapeada.' };
  if (!r.unlocked) return { success: false, reason: 'Ubicación bloqueada por fuerzas místicas.' };

  return {
    success: true,
    activeRegionId: regionId,
    message: `✓ Has viajado con éxito a: **${r.name}**.`
  };
}
