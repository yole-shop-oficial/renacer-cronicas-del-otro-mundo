import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { treeForClass, canLearnNode, type SkillTreeNode } from '@/data/skilltree';
import { IconRune } from '@/ui/icons';

/**
 * ÁRBOL DE HABILIDADES por clase: 3 ramas × 3 niveles.
 * Cada nodo muestra coste, requisitos, bonos de stats y habilidad
 * desbloqueada. Se aprende gastando puntos de habilidad (+1/nivel).
 */
export function SkillTreeScreen() {
  const save = useGameStore((s) => s.save);
  const learnNode = useGameStore((s) => s.learnTreeNode);
  if (!save) return null;
  const c = save.character;
  const nodes = treeForClass(c.classId);
  const branches = [...new Set(nodes.map((n) => n.branch))];
  const learned = c.treeNodes ?? [];
  const points = c.skillPoints ?? 0;

  return (
    <div className="panel">
      <h2 className="section-title">
        {t('tree.title')} — {t(`class.${c.classId}`)}
      </h2>
      <p className="hint-text">
        {t('tree.points', { points })} · {t('tree.hint')}
      </p>

      {branches.map((branch) => (
        <div className="card" key={branch}>
          <h3>❖ {t(`tree.branch.${c.classId}.${branch}`)}</h3>
          <div className="tree-branch">
            {nodes
              .filter((n) => n.branch === branch)
              .sort((a, b) => a.tier - b.tier)
              .map((node, i) => (
                <TreeNodeCard
                  key={node.id}
                  node={node}
                  learned={learned.includes(node.id)}
                  check={canLearnNode(node, { level: c.level, skillPoints: points, learnedNodes: learned })}
                  isFirst={i === 0}
                  onLearn={() => void learnNode(node.id)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TreeNodeCard({
  node,
  learned,
  check,
  isFirst,
  onLearn
}: {
  node: SkillTreeNode;
  learned: boolean;
  check: { ok: boolean; reason?: string };
  isFirst: boolean;
  onLearn: () => void;
}) {
  return (
    <>
      {!isFirst && <div className={`tree-connector ${learned ? 'active' : ''}`} aria-hidden />}
      <div className={`tree-node ${learned ? 'learned' : check.ok ? 'available' : 'locked'}`}>
        <div className="tree-node-head">
          <span className="tree-node-tier">{'✦'.repeat(node.tier)}</span>
          <span className="tree-node-name">{t(`tree.node.${node.id}`)}</span>
          {learned ? (
            <span className="tree-node-state learned">✓</span>
          ) : (
            <span className="tree-node-cost">{node.cost} ◈</span>
          )}
        </div>
        <div className="tree-node-body">
          {node.statBonus && (
            <span className="tree-node-bonus">
              {Object.entries(node.statBonus)
                .map(([s, v]) => `+${v} ${t(`stats.${s}`)}`)
                .join(' · ')}
            </span>
          )}
          {node.unlocksSkill && (
            <span className="tree-node-skill with-icon-inline"><IconRune size={13} className="ico-arcane" /> {t(`skill.${node.unlocksSkill}`)}</span>
          )}
        </div>
        {!learned && (
          <div className="tree-node-foot">
            {check.ok ? (
              <button className="btn-primary tree-learn-btn" onClick={onLearn}>
                {t('tree.learn')}
              </button>
            ) : (
              <span className="tree-node-req">
                {check.reason === 'level' && t('tree.needLevel', { level: node.requiredLevel })}
                {check.reason === 'points' && t('tree.needPoints', { points: node.cost })}
                {check.reason === 'requires' && t('tree.needPrevious')}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
