import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { GameIcon, IconScroll, IconMedal } from '@/ui/icons';

/**
 * REGISTRO DE MISIONES (Campaña → Misiones).
 * Misiones de campaña activas y completadas, con su estado.
 * (Las misiones de NPC con objetivos reales llegan con el sistema
 * de exploración — esta pantalla ya las alojará.)
 */
export function QuestLogScreen() {
  const save = useGameStore((s) => s.save);
  if (!save) return null;
  const active = save.world.quests.filter((q) => q.status === 'active');
  const done = save.world.quests.filter((q) => q.status === 'completed');

  return (
    <div className="panel">
      <h2 className="section-title with-icon">
        <IconScroll size={20} className="ico-gold" /> {t('camp.quests')}
      </h2>

      <h3 className="quest-section">{t('quests.active')}</h3>
      {active.length === 0 && <p className="hint-text">{t('quests.noneActive')}</p>}
      {active.map((q) => (
        <div className="card quest-card active" key={q.questId}>
          <div className="quest-card-head">
            <GameIcon name="spark" size={18} className="ico-teal" />
            <h3>{t(`quest.${q.questId}`)}</h3>
          </div>
          <p className="hint-text">{t('quests.inProgress')}</p>
        </div>
      ))}

      <h3 className="quest-section">{t('quests.completed')}</h3>
      {done.length === 0 && <p className="hint-text">{t('ui.empty')}</p>}
      {done.map((q) => (
        <div className="card quest-card done" key={q.questId}>
          <div className="quest-card-head">
            <IconMedal size={18} className="ico-gold" />
            <h3>{t(`quest.${q.questId}`)}</h3>
          </div>
          <p className="hint-text">✓ {t('quest.status.completed')}</p>
        </div>
      ))}
    </div>
  );
}
