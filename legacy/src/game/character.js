/**
 * 🧝 RPG CHARACTER CREATION & STATS MODELS
 * =========================================
 * Definiciones modulares de personajes iniciales, clases de combate y deidades (Diosas).
 * 
 * FASE 8: Creación de Personaje & FASE 14: Estadísticas
 */

// 8 Personajes Seleccionables Iniciales
export const INITIAL_CHARACTERS = [
  { id: 'char-1', name: 'Lyra', desc: 'Una joven solitaria en busca de respuestas.', str: 8, int: 14, agi: 10, vit: 9, luck: 12, will: 13, cha: 11, personality: 'Introvertida, analítica', talent: 'Foco Mental', history: 'Perdió a sus padres muy joven y ha vivido aislada en una cabaña del bosque, refugiada en libros antiguos.' },
  { id: 'char-2', name: 'Kael', desc: 'Un huérfano con una voluntad de hierro.', str: 14, int: 8, agi: 11, vit: 12, luck: 9, will: 14, cha: 9, personality: 'Valiente, tosco', talent: 'Piel de Acero', history: 'Creció en las calles de la aldea marginal, sobreviviendo con fuerza física y la promesa de un futuro mejor.' },
  { id: 'char-3', name: 'Aiden', desc: 'Un erudito errante con alma de artista.', str: 9, int: 15, agi: 9, vit: 10, luck: 11, will: 12, cha: 14, personality: 'Elocuente, curioso', talent: 'Lengua de Plata', history: 'Fue expulsado del Templo tras descubrir un manuscrito prohibido sobre la creación del mundo.' },
  { id: 'char-4', name: 'Sariel', desc: 'Una cazadora ágil con reflejos felinos.', str: 10, int: 11, agi: 15, vit: 9, luck: 13, will: 10, cha: 10, personality: 'Observadora, cautelosa', talent: 'Ojo de Águila', history: 'Pasó años rastreando bestias en los bosques profundos del norte de manera completamente aislada.' },
  { id: 'char-5', name: 'Elysia', desc: 'Hija de curanderos con un aura sanadora.', str: 7, int: 13, agi: 10, vit: 14, luck: 12, will: 15, cha: 12, personality: 'Compasiva, pacífica', talent: 'Manos de Luz', history: 'Vio morir a su familia de una plaga misteriosa que juró erradicar en su segunda vida.' },
  { id: 'char-6', name: 'Dorian', desc: 'Un proscrito astuto con un pasado oscuro.', str: 11, int: 10, agi: 14, vit: 8, luck: 15, will: 9, cha: 13, personality: 'Sarcástico, desconfiado', talent: 'Paso Silencioso', history: 'Escapó de la prisión del Reino tras ser traicionado por su propio gremio de mercenarios.' },
  { id: 'char-7', name: 'Rhea', desc: 'Una mística con conexión a planos etéreos.', str: 6, int: 16, agi: 9, vit: 9, luck: 14, will: 14, cha: 10, personality: 'Soñadora, mística', talent: 'Visión Astral', history: 'Desde pequeña escuchaba voces que le advertían de la inminente ruptura del portal interdimensional.' },
  { id: 'char-8', name: 'Bram', desc: 'Un guerrero rudo y protector indomable.', str: 15, int: 7, agi: 8, vit: 15, luck: 8, will: 13, cha: 8, personality: 'Leal, rudo', talent: 'Furia Temeraria', history: 'Defendió su puesto de avanzada militar en el páramo helado hasta que sus fuerzas se agotaron por completo.' }
];

// 8 Clases de Combate / Oficio Iniciales
export const CHARACTER_CLASSES = [
  { id: 'warrior', name: 'Guerrero', str_bonus: 3, vit_bonus: 2, will_bonus: 1, base_hp: 120, base_mp: 30, base_stamina: 100 },
  { id: 'knight', name: 'Caballero', str_bonus: 2, vit_bonus: 3, will_bonus: 2, base_hp: 140, base_mp: 20, base_stamina: 80 },
  { id: 'mage', name: 'Mago', int_bonus: 4, will_bonus: 2, base_hp: 70, base_mp: 120, base_stamina: 60 },
  { id: 'ranger', name: 'Arquero', agi_bonus: 4, luck_bonus: 2, base_hp: 90, base_mp: 50, base_stamina: 110 },
  { id: 'cleric', name: 'Sacerdote', int_bonus: 2, will_bonus: 4, base_hp: 85, base_mp: 90, base_stamina: 75 },
  { id: 'rogue', name: 'Pícaro', agi_bonus: 3, luck_bonus: 3, base_hp: 80, base_mp: 40, base_stamina: 120 },
  { id: 'summoner', name: 'Invocador', int_bonus: 3, will_bonus: 3, base_hp: 75, base_mp: 100, base_stamina: 70 },
  { id: 'adventurer', name: 'Aventurero', str_bonus: 1, int_bonus: 1, agi_bonus: 1, vit_bonus: 1, luck_bonus: 1, will_bonus: 1, base_hp: 95, base_mp: 60, base_stamina: 95 }
];

// Diosas Creadoras (Deidades de Renacimiento)
export const GODDESS_DEITIES = [
  { id: 'goddess-1', name: 'Eirene', personality: 'Serena, benevolente', philosophy: 'La armonía y el fluir de la vida a través del perdón.', blessing: 'Gracia Celestial', bonus: 'int+2, will+2', desc: 'Diosa de la Paz y la Sabiduría. Bendice a aquellos que eligen la persuasión y la curación por encima del conflicto.' },
  { id: 'goddess-2', name: 'Nemesis', personality: 'Estricta, justiciera', philosophy: 'El equilibrio universal se restaura mediante la acción.', blessing: 'Justicia Divina', bonus: 'str+2, vit+2', desc: 'Diosa de la Justicia Retributiva. Apoya a los guerreros implacables que defienden a los desvalidos y castigan a los corruptos.' },
  { id: 'goddess-3', name: 'Tyche', personality: 'Caprichosa, traviesa', philosophy: 'El azar y la intuición crean el sendero del destino.', blessing: 'Fortuna Caótica', bonus: 'agi+2, luck+3', desc: 'Diosa del Azar y del Destino. Protege a pícaros, exploradores y oportunistas que confían en su suerte y astucia.' }
];

// Calcula las estadísticas secundarias y completas del personaje unificado
export function calculateSecondaryStats(charBase, cls, god) {
  // Parsing Deity bonuses (e.g. 'int+2, will+2')
  const bonusMap = { str: 0, int: 0, agi: 0, vit: 0, luck: 0, will: 0, cha: 0 };
  if (god && god.bonus) {
    god.bonus.split(',').forEach(b => {
      const parts = b.trim().split('+');
      bonusMap[parts[0]] = parseInt(parts[1]) || 0;
    });
  }

  const str = charBase.str + (cls.str_bonus || 0) + bonusMap.str;
  const int = charBase.int + (cls.int_bonus || 0) + bonusMap.int;
  const agi = charBase.agi + (cls.agi_bonus || 0) + bonusMap.agi;
  const vit = charBase.vit + (cls.vit_bonus || 0) + bonusMap.vit;
  const luck = charBase.luck + (cls.luck_bonus || 0) + bonusMap.luck;
  const will = charBase.will + (cls.will_bonus || 0) + bonusMap.will;
  const cha = charBase.cha + (cls.cha_bonus || 0) + bonusMap.cha;

  // Secondary calculations
  const hp = cls.base_hp + vit * 12;
  const mp = cls.base_mp + int * 10;
  const stamina = cls.base_stamina + agi * 5;
  const attack = Math.round(str * 1.5 + agi * 0.8);
  const defense = Math.round(vit * 1.2 + str * 0.4);
  const critical = Math.round(luck * 0.5 + agi * 0.3);

  return {
    primary: { str, int, agi, vit, luck, will, cha },
    secondary: { hp, maxHp: hp, mp, maxMp: mp, stamina, maxStamina: stamina, attack, defense, critical }
  };
}
