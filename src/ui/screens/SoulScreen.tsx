import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { NPCS } from '@/data/world';
import { combatPower } from '@/domain/power';
import {
  buildSoulProfile,
  encodeSoulCode,
  decodeSoulCode,
  savePartnerSoul,
  loadPartnerSoul,
  forgetPartnerSoul,
  type SoulProfile
} from '@/services/souls';
import { GameIcon, IconSoul, IconLink, IconPower, IconMap as IconMapSvg, IconMedal } from '@/ui/icons';

/**
 * ALMAS SINCRONIZADAS: comparte tu código de alma y registra el del
 * compañero. Su tarjeta (caramelo) muestra información completa:
 * nombre, clase, Diosa, nivel, poder, títulos y dónde está en el mapa.
 */
export function SoulScreen() {
  const save = useGameStore((s) => s.save);
  const [partner, setPartner] = useState<SoulProfile | null>(null);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadPartnerSoul().then(setPartner);
  }, []);

  if (!save) return null;
  const myPower = combatPower(save.character, NPCS, save.world);
  const myCode = encodeSoulCode(buildSoulProfile(save, myPower));

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(t('soul.copyManual'));
    }
  }

  async function linkSoul() {
    setError(null);
    try {
      const profile = decodeSoulCode(input);
      if (profile.soulId === save?.characterId) {
        setError(t('soul.errorSelf'));
        return;
      }
      await savePartnerSoul(profile);
      setPartner(profile);
      setInput('');
    } catch {
      setError(t('soul.errorInvalid'));
    }
  }

  async function unlink() {
    await forgetPartnerSoul();
    setPartner(null);
  }

  return (
    <div className="panel">
      <h2 className="section-title">{t('soul.title')}</h2>
      <p className="hint-text">{t('soul.explain')}</p>

      {/* MI ALMA */}
      <div className="card soul-mine">
        <h3 className="with-icon">
          <IconSoul size={18} className="ico-gold" /> {t('soul.mine')}
        </h3>
        <p className="hint-text">{t('soul.shareHint')}</p>
        <div className="soul-code-box">
          <code className="soul-code">{myCode.slice(0, 28)}…</code>
          <button className="btn-primary soul-copy-btn" onClick={() => void copyCode()}>
            {copied ? t('soul.copied') : t('soul.copy')}
          </button>
        </div>
      </div>

      {/* ALMA SINCRONIZADA — tarjeta caramelo */}
      {partner ? (
        <div className="soul-card" role="region" aria-label={t('soul.partnerCard')}>
          <div className="soul-card-ribbon">{t('soul.linked')}</div>
          <div className="soul-card-head">
            <div className="soul-card-avatar">
              <IconSoul size={34} />
            </div>
            <div>
              <div className="soul-card-name">{partner.name}</div>
              <div className="soul-card-sub">
                {t(`char.${partner.templateId}`)} · {t(`class.${partner.classId}`)}
              </div>
              <div className="soul-card-sub soul-card-goddess">
                {t(`goddess.${partner.goddessId}`)}
              </div>
            </div>
          </div>
          <div className="soul-card-stats">
            <div className="soul-stat">
              <IconMedal size={16} />
              <span>{t('stats.level')} {partner.level}</span>
            </div>
            <div className="soul-stat">
              <IconPower size={16} />
              <span>{partner.power.toLocaleString()}</span>
            </div>
            <div className="soul-stat">
              <IconMapSvg size={16} />
              <span>{t(`region.${partner.regionId}`)}</span>
            </div>
          </div>
          {partner.titles.length > 0 && (
            <div className="soul-card-titles">
              {partner.titles.map((title) => (
                <span className="soul-title-chip" key={title}>
                  {t(`title.${title}`)}
                </span>
              ))}
            </div>
          )}
          <div className="soul-card-foot">
            <span className="hint-text">
              {t('soul.syncedAt', { date: new Date(partner.issuedAt).toLocaleString() })}
            </span>
            <button className="btn-secondary soul-unlink" onClick={() => void unlink()}>
              {t('soul.unlink')}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3 className="with-icon">
            <IconLink size={18} className="ico-arcane" /> {t('soul.linkTitle')}
          </h3>
          <p className="hint-text">{t('soul.linkHint')}</p>
          <textarea
            className="soul-input"
            rows={3}
            placeholder={t('soul.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={t('soul.placeholder')}
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" style={{ marginTop: 10, width: '100%' }} onClick={() => void linkSoul()} disabled={!input.trim()}>
            {t('soul.link')}
          </button>
        </div>
      )}

      <div className="card">
        <h3 className="with-icon">
          <GameIcon name="bond" size={18} className="ico-gold" /> {t('soul.groupTitle')}
        </h3>
        <p className="hint-text">{t('soul.groupHint')}</p>
      </div>
    </div>
  );
}
