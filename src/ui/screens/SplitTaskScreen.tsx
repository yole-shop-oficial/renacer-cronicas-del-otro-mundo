import { useEffect, useRef, useState } from 'react';
import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { useCoopStore } from '@/state/coopStore';
import {
  splitTaskById,
  createRitual,
  ritualPulse,
  resolveSplit,
  type SplitRole,
  type RitualState
} from '@/coop/splitTasks';
import { CombatScreen } from './CombatScreen';
import { sfx } from '@/services/audio';
import { GameIcon, IconSword, IconRune, IconBond, IconSpark } from '@/ui/icons';

/**
 * TAREAS DIVIDIDAS (§45) — dos cosas ocurren A LA VEZ.
 * EN PAREJA: cada alma reclama un rol; los resultados viajan por el
 * enlace y se funden. EN SOLITARIO: ritual contrarreloj → combate,
 * misma resolución combinada. Nadie se bloquea jamás.
 */

interface Props {
  taskId: string;
  onResolve: (outcomeNodeId: string, bothWon: boolean) => void;
}

export function SplitTaskScreen({ taskId, onResolve }: Props) {
  const def = splitTaskById(taskId);
  const save = useGameStore((s) => s.save);
  const partner = useCoopStore((s) => s.partner);
  const inGroup = useCoopStore((s) => s.inGroup);
  const partnerSplit = useCoopStore((s) => s.partnerSplit);
  const claimSplitRole = useCoopStore((s) => s.claimSplitRole);
  const reportSplitResult = useCoopStore((s) => s.reportSplitResult);
  const clearSplit = useCoopStore((s) => s.clearSplit);

  const duo = Boolean(partner && inGroup);
  const [myRole, setMyRole] = useState<SplitRole | null>(null);
  const [stage, setStage] = useState<'pick' | 'task' | 'second' | 'waiting'>('pick');
  const [combatWon, setCombatWon] = useState<boolean | null>(null);
  const [ritualWon, setRitualWon] = useState<boolean | null>(null);
  const resolvedRef = useRef(false);

  // El compañero reclamó un rol → el mío es el otro.
  useEffect(() => {
    if (duo && partnerSplit?.taskId === taskId && !myRole && stage === 'pick') {
      const mine: SplitRole = partnerSplit.role === 'combat' ? 'ritual' : 'combat';
      setMyRole(mine);
      setStage('task');
    }
  }, [duo, partnerSplit, taskId, myRole, stage]);

  // Resultado del compañero.
  useEffect(() => {
    if (!duo || partnerSplit?.taskId !== taskId || partnerSplit.won === undefined) return;
    if (partnerSplit.role === 'combat') setCombatWon((v) => (v === null ? partnerSplit.won! : v));
    else setRitualWon((v) => (v === null ? partnerSplit.won! : v));
  }, [duo, partnerSplit, taskId]);

  // Fusión de resultados (§45).
  useEffect(() => {
    if (resolvedRef.current) return;
    if (combatWon !== null && ritualWon !== null) {
      resolvedRef.current = true;
      clearSplit();
      const outcome = resolveSplit(def, combatWon, ritualWon);
      setTimeout(() => onResolve(outcome, combatWon && ritualWon), 900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combatWon, ritualWon]);

  if (!save) return null;

  function pickRole(role: SplitRole) {
    sfx('ui');
    setMyRole(role);
    setStage('task');
    if (duo) claimSplitRole(taskId, role);
  }

  function finishMyTask(role: SplitRole, won: boolean) {
    if (role === 'combat') setCombatWon(won);
    else setRitualWon(won);
    if (duo) {
      reportSplitResult(taskId, role, won);
      setStage('waiting');
    } else {
      // SOLITARIO: la otra tarea se juega en secuencia.
      const otherPending = role === 'combat' ? ritualWon === null : combatWon === null;
      if (otherPending) {
        setMyRole(role === 'combat' ? 'ritual' : 'combat');
        setStage('second');
      }
    }
  }

  // ── ELECCIÓN DE ROL ──
  if (stage === 'pick') {
    return (
      <div className="panel split-pick">
        <h2 className="section-title with-icon">
          <IconBond size={20} className="ico-pink" /> {t('split.title')}
        </h2>
        <p className="hint-text">{duo ? t('split.explainDuo', { name: partner?.name ?? '' }) : t('split.explainSolo')}</p>
        <button className="card selectable split-role-card" onClick={() => pickRole('combat')}>
          <IconSword size={30} className="ico-danger" />
          <h3>{t('split.roleCombat')}</h3>
          <p>{t(`split.${taskId}.combat`)}</p>
        </button>
        <button className="card selectable split-role-card" onClick={() => pickRole('ritual')}>
          <IconRune size={30} className="ico-arcane" />
          <h3>{t('split.roleRitual')}</h3>
          <p>{t(`split.${taskId}.ritual`)}</p>
        </button>
        {duo && <p className="hint-text" style={{ textAlign: 'center' }}>{t('split.partnerGets')}</p>}
      </div>
    );
  }

  // ── ESPERANDO AL COMPAÑERO ──
  if (stage === 'waiting') {
    return (
      <div className="center-screen">
        <IconSpark size={48} className="ico-gold" />
        <p className="game-tagline">{t('split.waiting', { name: partner?.name ?? '' })}</p>
        <p className="hint-text">{t('split.waitingHint')}</p>
      </div>
    );
  }

  // ── MI TAREA (o la segunda, en solitario) ──
  if (myRole === 'combat') {
    return (
      <CombatScreen
        combatId={def.combatId}
        onEnd={(result) => finishMyTask('combat', result === 'victory')}
      />
    );
  }
  return <RitualPanel def={def} onEnd={(won) => finishMyTask('ritual', won)} />;
}

/** Tarea B: el ritual de pulsos — tocar cuando el anillo cruza la zona. */
function RitualPanel({
  def,
  onEnd
}: {
  def: ReturnType<typeof splitTaskById>;
  onEnd: (won: boolean) => void;
}) {
  const [ritual, setRitual] = useState<RitualState>(createRitual);
  const [cycle, setCycle] = useState(0); // reinicia la animación del anillo
  const windowOpenRef = useRef(false);
  const doneRef = useRef(false);

  // Cada pulso: el anillo se cierra durante windowMs; la zona buena es el último 35%.
  useEffect(() => {
    if (ritual.phase !== 'active') return;
    windowOpenRef.current = false;
    const openAt = setTimeout(() => {
      windowOpenRef.current = true;
      sfx('alert');
    }, def.ritual.windowMs * 0.65);
    const missAt = setTimeout(() => {
      // no tocó a tiempo → fallo
      setRitual((r) => ritualPulse(r, false, def.ritual));
      setCycle((c) => c + 1);
    }, def.ritual.windowMs + 250);
    return () => {
      clearTimeout(openAt);
      clearTimeout(missAt);
    };
  }, [cycle, ritual.phase, def.ritual]);

  useEffect(() => {
    if (doneRef.current || ritual.phase === 'active') return;
    doneRef.current = true;
    sfx(ritual.phase === 'success' ? 'victory' : 'defeat');
    setTimeout(() => onEnd(ritual.phase === 'success'), 1100);
  }, [ritual.phase, onEnd]);

  function tap() {
    if (ritual.phase !== 'active') return;
    const hit = windowOpenRef.current;
    sfx(hit ? 'spell' : 'hurt');
    setRitual((r) => ritualPulse(r, hit, def.ritual));
    setCycle((c) => c + 1);
  }

  return (
    <div className="ritual-screen" role="region" aria-label={t('split.roleRitual')}>
      <h2 className="section-title">{t(`split.${def.id}.ritualTitle`)}</h2>
      <p className="hint-text">{t('split.ritualHint')}</p>

      <div className="ritual-progress">
        {Array.from({ length: def.ritual.steps }).map((_, i) => (
          <span key={i} className={`ritual-step ${i < ritual.step ? 'done' : ''}`} />
        ))}
      </div>

      <button className="ritual-target" onClick={tap} disabled={ritual.phase !== 'active'}>
        <span
          key={cycle}
          className="ritual-ring"
          style={{ animationDuration: `${def.ritual.windowMs}ms` }}
          aria-hidden
        />
        <span className="ritual-core">
          <GameIcon name="rune" size={34} />
        </span>
      </button>

      <p className="ritual-misses">
        {t('split.misses', { used: ritual.misses, max: def.ritual.maxMisses })}
      </p>

      {ritual.phase === 'success' && <div className="combat-result victory">{t('split.ritualDone')}</div>}
      {ritual.phase === 'failed' && <div className="combat-result defeat">{t('split.ritualFailed')}</div>}
    </div>
  );
}
