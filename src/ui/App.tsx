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
import { InventoryScreen } from './screens/InventoryScreen';
import { SkillTreeScreen } from './screens/SkillTreeScreen';
import { WorldMapScreen } from './screens/WorldMapScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { LifeTreeButton } from './LifeTreeButton';
import { GameIcon, type IconName } from './icons';

type Tab = 'story' | 'character' | 'inventory' | 'journal' | 'world' | 'settings';

const TABS: { id: Tab; icon: IconName; label: string }[] = [
  { id: 'story', icon: 'book', label: 'nav.story' },
  { id: 'character', icon: 'helm', label: 'nav.character' },
  { id: 'inventory', icon: 'bag', label: 'nav.inventory' },
  { id: 'journal', icon: 'scroll', label: 'nav.journal' },
  { id: 'world', icon: 'map', label: 'nav.world' },
  { id: 'settings', icon: 'gear', label: 'nav.settings' }
];

export function App() {
  const { online, banner, init } = useAppStore();
  const save = useGameStore((s) => s.save);
  const loadGame = useGameStore((s) => s.loadGame);
  const [booted, setBooted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>('story');
  const [subTab, setSubTab] = useState<'character' | 'skills' | 'tree' | 'relations'>('character');

  // Arranque (§44): datos locales → alma local → juego. Sin nube obligatoria.
  useEffect(() => {
    void (async () => {
      await init();
      const existing = await loadLatestGame();
      if (existing) loadGame(existing);
      setBooted(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pantalla de carga (~6s): precachea el juego para el modo offline.
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
    <div className="app-shell">
      <div className="status-bar" role="status" aria-live="polite">
        <span className="status-label">
          <span className={`status-dot ${dotClass}`} aria-hidden />
          {statusText}
        </span>
        {banner && <span className="status-banner">{t(banner)}</span>}
      </div>

      {!save ? (
        <CharacterCreator />
      ) : (
        <>
          {tab === 'story' && <StoryScreen />}
          {tab === 'character' && (
            <>
              <div className="subtabs">
                {(['character', 'skills', 'tree', 'relations'] as const).map((st) => (
                  <button
                    key={st}
                    className={`subtab ${subTab === st ? 'active' : ''}`}
                    onClick={() => setSubTab(st)}
                  >
                    {t(`nav.${st === 'tree' ? 'skilltree' : st}`)}
                  </button>
                ))}
              </div>
              {subTab === 'character' && <CharacterScreen />}
              {subTab === 'skills' && <SkillsScreen />}
              {subTab === 'tree' && <SkillTreeScreen />}
              {subTab === 'relations' && <RelationsScreen />}
            </>
          )}
          {tab === 'inventory' && <InventoryScreen />}
          {tab === 'journal' && <JournalScreen />}
          {tab === 'world' && <WorldMapScreen />}
          {tab === 'settings' && <SettingsScreen />}

          <LifeTreeButton />

          <nav className="bottom-nav" aria-label="Navegación principal">
            {TABS.map(({ id, icon, label }) => (
              <button
                key={id}
                className={`nav-btn ${tab === id ? 'active' : ''}`}
                onClick={() => setTab(id)}
                aria-current={tab === id ? 'page' : undefined}
              >
                <span className="nav-icon">
                  <GameIcon name={icon} size={21} />
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
