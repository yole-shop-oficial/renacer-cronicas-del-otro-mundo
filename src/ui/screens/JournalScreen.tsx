import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { NPCS, REGIONS } from '@/data/world';
import { availableRumors } from '@/data/rumors';
import { earnedMemories } from '@/data/memories';
import { RELATIONSHIP_AXES } from '@/domain/types';
import { dominantTrait, TRAITS, traitValue } from '@/domain/personality';
import { getMeta, setMeta } from '@/services/localdb';
import { GameIcon, IconBook, IconBond, IconMap as IconMapIco, IconScroll, IconMystery, IconStar, IconSoul } from '@/ui/icons';
import { Portrait, hasPortrait } from '@/ui/portraits';

/**
 * DIARIO (§36): Personas · Lugares · Misiones · Rumores · Decisiones ·
 * Recuerdos. Además muestra la personalidad (§27) y, al volver tras un
 * tiempo, el resumen "Mientras estabas fuera" (§37).
 */

type JTab = 'people' | 'places' | 'quests' | 'rumors' | 'memories' | 'soul';

export function JournalScreen() {
  const save = useGameStore((s) => s.save);
  const [tab, setTab] = useState<JTab>('memories');
  const [awayNote, setAwayNote] = useState<string[] | null>(null);

  // §37 — "Mientras estabas fuera": si pasaron >8h desde la última sesión.
  useEffect(() => {
    void (async () => {
      const lastSeen = Number((await getMeta('last_seen')) ?? 0);
      const now = Date.now();
      await setMeta('last_seen', String(now));
      if (!save || !lastSeen || now - lastSeen < 8 * 3600_000) return;
      const notes: string[] = [];
      const f = save.world.flags;
      if (f.poachers_mystery_open && !f.servan_vell_arc_open) notes.push(t('away.poachers'));
      if (f.servan_vell_arc_open && !f.vell_knows_you_exist) notes.push(t('away.serpent'));
      if (f.vell_knows_you_exist) notes.push(t('away.vell'));
      if (f.freed_mist_creature) notes.push(t('away.creature'));
      if (notes.length === 0) notes.push(t('away.quiet'));
      setAwayNote(notes);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!save) return null;
  const { world, character } = save;

  const TABS: { id: JTab; icon: React.ReactNode; label: string }[] = [
    { id: 'memories', icon: <IconStar size={14} />, label: t('journal.memories') },
    { id: 'people', icon: <IconBond size={14} />, label: t('journal.people') },
    { id: 'places', icon: <IconMapIco size={14} />, label: t('journal.places') },
    { id: 'quests', icon: <IconScroll size={14} />, label: t('journal.quests') },
    { id: 'rumors', icon: <IconMystery size={14} />, label: t('journal.rumors') },
    { id: 'soul', icon: <IconSoul size={14} />, label: t('journal.soul') }
  ];

  const knownNpcs = NPCS.filter((n) => {
    const rel = world.npcRelationships[n.id];
    return rel && RELATIONSHIP_AXES.some((a) => rel[a] !== 0);
  });
  const memories = earnedMemories(world.flags);
  const rumors = availableRumors(world.flags, world.discoveredRegions);
  const decisions = [...world.decisions].sort((a, b) => b.at - a.at).slice(0, 12);
  const dom = dominantTrait(character.personality);

  return (
    <div className="panel">
      <h2 className="section-title with-icon">
        <IconBook size={20} className="ico-gold" /> {t('journal.title')}
      </h2>

      {/* §37 Mientras estabas fuera */}
      {awayNote && (
        <div className="card away-card">
          <h3>{t('away.title')}</h3>
          {awayNote.map((n, i) => (
            <p key={i} className="hint-text">❖ {n}</p>
          ))}
          <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => setAwayNote(null)}>
            {t('ui.continue')}
          </button>
        </div>
      )}

      <div className="subtabs" style={{ padding: 0 }}>
        {TABS.map(({ id, icon, label }) => (
          <button key={id} className={`subtab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* RECUERDOS (§39) */}
      {tab === 'memories' && (
        <>
          {memories.length === 0 && <p className="hint-text">{t('journal.noMemories')}</p>}
          {memories.map((m) => (
            <div className="card memory-card" key={m.id}>
              <span className="memory-icon"><GameIcon name={m.icon} size={22} /></span>
              <div>
                <h3>{t(`memory.${m.id}`)}</h3>
                <p>{t(`memory.${m.id}.text`)}</p>
              </div>
            </div>
          ))}
        </>
      )}

      {/* PERSONAS */}
      {tab === 'people' && (
        <>
          {knownNpcs.length === 0 && <p className="hint-text">{t('ui.empty')}</p>}
          {knownNpcs.map((n) => (
            <div className="card" key={n.id}>
              <div className="npc-card-head">
                {hasPortrait(n.id) && <Portrait id={n.id} size={52} className="npc-portrait" />}
                <div>
                  <h3>{t(`speaker.${n.id}`)}</h3>
                  <p className="hint-text">{t(`region.${n.regionId}`)}</p>
                </div>
              </div>
              <p>{t(`npc.${n.id}.bio`)}</p>
            </div>
          ))}
        </>
      )}

      {/* LUGARES */}
      {tab === 'places' && (
        <>
          {REGIONS.filter((r) => world.discoveredRegions.includes(r.id)).map((r) => (
            <div className="card" key={r.id}>
              <h3>{t(`region.${r.id}`)}</h3>
              {r.id === world.currentRegionId && (
                <p className="hint-text">✦ {t('map.youAreHere')}</p>
              )}
            </div>
          ))}
        </>
      )}

      {/* MISIONES + DECISIONES */}
      {tab === 'quests' && (
        <>
          {world.quests.map((q) => (
            <div className="card" key={q.questId}>
              <h3>{t(`quest.${q.questId}`)}</h3>
              <p className="hint-text">{q.status === 'completed' ? '✓ ' : '❖ '}{t(`quest.status.${q.status}`)}</p>
            </div>
          ))}
          <h3 className="section-title" style={{ fontSize: 15, marginTop: 8 }}>{t('journal.decisions')}</h3>
          {decisions.map((d) => (
            <div className="card journal-decision" key={d.id}>
              <p className="hint-text">{new Date(d.at).toLocaleDateString()}</p>
              <p>❧ {t('journal.decidedAt', { node: d.nodeId })}</p>
            </div>
          ))}
        </>
      )}

      {/* RUMORES (§35) */}
      {tab === 'rumors' && (
        <>
          {rumors.length === 0 && <p className="hint-text">{t('journal.noRumors')}</p>}
          {rumors.map((r) => {
            const revealed = r.revealFlag && Boolean(world.flags[r.revealFlag]);
            return (
              <div className={`card rumor-card ${revealed ? `rumor-${r.truth}` : ''}`} key={r.id}>
                <h3 className="with-icon">
                  <IconMystery size={16} className="ico-arcane" /> {t(`rumor.${r.id}`)}
                </h3>
                <p>{t(`rumor.${r.id}.text`)}</p>
                <p className="hint-text" style={{ marginTop: 6 }}>
                  {revealed
                    ? r.truth === 'true'
                      ? `✓ ${t('journal.rumorTrue')}`
                      : r.truth === 'false'
                        ? `✗ ${t('journal.rumorFalse')}`
                        : `◐ ${t('journal.rumorPartial')}`
                    : `? ${t('journal.rumorUnverified')}`}
                </p>
              </div>
            );
          })}
        </>
      )}

      {/* ALMA: personalidad (§27) */}
      {tab === 'soul' && (
        <div className="card">
          <h3>{t('journal.personality')}</h3>
          {dom && (
            <p className="hint-text" style={{ marginBottom: 8 }}>
              {t('journal.dominant', { trait: t(`trait.${dom}`) })}
            </p>
          )}
          {TRAITS.filter((tr) => traitValue(character.personality, tr) !== 0).map((tr) => {
            const v = traitValue(character.personality, tr);
            return (
              <div className="attr-row" key={tr}>
                <span className="attr-name">{t(`trait.${tr}`)}</span>
                <div className="trait-bar">
                  <div style={{ width: `${Math.min(100, Math.abs(v) * 10)}%` }} />
                </div>
                <b className="attr-value">{v > 0 ? `+${v}` : v}</b>
              </div>
            );
          })}
          {TRAITS.every((tr) => traitValue(character.personality, tr) === 0) && (
            <p className="hint-text">{t('journal.noTraits')}</p>
          )}
          <p className="hint-text" style={{ marginTop: 10 }}>{t('journal.traitsHint')}</p>
        </div>
      )}
    </div>
  );
}
