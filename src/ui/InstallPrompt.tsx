import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { detectDevice } from '@/services/souls';
import { IconSoul } from '@/ui/icons';

/**
 * INSTALACIÓN PWA con soporte iOS real.
 * - Android/desktop: captura beforeinstallprompt y ofrece botón nativo.
 * - iPhone/iPad: Safari NUNCA avisa — mostramos instrucciones propias
 *   (Compartir → Añadir a pantalla de inicio) una sola vez.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function InstallPrompt() {
  const [show, setShow] = useState<'android' | 'ios' | null>(null);
  const device = detectDevice();

  useEffect(() => {
    if (device.standalone) return; // ya instalada
    if (localStorage.getItem('install_dismissed')) return;
    const timer = setTimeout(() => {
      if (device.platform === 'iphone') setShow('ios');
      else if (deferredPrompt) setShow('android');
    }, 12_000); // tras la carga y un rato de juego, sin agobiar
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  function dismiss() {
    localStorage.setItem('install_dismissed', '1');
    setShow(null);
  }

  async function installAndroid() {
    if (!deferredPrompt) return dismiss();
    await deferredPrompt.prompt();
    deferredPrompt = null;
    dismiss();
  }

  return (
    <div className="install-sheet" role="dialog" aria-label={t('install.title')}>
      <div className="install-card">
        <span className="install-icon"><IconSoul size={34} /></span>
        <h3>{t('install.title')}</h3>
        {show === 'android' ? (
          <>
            <p className="hint-text">{t('install.androidText')}</p>
            <div className="install-actions">
              <button className="btn-secondary" onClick={dismiss}>{t('install.later')}</button>
              <button className="btn-primary" onClick={() => void installAndroid()}>{t('install.install')}</button>
            </div>
          </>
        ) : (
          <>
            <p className="hint-text">{t('install.iosText')}</p>
            <ol className="install-steps">
              <li>{t('install.iosStep1')}</li>
              <li>{t('install.iosStep2')}</li>
              <li>{t('install.iosStep3')}</li>
            </ol>
            <div className="install-actions">
              <button className="btn-primary" style={{ width: '100%' }} onClick={dismiss}>{t('install.gotIt')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
