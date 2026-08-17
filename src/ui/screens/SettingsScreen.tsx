import { useEffect, useState } from 'react';
import { getLocale, setLocale, t, type Locale } from '@/i18n';
import { useAppStore } from '@/state/appStore';
import { detectDevice, connectionType, loadPartnerSoul, type SoulProfile } from '@/services/souls';
import { SoulScreen } from './SoulScreen';
import { GameIcon, IconWave, IconSoul, IconGear } from '@/ui/icons';

/**
 * AJUSTES: idioma, conexión y sincronización entre los dos teléfonos
 * (iPhone / Android / Windows), estado del dispositivo y almas vinculadas.
 */
export function SettingsScreen() {
  const online = useAppStore((s) => s.online);
  const [, force] = useState(0);
  const [view, setView] = useState<'main' | 'souls'>('main');
  const [partner, setPartner] = useState<SoulProfile | null>(null);
  const device = detectDevice();

  useEffect(() => {
    void loadPartnerSoul().then(setPartner);
  }, [view]);

  if (view === 'souls') {
    return (
      <>
        <div className="subtabs">
          <button className="subtab" onClick={() => setView('main')}>
            ← {t('nav.settings')}
          </button>
          <button className="subtab active">{t('soul.title')}</button>
        </div>
        <SoulScreen />
      </>
    );
  }

  function switchLocale(l: Locale) {
    setLocale(l);
    force((n) => n + 1);
  }


  return (
    <div className="panel">
      <h2 className="section-title">{t('nav.settings')}</h2>

      {/* CONEXIÓN */}
      <div className="card">
        <h3 className="with-icon">
          <IconWave size={18} className={online ? 'ico-teal' : 'ico-danger'} />
          {t('settings.connection')}
        </h3>
        <div className="settings-rows">
          <div className="settings-row">
            <span>{t('settings.network')}</span>
            <b className={online ? 'text-ok' : 'text-bad'}>
              {online ? t('status.online') : t('status.offline')}
            </b>
          </div>
          <div className="settings-row">
            <span>{t('settings.connType')}</span>
            <b>{connectionType()}</b>
          </div>

        </div>
        <p className="hint-text" style={{ marginTop: 8 }}>{t('settings.offlineFirstNote')}</p>
      </div>

      {/* DISPOSITIVO */}
      <div className="card">
        <h3 className="with-icon">
          <IconGear size={18} className="ico-arcane" />
          {t('settings.device')}
        </h3>
        <div className="settings-rows">
          <div className="settings-row">
            <span>{t('settings.platform')}</span>
            <b>{device.label}</b>
          </div>
          <div className="settings-row">
            <span>{t('settings.installed')}</span>
            <b>{device.standalone ? t('settings.yes') : t('settings.no')}</b>
          </div>
        </div>
        <p className="hint-text" style={{ marginTop: 8 }}>{t('settings.compatNote')}</p>
      </div>

      {/* ALMAS VINCULADAS */}
      <button className="card soul-settings-card" onClick={() => setView('souls')}>
        <h3 className="with-icon">
          <IconSoul size={18} className="ico-gold" />
          {t('soul.title')}
        </h3>
        {partner ? (
          <p>
            {t('soul.linkedWith', { name: partner.name })} · {t(`region.${partner.regionId}`)}
          </p>
        ) : (
          <p className="hint-text">{t('soul.noneLinked')}</p>
        )}
        <span className="soul-settings-arrow">
          <GameIcon name="arrow" size={18} />
        </span>
      </button>

      {/* IDIOMA */}
      <div className="card">
        <h3>{t('settings.language')}</h3>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            className={getLocale() === 'es' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => switchLocale('es')}
          >
            Español
          </button>
          <button
            className={getLocale() === 'en' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => switchLocale('en')}
          >
            English
          </button>
        </div>
      </div>

      <div className="card">
        <h3>{t('settings.about')}</h3>
        <p className="hint-text">
          {t('settings.version')} 0.2.0 · {t('settings.storageNote')}
        </p>
      </div>
    </div>
  );
}
