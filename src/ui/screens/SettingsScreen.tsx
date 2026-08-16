import { useState } from 'react';
import { getLocale, setLocale, t, type Locale } from '@/i18n';
import { useAppStore } from '@/state/appStore';
import { useGameStore } from '@/state/gameStore';
import { createCoopGame, joinCoopGame } from '@/services/multiplayer';
import { setActiveCoopGame } from '@/services/coopDecisions';
import { isSupabaseConfigured } from '@/services/supabase';

/** Ajustes: idioma, cooperativo (§34) y sesión. */
export function SettingsScreen() {
  const session = useAppStore((s) => s.session);
  const pendingOps = useAppStore((s) => s.pendingOps);
  const save = useGameStore((s) => s.save);
  const [, force] = useState(0);
  const [coopCode, setCoopCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [coopMsg, setCoopMsg] = useState<string | null>(null);
  const cloudReady = isSupabaseConfigured() && session?.email !== 'local@offline';

  function switchLocale(l: Locale) {
    setLocale(l);
    force((n) => n + 1);
  }

  async function hostCoop() {
    if (!session || !save) return;
    try {
      const coop = await createCoopGame(session.userId, save.gameId);
      await setActiveCoopGame(coop.gameId);
      setCoopCode(coop.code);
      setCoopMsg(null);
    } catch (err) {
      setCoopMsg(err instanceof Error ? err.message : String(err));
    }
  }

  async function joinCoop() {
    if (!session) return;
    try {
      const coop = await joinCoopGame(session.userId, joinCode);
      await setActiveCoopGame(coop.gameId);
      setCoopMsg(`✓ ${coop.code}`);
    } catch (err) {
      setCoopMsg(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="panel">
      <h2 className="section-title">{t('nav.settings')}</h2>

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
        <h3>{t('coop.title')}</h3>
        {cloudReady && save ? (
          <>
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => void hostCoop()}>
              {t('coop.create')}
            </button>
            {coopCode && (
              <p style={{ marginTop: 10, fontSize: 22, letterSpacing: '0.3em', color: 'var(--gold-soft)' }}>
                {t('coop.codeLabel')} <b>{coopCode}</b>
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input
                aria-label={t('coop.joinPlaceholder')}
                placeholder={t('coop.joinPlaceholder')}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10, fontSize: 16,
                  background: 'var(--bg-panel)', color: 'var(--text)',
                  border: '1px solid rgba(139,111,216,0.4)', textTransform: 'uppercase'
                }}
              />
              <button className="btn-secondary" onClick={() => void joinCoop()}>
                {t('coop.join')}
              </button>
            </div>
            {coopMsg && <p className="hint-text" style={{ marginTop: 8 }}>{coopMsg}</p>}
          </>
        ) : (
          <p className="hint-text">{t('coop.needsCloud')}</p>
        )}
      </div>

      <div className="card">
        <h3>{t('settings.about')}</h3>
        <p>
          {session?.email} · {t('settings.version')} 0.1.0
        </p>
        {pendingOps > 0 && (
          <p className="hint-text" style={{ marginTop: 6 }}>
            {t('status.pendingOps', { count: pendingOps })}
          </p>
        )}
      </div>
    </div>
  );
}
