import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { IconTreeOfLife } from '@/ui/icons';

/**
 * PANTALLA DE CARGA (~6s): prepara todos los datos del modo Offline First.
 * Fases reales + tiempo mínimo garantizado para que el service worker
 * precachee el juego completo la primera vez.
 */

const PHASES = [
  { key: 'loading.phase1', at: 0 },     // Despertando el mundo
  { key: 'loading.phase2', at: 18 },    // Descargando los caminos
  { key: 'loading.phase3', at: 38 },    // Grabando la historia en el dispositivo
  { key: 'loading.phase4', at: 58 },    // Buscando almas cercanas
  { key: 'loading.phase5', at: 78 },    // Encendiendo los faroles
  { key: 'loading.phase6', at: 92 }     // Todo listo
] as const;

export function LoadingScreen({ onReady }: { onReady: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const DURATION = 6000;
    const start = performance.now();
    let raf = 0;

    // Trabajo real en paralelo: asegurar el service worker (precache offline).
    const swReady =
      'serviceWorker' in navigator
        ? navigator.serviceWorker.ready.catch(() => undefined)
        : Promise.resolve(undefined);

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        void swReady.then(() => onReady());
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phase = [...PHASES].reverse().find((p) => progress >= p.at) ?? PHASES[0];

  return (
    <div className="loading-screen" role="status" aria-label={t('loading.title')}>
      <div className="loading-halo" aria-hidden />
      <div className="loading-tree">
        <IconTreeOfLife size={110} className="loading-tree-icon" />
      </div>
      <h1 className="game-title loading-title">{t('app.title')}</h1>
      <p className="game-tagline">{t('app.tagline')}</p>

      <div className="loading-bar-wrap">
        <div className="loading-bar">
          <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
          <div className="loading-bar-glow" style={{ left: `${progress}%` }} aria-hidden />
        </div>
        <div className="loading-info">
          <span className="loading-phase">{t(phase.key)}</span>
          <span className="loading-pct">{Math.floor(progress)}%</span>
        </div>
      </div>

      <p className="loading-note">{t('loading.offlineNote')}</p>
    </div>
  );
}
