import { useEffect, useRef } from 'react';
import { t, lt } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { renderStoryText } from '@/engine/text';
import { IconLock, IconBond } from '@/ui/icons';
import { useCoopStore } from '@/state/coopStore';
import { DiceOfFate } from '@/ui/DiceOfFate';
import { findSpecialDiscord } from '@/coop/specialDiscords';
import { CombatScreen } from './CombatScreen';
import { SplitTaskScreen } from './SplitTaskScreen';
import { sfx } from '@/services/audio';
import { Portrait, hasPortrait } from '@/ui/portraits';
import { getEnemy } from '@/data/enemies';
import { applyEffects } from '@/engine/effects';
import { saveGameLocally } from '@/state/persistence';
import { useGameStore as gameStore } from '@/state/gameStore';

/**
 * Pantalla de historia (§40): la narración es el centro.
 * Pergamino + decisiones grandes + registro narrativo de efectos (§61).
 */
export function StoryScreen() {
  const save = useGameStore((s) => s.save);
  const narrationLog = useGameStore((s) => s.narrationLog);
  const chooseOption = useGameStore((s) => s.chooseOption);
  const currentNode = useGameStore((s) => s.currentNode);
  const choicesFor = useGameStore((s) => s.choicesForCurrentNode);
  const scrollRef = useRef<HTMLDivElement>(null);
  const coopPartner = useCoopStore((s) => s.partner);
  const inGroup = useCoopStore((s) => s.inGroup);
  const negotiation = useCoopStore((s) => s.negotiation);
  const pickChoice = useCoopStore((s) => s.pickChoice);
  const yieldToPartner = useCoopStore((s) => s.yieldToPartner);
  const invokeDice = useCoopStore((s) => s.invokeDice);

  const node = currentNode();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [node?.id]);


  if (!save || !node) return <div className="center-screen">{t('ui.loading')}</div>;

  // TAREAS DIVIDIDAS (§45): dos tareas simultáneas, resultados fundidos.
  if (node.splitTaskId && !save.world.flags[`_split_done_${node.id}`]) {
    return (
      <SplitTaskScreen
        taskId={node.splitTaskId}
        onResolve={(outcomeNodeId, bothWon) => {
          void (async () => {
            const current = gameStore.getState().save;
            if (!current) return;
            const world = structuredClone(current.world);
            let character = current.character;
            world.flags[`_split_done_${node.id}`] = true;
            if (bothWon) {
              const { splitTaskById } = await import('@/coop/splitTasks');
              const def = splitTaskById(node.splitTaskId!);
              const fx = applyEffects(def.bothWinEffects, character, world);
              character = fx.character;
              Object.assign(world, fx.world);
            }
            const updated = { ...current, character, world, currentNodeId: outcomeNodeId, updatedAt: Date.now() };
            await saveGameLocally(updated);
            gameStore.setState({ save: updated, narrationLog: [] });
          })();
        }}
      />
    );
  }

  // COMBATE REAL (§4-5): el nodo encounter con combatId cambia la interfaz.
  if (node.combatId && !save.world.flags[`_combat_done_${node.id}`]) {
    return (
      <CombatScreen
        combatId={node.combatId}
        onEnd={(result) => {
          void (async () => {
            const current = gameStore.getState().save;
            if (!current) return;
            const world = structuredClone(current.world);
            let character = current.character;
            world.flags[`_combat_done_${node.id}`] = true;
            world.flags[`combat_${node.combatId}_${result}`] = true;
            if (result === 'victory') {
              // Recompensas del enemigo (§20), idempotentes por nodo.
              const enemy = getEnemy(node.combatId!);
              const fx = applyEffects(
                [
                  { kind: 'gainXp', amount: enemy.rewards.xp },
                  { kind: 'gainGold', amount: enemy.rewards.gold },
                  ...(enemy.rewards.items ?? []).map((it) => ({
                    kind: 'addItem' as const, key: it.itemId, amount: it.qty
                  }))
                ],
                character, world
              );
              character = fx.character;
              Object.assign(world, fx.world);
            }
            const nextId = result === 'victory'
              ? (node.victoryGoto ?? node.choices[0]?.goto ?? current.currentNodeId)
              : (node.defeatGoto ?? node.victoryGoto ?? current.currentNodeId);
            const updated = { ...current, character, world, currentNodeId: nextId, updatedAt: Date.now() };
            await saveGameLocally(updated);
            gameStore.setState({ save: updated, narrationLog: [] });
          })();
        }}
      />
    );
  }

  const duoMode = Boolean(coopPartner && inGroup);
  const textCtx = {
    name: save.character.name,
    gender: save.character.gender ?? 'f',
    partner: coopPartner?.name
  };

  const { available, locked } = choicesFor();

  async function handleChoice(choiceId: string) {
    const choice = available.find((c) => c.id === choiceId);
    if (!choice || !node) return;
    sfx('page');
    if (duoMode) {
      // Modo dúo: la elección es una PROPUESTA; se negocia con el alma compañera.
      pickChoice(node.id, choiceId);
      return;
    }
    await chooseOption(choice);
  }

  return (
    <>
      <div className="story-scroll" ref={scrollRef}>
        <p className="chapter-title">{node.chapterId === 'prologue' ? '✦ ✦ ✦' : '❖ ❖ ❖'}</p>
        <div className="parchment">
          {node.speaker && (
            <span className="speaker-row">
              {hasPortrait(node.speaker) && (
                <span className="speaker-portrait"><Portrait id={node.speaker} size={46} /></span>
              )}
              <span className="speaker-tag">{t(`speaker.${node.speaker}`)}</span>
            </span>
          )}
          {node.speaker && <br />}
          {renderStoryText(lt(duoMode && node.duoText ? node.duoText : node.text), textCtx)}
        </div>
        {narrationLog.length > 0 && (
          <div className="effect-log" aria-live="polite">
            {narrationLog.map((entry, i) => (
              <div key={i}>{t(entry.key, localizeParams(entry.params))}</div>
            ))}
          </div>
        )}
        {duoMode && negotiation && negotiation.nodeId === node.id && (
          <div className="negotiation-panel" aria-live="polite">
            <div className="negotiation-head">
              <IconBond size={16} className="ico-pink" />
              <b>{t('nego.title')}</b>
            </div>
            {negotiation.phase === 'waiting_picks' && negotiation.myPick && !negotiation.partnerPick && (
              <p>{t('nego.waitingPartner', { name: coopPartner?.name ?? '' })}</p>
            )}
            {negotiation.phase === 'waiting_picks' && !negotiation.myPick && negotiation.partnerPick && (
              <p>
                {t('nego.partnerPicked', {
                  name: coopPartner?.name ?? '',
                  choice: lt(node.choices.find((c) => c.id === negotiation.partnerPick)?.text ?? { es: '…' })
                })}
              </p>
            )}
            {negotiation.phase === 'discord' && (
              <>
                <p className="nego-discord">{t('nego.discord', { name: coopPartner?.name ?? '' })}</p>
                {(() => {
                  const special = negotiation.myPick && negotiation.partnerPick
                    ? findSpecialDiscord(node.id, negotiation.myPick, negotiation.partnerPick)
                    : null;
                  return special ? (
                    <div className="nego-special parchment">
                      {renderStoryText(lt(special.text), textCtx)}
                    </div>
                  ) : null;
                })()}
                <div className="nego-picks">
                  <div className="nego-pick mine">
                    <span>{save.character.name}</span>
                    <em>«{lt(node.choices.find((c) => c.id === negotiation.myPick)?.text ?? { es: '…' })}»</em>
                  </div>
                  <div className="nego-pick theirs">
                    <span>{coopPartner?.name}</span>
                    <em>«{lt(node.choices.find((c) => c.id === negotiation.partnerPick)?.text ?? { es: '…' })}»</em>
                  </div>
                </div>
                <div className="nego-actions">
                  <button className="btn-secondary" onClick={yieldToPartner}>{t('nego.yield')}</button>
                  <button className="btn-primary nego-dice-btn" onClick={invokeDice}>{t('nego.dice')}</button>
                </div>
              </>
            )}
          </div>
        )}
        {node.end && node.choices.length === 0 && (
          <div className="effect-log">{t('ui.chapterEnd')}</div>
        )}
      </div>
      <div className="choices">
        {available.map((choice) => {
          const isMine = negotiation?.myPick === choice.id;
          const isTheirs = negotiation?.partnerPick === choice.id;
          return (
            <button
              key={choice.id}
              className={`choice-btn ${isMine ? 'picked-mine' : ''} ${isTheirs ? 'picked-theirs' : ''}`}
              onClick={() => void handleChoice(choice.id)}
            >
              {renderStoryText(lt(choice.text), textCtx)}
              {isMine && <span className="pick-tag mine">{save.character.name}</span>}
              {isTheirs && <span className="pick-tag theirs">{coopPartner?.name}</span>}
            </button>
          );
        })}
        {locked.map((choice) => (
          <button key={choice.id} className="choice-btn locked" disabled aria-disabled="true">
            {renderStoryText(lt(choice.text), textCtx)}
            <span className="lock-hint">
              <IconLock size={13} className="inline-ico" /> {choice.lockedHint ? lt(choice.lockedHint) : t('ui.locked')}
            </span>
          </button>
        ))}
      </div>
      <DiceOfFate />
    </>
  );
}

/** Traduce parámetros que son claves de contenido (item.x, skill.x...). */
function localizeParams(params?: Record<string, string | number>) {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string' && ['item', 'skill', 'quest', 'region', 'npc', 'title', 'stat', 'axis'].includes(k)) {
      const prefixes: Record<string, string> = {
        item: 'item', skill: 'skill', quest: 'quest', region: 'region',
        npc: 'speaker', title: 'title', stat: 'stats', axis: 'rel'
      };
      out[k] = t(`${prefixes[k]}.${v}`);
    } else {
      out[k] = v;
    }
  }
  return out;
}
