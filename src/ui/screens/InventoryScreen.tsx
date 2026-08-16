import { useState } from 'react';
import { t } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { itemById } from '@/data/items';
import { EQUIPMENT_SLOTS, type EquipmentSlot } from '@/domain/types';
import { GameIcon, IconCoin, IconHeart, IconDrop, type IconName } from '@/ui/icons';

/**
 * INVENTARIO renovado: slots de equipo (arma/armadura/accesorio),
 * rejilla de objetos, panel de detalle con stats y equipar/desequipar.
 */

const SLOT_ICONS: Record<EquipmentSlot, IconName> = {
  weapon: 'sword',
  armor: 'shield',
  accessory: 'ring'
};

const TYPE_ICONS: Record<string, IconName> = {
  weapon: 'sword', armor: 'shield', consumable: 'potion', material: 'ore',
  magic: 'rune', quest: 'scroll', unique: 'star', hidden: 'mystery'
};

const RARITY_CLASS: Record<string, string> = {
  common: 'r-common', uncommon: 'r-uncommon', rare: 'r-rare',
  epic: 'r-epic', legendary: 'r-legendary', unique: 'r-unique'
};

export function InventoryScreen() {
  const save = useGameStore((s) => s.save);
  const equipItem = useGameStore((s) => s.equipItem);
  const unequipSlot = useGameStore((s) => s.unequipSlot);
  const [selected, setSelected] = useState<string | null>(null);

  if (!save) return null;
  const c = save.character;
  const equipment = c.equipment ?? {};

  const selectedItem = selected ? safeItem(selected) : null;
  const selectedEntry = selected ? c.inventory.find((e) => e.itemId === selected) : null;
  const isEquipped = selectedItem?.slot ? equipment[selectedItem.slot] === selected : false;

  return (
    <div className="panel">
      <h2 className="section-title">{t('nav.inventory')}</h2>

      {/* SLOTS DE EQUIPO */}
      <div className="card">
        <h3>{t('inv.equipment')}</h3>
        <div className="equip-slots">
          {EQUIPMENT_SLOTS.map((slot) => {
            const itemId = equipment[slot];
            const item = itemId ? safeItem(itemId) : null;
            return (
              <button
                key={slot}
                className={`equip-slot ${item ? RARITY_CLASS[item.rarity] : 'empty'}`}
                onClick={() => itemId && setSelected(itemId)}
                aria-label={`${t(`inv.slot.${slot}`)}: ${itemId ? t(`item.${itemId}`) : t('inv.emptySlot')}`}
              >
                <span className="equip-slot-icon" aria-hidden>
                  <GameIcon name={item ? TYPE_ICONS[item.type] : SLOT_ICONS[slot]} size={24} />
                </span>
                <span className="equip-slot-label">{t(`inv.slot.${slot}`)}</span>
                <span className="equip-slot-name">
                  {itemId ? t(`item.${itemId}`) : t('inv.emptySlot')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* REJILLA DE OBJETOS */}
      <div className="card">
        <h3>{t('inv.bag', { count: c.inventory.length })}</h3>
        {c.inventory.length === 0 && <p className="hint-text">{t('ui.empty')}</p>}
        <div className="inv-grid">
          {c.inventory.map((entry) => {
            const item = safeItem(entry.itemId);
            if (!item) return null;
            const equipped = item.slot ? equipment[item.slot] === entry.itemId : false;
            return (
              <button
                key={entry.itemId}
                className={`inv-cell ${RARITY_CLASS[item.rarity]} ${selected === entry.itemId ? 'selected' : ''} ${equipped ? 'equipped' : ''}`}
                onClick={() => setSelected(entry.itemId)}
                aria-label={t(`item.${entry.itemId}`)}
              >
                <span className="inv-cell-icon" aria-hidden><GameIcon name={TYPE_ICONS[item.type]} size={26} /></span>
                {entry.quantity > 1 && <span className="inv-cell-qty">×{entry.quantity}</span>}
                {equipped && <span className="inv-cell-equipped" aria-hidden>✓</span>}
              </button>
            );
          })}
          {/* Slots vacíos decorativos hasta múltiplo de 4 */}
          {Array.from({ length: Math.max(0, 8 - c.inventory.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="inv-cell empty" aria-hidden />
          ))}
        </div>
      </div>

      {/* DETALLE DEL OBJETO */}
      {selectedItem && selectedEntry && (
        <div className={`card inv-detail ${RARITY_CLASS[selectedItem.rarity]}`}>
          <h3 className="with-icon">
            <GameIcon name={TYPE_ICONS[selectedItem.type]} size={19} className="ico-gold" /> {t(`item.${selectedItem.id}`)}
            <span className={`rarity-tag ${RARITY_CLASS[selectedItem.rarity]}`}>
              {t(`rarity.${selectedItem.rarity}`)}
            </span>
          </h3>
          <p>{t(`item.${selectedItem.id}.desc`)}</p>

          {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
            <div className="stat-grid" style={{ marginTop: 10 }}>
              {Object.entries(selectedItem.stats).map(([stat, v]) => (
                <div className="stat-row" key={stat}>
                  <span>{t(`stats.${stat}`)}</span>
                  <b className="attr-bonus">+{v}</b>
                </div>
              ))}
            </div>
          )}
          {selectedItem.effects?.restoreHp && (
            <p className="hint-text" style={{ marginTop: 6 }}>
              <IconHeart size={14} className="ico-danger inline-ico" /> +{selectedItem.effects.restoreHp} {t('stats.hp')}
            </p>
          )}
          {selectedItem.effects?.restoreMp && (
            <p className="hint-text" style={{ marginTop: 6 }}>
              <IconDrop size={14} className="ico-teal inline-ico" /> +{selectedItem.effects.restoreMp} {t('stats.mp')}
            </p>
          )}
          {selectedItem.value > 0 && (
            <p className="hint-text" style={{ marginTop: 6 }}><IconCoin size={14} className="ico-gold inline-ico" /> {selectedItem.value}</p>
          )}

          {selectedItem.slot && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {isEquipped ? (
                <button
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => void unequipSlot(selectedItem.slot!)}
                >
                  {t('inv.unequip')}
                </button>
              ) : (
                <button
                  className="btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => void equipItem(selectedItem.id)}
                >
                  {t('inv.equip')} · {t(`inv.slot.${selectedItem.slot}`)}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function safeItem(id: string) {
  try {
    return itemById(id);
  } catch {
    return null;
  }
}
