export type ViewMode = 'canvas' | 'standard'

const MODES: { id: ViewMode; label: string }[] = [
  { id: 'standard', label: 'Стандартный' },
  { id: 'canvas', label: 'Экспериментальный' },
]

/** Segmented control режима отображения — сверху по центру */
export function ViewSwitcher({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div
      className={'view-switcher toon-panel view-switcher--' + mode}
      role="tablist"
      aria-label="Режим отображения"
    >
      <span className="view-switcher__pill" aria-hidden="true" />
      {MODES.map((m) => (
        <button
          key={m.id}
          role="tab"
          aria-selected={mode === m.id}
          className={'view-switcher__seg' + (mode === m.id ? ' view-switcher__seg--active' : '')}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
