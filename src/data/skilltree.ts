import type { PrimaryStat } from '@/domain/types';

/**
 * ÁRBOL DE HABILIDADES POR CLASE.
 * Cada clase tiene 3 ramas × 3 niveles. Un nodo requiere:
 * nivel de personaje, puntos de habilidad y (a veces) el nodo anterior.
 * Data-driven: añadir nodos no toca el motor.
 */

export interface SkillTreeNode {
  id: string;
  classId: string;
  branch: string;
  tier: 1 | 2 | 3;
  requiresNode?: string;
  requiredLevel: number;
  cost: number; // puntos de habilidad
  /** Bonificación pasiva de stats al aprenderlo. */
  statBonus?: Partial<Record<PrimaryStat, number>>;
  /** Habilidad activa que desbloquea (usable en la narrativa). */
  unlocksSkill?: string;
}

function tree(classId: string, branches: Record<string, [SkillTreeNodeSpec, SkillTreeNodeSpec, SkillTreeNodeSpec]>): SkillTreeNode[] {
  const nodes: SkillTreeNode[] = [];
  for (const [branch, tiers] of Object.entries(branches)) {
    tiers.forEach((spec, i) => {
      const tier = (i + 1) as 1 | 2 | 3;
      const id = `${classId}_${branch}_${tier}`;
      nodes.push({
        id,
        classId,
        branch,
        tier,
        requiresNode: tier > 1 ? `${classId}_${branch}_${tier - 1}` : undefined,
        requiredLevel: tier === 1 ? 2 : tier === 2 ? 4 : 7,
        cost: tier,
        ...spec
      });
    });
  }
  return nodes;
}

type SkillTreeNodeSpec = Pick<SkillTreeNode, 'statBonus' | 'unlocksSkill'>;

export const SKILL_TREE: SkillTreeNode[] = [
  ...tree('warrior', {
    fuerza: [
      { statBonus: { strength: 2 } },
      { statBonus: { strength: 3 }, unlocksSkill: 'war_cry' },
      { statBonus: { strength: 5 }, unlocksSkill: 'berserk' }
    ],
    resistencia: [
      { statBonus: { vitality: 2 } },
      { statBonus: { vitality: 3 } },
      { statBonus: { vitality: 5 }, unlocksSkill: 'iron_will' }
    ],
    tecnica: [
      { statBonus: { agility: 2 } },
      { statBonus: { agility: 2, strength: 1 }, unlocksSkill: 'disarm' },
      { statBonus: { agility: 3, luck: 2 } }
    ]
  }),
  ...tree('knight', {
    baluarte: [
      { statBonus: { vitality: 2 } },
      { statBonus: { vitality: 3 }, unlocksSkill: 'guardian_oath' },
      { statBonus: { vitality: 5 }, unlocksSkill: 'aegis' }
    ],
    honor: [
      { statBonus: { willpower: 2 } },
      { statBonus: { willpower: 3, charisma: 1 } },
      { statBonus: { willpower: 4, charisma: 2 }, unlocksSkill: 'rally' }
    ],
    acero: [
      { statBonus: { strength: 2 } },
      { statBonus: { strength: 3 }, unlocksSkill: 'shield_bash' },
      { statBonus: { strength: 4, vitality: 2 } }
    ]
  }),
  ...tree('mage', {
    arcano: [
      { statBonus: { intelligence: 2 } },
      { statBonus: { intelligence: 3 }, unlocksSkill: 'arcane_missile' },
      { statBonus: { intelligence: 5 }, unlocksSkill: 'meteor' }
    ],
    mente: [
      { statBonus: { willpower: 2 } },
      { statBonus: { willpower: 3 }, unlocksSkill: 'clarity' },
      { statBonus: { willpower: 4, intelligence: 2 } }
    ],
    velo: [
      { statBonus: { luck: 2 } },
      { statBonus: { intelligence: 2, luck: 1 }, unlocksSkill: 'veil_sight' },
      { statBonus: { intelligence: 3, luck: 3 } }
    ]
  }),
  ...tree('archer', {
    punteria: [
      { statBonus: { agility: 2 } },
      { statBonus: { agility: 3 }, unlocksSkill: 'double_shot' },
      { statBonus: { agility: 5 }, unlocksSkill: 'eagle_eye' }
    ],
    instinto: [
      { statBonus: { luck: 2 } },
      { statBonus: { luck: 3 } },
      { statBonus: { luck: 4, agility: 2 }, unlocksSkill: 'hunters_mark' }
    ],
    campo: [
      { statBonus: { vitality: 2 } },
      { statBonus: { vitality: 2, agility: 1 }, unlocksSkill: 'trap_sense' },
      { statBonus: { vitality: 3, strength: 2 } }
    ]
  }),
  ...tree('priest', {
    luz: [
      { statBonus: { willpower: 2 } },
      { statBonus: { willpower: 3 }, unlocksSkill: 'greater_heal' },
      { statBonus: { willpower: 5 }, unlocksSkill: 'sanctuary' }
    ],
    fe: [
      { statBonus: { charisma: 2 } },
      { statBonus: { charisma: 3 }, unlocksSkill: 'blessing' },
      { statBonus: { charisma: 4, willpower: 2 } }
    ],
    verdad: [
      { statBonus: { intelligence: 2 } },
      { statBonus: { intelligence: 2, willpower: 1 }, unlocksSkill: 'reveal_lie' },
      { statBonus: { intelligence: 3, charisma: 3 } }
    ]
  }),
  ...tree('rogue', {
    sombra: [
      { statBonus: { agility: 2 } },
      { statBonus: { agility: 3 }, unlocksSkill: 'vanish' },
      { statBonus: { agility: 5 }, unlocksSkill: 'shadow_strike' }
    ],
    astucia: [
      { statBonus: { luck: 2 } },
      { statBonus: { luck: 2, charisma: 1 }, unlocksSkill: 'pickpocket' },
      { statBonus: { luck: 4, charisma: 2 } }
    ],
    filo: [
      { statBonus: { strength: 1, agility: 1 } },
      { statBonus: { strength: 2, agility: 1 }, unlocksSkill: 'poison_blade' },
      { statBonus: { strength: 3, agility: 3 } }
    ]
  }),
  ...tree('summoner', {
    pacto: [
      { statBonus: { intelligence: 2 } },
      { statBonus: { intelligence: 3 }, unlocksSkill: 'summon_sprite' },
      { statBonus: { intelligence: 5 }, unlocksSkill: 'summon_guardian' }
    ],
    dominio: [
      { statBonus: { willpower: 2 } },
      { statBonus: { willpower: 3 }, unlocksSkill: 'soul_link' },
      { statBonus: { willpower: 5, intelligence: 2 } }
    ],
    umbral: [
      { statBonus: { luck: 2 } },
      { statBonus: { luck: 2, willpower: 1 }, unlocksSkill: 'veil_step' },
      { statBonus: { luck: 3, intelligence: 3 } }
    ]
  }),
  ...tree('adventurer', {
    caminos: [
      { statBonus: { agility: 1, vitality: 1 } },
      { statBonus: { agility: 2, vitality: 1 }, unlocksSkill: 'pathfinder' },
      { statBonus: { agility: 2, vitality: 2, luck: 2 } }
    ],
    ingenio: [
      { statBonus: { intelligence: 1, charisma: 1 } },
      { statBonus: { intelligence: 2, charisma: 1 }, unlocksSkill: 'improvise' },
      { statBonus: { intelligence: 2, charisma: 2, luck: 2 } }
    ],
    fortuna: [
      { statBonus: { luck: 2 } },
      { statBonus: { luck: 3 }, unlocksSkill: 'lucky_break' },
      { statBonus: { luck: 5 } }
    ]
  })
];

export function treeForClass(classId: string): SkillTreeNode[] {
  return SKILL_TREE.filter((n) => n.classId === classId);
}

export function treeNodeById(id: string): SkillTreeNode {
  const n = SKILL_TREE.find((n) => n.id === id);
  if (!n) throw new Error(`Nodo de árbol desconocido: ${id}`);
  return n;
}

/** ¿Puede el personaje aprender este nodo? */
export function canLearnNode(
  node: SkillTreeNode,
  opts: { level: number; skillPoints: number; learnedNodes: string[] }
): { ok: boolean; reason?: 'level' | 'points' | 'requires' | 'learned' } {
  if (opts.learnedNodes.includes(node.id)) return { ok: false, reason: 'learned' };
  if (opts.level < node.requiredLevel) return { ok: false, reason: 'level' };
  if (opts.skillPoints < node.cost) return { ok: false, reason: 'points' };
  if (node.requiresNode && !opts.learnedNodes.includes(node.requiresNode)) {
    return { ok: false, reason: 'requires' };
  }
  return { ok: true };
}
