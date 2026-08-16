import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { deriveStats, xpForNextLevel } from '@/domain/stats';
import { PRIMARY_STATS } from '@/domain/types';

/** Ficha de personaje: stats primarias, derivadas, títulos y reputación. */
export function CharacterScreen() {
  const save = useGameStore((s) => s.save);
  if (!save) return null;
  const c = save.character;
  const derived = deriveStats(c.stats, c.level);
  const nextXp = xpForNextLevel(c.level);

  return (
    <div className="panel">
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
          <div className="hp-bar"><div style={{ width: `${(c.currentHp / derived.hp) * 100}%` }} /></div>
        </div>
        <div style={{ marginTop: 8 }}>
          <div className="stat-row">
            <span>{t('stats.mp')}</span>
            <b>{c.currentMp}/{derived.mp}</b>
          </div>
          <div className="mp-bar"><div style={{ width: `${(c.currentMp / derived.mp) * 100}%` }} /></div>
        </div>
        <div className="stat-row" style={{ marginTop: 8 }}>
          <span>{t('stats.gold')}</span>
          <b>🪙 {c.gold}</b>
        </div>
      </div>

      <div className="card">
        <h3>{t('nav.character')}</h3>
        <div className="stat-grid">
          {PRIMARY_STATS.map((s) => (
            <div className="stat-row" key={s}>
              <span>{t(`stats.${s}`)}</span>
              <b>{c.stats[s]}</b>
            </div>
          ))}
        </div>
      </div>

      {c.titles.length > 0 && (
        <div className="card">
          <h3>✦</h3>
          {c.titles.map((title) => (
            <p key={title}>🏅 {t(`title.${title}`)}</p>
          ))}
        </div>
      )}
    </div>
  );
}
