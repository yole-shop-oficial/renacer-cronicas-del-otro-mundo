import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { xpForNextLevel } from '@/domain/stats';
import { PRIMARY_STATS } from '@/domain/types';
import { NPCS } from '@/data/world';
import { effectiveStats, effectiveDerived, powerBreakdown } from '@/domain/power';
import { IconPower, IconCoin, IconBond, IconMedal } from '@/ui/icons';

/**
 * Ficha de personaje: PODER DE COMBATE calculado automático (con desglose),
 * stats efectivas (base + equipo + vínculos) y asignación de puntos
 * (+10 por nivel).
 */
export function CharacterScreen() {
  const save = useGameStore((s) => s.save);
  const spendPoint = useGameStore((s) => s.spendAttributePoint);
  if (!save) return null;
  const c = save.character;
  const eff = effectiveStats(c, NPCS, save.world);
  const derived = effectiveDerived(c, NPCS, save.world);
  const power = powerBreakdown(c, NPCS, save.world);
  const nextXp = xpForNextLevel(c.level);
  const points = c.unspentPoints ?? 0;

  return (
    <div className="panel">
      {/* PODER DE COMBATE */}
      <div className="card power-card">
        <div className="power-value">
          <span className="power-icon" aria-hidden><IconPower size={34} /></span>
          <div>
            <div className="power-number">{power.total.toLocaleString()}</div>
            <div className="power-label">{t('power.title')}</div>
          </div>
        </div>
        <div className="stat-grid" style={{ marginTop: 10 }}>
          <div className="stat-row"><span>{t('power.fromStats')}</span><b>{power.fromStats}</b></div>
          <div className="stat-row"><span>{t('power.fromLevel')}</span><b>+{power.fromLevel}</b></div>
          <div className="stat-row"><span>{t('power.fromSkills')}</span><b>+{power.fromSkills}</b></div>
        </div>
        {Object.keys(power.bondContribution).length > 0 && (
          <p className="hint-text" style={{ marginTop: 8 }}>
            <IconBond size={14} className="ico-pink inline-ico" /> {t('power.bondsHelp')}:{' '}
            {Object.entries(power.bondContribution)
              .map(([stat, v]) => `+${v} ${t(`stats.${stat}`)}`)
              .join(' · ')}
          </p>
        )}
      </div>

      <div className="card">
        <h3>{c.name}</h3>
        <p>
          {t(`char.${c.templateId}`)} · {t(`class.${c.classId}`)} · {t(`goddess.${c.goddessId}`)}
        </p>
        <div style={{ marginTop: 12 }}>
          <div className="stat-row">
            <span>{t('stats.level')} {c.level}</span>
            <b>{c.xp}/{nextXp} {t('stats.xp')}</b>
          </div>
          <div className="xp-bar" role="progressbar" aria-valuenow={c.xp} aria-valuemax={nextXp}>
            <div style={{ width: `${Math.min(100, (c.xp / nextXp) * 100)}%` }} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <div className="stat-row">
            <span>{t('stats.hp')}</span>
            <b>{c.currentHp}/{derived.hp}</b>
          </div>
          <div className="hp-bar"><div style={{ width: `${Math.min(100, (c.currentHp / derived.hp) * 100)}%` }} /></div>
        </div>
        <div style={{ marginTop: 8 }}>
          <div className="stat-row">
            <span>{t('stats.mp')}</span>
            <b>{c.currentMp}/{derived.mp}</b>
          </div>
          <div className="mp-bar"><div style={{ width: `${Math.min(100, (c.currentMp / derived.mp) * 100)}%` }} /></div>
        </div>
        <div className="stat-row" style={{ marginTop: 8 }}>
          <span>{t('stats.gold')}</span>
          <b className="with-icon-inline"><IconCoin size={15} className="ico-gold" /> {c.gold}</b>
        </div>
      </div>

      {/* ATRIBUTOS + ASIGNACIÓN DE PUNTOS */}
      <div className="card">
        <h3>
          {t('attrs.title')}
          {points > 0 && <span className="points-badge">{t('attrs.points', { points })}</span>}
        </h3>
        {PRIMARY_STATS.map((s) => {
          const bonus = eff[s] - c.stats[s];
          return (
            <div className="attr-row" key={s}>
              <span className="attr-name">{t(`stats.${s}`)}</span>
              <span className="attr-value">
                <b>{c.stats[s]}</b>
                {bonus > 0 && <em className="attr-bonus">+{bonus}</em>}
              </span>
              {points > 0 && (
                <button
                  className="attr-plus"
                  aria-label={`+1 ${t(`stats.${s}`)}`}
                  onClick={() => void spendPoint(s)}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
        <p className="hint-text" style={{ marginTop: 8 }}>{t('attrs.hint')}</p>
      </div>

      {/* DERIVADAS EFECTIVAS */}
      <div className="card">
        <h3>{t('attrs.derived')}</h3>
        <div className="stat-grid">
          <div className="stat-row"><span>{t('derived.attack')}</span><b>{derived.attack}</b></div>
          <div className="stat-row"><span>{t('derived.defense')}</span><b>{derived.defense}</b></div>
          <div className="stat-row"><span>{t('derived.magicPower')}</span><b>{derived.magicPower}</b></div>
          <div className="stat-row"><span>{t('derived.speed')}</span><b>{derived.speed}</b></div>
          <div className="stat-row"><span>{t('derived.crit')}</span><b>{derived.crit}%</b></div>
          <div className="stat-row"><span>{t('derived.resistance')}</span><b>{derived.resistance}</b></div>
        </div>
      </div>

      {c.titles.length > 0 && (
        <div className="card">
          <h3>✦</h3>
          {c.titles.map((title) => (
            <p key={title} className="with-icon-inline"><IconMedal size={16} className="ico-gold" /> {t(`title.${title}`)}</p>
          ))}
        </div>
      )}
    </div>
  );
}
