import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { useAppStore } from '@/state/appStore';
import { useGameStore } from '@/state/gameStore';
import { loadLatestGame } from '@/state/persistence';
import { LoadingScreen } from './screens/LoadingScreen';
import { CharacterCreator } from './screens/CharacterCreator';
import { StoryScreen } from './screens/StoryScreen';
import { CharacterScreen } from './screens/CharacterScreen';
import { SkillsScreen, RelationsScreen } from './screens/PanelsScreens';
import { JournalScreen } from './screens/JournalScreen';
import { isDemoSave } from '@/services/demo';
import { InventoryScreen } from './screens/InventoryScreen';
import { SkillTreeScreen } from './screens/SkillTreeScreen';
import { WorldMapScreen } from './screens/WorldMapScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { QuestLogScreen } from './screens/QuestLogScreen';
import { LifeTreeScreen } from './screens/LifeTreeScreen';
import { SoulScreen } from './screens/SoulScreen';
import { InstallPrompt } from './InstallPrompt';
import { GameIcon, type IconName } from './icons';

/**
 * NAVEGACIÓN NATIVA — 4 pestañas:
 *  Campaña  → Historia · Misiones (el diario de misiones activas)
 *  Personaje→ Ficha · Habilidades · Árbol · Inventario · Vínculos
 *  Mundo    → mapa y zonas (explorar vive aquí)
 *  Menú     → Diario · Almas/Pareja · Árbol de la Vida · Ajustes
 * Sin scroll de página: solo las áreas internas se desplazan.
 */

type Tab = 'campaign' | 'character' | 'world' | 'menu';
type CampSub = 'story' | 'quests';
type CharSub = 'sheet' | 'skills' | 'tree' | 'inventory' | 'relations';
type MenuSub = 'journal' | 'souls' | 'lifetree' | 'settings';

const TABS: { id: Tab; icon: IconName; label: string }[] = [
  { id: 'campaign', icon: 'book', label: 'nav.campaign' },
  { id: 'character', icon: 'helm', label: 'nav.character' },
  { id: 'world', icon: 'map', label: 'nav.world' },
  { id: 'menu', icon: 'gear', label: 'nav.menu' }
];

export function App() {
  const { online, banner, init } = useAppStore();
  const save = useGameStore((s) => s.save);
  const loadGame = useGameStore((s) => s.loadGame);
  const [booted, setBooted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>('campaign');
  const [campSub, setCampSub] = useState<CampSub>('story');
  const [charSub, setCharSub] = useState<CharSub>('sheet');
  const [menuSub, setMenuSub] = useState<MenuSub>('journal');
  const [lifeTreeOpen, setLifeTreeOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      await init();
      const existing = await loadLatestGame();
      if (existing) loadGame(existing);
      setBooted(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded || !booted) {
    return (
      <div className="app-shell">
        <LoadingScreen onReady={() => setLoaded(true)} />
      </div>
    );
  }

  const dotClass = online ? 'online' : 'offline';
  const statusText = online ? t('status.online') : t('status.offline');

  return (
    <div className="app-shell native">
      <div className="status-bar" role="status" aria-live="polite">
        <span className="status-label">
          <span className={`status-dot ${dotClass}`} aria-hidden />
          {statusText}
        </span>
        {isDemoSave(save) && <span className="demo-badge">{t('settings.demo')}</span>}
        {banner && <span className="status-banner">{t(banner)}</span>}
      </div>

      {!save ? (
        <CharacterCreator />
      ) : (
        <>
          {/* ── CAMPAÑA ── */}
          {tab === 'campaign' && (
            <div className="tab-body">
              <div className="subtabs">
                <button className={`subtab ${campSub === 'story' ? 'active' : ''}`} onClick={() => setCampSub('story')}>
                  <GameIcon name="book" size={14} /> {t('camp.story')}
                </button>
                <button className={`subtab ${campSub === 'quests' ? 'active' : ''}`} onClick={() => setCampSub('quests')}>
                  <GameIcon name="scroll" size={14} /> {t('camp.quests')}
                </button>
              </div>
              <div className="tab-content">
                {campSub === 'story' && <StoryScreen />}
                {campSub === 'quests' && <QuestLogScreen />}
              </div>
            </div>
          )}

          {/* ── PERSONAJE ── */}
          {tab === 'character' && (
            <div className="tab-body">
              <div className="subtabs">
                {(
                  [
                    ['sheet', 'nav.character'],
                    ['skills', 'nav.skills'],
                    ['tree', 'nav.skilltree'],
                    ['inventory', 'nav.inventory'],
                    ['relations', 'nav.relations']
                  ] as [CharSub, string][]
                ).map(([id, label]) => (
                  <button key={id} className={`subtab ${charSub === id ? 'active' : ''}`} onClick={() => setCharSub(id)}>
                    {t(label)}
                  </button>
                ))}
              </div>
              <div className="tab-content">
                {charSub === 'sheet' && <CharacterScreen />}
                {charSub === 'skills' && <SkillsScreen />}
                {charSub === 'tree' && <SkillTreeScreen />}
                {charSub === 'inventory' && <InventoryScreen />}
                {charSub === 'relations' && <RelationsScreen />}
              </div>
            </div>
          )}

          {/* ── MUNDO ── */}
          {tab === 'world' && (
            <div className="tab-body">
              <div className="tab-content">
                <WorldMapScreen />
              </div>
            </div>
          )}

          {/* ── MENÚ ── */}
          {tab === 'menu' && (
            <div className="tab-body">
              <div className="subtabs">
                {(
                  [
                    ['journal', 'nav.journal'],
                    ['souls', 'soul.title'],
                    ['lifetree', 'menu.lifetree'],
                    ['settings', 'nav.settings']
                  ] as [MenuSub, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    className={`subtab ${menuSub === id ? 'active' : ''}`}
                    onClick={() => {
                      if (id === 'lifetree') setLifeTreeOpen(true);
                      else setMenuSub(id);
                    }}
                  >
                    {t(label)}
                  </button>
                ))}
              </div>
              <div className="tab-content">
                {menuSub === 'journal' && <JournalScreen />}
                {menuSub === 'souls' && <SoulScreen />}
                {menuSub === 'settings' && <SettingsScreen />}
              </div>
            </div>
          )}

          {lifeTreeOpen && <LifeTreeScreen onClose={() => setLifeTreeOpen(false)} />}
          <InstallPrompt />

          <nav className="bottom-nav four" aria-label="Navegación principal">
            {TABS.map(({ id, icon, label }) => (
              <button
                key={id}
                className={`nav-btn ${tab === id ? 'active' : ''}`}
                onClick={() => setTab(id)}
                aria-current={tab === id ? 'page' : undefined}
              >
                <span className="nav-icon">
                  <GameIcon name={icon} size={22} />
                </span>
                {t(label)}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
