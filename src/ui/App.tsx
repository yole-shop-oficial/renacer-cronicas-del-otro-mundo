import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { useAppStore } from '@/state/appStore';
import { useGameStore } from '@/state/gameStore';
import { loadLatestGame } from '@/state/persistence';
import { AuthScreen } from './screens/AuthScreen';
import { CharacterCreator } from './screens/CharacterCreator';
import { StoryScreen } from './screens/StoryScreen';
import { CharacterScreen } from './screens/CharacterScreen';
import {
  SkillsScreen,
  InventoryScreen,
  QuestsScreen,
  WorldScreen,
  RelationsScreen
} from './screens/PanelsScreens';
import { SettingsScreen } from './screens/SettingsScreen';
import { LifeTreeButton } from './LifeTreeButton';

type Tab = 'story' | 'character' | 'inventory' | 'quests' | 'world' | 'settings';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'story', icon: '📖', label: 'nav.story' },
  { id: 'character', icon: '🛡️', label: 'nav.character' },
  { id: 'inventory', icon: '🎒', label: 'nav.inventory' },
  { id: 'quests', icon: '📜', label: 'nav.quests' },
  { id: 'world', icon: '🗺️', label: 'nav.world' },
  { id: 'settings', icon: '⚙️', label: 'nav.settings' }
];

export function App() {
  const { session, connection, banner, init } = useAppStore();
  const save = useGameStore((s) => s.save);
  const loadGame = useGameStore((s) => s.loadGame);
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState<Tab>('story');
  const [subTab, setSubTab] = useState<'character' | 'skills' | 'relations'>('character');

  // Arranque (§44): cargar estado local → mostrar juego → sincronizar.
  useEffect(() => {
    void (async () => {
      await init();
      const existing = await loadLatestGame();
      if (existing) loadGame(existing);
      setBooted(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!booted) {
    return (
      <div className="app-shell">
        <div className="center-screen">
          <h1 className="game-title">{t('app.title')}</h1>
          <p className="game-tagline">{t('ui.loading')}</p>
        </div>
      </div>
    );
  }

  const dotClass =
    connection === 'OFFLINE' ? 'offline' : connection === 'SYNCING' ? 'syncing' : 'online';
  const statusText =
    connection === 'OFFLINE'
      ? t('status.offline')
      : connection === 'SYNCING'
        ? t('status.syncing')
        : t('status.online');

  return (
    <div className="app-shell">
      <div className="status-bar" role="status" aria-live="polite">
        <span className="status-label">
          <span className={`status-dot ${dotClass}`} aria-hidden />
          {statusText}
        </span>
        {banner && <span className="status-banner">{t(banner)}</span>}
      </div>

      {!session ? (
        <AuthScreen />
      ) : !save ? (
        <CharacterCreator />
      ) : (
        <>
          {tab === 'story' && <StoryScreen />}
          {tab === 'character' && (
            <>
              <div style={{ display: 'flex', gap: 8, padding: '10px 16px 0' }}>
                {(['character', 'skills', 'relations'] as const).map((st) => (
                  <button
                    key={st}
                    className={subTab === st ? 'btn-primary' : 'btn-secondary'}
                    style={{ minHeight: 38, padding: '8px 14px', fontSize: 13 }}
                    onClick={() => setSubTab(st)}
                  >
                    {t(`nav.${st === 'character' ? 'character' : st === 'skills' ? 'skills' : 'relations'}`)}
                  </button>
                ))}
              </div>
              {subTab === 'character' && <CharacterScreen />}
              {subTab === 'skills' && <SkillsScreen />}
              {subTab === 'relations' && <RelationsScreen />}
            </>
          )}
          {tab === 'inventory' && <InventoryScreen />}
          {tab === 'quests' && <QuestsScreen />}
          {tab === 'world' && <WorldScreen />}
          {tab === 'settings' && <SettingsScreen />}

          {/* Árbol de la Vida: botón flotante siempre visible en partida */}
          <LifeTreeButton />

          <nav className="bottom-nav" aria-label="Navegación principal">
            {TABS.map(({ id, icon, label }) => (
              <button
                key={id}
                className={`nav-btn ${tab === id ? 'active' : ''}`}
                onClick={() => setTab(id)}
                aria-current={tab === id ? 'page' : undefined}
              >
                <span className="icon" aria-hidden>{icon}</span>
                {t(label)}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
