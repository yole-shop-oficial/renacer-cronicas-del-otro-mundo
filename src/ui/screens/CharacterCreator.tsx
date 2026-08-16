import { useState } from 'react';
import { t } from '@/i18n';
import { CHARACTER_TEMPLATES, templateById } from '@/data/characters';
import { CLASSES } from '@/data/classes';
import { GODDESSES } from '@/data/goddesses';
import { PRIMARY_STATS } from '@/domain/types';
import { useGameStore } from '@/state/gameStore';
import { useAppStore } from '@/state/appStore';

/**
 * Creación de personaje (§11): personaje → nombre → clase → Diosa → confirmar.
 */
export function CharacterCreator() {
  const createNewGame = useGameStore((s) => s.createNewGame);
  const triggerSync = useAppStore((s) => s.triggerSync);

  const [step, setStep] = useState(0);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [goddessId, setGoddessId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const totalSteps = 4;

  async function confirm() {
    if (!templateId || !classId || !goddessId) return;
    setBusy(true);
    await createNewGame({
      templateId,
      name: name || templateById(templateId).defaultName,
      classId,
      goddessId
    });
    void triggerSync();
  }

  return (
    <div className="panel">
      <h2 className="section-title">{t('creator.title')}</h2>
      <p className="hint-text">
        {t('creator.subtitle')} — {t('creator.step', { step: step + 1, total: totalSteps })}
      </p>

      {step === 0 && (
        <>
          <h3 className="section-title" style={{ fontSize: 16 }}>{t('creator.chooseCharacter')}</h3>
          {CHARACTER_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              role="button"
              tabIndex={0}
              className={`card selectable ${templateId === tpl.id ? 'selected' : ''}`}
              onClick={() => setTemplateId(tpl.id)}
              onKeyDown={(e) => e.key === 'Enter' && setTemplateId(tpl.id)}
            >
              <h3>{t(`char.${tpl.id}`)}</h3>
              <p>
                {t('creator.talents')}: {tpl.talents.join(', ')}
              </p>
              <div className="stat-grid" style={{ marginTop: 8 }}>
                {PRIMARY_STATS.map((s) => (
                  <div className="stat-row" key={s}>
                    <span>{t(`stats.${s}`)}</span>
                    <b>{tpl.baseStats[s]}</b>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {step === 1 && templateId && (
        <div className="form">
          <label htmlFor="charname">{t('creator.chooseName')}</label>
          <input
            id="charname"
            maxLength={24}
            placeholder={templateById(templateId).defaultName}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      {step === 2 && (
        <>
          <h3 className="section-title" style={{ fontSize: 16 }}>{t('creator.chooseClass')}</h3>
          {CLASSES.map((cls) => (
            <div
              key={cls.id}
              role="button"
              tabIndex={0}
              className={`card selectable ${classId === cls.id ? 'selected' : ''}`}
              onClick={() => setClassId(cls.id)}
              onKeyDown={(e) => e.key === 'Enter' && setClassId(cls.id)}
            >
              <h3>{t(`class.${cls.id}`)}</h3>
              <p>{t(`class.${cls.id}.desc`)}</p>
              <p style={{ marginTop: 6 }}>
                {t('creator.startingSkills')}: {cls.startingSkills.map((s) => t(`skill.${s}`)).join(', ')}
              </p>
            </div>
          ))}
        </>
      )}

      {step === 3 && (
        <>
          <h3 className="section-title" style={{ fontSize: 16 }}>{t('creator.chooseGoddess')}</h3>
          {GODDESSES.map((g) => (
            <div
              key={g.id}
              role="button"
              tabIndex={0}
              className={`card selectable ${goddessId === g.id ? 'selected' : ''}`}
              onClick={() => setGoddessId(g.id)}
              onKeyDown={(e) => e.key === 'Enter' && setGoddessId(g.id)}
            >
              <h3>{t(`goddess.${g.id}`)}</h3>
              <p>{t(`goddess.${g.id}.desc`)}</p>
              <p style={{ marginTop: 6 }}>
                {t('creator.blessing')}: +{g.blessing.bonus} {t(`stats.${g.blessing.stat}`)}
                {g.grantsSkill ? ` · ${t(`skill.${g.grantsSkill}`)}` : ''}
              </p>
            </div>
          ))}
        </>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {step > 0 && (
          <button className="btn-secondary" onClick={() => setStep(step - 1)}>
            {t('creator.back')}
          </button>
        )}
        {step < totalSteps - 1 ? (
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={(step === 0 && !templateId) || (step === 2 && !classId)}
            onClick={() => setStep(step + 1)}
          >
            {t('creator.next')}
          </button>
        ) : (
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={!goddessId || busy}
            onClick={() => void confirm()}
          >
            {busy ? '...' : `✦ ${t('creator.confirm')} ✦`}
          </button>
        )}
      </div>
    </div>
  );
}
