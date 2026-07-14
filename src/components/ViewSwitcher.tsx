import { useI18n } from '../i18n'

export type ViewMode = 'canvas' | 'standard'

/** Segmented control режима отображения — сверху по центру */
export function ViewSwitcher({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const { s } = useI18n()
  const modes: { id: ViewMode; label: string }[] = [
    { id: 'standard', label: s.viewStandard },
    { id: 'canvas', label: s.viewCanvas },
  ]
  return (
    <div
      className={'view-switcher toon-panel view-switcher--' + mode}
      role="tablist"
      aria-label={s.viewMode}
    >
      <span className="view-switcher__pill" aria-hidden="true" />
      {modes.map((m) => (
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
