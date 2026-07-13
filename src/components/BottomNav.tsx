import { useState } from 'react'
import type { Theme } from '../hooks'
import type { Section } from '../sections'

interface Props {
  sections: Section[]
  active: string | null
  onSelect: (id: string) => void
  theme: Theme
  onToggleTheme: () => void
  /** Данные зума показываются только на канвасе */
  scale?: number
  onResetZoom?: () => void
  /** Переключатель режима отображения (только веб-версия) */
  viewMode?: 'canvas' | 'standard'
  onToggleView?: () => void
}

export function BottomNav({
  sections,
  active,
  onSelect,
  theme,
  onToggleTheme,
  scale,
  onResetZoom,
  viewMode,
  onToggleView,
}: Props) {
  const [spark, setSpark] = useState(0)
  return (
    <nav className="bottom-nav toon-panel" aria-label="Разделы">
      {sections.map((s) => (
        <button
          key={s.id}
          className={'bottom-nav__item' + (active === s.id ? ' bottom-nav__item--active' : '')}
          onClick={() => onSelect(s.id)}
        >
          {s.label}
        </button>
      ))}
      <span className="bottom-nav__sep" aria-hidden="true" />
      {scale !== undefined && (
        <button className="bottom-nav__zoom" onClick={onResetZoom} title="Сбросить масштаб">
          {Math.round(scale * 100)}%
        </button>
      )}
      <button
        className="bottom-nav__theme"
        onClick={() => {
          setSpark((s) => s + 1)
          onToggleTheme()
        }}
        aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      >
        {theme === 'dark' ? '☀' : '☾'}
        {spark > 0 && (
          <svg key={spark} className="nav-spark" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M10 1 l2 6 6 0.6 -4.5 4 1.5 6.4 -5 -3.6 -5 3.6 1.5 -6.4 -4.5 -4 6 -0.6 z"
              fill="var(--accent)"
              stroke="var(--outline)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      {onToggleView && (
        <button
          className="bottom-nav__theme bottom-nav__view"
          onClick={onToggleView}
          aria-label={viewMode === 'canvas' ? 'Стандартный вид' : 'Экспериментальный вид'}
          title={viewMode === 'canvas' ? 'Стандартный вид' : 'Экспериментальный вид'}
        >
          {viewMode === 'canvas' ? '▤' : '⌗'}
        </button>
      )}
    </nav>
  )
}
