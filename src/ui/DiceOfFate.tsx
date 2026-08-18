import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { useCoopStore } from '@/state/coopStore';
import { useGameStore } from '@/state/gameStore';
import { sfx } from '@/services/audio';

/**
 * LOS DADOS DE LOS DIOSES DEL DESTINO — animación dramática.
 * Dado d20 divino en SVG: gira con destellos, revela las dos tiradas
 * y corona al alma ganadora. El perdedor elige: aceptar el veredicto
 * o desafiar al destino (precio caro).
 */

function DivineD20({ spinning, value }: { spinning: boolean; value?: number }) {
  return (
    <svg viewBox="0 0 120 120" width="110" height="110" className={`d20 ${spinning ? 'spinning' : 'landed'}`} aria-hidden>
      <defs>
        <linearGradient id="d20face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4b3b7c" />
          <stop offset="100%" stopColor="#2a2148" />
        </linearGradient>
        <linearGradient id="d20edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8ca8a" />
          <stop offset="100%" stopColor="#b8893a" />
        </linearGradient>
      </defs>
      {/* icosaedro estilizado */}
      <polygon points="60,6 108,36 108,84 60,114 12,84 12,36" fill="url(#d20face)" stroke="url(#d20edge)" strokeWidth="2.5" />
      <polygon points="60,6 108,36 60,50 12,36" fill="rgba(255,255,255,0.06)" stroke="url(#d20edge)" strokeWidth="1.2" />
      <polygon points="60,50 108,36 108,84 60,114" fill="rgba(0,0,0,0.18)" stroke="url(#d20edge)" strokeWidth="1.2" />
      <polygon points="60,50 12,36 12,84 60,114" fill="rgba(255,255,255,0.03)" stroke="url(#d20edge)" strokeWidth="1.2" />
      {value !== undefined && (
        <text x="60" y="72" textAnchor="middle" fontSize="34" fontWeight="800" fill="#ffe9b8" fontFamily="Georgia, serif">
          {value}
        </text>
      )}
    </svg>
  );
}

export function DiceOfFate() {
  const negotiation = useCoopStore((s) => s.negotiation);
  const showDice = useCoopStore((s) => s.showDice);
  const partner = useCoopStore((s) => s.partner);
  const rollMyDice = useCoopStore((s) => s.rollMyDice);
  const acceptFate = useCoopStore((s) => s.acceptFate);
  const defyFate = useCoopStore((s) => s.defyFate);
  const save = useGameStore((s) => s.save);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    if (negotiation?.phase === 'resolved' && negotiation.byDice) {
      const timer = setTimeout(() => setRevealed(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [negotiation?.phase, negotiation?.byDice, negotiation?.myRoll, negotiation?.partnerRoll]);

  if (!showDice || !negotiation || !save || !partner) return null;
  const myName = save.character.name;
  const rolling = negotiation.phase === 'rolling';
  const resolved = negotiation.phase === 'resolved' && negotiation.byDice;
  const iWon = negotiation.diceWinner === 'me';

  return (
    <div className="lifetree-overlay dice-overlay" role="alertdialog" aria-label={t('dice.title')}>
      <div className="dice-stage">
        <div className="dice-rays" aria-hidden />
        <h2 className="dice-title">{t('dice.title')}</h2>
        <p className="dice-sub">{t('dice.sub')}</p>

        <div className="dice-arena">
          <div className={`dice-side ${resolved && iWon ? 'winner' : ''}`}>
            <span className="dice-soul-name">{myName}</span>
            <DivineD20 spinning={rolling && negotiation.myRoll === undefined} value={negotiation.myRoll} />
            {rolling && negotiation.myRoll === undefined && (
              <button className="btn-primary dice-roll-btn" onClick={() => { sfx('dice'); rollMyDice(); }}>
                {t('dice.roll')}
              </button>
            )}
          </div>
          <div className="dice-vs" aria-hidden>⟡</div>
          <div className={`dice-side ${resolved && !iWon ? 'winner' : ''}`}>
            <span className="dice-soul-name">{partner.name}</span>
            <DivineD20
              spinning={rolling && negotiation.partnerRoll === undefined}
              value={negotiation.partnerRoll}
            />
            {rolling && negotiation.partnerRoll === undefined && (
              <span className="dice-waiting">{t('dice.waiting')}</span>
            )}
          </div>
        </div>

        {resolved && revealed && (
          <div className="dice-verdict">
            <p className="dice-winner-text">
              {t('dice.winner', { name: iWon ? myName : partner.name })}
            </p>
            {iWon ? (
              <p className="hint-text">{t('dice.youWonHint')}</p>
            ) : (
              <>
                <p className="hint-text">{t('dice.youLostHint')}</p>
                <div className="dice-actions">
                  <button className="btn-primary" onClick={() => void acceptFate()}>
                    {t('dice.accept')}
                  </button>
                  <button className="btn-secondary dice-defy" onClick={() => void defyFate()}>
                    {t('dice.defy')}
                  </button>
                </div>
                <p className="dice-price-note">{t('dice.defyPrice')}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
