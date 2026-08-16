import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { REGIONS, NPCS } from '@/data/world';
import { poisForRegion, type PoiDef, type PoiAction } from '@/data/pois';
import { combatPower } from '@/domain/power';
import { loadPartnerSoul, type SoulProfile } from '@/services/souls';
import { GameIcon, IconPoi, IconLock, IconSoul, type IconName } from '@/ui/icons';

/**
 * MAPA MEJORADO: regiones como tarjetas ilustradas; al tocar una región
 * descubierta se abre su plano con PUNTOS DE RECORRIDO señalados.
 * Entrar en un punto muestra sus acciones/eventos (con requisitos).
 * Si hay un alma sincronizada, su posición aparece en el mapa.
 */

const REGION_ICON: Record<string, IconName> = {
  village: 'village',
  forest: 'forest',
  city: 'city',
  ruins: 'ruins',
  temple: 'temple',
  unknown: 'mystery'
};

export function WorldMapScreen() {
  const save = useGameStore((s) => s.save);
  const performPoiAction = useGameStore((s) => s.performPoiAction);
  const [openRegion, setOpenRegion] = useState<string | null>(null);
  const [openPoi, setOpenPoi] = useState<PoiDef | null>(null);
  const [partner, setPartner] = useState<SoulProfile | null>(null);

  useEffect(() => {
    void loadPartnerSoul().then(setPartner);
  }, []);

  if (!save) return null;
  const { discoveredRegions, currentRegionId } = save.world;
  const power = combatPower(save.character, NPCS, save.world);

  // ── Vista de plano de región con puntos de recorrido ──
  if (openRegion) {
    const region = REGIONS.find((r) => r.id === openRegion)!;
    const pois = poisForRegion(openRegion);
    return (
      <div className="panel">
        <div className="map-region-head">
          <button className="btn-secondary map-back" onClick={() => { setOpenRegion(null); setOpenPoi(null); }}>
            ← {t('map.back')}
          </button>
          <h2 className="section-title with-icon">
            <GameIcon name={REGION_ICON[region.kind]} size={22} className="ico-gold" />
            {t(`region.${region.id}`)}
          </h2>
        </div>

        {/* Plano de la región */}
        <div className={`region-plane plane-${region.kind}`} role="img" aria-label={t(`region.${region.id}`)}>
          <div className="plane-texture" aria-hidden />
          {pois.map((poi) => {
            const visited = save.world.flags[`_poi_done_${poi.id}`] === true;
            return (
              <button
                key={poi.id}
                className={`poi-marker ${visited ? 'visited' : ''} ${openPoi?.id === poi.id ? 'active' : ''}`}
                style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
                onClick={() => setOpenPoi(poi)}
                aria-label={t(`poi.${poi.id}`)}
              >
                <GameIcon name={poi.icon} size={17} />
                <span className="poi-pulse" aria-hidden />
              </button>
            );
          })}
          {/* Alma sincronizada en este plano */}
          {partner && partner.regionId === openRegion && (
            <div className="poi-marker partner-marker" style={{ left: '88%', top: '16%' }} title={partner.name}>
              <IconSoul size={16} />
            </div>
          )}
        </div>

        {/* Detalle del punto tocado */}
        {openPoi && (
          <div className="card poi-detail">
            <h3 className="with-icon">
              <GameIcon name={openPoi.icon} size={18} className="ico-gold" />
              {t(`poi.${openPoi.id}`)}
            </h3>
            <p className="hint-text">{t(`poi.${openPoi.id}.desc`)}</p>
            {openPoi.actions.map((action) => (
              <PoiActionRow
                key={action.id}
                action={action}
                done={save.world.flags[`_poi_act_${action.id}`] === true}
                level={save.character.level}
                power={power}
                flagOk={!action.requiresFlag || Boolean(save.world.flags[action.requiresFlag])}
                onDo={() => void performPoiAction(openPoi.id, action.id)}
              />
            ))}
          </div>
        )}

        {!openPoi && (
          <p className="hint-text" style={{ textAlign: 'center' }}>{t('map.tapPoi')}</p>
        )}
      </div>
    );
  }

  // ── Vista general de regiones ──
  return (
    <div className="panel">
      <h2 className="section-title">{t('nav.world')}</h2>
      <p className="hint-text">{t('map.hint')}</p>
      <div className="region-grid2">
        {REGIONS.map((r) => {
          const discovered = discoveredRegions.includes(r.id);
          const isHere = r.id === currentRegionId;
          const partnerHere = partner?.regionId === r.id;
          const poiCount = poisForRegion(r.id).length;
          return (
            <button
              key={r.id}
              className={`region-tile plane-${r.kind} ${isHere ? 'current' : ''} ${discovered ? '' : 'undiscovered'}`}
              disabled={!discovered}
              onClick={() => setOpenRegion(r.id)}
            >
              <div className="plane-texture" aria-hidden />
              <GameIcon name={discovered ? REGION_ICON[r.kind] : 'mystery'} size={30} className="region-tile-icon" />
              <span className="region-tile-name">
                {discovered ? t(`region.${r.id}`) : t('region.unknown')}
              </span>
              {discovered && poiCount > 0 && (
                <span className="region-tile-pois">
                  <IconPoi size={12} /> {poiCount}
                </span>
              )}
              {isHere && <span className="region-tile-here">{t('map.youAreHere')}</span>}
              {partnerHere && discovered && (
                <span className="region-tile-partner" title={partner?.name}>
                  <IconSoul size={13} /> {partner?.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PoiActionRow({
  action,
  done,
  level,
  power,
  flagOk,
  onDo
}: {
  action: PoiAction;
  done: boolean;
  level: number;
  power: number;
  flagOk: boolean;
  onDo: () => void;
}) {
  const levelOk = !action.requiredLevel || level >= action.requiredLevel;
  const powerOk = !action.requiredPower || power >= action.requiredPower;
  const available = !done && levelOk && powerOk && flagOk;

  return (
    <div className={`poi-action ${done ? 'done' : available ? '' : 'locked'}`}>
      <div className="poi-action-info">
        <span className="poi-action-name">{t(`poiact.${action.id}`)}</span>
        <span className="hint-text">{t(`poiact.${action.id}.desc`)}</span>
        {(action.requiredLevel || action.requiredPower) && (
          <span className="poi-action-req hint-text">
            {action.requiredLevel ? `${t('bond.reqLevel', { level: action.requiredLevel })} ` : ''}
            {action.requiredPower ? `· ${t('power.title')} ${action.requiredPower}` : ''}
          </span>
        )}
      </div>
      {done ? (
        <span className="poi-action-done">{t('map.done')}</span>
      ) : available ? (
        <button className="btn-primary poi-action-btn" onClick={onDo}>
          {t('map.enter')}
        </button>
      ) : (
        <span className="poi-action-lock">
          <IconLock size={14} />
          {!flagOk ? t('map.lockStory') : !levelOk ? t('bond.lockLevel') : t('bond.lockPower')}
        </span>
      )}
    </div>
  );
}
