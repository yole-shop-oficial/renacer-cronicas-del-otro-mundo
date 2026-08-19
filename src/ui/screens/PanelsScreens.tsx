import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { skillById } from '@/data/skills';
import { NPCS } from '@/data/world';
import { RELATIONSHIP_AXES } from '@/domain/types';
import { bondLevel, bondScore } from '@/domain/power';
import { activeStageIndex, isDelivered, objectiveProgress, stageComplete, readyToDeliver } from '@/state/npcQuestState';
import { npcQuestById } from '@/data/npcQuests';
import { IconScroll, IconLock, IconSpark } from '@/ui/icons';
import { Portrait, hasPortrait } from '@/ui/portraits';

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
          <p>{q.status === 'completed' ? '✓ ' : '❖ '}{t(`quest.status.${q.status}`)}</p>
        </div>
      ))}
    </div>
  );
}


/**
 * Vínculos (§19-20) + SISTEMA DE PODER POR VÍNCULO:
 * cada NPC potencia una estadística; a mayor vínculo, más bonificación.
 * Desde aquí también se hacen las misiones de NPC.
 */
export function RelationsScreen() {
  const save = useGameStore((s) => s.save);
  const availableNpcQuests = useGameStore((s) => s.availableNpcQuests);
  const acceptNpcQuest = useGameStore((s) => s.acceptNpcQuest);
  const advanceNpcQuestStage = useGameStore((s) => s.advanceNpcQuestStage);
  const deliverNpcQuest = useGameStore((s) => s.deliverNpcQuest);
  if (!save) return null;
  const rels = save.world.npcRelationships;
  const known = Object.entries(rels).filter(([, r]) =>
    RELATIONSHIP_AXES.some((a) => r[a] !== 0)
  );
  return (
    <div className="panel">
      <h2 className="section-title">{t('nav.relations')}</h2>
      <p className="hint-text">{t('bond.explain')}</p>
      {known.length === 0 && <p className="hint-text">{t('ui.empty')}</p>}
      {known.map(([npcId, rel]) => {
        const npc = NPCS.find((n) => n.id === npcId);
        const memories = save.world.npcMemory[npcId] ?? [];
        const level = bondLevel(rel);
        const score = bondScore(rel);
        const quests = availableNpcQuests(npcId);
        return (
          <div className="card" key={npcId}>
            <div className="npc-card-head">
              {hasPortrait(npcId) && <Portrait id={npcId} size={52} className="npc-portrait" />}
              <h3>
                {t(`speaker.${npcId}`)}
                <span className="bond-badge">
                  {t('bond.level', { level })}
                </span>
              </h3>
            </div>
            {npc && (
              <p className="hint-text" style={{ marginBottom: 6 }}>
                {t(`region.${npc.regionId}`)} · {npc.age} ⌛
              </p>
            )}
            {/* Barra de vínculo + stat que potencia */}
            <div className="bond-bar" role="progressbar" aria-valuenow={score} aria-valuemax={100}>
              <div style={{ width: `${score}%` }} />
            </div>
            {npc && (
              <p className="bond-power">
                <IconSpark size={14} className="ico-arcane inline-ico" /> {t('bond.grants', { stat: t(`stats.${npc.bondStat}`) })}
                {level > 0 && <b> +{level}</b>}
                {level < 5 && (
                  <span className="hint-text"> · {t('bond.nextAt', { score: (level + 1) * 20 })}</span>
                )}
              </p>
            )}
            <p style={{ marginBottom: 10 }}>{t(`npc.${npcId}.bio`)}</p>
            <div className="stat-grid">
              {RELATIONSHIP_AXES.filter((a) => rel[a] !== 0).map((a) => (
                <div className="stat-row" key={a}>
                  <span>{t(`rel.${a}`)}</span>
                  <b>{rel[a] > 0 ? `+${rel[a]}` : rel[a]}</b>
                </div>
              ))}
            </div>

            {/* MISIONES DEL NPC — ciclo real: aceptar → objetivos → entregar */}
            {quests.length > 0 && (
              <div className="npc-quests">
                <h4 className="with-icon-inline"><IconScroll size={15} className="ico-gold" /> {t('bond.quests')}</h4>
                {quests.map(({ quest, ok, reason }) => {
                  const q = npcQuestById(quest.id);
                  const stageIdx = activeStageIndex(save, q.id);
                  const active = stageIdx !== null;
                  const delivered = isDelivered(save, q.id);
                  if (delivered) return null;
                  return (
                    <div className={`npc-quest ${active ? 'inprogress' : ok ? '' : 'locked'} ${q.kind === 'long' ? 'long' : ''}`} key={q.id}>
                      <div className="npc-quest-info">
                        <span className="npc-quest-name">
                          {q.kind === 'long' && <em className="quest-long-tag">{t('nq.longTag')}</em>}
                          {t(`nq.${q.id}`)}
                        </span>
                        <span className="npc-quest-desc hint-text">
                          {active ? t(`nq.${q.id}.stage${stageIdx! + 1}`) : t(`nq.${q.id}.desc`)}
                        </span>
                        {!active && (
                          <span className="npc-quest-req hint-text">
                            {t('bond.reqLevel', { level: q.requiredLevel })}
                            {q.requiredPower > 0 && ` · ⚔ ${q.requiredPower}`}
                            {q.requiredBondLevel > 0 && ` · 💞 ${q.requiredBondLevel}`}
                          </span>
                        )}
                        {active && (
                          <div className="quest-objectives">
                            {q.stages[stageIdx!].objectives.map((obj, i) => {
                              const prog = objectiveProgress(save, q, obj);
                              const done = prog >= obj.amount;
                              return (
                                <span key={i} className={`quest-obj ${done ? 'done' : ''}`}>
                                  {done ? '✓' : '◈'} {t(`obj.${obj.kind}`, {
                                    target: t(obj.kind === 'kill' ? `enemy.${obj.target}` : obj.kind === 'collect' ? `item.${obj.target}` : `region.${obj.target}`),
                                    n: prog, total: obj.amount
                                  })}
                                </span>
                              );
                            })}
                            {q.stages.length > 1 && (
                              <span className="hint-text">{t('nq.stageOf', { s: stageIdx! + 1, total: q.stages.length })}</span>
                            )}
                          </div>
                        )}
                      </div>
                      {!active && ok && (
                        <button className="btn-primary npc-quest-btn" onClick={() => void acceptNpcQuest(q.id)}>
                          {t('bond.accept')}
                        </button>
                      )}
                      {!active && !ok && (
                        <span className="npc-quest-lock">
                          <IconLock size={13} className="inline-ico" /> {reason === 'level' && t('bond.lockLevel')}
                          {reason === 'power' && t('bond.lockPower')}
                          {reason === 'bond' && t('bond.lockBond')}
                        </span>
                      )}
                      {active && stageIdx! < q.stages.length - 1 && stageComplete(save, q, stageIdx!) && (
                        <button className="btn-primary npc-quest-btn" onClick={() => void advanceNpcQuestStage(q.id)}>
                          {t('bond.nextStage')}
                        </button>
                      )}
                      {active && readyToDeliver(save, q) && (
                        <button className="btn-primary npc-quest-btn deliver" onClick={() => void deliverNpcQuest(q.id)}>
                          {t('bond.deliver')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {memories.length > 0 && (
              <p className="hint-text" style={{ marginTop: 8, fontStyle: 'italic' }}>
                ✦ {memories.length === 1 ? t('rel.remembers_one') : t('rel.remembers', { count: memories.length })}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
