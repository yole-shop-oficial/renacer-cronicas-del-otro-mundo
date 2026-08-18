import { useEffect, useState } from 'react';
import { getLocale, setLocale, t, type Locale } from '@/i18n';
import { useAppStore } from '@/state/appStore';
import { detectDevice, connectionType, loadPartnerSoul, type SoulProfile } from '@/services/souls';
import { SoulScreen } from './SoulScreen';
import { GameIcon, IconWave, IconSoul, IconGear, IconSpark, IconScroll } from '@/ui/icons';
import { isSoundOn, setSoundOn, isHapticsOn, setHapticsOn, sfx } from '@/services/audio';
import { getDifficulty, setDifficulty, type Difficulty } from '@/combat/difficulty';
import { downloadBackup, importSave } from '@/services/backup';
import { createDemoSave, isDemoSave } from '@/services/demo';
import { loadLatestGame } from '@/state/persistence';
import { useGameStore } from '@/state/gameStore';
import { saveGameLocally } from '@/state/persistence';

/**
 * AJUSTES: idioma, conexión y sincronización entre los dos teléfonos
 * (iPhone / Android / Windows), estado del dispositivo y almas vinculadas.
 */
export function SettingsScreen() {
  const online = useAppStore((s) => s.online);
  const [, force] = useState(0);
  const save = useGameStore((st) => st.save);
  const loadGame = useGameStore((st) => st.loadGame);
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState<string | null>(null);
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

      {/* JUEGO: dificultad, sonido, haptics (§106-108) */}
      <div className="card">
        <h3 className="with-icon"><IconSpark size={18} className="ico-gold" /> {t('settings.game')}</h3>
        <p className="hint-text">{t('settings.difficulty')}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {(['story', 'normal', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              className={getDifficulty() === d ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, minHeight: 40, fontSize: 12.5 }}
              onClick={() => { setDifficulty(d); force((n) => n + 1); }}
            >
              {t(`difficulty.${d}`)}
            </button>
          ))}
        </div>
        <div className="settings-rows" style={{ marginTop: 10 }}>
          <button className="settings-row settings-toggle" onClick={() => { setSoundOn(!isSoundOn()); sfx('ui'); force((n) => n + 1); }}>
            <span>{t('settings.sound')}</span>
            <b className={isSoundOn() ? 'text-ok' : 'text-bad'}>{isSoundOn() ? t('settings.yes') : t('settings.no')}</b>
          </button>
          <button className="settings-row settings-toggle" onClick={() => { setHapticsOn(!isHapticsOn()); force((n) => n + 1); }}>
            <span>{t('settings.haptics')}</span>
            <b className={isHapticsOn() ? 'text-ok' : 'text-bad'}>{isHapticsOn() ? t('settings.yes') : t('settings.no')}</b>
          </button>
        </div>
      </div>

      {/* MODO DEMO (§97) */}
      <div className="card">
        <h3 className="with-icon"><GameIcon name="star" size={18} className="ico-gold" /> {t('settings.demo')}</h3>
        {isDemoSave(save) ? (
          <>
            <p className="hint-text">{t('settings.demoActive')}</p>
            <button
              className="btn-primary" style={{ width: '100%', marginTop: 8 }}
              onClick={() => {
                void (async () => {
                  const real = await loadLatestGame();
                  if (real) loadGame(real);
                  else location.reload();
                })();
              }}
            >
              {t('settings.demoExit')}
            </button>
          </>
        ) : (
          <>
            <p className="hint-text">{t('settings.demoHint')}</p>
            <button
              className="btn-secondary" style={{ width: '100%', marginTop: 8 }}
              onClick={() => loadGame(createDemoSave())}
            >
              {t('settings.demoStart')}
            </button>
          </>
        )}
      </div>

      {/* BACKUP (§96) */}
      <div className="card">
        <h3 className="with-icon"><IconScroll size={18} className="ico-arcane" /> {t('settings.backup')}</h3>
        <p className="hint-text">{t('settings.backupHint')}</p>
        {save && (
          <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={() => downloadBackup(save)}>
            {t('settings.exportSave')}
          </button>
        )}
        <textarea
          className="soul-input" rows={2}
          placeholder="RENACER1..."
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          aria-label="RENACER1..."
        />
        <button
          className="btn-secondary" style={{ width: '100%', marginTop: 6 }}
          disabled={!importText.trim()}
          onClick={() => {
            void (async () => {
              try {
                const imported = importSave(importText);
                await saveGameLocally(imported);
                loadGame(imported);
                setImportMsg(`✓ ${t('settings.importOk')}`);
                setImportText('');
              } catch {
                setImportMsg(t('settings.importBad'));
              }
            })();
          }}
        >
          {t('settings.importSave')}
        </button>
        {importMsg && <p className="hint-text" style={{ marginTop: 6 }}>{importMsg}</p>}
      </div>

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
