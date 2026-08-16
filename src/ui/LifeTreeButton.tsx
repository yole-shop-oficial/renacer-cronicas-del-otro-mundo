import { useState } from 'react';
import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { LifeTreeScreen } from './screens/LifeTreeScreen';

/**
 * Botón flotante del Árbol de la Vida: un árbol divino dibujado en SVG.
 * Al tocarlo → cartel de confirmación («¿Estás segura/o...?» según género)
 * → teletransporte al libro de tu historia.
 */

/** Árbol divino: copa luminosa, tronco entrelazado y raíces — SVG inline. */
function DivineTreeSvg() {
  return (
    <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden focusable="false">
      <defs>
        <radialGradient id="treeGlow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="55%" stopColor="#d4a94e" />
          <stop offset="100%" stopColor="#8b6fd8" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id="trunkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8893a" />
          <stop offset="100%" stopColor="#6d4b1f" />
        </linearGradient>
      </defs>
      {/* Halo divino */}
      <circle cx="32" cy="24" r="19" fill="url(#treeGlow)" opacity="0.9">
        <animate attributeName="opacity" values="0.75;1;0.75" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Copa: tres lóbulos */}
      <circle cx="22" cy="24" r="10" fill="#8b6fd8" opacity="0.85" />
      <circle cx="42" cy="24" r="10" fill="#8b6fd8" opacity="0.85" />
      <circle cx="32" cy="16" r="11" fill="#a58ae6" opacity="0.9" />
      <circle cx="32" cy="24" r="9" fill="#b9a5ec" />
      {/* Destellos-hoja */}
      <circle cx="26" cy="14" r="1.4" fill="#fff6d8" />
      <circle cx="40" cy="18" r="1.2" fill="#fff6d8" />
      <circle cx="33" cy="27" r="1.3" fill="#fff6d8" />
      <circle cx="20" cy="27" r="1.1" fill="#fff6d8" />
      <circle cx="44" cy="28" r="1.1" fill="#fff6d8" />
      {/* Tronco entrelazado */}
      <path
        d="M30 30 C29 38 27 40 24 44 L28 44 C30 41 31 39 31.5 37 C32 39 33 41 36 44 L40 44 C36 40 35 38 34 30 Z"
        fill="url(#trunkGrad)"
      />
      {/* Raíces */}
      <path
        d="M24 44 C20 47 16 47 12 50 M28 45 C26 48 24 50 22 52 M32 45 L32 52 M36 45 C38 48 40 50 42 52 M40 44 C44 47 48 47 52 50"
        stroke="#6d4b1f"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function LifeTreeButton() {
  const save = useGameStore((s) => s.save);
  const [confirming, setConfirming] = useState(false);
  const [open, setOpen] = useState(false);

  if (!save) return null;
  const gender = save.character.gender ?? 'f';

  return (
    <>
      <button
        className="lifetree-fab"
        onClick={() => setConfirming(true)}
        aria-label={t('lifetree.fabLabel')}
        title={t('lifetree.fabLabel')}
      >
        <DivineTreeSvg />
      </button>

      {confirming && (
        <div className="lifetree-overlay" role="alertdialog" aria-label={t('lifetree.confirmTitle')}>
          <div className="lifetree-confirm card">
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <DivineTreeSvg />
            </div>
            <h3 style={{ textAlign: 'center' }}>{t('lifetree.confirmTitle')}</h3>
            <p style={{ textAlign: 'center' }}>
              {gender === 'f' ? t('lifetree.confirmBody.f') : t('lifetree.confirmBody.m')}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirming(false)}>
                {t('lifetree.stay')}
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setConfirming(false);
                  setOpen(true);
                }}
              >
                {t('lifetree.travel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {open && <LifeTreeScreen onClose={() => setOpen(false)} />}
    </>
  );
}
