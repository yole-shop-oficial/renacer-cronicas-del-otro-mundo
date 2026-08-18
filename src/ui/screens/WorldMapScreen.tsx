import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { REGIONS, NPCS } from '@/data/world';
import { poisForRegion, type PoiDef, type PoiAction } from '@/data/pois';
import { combatPower } from '@/domain/power';
import { loadPartnerSoul, type SoulProfile } from '@/services/souls';
import { GameIcon, IconPoi, IconLock, IconSoul, IconBond, type IconName } from '@/ui/icons';
import { useCoopStore } from '@/state/coopStore';
import { reunionForRegion } from '@/coop/reunions';
import { renderStoryText } from '@/engine/text';
import { lt } from '@/i18n';
import { applyEffects } from '@/engine/effects';
import { saveGameLocally } from '@/state/persistence';
import { useGameStore as gameStoreHook } from '@/state/gameStore';

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
  const [listView, setListView] = useState(localStorage.getItem('map_view') === 'list');
  const [openPoi, setOpenPoi] = useState<PoiDef | null>(null);
  const [partner, setPartner] = useState<SoulProfile | null>(null);
  const livePartner = useCoopStore((s) => s.partner);
  const separated = useCoopStore((s) => s.separated);
  const coopReunite = useCoopStore((s) => s.reunite);

  useEffect(() => {
    void loadPartnerSoul().then(setPartner);
  }, []);

  if (!save) return null;
  const { discoveredRegions, currentRegionId } = save.world;
  // Preferir la posición EN VIVO del alma conectada sobre la del código estático.
  const partnerRegion = livePartner?.regionId ?? partner?.regionId;
  const partnerName = livePartner?.name ?? partner?.name;
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

        {/* REENCUENTRO: almas separadas que se cruzan en esta región */}
        {separated && partnerRegion === openRegion && currentRegionId === openRegion && (() => {
          const scene = reunionForRegion(openRegion);
          if (!scene || save.world.flags[`_reunion_${scene.id}`]) return null;
          const iDefied = save.world.flags['marca_del_destino'] === true &&
            save.world.flags['marca_del_destino_redimida'] !== true;
          const text = iDefied ? scene.textDefiant : scene.textWinner;
          const ctx = {
            name: save.character.name,
            gender: save.character.gender ?? 'f',
            partner: partnerName ?? ''
          };
          async function acceptReunion() {
            const current = gameStoreHook.getState().save;
            if (!current || !scene) return;
            const result = applyEffects(scene.onReunite, current.character, current.world);
            result.world.flags[`_reunion_${scene.id}`] = true;
            delete result.world.flags['grupo_separado'];
            result.world.flags['grupo_reunido'] = true;
            const updated = { ...current, character: result.character, world: result.world, updatedAt: Date.now() };
            await saveGameLocally(updated);
            gameStoreHook.setState({ save: updated, narrationLog: result.log });
            coopReunite();
          }
          return (
            <div className="card reunion-card" role="region" aria-label={t('reunion.title')}>
              <h3 className="with-icon">
                <IconBond size={18} className="ico-pink" /> {t('reunion.title')}
              </h3>
              <div className="parchment reunion-text">
                {renderStoryText(lt(text), ctx)}
              </div>
              <div className="reunion-actions">
                <button className="btn-primary" onClick={() => void acceptReunion()}>
                  {t('reunion.accept')}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setOpenRegion(null)}
                >
                  {t('reunion.walkAway')}
                </button>
              </div>
              <p className="hint-text" style={{ marginTop: 8 }}>{t('reunion.hint')}</p>
            </div>
          );
        })()}

        {!openPoi && (
          <p className="hint-text" style={{ textAlign: 'center' }}>{t('map.tapPoi')}</p>
        )}
      </div>
    );
  }

  // ── Vista general de regiones ──
  return (
    <div className="panel">
      <div className="map-head-row">
        <h2 className="section-title">{t('nav.world')}</h2>
        <button
          className="btn-secondary map-view-toggle"
          onClick={() => {
            const next = !listView;
            setListView(next);
            localStorage.setItem('map_view', next ? 'list' : 'map');
          }}
        >
          {listView ? t('map.viewMap') : t('map.viewList')}
        </button>
      </div>
      <p className="hint-text">{t('map.hint')}</p>
      {separated && partnerRegion && partnerRegion === currentRegionId && (
        <button className="card reunion-banner" onClick={() => setOpenRegion(currentRegionId)}>
          <IconBond size={18} className="ico-pink" />
          <span>{t('reunion.nearby', { name: partnerName ?? '' })}</span>
        </button>
      )}
      {listView ? (
        <div className="region-list">
          {REGIONS.map((r) => {
            const discovered = discoveredRegions.includes(r.id);
            const isHere = r.id === currentRegionId;
            return (
              <button
                key={r.id}
                className={`region-list-row ${isHere ? 'current' : ''} ${discovered ? '' : 'undiscovered'}`}
                disabled={!discovered}
                onClick={() => setOpenRegion(r.id)}
              >
                <GameIcon name={discovered ? REGION_ICON[r.kind] : 'mystery'} size={20} />
                <span className="region-list-name">
                  {discovered ? t(`region.${r.id}`) : t('region.unknown')}
                </span>
                {isHere && <span className="region-tile-here">{t('map.youAreHere')}</span>}
                {discovered && (
                  <span className="region-list-pois">
                    <IconPoi size={12} /> {poisForRegion(r.id).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
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
      )}
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
