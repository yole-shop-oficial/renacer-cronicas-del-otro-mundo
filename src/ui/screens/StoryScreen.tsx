import { useEffect, useRef, useState } from 'react';
import { t, lt } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { useAppStore } from '@/state/appStore';
import {
  fetchPartnerDecision,
  watchPartnerDecision,
  type PartnerDecision
} from '@/services/coopDecisions';
import { renderStoryText } from '@/engine/text';
import { IconLock, IconBond } from '@/ui/icons';
import { useCoopStore } from '@/state/coopStore';
import { DiceOfFate } from '@/ui/DiceOfFate';

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
  const refreshPending = useAppStore((s) => s.refreshPending);
  const triggerSync = useAppStore((s) => s.triggerSync);
  const session = useAppStore((s) => s.session);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [partnerDecision, setPartnerDecision] = useState<PartnerDecision | null>(null);

  const node = currentNode();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [node?.id]);

  // Evento cooperativo (§35): consultar y vigilar la decisión del compañero.
  // Nunca bloquea: si no hay coop/red, simplemente no se muestra nada.
  useEffect(() => {
    setPartnerDecision(null);
    if (!node?.coopEventId || !session) return;
    let cancelled = false;
    void fetchPartnerDecision(session.userId, node.id).then((d) => {
      if (!cancelled && d) setPartnerDecision(d);
    });
    const unwatch = watchPartnerDecision(session.userId, node.id, (d) => {
      if (!cancelled) setPartnerDecision(d);
    });
    return () => {
      cancelled = true;
      unwatch();
    };
  }, [node?.id, node?.coopEventId, session]);

  if (!save || !node) return <div className="center-screen">{t('ui.loading')}</div>;

  const coopPartner = useCoopStore((s) => s.partner);
  const inGroup = useCoopStore((s) => s.inGroup);
  const negotiation = useCoopStore((s) => s.negotiation);
  const pickChoice = useCoopStore((s) => s.pickChoice);
  const yieldToPartner = useCoopStore((s) => s.yieldToPartner);
  const invokeDice = useCoopStore((s) => s.invokeDice);
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
    if (duoMode) {
      // Modo dúo: la elección es una PROPUESTA; se negocia con el alma compañera.
      pickChoice(node.id, choiceId);
      return;
    }
    await chooseOption(choice);
    await refreshPending();
    void triggerSync();
  }

  return (
    <>
      <div className="story-scroll" ref={scrollRef}>
        <p className="chapter-title">{node.chapterId === 'prologue' ? '✦ ✦ ✦' : '❖ ❖ ❖'}</p>
        <div className="parchment">
          {node.speaker && <span className="speaker-tag">{t(`speaker.${node.speaker}`)}</span>}
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
        {node.coopEventId && (
          <div className="effect-log coop-banner" aria-live="polite">
            <div>{t('coop.dualEvent')}</div>
            {partnerDecision ? (
              <div style={{ marginTop: 6 }}>
                {t('coop.partnerChose', {
                  choice: lt(
                    node.choices.find((c) => c.id === partnerDecision.choiceId)?.text ?? {
                      es: partnerDecision.choiceId
                    }
                  )
                })}
              </div>
            ) : (
              <div style={{ marginTop: 6 }}>{t('coop.partnerPending')}</div>
            )}
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
