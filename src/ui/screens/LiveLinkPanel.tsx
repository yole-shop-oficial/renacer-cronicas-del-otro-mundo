import { useEffect, useRef, useState } from 'react';
import { t } from '@/i18n';
import { useCoopStore } from '@/state/coopStore';
import {
  shortCode,
  encodeInvite,
  decodeInvite,
  inviteLink,
  drawCodeMatrix,
  readCodeMatrix,
  type Invite
} from '@/coop/pairing';
import { getMeta, setMeta } from '@/services/localdb';
import { IconWave, IconLink, IconSoul, IconBond } from '@/ui/icons';

/**
 * JUGAR CON MI PAREJA (§49-54) — sin tecnología visible.
 * Crear partida → QR + código corto + botón compartir.
 * Unirse → escanear QR / pegar invitación → QR de respuesta.
 * El jugador solo ve: código, QR, "Conectando...", "Conectados ✓".
 */
export function LiveLinkPanel() {
  const {
    linkState, partner, inGroup, separated,
    anchorCode, joinAnswer, playerBond,
    startHosting, joinWithAnchor, completeWithAnswer, disconnect,
    leaveGroup, reunite
  } = useCoopStore();
  const [mode, setMode] = useState<'menu' | 'host' | 'join'>('menu');
  const [myCode, setMyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pasted, setPasted] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastPartnerName, setLastPartnerName] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const answerCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    void getMeta('last_partner_name').then((n) => setLastPartnerName(n || null));
  }, []);

  // Recordar pareja al conectar (§54).
  useEffect(() => {
    if (linkState === 'connected' && partner) {
      void setMeta('last_partner_name', partner.name);
    }
  }, [linkState, partner]);

  // Invitación entrante por enlace (#join=...) (§53).
  useEffect(() => {
    if (location.hash.startsWith('#join=')) {
      const raw = decodeURIComponent(location.hash.slice(6));
      history.replaceState(null, '', location.pathname);
      void acceptInviteText(raw);
      setMode('join');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dibujar QR del anfitrión cuando el ancla esté lista.
  useEffect(() => {
    if (mode === 'host' && anchorCode && canvasRef.current && myCode) {
      const invite: Invite = { code: myCode, payload: anchorCode, role: 'offer' };
      drawCodeMatrix(canvasRef.current, encodeInvite(invite));
    }
  }, [mode, anchorCode, myCode]);

  // Dibujar QR de respuesta del invitado.
  useEffect(() => {
    if (mode === 'join' && joinAnswer && answerCanvasRef.current && myCode) {
      const invite: Invite = { code: myCode, payload: joinAnswer, role: 'answer' };
      drawCodeMatrix(answerCanvasRef.current, encodeInvite(invite));
    }
  }, [mode, joinAnswer, myCode]);

  useEffect(() => () => stopScan(), []);

  async function createGame() {
    setError(null);
    setMode('host');
    setMyCode(shortCode());
    try {
      await startHosting();
    } catch {
      setError(t('link.errorWebrtc'));
    }
  }

  async function acceptInviteText(text: string): Promise<boolean> {
    try {
      const invite = decodeInvite(text);
      if (invite.role === 'offer') {
        setMyCode(invite.code); // el mismo código verifica ambas pantallas
        await joinWithAnchor(invite.payload);
        return true;
      }
      if (invite.role === 'answer') {
        await completeWithAnswer(invite.payload);
        return true;
      }
    } catch {
      setError(t('link.errorCode'));
    }
    return false;
  }

  function startScan() {
    setError(null);
    setScanning(true);
    void navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        void videoRef.current.play();
        const canvas = document.createElement('canvas');
        scanTimer.current = setInterval(() => {
          const video = videoRef.current;
          if (!video || video.videoWidth === 0) return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(video, 0, 0);
          const text = readCodeMatrix(ctx.getImageData(0, 0, canvas.width, canvas.height));
          if (text) {
            void acceptInviteText(text).then((ok) => {
              if (ok) stopScan();
            });
          }
        }, 500);
      })
      .catch(() => {
        setScanning(false);
        setError(t('link.errorCamera'));
      });
  }

  function stopScan() {
    if (scanTimer.current) clearInterval(scanTimer.current);
    scanTimer.current = null;
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }

  async function shareInvite() {
    if (!anchorCode || !myCode) return;
    const link = inviteLink({ code: myCode, payload: anchorCode, role: 'offer' });
    if (navigator.share) {
      try {
        await navigator.share({ title: 'RENACER', text: t('link.shareText', { code: myCode }), url: link });
        return;
      } catch { /* cancelado */ }
    }
    try {
      await navigator.clipboard.writeText(link);
      setError(null);
    } catch { /* sin clipboard */ }
  }

  // ── CONECTADOS ──
  if (linkState === 'connected' && partner) {
    return (
      <div className="card link-connected">
        <h3 className="with-icon">
          <span className="link-dot green" aria-hidden />
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
        {/* §48: el vínculo entre las dos almas jugadoras */}
        {(playerBond.trust > 0 || playerBond.cooperation > 0 || playerBond.rivalry > 0 || playerBond.complicity > 0) && (
          <div className="player-bond">
            <span className="player-bond-title">{t('pbond.title')}</span>
            <div className="stat-grid">
              {playerBond.trust > 0 && (
                <div className="stat-row"><span>{t('pbond.trust')}</span><b>+{playerBond.trust}</b></div>
              )}
              {playerBond.cooperation > 0 && (
                <div className="stat-row"><span>{t('pbond.cooperation')}</span><b>+{playerBond.cooperation}</b></div>
              )}
              {playerBond.complicity > 0 && (
                <div className="stat-row"><span>{t('pbond.complicity')}</span><b>+{playerBond.complicity}</b></div>
              )}
              {playerBond.rivalry > 0 && (
                <div className="stat-row"><span>{t('pbond.rivalry')}</span><b>+{playerBond.rivalry}</b></div>
              )}
            </div>
          </div>
        )}
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

  // ── RECONECTANDO ──
  if (linkState === 'lost') {
    return (
      <div className="card">
        <h3 className="with-icon"><span className="link-dot yellow" aria-hidden /> {t('link.reconnecting')}</h3>
        <p className="hint-text">{t('link.partnerLeft')}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="btn-primary" onClick={() => { disconnect(); void createGame(); }}>{t('link.host')}</button>
          <button className="btn-secondary" onClick={disconnect}>{t('link.continueSolo')}</button>
        </div>
      </div>
    );
  }

  // ── ANFITRIÓN ──
  if (mode === 'host') {
    return (
      <div className="card">
        <h3 className="with-icon"><IconLink size={18} className="ico-arcane" /> {t('link.hostTitle')}</h3>
        {!anchorCode ? (
          <p className="hint-text">{t('link.generating')}</p>
        ) : (
          <>
            <div className="pair-code" aria-label={t('link.yourCode')}>{myCode}</div>
            <canvas ref={canvasRef} className="pair-qr" aria-label="QR" />
            <p className="hint-text" style={{ textAlign: 'center' }}>{t('link.hostHint')}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => void shareInvite()}>
                {t('link.share')}
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={startScan}>
                {t('link.scanAnswer')}
              </button>
            </div>
            {scanning && (
              <div className="pair-scanner">
                <video ref={videoRef} muted playsInline />
                <button className="btn-secondary" onClick={stopScan}>{t('link.stopScan')}</button>
              </div>
            )}
            <details className="pair-manual">
              <summary>{t('link.manualFallback')}</summary>
              <textarea
                className="soul-input" rows={2} placeholder={t('link.pasteHere')}
                value={pasted} onChange={(e) => setPasted(e.target.value)}
              />
              <button className="btn-secondary" style={{ marginTop: 6, width: '100%' }}
                disabled={!pasted.trim()}
                onClick={() => void acceptInviteText(pasted).then((ok) => ok && setPasted(''))}>
                {t('link.confirm')}
              </button>
            </details>
          </>
        )}
        {linkState === 'connecting' && <p className="hint-text link-connecting">{t('link.connecting')}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => { stopScan(); setMode('menu'); }}>
          ← {t('creator.back')}
        </button>
      </div>
    );
  }

  // ── INVITADO ──
  if (mode === 'join') {
    return (
      <div className="card">
        <h3 className="with-icon"><IconLink size={18} className="ico-arcane" /> {t('link.joinTitle')}</h3>
        {!joinAnswer ? (
          <>
            <p className="hint-text">{t('link.joinHint')}</p>
            <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={startScan}>
              {t('link.scanQr')}
            </button>
            {scanning && (
              <div className="pair-scanner">
                <video ref={videoRef} muted playsInline />
                <button className="btn-secondary" onClick={stopScan}>{t('link.stopScan')}</button>
              </div>
            )}
            <details className="pair-manual">
              <summary>{t('link.manualFallback')}</summary>
              <textarea
                className="soul-input" rows={2} placeholder={t('link.pasteHere')}
                value={pasted} onChange={(e) => setPasted(e.target.value)}
              />
              <button className="btn-secondary" style={{ marginTop: 6, width: '100%' }}
                disabled={!pasted.trim()}
                onClick={() => void acceptInviteText(pasted).then((ok) => ok && setPasted(''))}>
                {t('link.confirm')}
              </button>
            </details>
          </>
        ) : (
          <>
            <div className="pair-code">{myCode}</div>
            <canvas ref={answerCanvasRef} className="pair-qr" aria-label="QR" />
            <p className="hint-text" style={{ textAlign: 'center' }}>{t('link.answerHint')}</p>
          </>
        )}
        {linkState === 'connecting' && <p className="hint-text link-connecting">{t('link.connecting')}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => { stopScan(); setMode('menu'); }}>
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
      {lastPartnerName && (
        <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={() => void createGame()}>
          {t('link.continueWith', { name: lastPartnerName })}
        </button>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button className={lastPartnerName ? 'btn-secondary' : 'btn-primary'} style={{ flex: 1 }} onClick={() => void createGame()}>
          {t('link.host')}
        </button>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setMode('join')}>
          {t('link.join')}
        </button>
      </div>
    </div>
  );
}
