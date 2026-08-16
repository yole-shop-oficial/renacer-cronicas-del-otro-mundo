import { useState } from 'react';
import { t } from '@/i18n';
import { useCoopStore } from '@/state/coopStore';
import { IconWave, IconLink, IconSoul, IconBond } from '@/ui/icons';

/**
 * ENLACE EN TIEMPO REAL POR WIFI (WebRTC local, sin servidor).
 * Host: crea ANCLA → invitado la pega → invitado genera UNIÓN →
 * host la pega → conectados. En la misma WiFi es instantáneo.
 */
export function LiveLinkPanel() {
  const {
    linkState, partner, inGroup, separated,
    anchorCode, joinAnswer,
    startHosting, joinWithAnchor, completeWithAnswer, disconnect,
    leaveGroup, reunite
  } = useCoopStore();
  const [mode, setMode] = useState<'menu' | 'host' | 'join'>('menu');
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, tag: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError(t('soul.copyManual'));
    }
  }

  async function doHost() {
    setError(null);
    setMode('host');
    try {
      await startHosting();
    } catch {
      setError(t('link.errorWebrtc'));
    }
  }

  async function doJoinPaste() {
    setError(null);
    try {
      await joinWithAnchor(pasted);
      setPasted('');
    } catch {
      setError(t('link.errorCode'));
    }
  }

  async function doCompletePaste() {
    setError(null);
    try {
      await completeWithAnswer(pasted);
      setPasted('');
    } catch {
      setError(t('link.errorCode'));
    }
  }

  // ── CONECTADOS ──
  if (linkState === 'connected' && partner) {
    return (
      <div className="card link-connected">
        <h3 className="with-icon">
          <IconWave size={18} className="ico-teal" /> {t('link.connected')}
        </h3>
        <div className="link-partner-row">
          <IconSoul size={22} className="ico-gold" />
          <div>
            <b>{partner.name}</b>
            <span className="hint-text"> · {t('stats.level')} {partner.level} · {t(`region.${partner.regionId}`)}</span>
          </div>
          <span className={`link-group-badge ${inGroup ? 'on' : 'off'}`}>
            {inGroup ? t('link.inGroup') : separated ? t('link.separated') : t('link.notGrouped')}
          </span>
        </div>
        <p className="hint-text">{inGroup ? t('link.groupHint') : t('link.separatedHint')}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          {inGroup ? (
            <button className="btn-secondary" onClick={leaveGroup}>
              <IconBond size={14} className="inline-ico" /> {t('link.leaveGroup')}
            </button>
          ) : (
            <button className="btn-primary" onClick={reunite}>
              <IconBond size={14} className="inline-ico" /> {t('link.reunite')}
            </button>
          )}
          <button className="btn-secondary" onClick={disconnect}>{t('link.disconnect')}</button>
        </div>
      </div>
    );
  }

  // ── HOST: mostrar ancla y esperar unión ──
  if (mode === 'host') {
    return (
      <div className="card">
        <h3 className="with-icon"><IconLink size={18} className="ico-arcane" /> {t('link.hostTitle')}</h3>
        {!anchorCode ? (
          <p className="hint-text">{t('link.generating')}</p>
        ) : (
          <>
            <p className="hint-text">{t('link.step1Host')}</p>
            <div className="soul-code-box">
              <code className="soul-code">{anchorCode.slice(0, 26)}…</code>
              <button className="btn-primary soul-copy-btn" onClick={() => void copy(anchorCode, 'anchor')}>
                {copied === 'anchor' ? t('soul.copied') : t('soul.copy')}
              </button>
            </div>
            <p className="hint-text" style={{ marginTop: 10 }}>{t('link.step2Host')}</p>
            <textarea
              className="soul-input" rows={3}
              placeholder="UNION1..." value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              aria-label="UNION1..."
            />
            <button className="btn-primary" style={{ width: '100%', marginTop: 8 }}
              disabled={!pasted.trim()} onClick={() => void doCompletePaste()}>
              {t('link.complete')}
            </button>
          </>
        )}
        {linkState === 'connecting' && <p className="hint-text">{t('link.connecting')}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => setMode('menu')}>
          ← {t('creator.back')}
        </button>
      </div>
    );
  }

  // ── GUEST: pegar ancla, mostrar unión ──
  if (mode === 'join') {
    return (
      <div className="card">
        <h3 className="with-icon"><IconLink size={18} className="ico-arcane" /> {t('link.joinTitle')}</h3>
        {!joinAnswer ? (
          <>
            <p className="hint-text">{t('link.step1Guest')}</p>
            <textarea
              className="soul-input" rows={3}
              placeholder="ANCLA1..." value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              aria-label="ANCLA1..."
            />
            <button className="btn-primary" style={{ width: '100%', marginTop: 8 }}
              disabled={!pasted.trim()} onClick={() => void doJoinPaste()}>
              {t('link.accept')}
            </button>
          </>
        ) : (
          <>
            <p className="hint-text">{t('link.step2Guest')}</p>
            <div className="soul-code-box">
              <code className="soul-code">{joinAnswer.slice(0, 26)}…</code>
              <button className="btn-primary soul-copy-btn" onClick={() => void copy(joinAnswer, 'answer')}>
                {copied === 'answer' ? t('soul.copied') : t('soul.copy')}
              </button>
            </div>
            <p className="hint-text" style={{ marginTop: 8 }}>{t('link.waitingHost')}</p>
          </>
        )}
        {error && <p className="error-text">{error}</p>}
        <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => setMode('menu')}>
          ← {t('creator.back')}
        </button>
      </div>
    );
  }

  // ── MENÚ ──
  return (
    <div className="card">
      <h3 className="with-icon"><IconWave size={18} className="ico-teal" /> {t('link.title')}</h3>
      <p className="hint-text">{t('link.explain')}</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => void doHost()}>
          {t('link.host')}
        </button>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setMode('join')}>
          {t('link.join')}
        </button>
      </div>
    </div>
  );
}
