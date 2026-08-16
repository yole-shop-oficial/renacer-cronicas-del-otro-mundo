/**
 * 🎒 INVENTORY AND ITEMS MODEL ENGINE
 * =====================================
 * Estructuras de datos para objetos, armas, pócimas y consumibles con efectos matemáticos.
 * 
 * FASE 11: Inventario
 */

export const ITEMS_CATALOG = [
  { id: 'sword-1', name: 'Espada Corta de Lino', desc: 'Una espada básica pero ligera, ideal para guerreros veloces.', category: 'weapons', stat_bonus: { attack: 12 }, unique: false },
  { id: 'staff-1', name: 'Bastón de Éter Cristalino', desc: 'Canaliza y potencia la energía del maná ambiente en un 20%.', category: 'weapons', stat_bonus: { attack: 5, maxMp: 25 }, unique: false },
  { id: 'armor-1', name: 'Pechera de Acero Templado', desc: 'Armadura pesada de los caballeros imperiales de Tyche.', category: 'armors', stat_bonus: { defense: 18 }, unique: false },
  { id: 'robe-1', name: 'Túnica de Hilo de Seda Mística', desc: 'Túnica impregnada de éter que protege contra ataques mágicos.', category: 'armors', stat_bonus: { defense: 6, maxMp: 15 }, unique: false },
  { id: 'potion-hp', name: 'Poción de Vida Mayor', desc: 'Una ampolla de vidrio rellena con líquido carmesí efervescente.', category: 'consumibles', heal_hp: 45, unique: false },
  { id: 'potion-mp', name: 'Elíxir de Éter Concentrado', desc: 'Un brebaje azul místico que restaura las reservas de Maná.', category: 'consumibles', restore_mp: 40, unique: false },
  { id: 'key-temple', name: 'Llave de Bronce del Templo', desc: 'Una llave antigua grabada con la marca de la Diosa Eirene.', category: 'quest', unique: true }
];

// Añade un objeto al inventario del jugador
export function addItemToInventory(inventory, itemId) {
  const item = ITEMS_CATALOG.find(i => i.id === itemId);
  if (!item) return inventory;

  const updated = [...inventory];
  const existing = updated.find(i => i.id === itemId);

  if (existing && !item.unique) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    updated.push({ ...item, quantity: 1 });
  }

  return updated;
}

// Remueve o reduce la cantidad de un objeto del inventario
export function removeItemFromInventory(inventory, itemId) {
  const updated = [...inventory];
  const idx = updated.findIndex(i => i.id === itemId);

  if (idx >= 0) {
    if (updated[idx].quantity > 1) {
      updated[idx].quantity -= 1;
    } else {
      updated.splice(idx, 1);
    }
  }

  return updated;
}

// Utiliza un objeto consumible y aplica su beneficio sobre las estadísticas de combate
export function useConsumableItem(itemId, characterStats) {
  const item = ITEMS_CATALOG.find(i => i.id === itemId);
  if (!item || item.category !== 'consumibles') {
    return { success: false, reason: 'El objeto no es consumible.' };
  }

  const sStats = characterStats.secondary;

  if (item.heal_hp) {
    sStats.hp = Math.min(sStats.maxHp, sStats.hp + item.heal_hp);
  }
  
  if (item.restore_mp) {
    sStats.mp = Math.min(sStats.maxMp, sStats.mp + item.restore_mp);
  }

  return {
    success: true,
    message: `Consumiste **${item.name}** con éxito.`,
    updatedStats: characterStats
  };
}
