import { useEffect, useRef, useState } from 'react';
import { t, getLocale } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { useCoopStore } from '@/state/coopStore';
import { createCombat, act, react, tick, tryCoopCombo } from '@/combat/engine';
import type { CombatState, CombatAction } from '@/combat/types';
import { actionsForCharacter, actionById } from '@/data/combatActions';
import { getEnemy } from '@/data/enemies';
import { effectiveDerived } from '@/domain/power';
import { NPCS } from '@/data/world';
import { COMBO_WINDOW_MS } from '@/combat/combos';
import { TRAIT_COMBAT_UNLOCKS, traitValue } from '@/domain/personality';
import { sfx } from '@/services/audio';
import { Portrait } from '@/ui/portraits';
import { GameIcon, IconSword, IconShield, IconRune, IconPotion, IconMystery, IconHeart, IconDrop, IconSpark } from '@/ui/icons';

/**
 * PANTALLA DE COMBATE (§62-65) — móvil primero, un pulgar.
 * Enemigo arriba, narración en el centro, comandos grandes abajo.
 * Ventanas de reacción generosas; pausa suave al abrir el registro.
 */

const TICK_MS = 250;

interface Props {
  combatId: string;
  onEnd: (result: 'victory' | 'defeat' | 'fled') => void;
}

export function CombatScreen({ combatId, onEnd }: Props) {
  const save = useGameStore((s) => s.save);
  const partner = useCoopStore((s) => s.partner);
  const inGroup = useCoopStore((s) => s.inGroup);
  const lastPartnerAction = useCoopStore((s) => s.lastCombatAction);
  const sendCombatAction = useCoopStore((s) => s.sendCombatAction);

  const derived = save ? effectiveDerived(save.character, NPCS, save.world) : null;
  const [combat, setCombat] = useState<CombatState | null>(null);
  const [paused, setPaused] = useState(false);
  const [tab, setTab] = useState<'main' | 'skills' | 'spells'>('main');
  const endedRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  const attackStat = derived ? Math.round(derived.attack / 2) : 5;
  const magicStat = derived ? Math.round(derived.magicPower / 2) : 5;
  const personalityUnlocks = save
    ? TRAIT_COMBAT_UNLOCKS.filter(
        (u) => traitValue(save.character.personality, u.trait) >= u.min
      ).map((u) => u.actionId)
    : [];
  const allActions = save ? actionsForCharacter(save.character.skills, personalityUnlocks) : [];

  // Inicializar combate
  useEffect(() => {
    if (!save || !derived) return;
    setCombat(
      createCombat(combatId, {
        hp: Math.max(1, save.character.currentHp),
        maxHp: derived.hp,
        mp: Math.max(0, save.character.currentMp),
        maxMp: derived.mp,
        stamina: derived.stamina
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combatId]);

  // Bucle de ticks (tiempo real §7, con pausa suave §65/§109)
  useEffect(() => {
    if (!combat || combat.phase !== 'active' || paused) return;
    const id = setInterval(() => {
      setCombat((prev) => {
        if (!prev || prev.phase !== 'active') return prev;
        const { state } = tick(prev, TICK_MS, attackStat, magicStat, allActions);
        return state;
      });
    }, TICK_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat?.phase, paused]);

  // Fin del combate
  useEffect(() => {
    if (!combat || endedRef.current) return;
    if (combat.phase === 'victory' || combat.phase === 'defeat' || combat.phase === 'fled') {
      endedRef.current = true;
      sfx(combat.phase === 'victory' ? 'victory' : 'defeat');
      setTimeout(() => onEnd(combat.phase as 'victory' | 'defeat' | 'fled'), 1400);
    }
  }, [combat, onEnd]);

  // Sonido de alerta al abrirse una ventana de reacción (§64)
  const hadIncoming = useRef(false);
  useEffect(() => {
    const has = Boolean(combat?.incoming);
    if (has && !hadIncoming.current) sfx('alert');
    hadIncoming.current = has;
  }, [combat?.incoming]);

  // Autoscroll del registro
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [combat?.log.length]);

  // COMBO cooperativo (§67): acción del compañero reciente + la mía
  const partnerElementRef = useRef<{ element: string; at: number } | null>(null);
  useEffect(() => {
    if (lastPartnerAction) {
      partnerElementRef.current = { element: lastPartnerAction.element, at: Date.now() };
    }
  }, [lastPartnerAction]);

  if (!save || !combat) return null;
  const enemy = getEnemy(combat.enemyId);
  const locale = getLocale();

  function doAction(action: CombatAction) {
    // §28: Salvar — perdonar la vida termina el combate si el enemigo está débil.
    if (action.id === 'spare_life') {
      setCombat((prev) => {
        if (!prev || prev.enemyHp > prev.enemyMaxHp * 0.3) return prev;
        const s2 = structuredClone(prev);
        s2.phase = 'victory';
        s2.log.push({
          text: {
            es: 'Bajas el arma. La criatura te mira... y comprende. Hay victorias que no necesitan sangre.',
            en: 'You lower your weapon. The creature looks at you... and understands. Some victories need no blood.'
          },
          tone: 'combo',
          at: Date.now()
        });
        return s2;
      });
      return;
    }
    setCombat((prev) => {
      if (!prev) return prev;
      let { state } = act(prev, action, attackStat, magicStat);
      // combo si el compañero actuó hace poco con elemento combinable
      const pe = partnerElementRef.current;
      if (inGroup && pe && Date.now() - pe.at < COMBO_WINDOW_MS && action.basePower > 0) {
        const r = tryCoopCombo(state, action.element, pe.element as never);
        state = r.state;
        if (r.comboId) partnerElementRef.current = null;
      }
      return state;
    });
    sfx(action.kind === 'spell' ? 'spell' : action.kind === 'attack' || action.kind === 'skill' ? 'hit' : 'ui');
    if (inGroup) sendCombatAction(action.id, action.element);
  }

  function doReaction(reaction: 'defend' | 'dodge' | 'interrupt' | 'counterspell') {
    sfx('ui');
    setCombat((prev) => (prev ? react(prev, reaction).state : prev));
  }

  const hpPct = (combat.enemyHp / combat.enemyMaxHp) * 100;
  const pHpPct = (combat.playerHp / combat.playerMaxHp) * 100;
  const pMpPct = combat.playerMaxMp > 0 ? (combat.playerMp / combat.playerMaxMp) * 100 : 0;
  const skills = allActions.filter((a) => a.kind === 'skill');
  const spells = allActions.filter((a) => a.kind === 'spell');
  const mainActions = allActions.filter((a) => ['attack', 'defend', 'analyze', 'item'].includes(a.kind));

  return (
    <div className="combat-screen" role="region" aria-label={t('combat.title')}>
      {/* ── ENEMIGO ── */}
      <div className="combat-enemy">
        <div className="combat-enemy-head">
          <span className="combat-enemy-portrait"><Portrait id={enemy.id} size={44} /></span>
          <span className="combat-enemy-name">{t(`enemy.${enemy.id}`)}</span>
          {combat.currentPhase > 0 && <span className="combat-phase">{t('combat.phase', { n: combat.currentPhase + 1 })}</span>}
          <button className="combat-pause" onClick={() => setPaused(!paused)} aria-label={t(paused ? 'combat.resume' : 'combat.pause')}>
            {paused ? '▶' : 'Ⅱ'}
          </button>
        </div>
        <div className="combat-hpbar enemy" role="progressbar" aria-valuenow={combat.enemyHp} aria-valuemax={combat.enemyMaxHp}>
          <div style={{ width: `${hpPct}%` }} />
        </div>
        {combat.enemyStatuses.length > 0 && (
          <div className="combat-statuses">
            {combat.enemyStatuses.map((st) => (
              <span key={st.effect} className={`status-chip st-${st.effect}`}>
                {t(`status.${st.effect}`)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── NARRACIÓN ── */}
      <div className="combat-log" ref={logRef} aria-live="polite">
        {combat.log.slice(-30).map((entry, i) => (
          <p key={i} className={`combat-line tone-${entry.tone}`}>
            {entry.text[locale] ?? entry.text.es}
            {entry.amount !== undefined && (
              <b className={entry.amount < 0 ? 'dmg' : 'healnum'}> {entry.amount}</b>
            )}
          </p>
        ))}
        {combat.casting && (
          <p className="combat-line tone-player casting">
            {t('combat.casting')} <CastBar remaining={combat.casting.remainingMs} action={actionById(combat.casting.actionId)} />
          </p>
        )}
        {paused && <p className="combat-line tone-system">{t('combat.pausedNote')}</p>}
      </div>

      {/* ── VENTANA DE REACCIÓN (§64) ── */}
      {combat.incoming && combat.phase === 'active' && (
        <div className="reaction-window" role="alert">
          <div className="reaction-timer">
            <div
              className="reaction-timer-fill"
              style={{ animationDuration: `${combat.incoming.remainingMs}ms` }}
            />
          </div>
          <div className="reaction-buttons">
            <button className="reaction-btn" onClick={() => doReaction('dodge')}>
              <IconSpark size={16} /> {t('combat.dodge')}
            </button>
            <button className="reaction-btn" onClick={() => doReaction('defend')}>
              <IconShield size={16} /> {t('combat.block')}
            </button>
            {allActions.some((a) => a.interrupts) && (
              <button className="reaction-btn" onClick={() => doReaction('interrupt')}>
                <IconRune size={16} /> {t('combat.interrupt')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── COMPAÑERO (§66) ── */}
      {inGroup && partner && (
        <div className="combat-partner">
          <GameIcon name="soul" size={14} className="ico-gold" />
          <span>{partner.name}</span>
          {lastPartnerAction && <em>· {t(`skill.${lastPartnerAction.actionId}`) || lastPartnerAction.actionId}</em>}
        </div>
      )}

      {/* ── JUGADOR: barras ── */}
      <div className="combat-player">
        <div className="combat-bar-row">
          <IconHeart size={14} className="ico-danger" />
          <div className="combat-hpbar player"><div style={{ width: `${pHpPct}%` }} /></div>
          <span className="combat-bar-num">{Math.ceil(combat.playerHp)}</span>
        </div>
        <div className="combat-bar-row">
          <IconDrop size={14} className="ico-teal" />
          <div className="combat-hpbar mana"><div style={{ width: `${pMpPct}%` }} /></div>
          <span className="combat-bar-num">{Math.ceil(combat.playerMp)}</span>
        </div>
        {combat.playerStatuses.length > 0 && (
          <div className="combat-statuses">
            {combat.playerStatuses.map((st) => (
              <span key={st.effect} className={`status-chip st-${st.effect}`}>{t(`status.${st.effect}`)}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── COMANDOS (§63): grandes, con coste y cooldown ── */}
      <div className="combat-tabs">
        <button className={`subtab ${tab === 'main' ? 'active' : ''}`} onClick={() => setTab('main')}>
          <IconSword size={14} /> {t('combat.tabMain')}
        </button>
        {skills.length > 0 && (
          <button className={`subtab ${tab === 'skills' ? 'active' : ''}`} onClick={() => setTab('skills')}>
            <IconSpark size={14} /> {t('combat.tabSkills')}
          </button>
        )}
        {spells.length > 0 && (
          <button className={`subtab ${tab === 'spells' ? 'active' : ''}`} onClick={() => setTab('spells')}>
            <IconRune size={14} /> {t('combat.tabSpells')}
          </button>
        )}
      </div>
      <div className="combat-actions">
        {(tab === 'main' ? mainActions : tab === 'skills' ? skills : spells).map((action) => {
          const cd = combat.cooldowns[action.id] ?? 0;
          const disabled =
            combat.phase !== 'active' || paused || cd > 0 ||
            combat.playerMp < action.mpCost || combat.playerStamina < action.staminaCost ||
            Boolean(combat.casting);
          return (
            <button
              key={action.id}
              className={`combat-action-btn ${disabled ? 'disabled' : ''} el-${action.element}`}
              disabled={disabled}
              onClick={() => doAction(action)}
            >
              <span className="combat-action-icon">
                {action.kind === 'attack' && <IconSword size={20} />}
                {action.kind === 'defend' && <IconShield size={20} />}
                {action.kind === 'analyze' && <IconMystery size={20} />}
                {action.kind === 'item' && <IconPotion size={20} />}
                {action.kind === 'skill' && <IconSpark size={20} />}
                {action.kind === 'spell' && <IconRune size={20} />}
              </span>
              <span className="combat-action-name">{t(`combat.action.${action.id}`)}</span>
              <span className="combat-action-cost">
                {action.mpCost > 0 && `${action.mpCost} MP`}
                {action.castMs > 0 && ` · ${(action.castMs / 1000).toFixed(1)}s`}
              </span>
              {cd > 0 && <span className="combat-cd" style={{ height: `${(cd / action.cooldownMs) * 100}%` }} />}
            </button>
          );
        })}
      </div>

      {/* ── RESULTADO ── */}
      {combat.phase === 'victory' && (
        <div className="combat-result victory">{t('combat.victory')}</div>
      )}
      {combat.phase === 'defeat' && (
        <div className="combat-result defeat">{t('combat.defeat')}</div>
      )}
    </div>
  );
}

function CastBar({ remaining, action }: { remaining: number; action?: CombatAction }) {
  if (!action) return null;
  const pct = 100 - (remaining / action.castMs) * 100;
  return (
    <span className="castbar">
      <span className="castbar-fill" style={{ width: `${pct}%` }} />
    </span>
  );
}
