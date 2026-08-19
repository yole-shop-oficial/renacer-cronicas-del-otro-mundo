import { useState } from 'react';
import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import {
  zoneById,
  exploredNodes,
  reachableNodes,
  zoneCompletion,
  type ZoneNode
} from '@/data/zones';
import { CombatScreen } from './CombatScreen';
import { sfx } from '@/services/audio';
import { GameIcon, type IconName } from '@/ui/icons';

/**
 * EXPLORACIÓN REAL — mini-mapa de puntos conectados dentro de la zona.
 * Eliges ruta punto a punto: combate, evento, tesoro, recolección o
 * descanso según el nodo. Progreso 0-100% con bonus al completar.
 */

const NODE_ICON: Record<ZoneNode['kind'], IconName> = {
  start: 'poi',
  combat: 'sword',
  event: 'spark',
  treasure: 'coin',
  gather: 'potion',
  rest: 'heart'
};

interface Props {
  zoneId: string;
  onExit: () => void;
}

export function ZoneExploreScreen({ zoneId, onExit }: Props) {
  const save = useGameStore((s) => s.save);
  const exploreZoneNode = useGameStore((s) => s.exploreZoneNode);
  const registerZoneKill = useGameStore((s) => s.registerZoneKill);
  const narrationLog = useGameStore((s) => s.narrationLog);
  const [fighting, setFighting] = useState<{ nodeId: string; enemyId: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  if (!save) return null;
  const zone = zoneById(zoneId);
  const flags = save.world.flags;
  const explored = new Set(exploredNodes(zone, flags));
  const reachable = new Set(reachableNodes(zone, flags));
  const completion = zoneCompletion(zone, flags);
  const selNode = selected ? zone.nodes.find((n) => n.id === selected) : null;

  // combate de nodo en curso
  if (fighting) {
    return (
      <CombatScreen
        combatId={fighting.enemyId}
        onEnd={(result) => {
          void registerZoneKill(zoneId, fighting.nodeId, fighting.enemyId, result === 'victory');
          setFighting(null);
          setSelected(null);
        }}
      />
    );
  }

  function enterNode(node: ZoneNode) {
    if (!reachable.has(node.id)) return;
    sfx('page');
    if (node.kind === 'combat') {
      const enemyId = node.enemyId ?? zone.monsterPool[Math.floor(Math.random() * zone.monsterPool.length)];
      setFighting({ nodeId: node.id, enemyId });
    } else {
      void exploreZoneNode(zoneId, node.id);
      setSelected(null);
    }
  }

  return (
    <div className="panel zone-panel">
      <div className="map-region-head">
        <button className="btn-secondary map-back" onClick={onExit}>
          ← {t('zone.back')}
        </button>
        <h2 className="section-title with-icon">
          <GameIcon name="map" size={20} className="ico-gold" /> {t(`region.${zone.regionId}`)}
        </h2>
      </div>

      {/* Peligro y progreso */}
      <div className="zone-meta">
        <span className="zone-danger" title={t('zone.danger')}>
          {'☠'.repeat(zone.danger)}
          <em>{'☠'.repeat(5 - zone.danger)}</em>
        </span>
        <span className="hint-text">{t('zone.suggested', { level: zone.suggestedLevel })}</span>
        <span className="zone-completion">{completion}%</span>
      </div>
      <div className="bond-bar zone-bar" role="progressbar" aria-valuenow={completion} aria-valuemax={100}>
        <div style={{ width: `${completion}%` }} />
      </div>
      {save.character.level < zone.suggestedLevel - 1 && (
        <p className="zone-warning">⚠ {t('zone.tooDangerous')}</p>
      )}

      {/* MINI-MAPA DE PUNTOS */}
      <div className={`region-plane plane-${zone.regionId === 'bosque_susurros' ? 'forest' : zone.regionId === 'puerto_zafir' ? 'city' : 'ruins'} zone-plane`}>
        <div className="plane-texture" aria-hidden />
        {/* conexiones */}
        <svg className="zone-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {zone.nodes.flatMap((n) =>
            n.connects
              .filter((c) => c > n.id) // una línea por par
              .map((c) => {
                const other = zone.nodes.find((o) => o.id === c);
                if (!other) return null;
                const active = explored.has(n.id) && explored.has(other.id);
                const open = (explored.has(n.id) && reachable.has(other.id)) || (explored.has(other.id) && reachable.has(n.id));
                return (
                  <line
                    key={`${n.id}-${c}`}
                    x1={n.x} y1={n.y} x2={other.x} y2={other.y}
                    className={active ? 'link-done' : open ? 'link-open' : 'link-hidden'}
                  />
                );
              })
          )}
        </svg>
        {/* nodos */}
        {zone.nodes.map((node) => {
          const isExplored = explored.has(node.id);
          const isReachable = reachable.has(node.id);
          if (!isExplored && !isReachable) {
            return (
              <span key={node.id} className="zone-node hidden" style={{ left: `${node.x}%`, top: `${node.y}%` }} aria-hidden>
                ?
              </span>
            );
          }
          return (
            <button
              key={node.id}
              className={`zone-node ${isExplored ? 'explored' : 'reachable'} ${selected === node.id ? 'active' : ''} kind-${node.kind}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => (isReachable ? setSelected(node.id) : undefined)}
              aria-label={t(`zone.node.${zone.id}.${node.id}`)}
            >
              <GameIcon name={NODE_ICON[node.kind]} size={15} />
              {isReachable && <span className="poi-pulse" aria-hidden />}
            </button>
          );
        })}
      </div>

      {/* Detalle del nodo seleccionado */}
      {selNode && reachable.has(selNode.id) && (
        <div className="card poi-detail">
          <h3 className="with-icon">
            <GameIcon name={NODE_ICON[selNode.kind]} size={18} className="ico-gold" />
            {t(`zone.node.${zone.id}.${selNode.id}`)}
          </h3>
          <p className="hint-text">{t(`zone.node.${zone.id}.${selNode.id}.desc`)}</p>
          <button className="btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={() => enterNode(selNode)}>
            {selNode.kind === 'combat' ? t('zone.fight') : t('zone.enter')}
          </button>
        </div>
      )}

      {!selNode && narrationLog.length > 0 && (
        <div className="effect-log" aria-live="polite">
          {narrationLog.map((entry, i) => (
            <div key={i}>{t(entry.key, entry.params)}</div>
          ))}
        </div>
      )}
      {!selNode && narrationLog.length === 0 && (
        <p className="hint-text" style={{ textAlign: 'center' }}>{t('zone.tapNode')}</p>
      )}
    </div>
  );
}
