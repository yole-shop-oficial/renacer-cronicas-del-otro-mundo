import { useMemo, useState } from 'react';
import { t, lt } from '@/i18n';
import { useGameStore } from '@/state/gameStore';
import { renderStoryText } from '@/engine/text';
import { createStoryEngine } from '@/content/story';
import { IconLock } from '@/ui/icons';

/**
 * ÁRBOL DE LA VIDA — El libro de TU historia.
 * Reconstruye el recorrido real del jugador desde el event log de
 * decisiones (§65: el mundo recuerda) y lo presenta como un libro:
 * página a página, capítulo a capítulo, SOLO hasta donde has llegado.
 * No revela nada del futuro ni de las ramas que no tomaste.
 */

interface BookPage {
  nodeId: string;
  chapterId: string;
  speaker?: string;
  text: string;
  choiceTaken?: string;
  at?: number;
}

function useLifeBook(): { pages: BookPage[]; chapters: Map<string, BookPage[]> } {
  const save = useGameStore((s) => s.save);

  return useMemo(() => {
    const pages: BookPage[] = [];
    if (!save) return { pages, chapters: new Map() };

    const engine = createStoryEngine();
    const ctx = { name: save.character.name, gender: save.character.gender ?? 'f' };

    // Recorremos las decisiones en orden cronológico: cada una es una página
    // vivida (nodo + elección tomada). Es el camino REAL, no el posible.
    const ordered = [...save.world.decisions].sort((a, b) => a.at - b.at);

    for (const decision of ordered) {
      try {
        const node = engine.getNode(decision.nodeId);
        const choice = node.choices.find((c) => c.id === decision.choiceId);
        pages.push({
          nodeId: node.id,
          chapterId: node.chapterId,
          speaker: node.speaker,
          text: renderStoryText(lt(node.text), ctx),
          choiceTaken: choice ? renderStoryText(lt(choice.text), ctx) : undefined,
          at: decision.at
        });
      } catch {
        // Nodo de una versión anterior del contenido: se omite con gracia.
      }
    }

    // La página actual (donde estás ahora), aún sin decidir:
    try {
      const current = engine.getNode(save.currentNodeId);
      if (!pages.some((p) => p.nodeId === current.id && !p.choiceTaken)) {
        pages.push({
          nodeId: current.id,
          chapterId: current.chapterId,
          speaker: current.speaker,
          text: renderStoryText(lt(current.text), ctx)
        });
      }
    } catch {
      /* nodo desconocido */
    }

    const chapters = new Map<string, BookPage[]>();
    for (const page of pages) {
      const list = chapters.get(page.chapterId) ?? [];
      list.push(page);
      chapters.set(page.chapterId, list);
    }
    return { pages, chapters };
  }, [save]);
}

const CHAPTER_TITLES: Record<string, { es: string; en: string }> = {
  prologue: { es: 'Prólogo — La última página', en: 'Prologue — The Last Page' },
  chapter_01: { es: 'Capítulo 1 — La aldea entre la niebla', en: 'Chapter 1 — The Village in the Mist' },
  chapter_02: { es: 'Capítulo 2 — El sello de la Sierpe', en: 'Chapter 2 — The Seal of the Serpent' }
};

export function LifeTreeScreen({ onClose }: { onClose: () => void }) {
  const save = useGameStore((s) => s.save);
  const { pages, chapters } = useLifeBook();
  const [pageIndex, setPageIndex] = useState(0);

  if (!save) return null;

  const page = pages[pageIndex];
  const isCurrent = pageIndex === pages.length - 1 && !page?.choiceTaken;

  return (
    <div className="lifetree-overlay" role="dialog" aria-label={t('lifetree.title')}>
      <div className="lifetree-book">
        <header className="lifetree-header">
          <span className="lifetree-crown" aria-hidden>✦ ❦ ✦</span>
          <h2>{t('lifetree.title')}</h2>
          <p className="hint-text">{t('lifetree.subtitle', { name: save.character.name })}</p>
          <button className="lifetree-close" onClick={onClose} aria-label={t('lifetree.close')}>
            ✕
          </button>
        </header>

        {/* Índice de capítulos vividos */}
        <nav className="lifetree-toc" aria-label={t('lifetree.chapters')}>
          {[...chapters.keys()].map((chId) => {
            const first = pages.findIndex((p) => p.chapterId === chId);
            const active = page?.chapterId === chId;
            return (
              <button
                key={chId}
                className={`lifetree-toc-btn ${active ? 'active' : ''}`}
                onClick={() => setPageIndex(first)}
              >
                {lt(CHAPTER_TITLES[chId] ?? { es: chId, en: chId })}
              </button>
            );
          })}
        </nav>

        {/* Página del libro */}
        <div className="lifetree-page-scroll">
          {page ? (
            <article className={`parchment lifetree-page ${isCurrent ? 'current' : ''}`}>
              <div className="lifetree-pagenum">
                {t('lifetree.page', { num: pageIndex + 1, total: pages.length })}
              </div>
              {page.speaker && <span className="speaker-tag">{t(`speaker.${page.speaker}`)}</span>}
              <p className="lifetree-text">{page.text}</p>
              {page.choiceTaken ? (
                <p className="lifetree-choice">
                  ❧ {t('lifetree.youChose')} <em>«{page.choiceTaken}»</em>
                </p>
              ) : (
                <p className="lifetree-choice lifetree-here">
                  ✦ {t('lifetree.youAreHere')} ✦
                </p>
              )}
            </article>
          ) : (
            <article className="parchment lifetree-page">
              <p className="lifetree-text">{t('lifetree.empty')}</p>
            </article>
          )}
        </div>

        {/* Navegación de páginas */}
        <footer className="lifetree-nav">
          <button
            className="btn-secondary"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          >
            ← {t('lifetree.prev')}
          </button>
          <span className="lifetree-progress">
            {pages.length > 0 ? `${pageIndex + 1} / ${pages.length}` : '—'}
          </span>
          <button
            className="btn-secondary"
            disabled={pageIndex >= pages.length - 1}
            onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
          >
            {t('lifetree.next')} →
          </button>
        </footer>
        <p className="lifetree-sealed"><IconLock size={13} className="inline-ico" /> {t('lifetree.sealed')}</p>
      </div>
    </div>
  );
}
