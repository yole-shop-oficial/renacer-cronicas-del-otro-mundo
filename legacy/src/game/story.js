/**
 * 📖 ADVANCED NARRATIVE ENGINE
 * =============================
 * Motor de decisiones, diálogos, condiciones y consecuencias que mueven la historia de Renacer.
 * 
 * FASE 9: Motor narrativo & FASE 10: Historia inicial
 */

export const STORY_NODES = {
  // --- CAPÍTULO I: EL FINAL ---
  'intro-1': {
    chapter: 'CAPÍTULO I',
    title: 'EL FINAL',
    text: 'El viento golpeaba la ventana de tu habitación vacía. Miras el espejo roto. Has perdido a tus padres, tus posesiones han sido embargadas por el reino y estás completamente aislada en este mundo sin rumbo... Sientes que tu vieja vida ha terminado.',
    type: 'narrator',
    choices: [
      { text: 'Aceptar el final del camino y cerrar los ojos...', nextNode: 'intro-2' },
      { text: 'Buscar consuelo orando bajo la luz de la luna...', nextNode: 'intro-eirene' }
    ]
  },
  
  'intro-2': {
    chapter: 'CAPÍTULO I',
    title: 'EL VACÍO',
    text: 'Cierras los ojos, lista para dejar que el frío te consuma. De repente, la realidad se distorsiona. Una luz mística invade tu mente. El suelo desaparece y te encuentras flotando en un plano etéreo lleno de estrellas.',
    type: 'narrator',
    choices: [
      { text: 'Avanzar hacia la luz resplandeciente...', nextNode: 'goddess-meet' }
    ]
  },

  'intro-eirene': {
    chapter: 'CAPÍTULO I',
    title: 'UNA ORACIÓN EN LA NOCHE',
    text: 'Te arrodillas y oras con fervor místico por tus padres ausentes. Al hacerlo, el maná de la habitación vibra. Una cálida sensación de paz invade tu cuerpo místico y las corrientes estelares te absorben hacia un plano celestial.',
    type: 'narrator',
    choices: [
      { text: 'Avanzar hacia el plano divino...', nextNode: 'goddess-meet' }
    ]
  },

  'goddess-meet': {
    chapter: 'CAPÍTULO I',
    title: 'EL RENACIMIENTO',
    text: 'Ante ti se materializa una Diosa mística de inmensurable esplendor. Te mira con compasión y te dice: "Tu antigua vida ha terminado, alma herida. Pero el cosmos te concede una segunda oportunidad. Renacerás en un nuevo mundo llamado Ludus. Pero recuerda: allí, el destino no está escrito. Tus decisiones crearán la historia."',
    type: 'dialogue',
    npc: 'Diosa',
    choices: [
      { text: 'Aceptar el pacto divino y renacer...', nextNode: 'village-arrival' }
    ]
  },

  // --- CAPÍTULO II: EL RENACER ---
  'village-arrival': {
    chapter: 'CAPÍTULO II',
    title: 'EL REFUGIO DE EIRENE',
    text: 'Despiertas sobre un lecho de praderas doradas en las afueras del Refugio de Eirene. El cielo tiene dos lunas y las plantas brillan con un sutil maná azul. A lo lejos, una imponente capitana de la guardia patrulla los alrededores.',
    type: 'narrator',
    choices: [
      { 
        text: 'Analizar la corriente de maná del bosque cercano...', 
        nextNode: 'forest-creature',
        req: { skills: ['analyze'] } // Requiere la habilidad Analizar!
      },
      { 
        text: 'Acercarte amigablemente a la capitana de la guardia...', 
        nextNode: 'valeria-meet' 
      },
      { 
        text: 'Inspeccionar el templo de piedra de la Diosa Eirene...', 
        nextNode: 'temple-inspect',
        req: { items: ['key-temple'] } // Requiere poseer el objeto de la llave del Templo!
      }
    ]
  },

  'valeria-meet': {
    chapter: 'CAPÍTULO II',
    title: 'VALERIA, LA CAPITANA',
    text: 'Te acercas a Valeria. Ella coloca la mano sobre la empuñadura de su espada de acero. "¡Alto ahí, extraña! Identifícate. El bosque de las Hojas Susurrantes está infestado de bestias salvajes y no toleramos forasteros sospechosos."',
    type: 'dialogue',
    npc: 'npc-valeria',
    choices: [
      { 
        text: 'Persuadir a Valeria explicándole tu místico despertar...', 
        nextNode: 'valeria-friendly',
        req: { stats: { cha: 11 } } // Requiere Carisma >= 11
      },
      { 
        text: 'Responder de forma desafiante y con autoridad...', 
        nextNode: 'valeria-fight',
        req: { stats: { str: 12 } } // Requiere Fuerza >= 12
      },
      { 
        text: 'Dar media vuelta y retirarte hacia el bosque...', 
        nextNode: 'forest-creature' 
      }
    ]
  },

  'valeria-friendly': {
    chapter: 'CAPÍTULO II',
    title: 'LA CONFIANZA DE VALERIA',
    text: 'Tus dulces y elocuentes palabras calman la tensión de Valeria. Retira la mano de su espada. "Ya veo... eres una viajera mística bendecida. Disculpa mi rudeza. Ten, necesitas protección para el bosque. Toma esta espada corta de lino."',
    type: 'dialogue',
    npc: 'npc-valeria',
    rewards: { items: ['sword-1'], relations: { 'npc-valeria': { field: 'trust', val: 20 } } },
    choices: [
      { text: 'Agradecer la espada y explorar el bosque de las Hojas Susurrantes...', nextNode: 'forest-creature' }
    ]
  },

  'valeria-fight': {
    chapter: 'CAPÍTULO II',
    title: 'UN CHOQUE DE VOLUNTADES',
    text: 'Valeria se sorprende de tu imponente autoridad física. Su mirada se endurece. "Tienes agallas, extraña. Pero aquí la ley impera por la fuerza de Nemesis."',
    type: 'dialogue',
    npc: 'npc-valeria',
    rewards: { relations: { 'npc-valeria': { field: 'fear', val: 30 } } },
    choices: [
      { text: 'Avanzar firmemente hacia el bosque místico...', nextNode: 'forest-creature' }
    ]
  },

  'forest-creature': {
    chapter: 'CAPÍTULO II',
    title: 'LA CRIATURA DEL BOSQUE',
    text: 'Al internarte en el bosque de las Hojas Susurrantes, una criatura felina con pelaje de cristal y colmillos de éter salta de las ramas. Gruñe imponentemente mirándote directo a los ojos.',
    type: 'encounter',
    choices: [
      { 
        text: 'Analizar criatura en busca de debilidades de maná...', 
        nextNode: 'creature-weakness',
        req: { stats: { int: 11 } } // Requiere Inteligencia >= 11
      },
      { 
        text: 'Atacar a la criatura de frente...', 
        nextNode: 'creature-combat' 
      },
      { 
        text: 'Curar heridas espirituales de la criatura...', 
        nextNode: 'creature-tame',
        req: { skills: ['heal'] } // Requiere la habilidad Curación!
      }
    ]
  },

  'creature-weakness': {
    chapter: 'CAPÍTULO II',
    title: 'EL SECRETO DEL CRISTAL',
    text: 'Tu inteligencia te permite analizar los flujos de maná de la criatura. Descubres que su punto débil es el cristal en su pecho. Te es fácil asustarla canalizando un haz de luz mística.',
    type: 'narrator',
    rewards: { xp: 50 },
    choices: [
      { text: 'Regresar victoriosa a la aldea con el maná purificado...', nextNode: 'village-arrival' }
    ]
  },

  'creature-combat': {
    chapter: 'CAPÍTULO II',
    title: 'UNA BATALLA DE ELEMENTOS',
    text: 'La criatura te ataca y te muerde el brazo, causándote daño espiritual. Sin embargo, logras golpearla con tus fuerzas y la asustas, forzándola a huir hacia el este.',
    type: 'narrator',
    damage: 30, // Causa daño de HP al personaje!
    rewards: { xp: 30 },
    choices: [
      { text: 'Curar tus heridas y volver a la aldea...', nextNode: 'village-arrival' }
    ]
  },

  'creature-tame': {
    chapter: 'CAPÍTULO II',
    title: 'EL ESPÍRITU AMIGO',
    text: 'Utilizas tu habilidad de Curación para sanar las grietas del cristal del felino. Su maná salvaje se calma y ronronea mansamente. En agradecimiento, te entrega una antigua llave de bronce grabada del suelo.',
    type: 'narrator',
    rewards: { items: ['key-temple'], xp: 60 },
    choices: [
      { text: 'Aceptar la mística llave y regresar victoriosa a la aldea...', nextNode: 'village-arrival' }
    ]
  },

  'temple-inspect': {
    chapter: 'CAPÍTULO II',
    title: 'EL INTERIOR DEL TEMPLO',
    text: 'Introduces la llave de bronce de la Diosa Eirene en la gran puerta de piedra del Templo de Luz. La puerta gira silenciosamente revelando un altar secreto brillante con el Bastón de Éter Cristalino.',
    type: 'narrator',
    rewards: { items: ['staff-1'] },
    choices: [
      { text: 'Tomar el bastón del éter y continuar tu camino del otro mundo...', nextNode: 'village-arrival' }
    ]
  }
};

// Verifica las condiciones de un nodo de historia según las estadísticas, habilidades e inventario del personaje
export function evaluateChoiceRequirements(choice, characterStats, inventory) {
  if (!choice.req) return { valid: true };

  const req = choice.req;
  const pStats = characterStats.primary;

  // 1. Verificar atributos mínimos
  if (req.stats) {
    for (const [stat, reqVal] of Object.entries(req.stats)) {
      if ((pStats[stat] || 0) < reqVal) {
        return { valid: false, reason: `Requiere ${stat.toUpperCase()} >= ${reqVal}` };
      }
    }
  }

  // 2. Verificar habilidades aprendidas
  if (req.skills) {
    const learnedSkills = characterStats.skills || [];
    for (const skillId of req.skills) {
      if (!learnedSkills.includes(skillId)) {
        return { valid: false, reason: `Requiere habilidad aprendida` };
      }
    }
  }

  // 3. Verificar objetos poseídos
  if (req.items) {
    for (const itemId of req.items) {
      const hasItem = inventory.some(item => item.id === itemId && item.quantity > 0);
      if (!hasItem) {
        return { valid: false, reason: `Requiere objeto en inventario` };
      }
    }
  }

  return { valid: true };
}
