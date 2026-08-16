import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { skillById } from '@/data/skills';
import { itemById } from '@/data/items';
import { REGIONS } from '@/data/world';
import { RELATIONSHIP_AXES } from '@/domain/types';

/** Habilidades (§16): cada una lista sus usos narrativos. */
export function SkillsScreen() {
  const save = useGameStore((s) => s.save);
  if (!save) return null;
  return (
    <div className="panel">
      <h2 className="section-title">{t('nav.skills')}</h2>
      {save.character.skills.map((id) => {
        const skill = skillById(id);
        return (
          <div className="card" key={id}>
            <h3>{t(`skill.${id}`)}</h3>
            <p>
              {t('stats.mp')}: {skill.mpCost} · {skill.narrativeTags.join(' · ')}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Inventario (§18). */
export function InventoryScreen() {
  const save = useGameStore((s) => s.save);
  if (!save) return null;
  const inv = save.character.inventory;
  return (
    <div className="panel">
      <h2 className="section-title">{t('nav.inventory')}</h2>
      {inv.length === 0 && <p className="hint-text">{t('ui.empty')}</p>}
      {inv.map((entry) => {
        const item = itemById(entry.itemId);
        return (
          <div className="card" key={entry.itemId}>
            <h3>
              {t(`item.${entry.itemId}`)} ×{entry.quantity}
              {entry.equipped ? ` · ${t('ui.equipped')}` : ''}
            </h3>
            <p>
              {item.rarity} · {item.type}
              {item.value > 0 ? ` · 🪙 ${item.value}` : ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Misiones (§62): estado de quests desde el WorldState. */
export function QuestsScreen() {
  const save = useGameStore((s) => s.save);
  if (!save) return null;
  const quests = save.world.quests;
  return (
    <div className="panel">
      <h2 className="section-title">{t('nav.quests')}</h2>
      {quests.length === 0 && <p className="hint-text">{t('ui.empty')}</p>}
      {quests.map((q) => (
        <div className="card" key={q.questId}>
          <h3>{t(`quest.${q.questId}`)}</h3>
          <p>{q.status === 'completed' ? '✓ ' : '◈ '}{t(`quest.status.${q.status}`)}</p>
        </div>
      ))}
    </div>
  );
}

/** Mundo (§21): mapa 2D por cartas de región. */
export function WorldScreen() {
  const save = useGameStore((s) => s.save);
  if (!save) return null;
  const { discoveredRegions, currentRegionId } = save.world;
  const icons: Record<string, string> = {
    village: '🏘️', forest: '🌲', city: '🏰', ruins: '🏛️', temple: '⛩️', unknown: '❓'
  };
  return (
    <div className="panel">
      <h2 className="section-title">{t('nav.world')}</h2>
      <div className="region-grid">
        {REGIONS.map((r) => {
          const discovered = discoveredRegions.includes(r.id);
          return (
            <div
              key={r.id}
              className={`card region-card ${r.id === currentRegionId ? 'current' : ''} ${discovered ? '' : 'undiscovered'}`}
            >
              <span className="icon" aria-hidden>{icons[r.kind]}</span>
              <h3 style={{ fontSize: 14 }}>{discovered ? t(`region.${r.id}`) : t('region.unknown')}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Vínculos (§19-20): relaciones y memoria de NPC. */
export function RelationsScreen() {
  const save = useGameStore((s) => s.save);
  if (!save) return null;
  const rels = save.world.npcRelationships;
  const known = Object.entries(rels).filter(([, r]) =>
    RELATIONSHIP_AXES.some((a) => r[a] !== 0)
  );
  return (
    <div className="panel">
      <h2 className="section-title">{t('nav.relations')}</h2>
      {known.length === 0 && <p className="hint-text">{t('ui.empty')}</p>}
      {known.map(([npcId, rel]) => (
        <div className="card" key={npcId}>
          <h3>{t(`speaker.${npcId}`)}</h3>
          <div className="stat-grid">
            {RELATIONSHIP_AXES.filter((a) => rel[a] !== 0).map((a) => (
              <div className="stat-row" key={a}>
                <span>{t(`rel.${a}`)}</span>
                <b>{rel[a] > 0 ? `+${rel[a]}` : rel[a]}</b>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
