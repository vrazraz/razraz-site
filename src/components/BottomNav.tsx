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
}

export function BottomNav({ sections, active, onSelect, theme, onToggleTheme, scale, onResetZoom }: Props) {
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
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
    </nav>
  )
}
