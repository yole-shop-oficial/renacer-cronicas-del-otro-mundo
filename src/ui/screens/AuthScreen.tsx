import { useState } from 'react';
import { t } from '@/i18n';
import { signIn, signUp, createLocalGuestSession } from '@/services/auth';
import { isSupabaseConfigured } from '@/services/supabase';
import { useAppStore } from '@/state/appStore';

/**
 * Registro / inicio de sesión (§25).
 * Si Supabase no está configurado, ofrece modo local honesto (§88).
 */
export function AuthScreen() {
  const setSession = useAppStore((s) => s.setSession);
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cloudReady = isSupabaseConfigured();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (!navigator.onLine) throw new Error(t('auth.firstRunNeedsNet'));
      const info = mode === 'signup' ? await signUp(email, password) : await signIn(email, password);
      setSession(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function playLocal() {
    setSession(await createLocalGuestSession());
  }

  return (
    <div className="center-screen">
      <h1 className="game-title">{t('app.title')}</h1>
      <p className="game-tagline">«{t('app.tagline')}»</p>
      <p className="hint-text" style={{ textAlign: 'center' }}>{t('auth.welcome')}</p>

      {cloudReady ? (
        <form className="form" onSubmit={submit}>
          <div>
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-text" role="alert">{error}</p>}
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? '...' : mode === 'signup' ? t('auth.signup') : t('auth.signin')}
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
          >
            {mode === 'signup' ? t('auth.haveAccount') : t('auth.needAccount')}
          </button>
        </form>
      ) : (
        <div className="form">
          <p className="hint-text">{t('auth.guestNote')}</p>
          <button className="btn-primary" type="button" onClick={playLocal}>
            {t('auth.guestMode')}
          </button>
        </div>
      )}
    </div>
  );
}
