import { useEffect, useRef, useState } from 'react'
import type { Theme } from '../hooks'
import type { Section } from '../sections'
import { useI18n } from '../i18n'

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

/** Иконка-домик для раздела «Обо мне» (ассет владельца) */
const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M1 9.03322C1 8.07025 1.46226 7.16582 2.24272 6.60176L10.8285 0.396608C11.1781 0.143922 11.5891 1.49012e-07 12 0C12.4109 -1.49012e-07 12.8219 0.143921 13.1715 0.396607L21.7573 6.60176C22.5377 7.16582 23 8.07025 23 9.03322V20.9999C23 22.1045 22.1046 22.9999 21 22.9999H15C14.4477 22.9999 14 22.5522 14 21.9999V16.9999C14 16.4476 13.5523 15.9999 13 15.9999H11C10.4477 15.9999 10 16.4476 10 16.9999V21.9999C10 22.5522 9.55228 22.9999 9 22.9999H3C1.89543 22.9999 1 22.1045 1 20.9999V9.03322Z"
      fill="currentColor"
    />
  </svg>
)

const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.31-.09.63-.09.94s.02.63.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58ZM12 15.6A3.61 3.61 0 0 1 8.4 12c0-1.98 1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6Z"
      fill="currentColor"
    />
  </svg>
)

export function BottomNav({ sections, active, onSelect, theme, onToggleTheme, scale, onResetZoom }: Props) {
  const { lang, setLang, s } = useI18n()
  const [spark, setSpark] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)

  /* Клик мимо и Esc закрывают настройки */
  useEffect(() => {
    if (!settingsOpen) return
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setSettingsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [settingsOpen])

  return (
    <nav ref={navRef} className="bottom-nav toon-panel" aria-label={s.navAria}>
      {sections.map((sec) => {
        const label = s.sections[sec.id]
        return (
          <button
            key={sec.id}
            className={
              'bottom-nav__item' +
              (active === sec.id ? ' bottom-nav__item--active' : '') +
              (sec.id === 'about' ? ' bottom-nav__item--icon' : '')
            }
            onClick={() => onSelect(sec.id)}
            aria-label={label}
            title={sec.id === 'about' ? label : undefined}
          >
            {sec.id === 'about' ? <HomeIcon /> : label}
          </button>
        )
      })}
      <span className="bottom-nav__sep" aria-hidden="true" />
      {scale !== undefined && (
        <button className="bottom-nav__zoom" onClick={onResetZoom} title={s.resetZoom}>
          {Math.round(scale * 100)}%
        </button>
      )}
      <button
        className={'bottom-nav__theme bottom-nav__gear' + (settingsOpen ? ' bottom-nav__gear--open' : '')}
        onClick={() => setSettingsOpen((o) => !o)}
        aria-label={s.settings}
        aria-expanded={settingsOpen}
        title={s.settings}
      >
        <GearIcon />
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
      {settingsOpen && (
        <div className="settings-pop toon-panel" role="dialog" aria-label={s.settings}>
          <div className="settings-row">
            <span className="settings-row__label">{s.theme}</span>
            <button
              className="settings-control interactive"
              onClick={() => {
                setSpark(n => n + 1)
                onToggleTheme()
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}${theme === 'dark' ? 'icon-moon.png' : 'icon-sun.png'}`}
                alt=""
                draggable={false}
              />
              {theme === 'dark' ? s.themeDark : s.themeLight}
            </button>
          </div>
          <div className="settings-row">
            <span className="settings-row__label">{s.language}</span>
            <div className="settings-seg" role="tablist" aria-label={s.language}>
              {(['ru', 'en'] as const).map((l) => (
                <button
                  key={l}
                  role="tab"
                  aria-selected={lang === l}
                  className={'settings-seg__btn' + (lang === l ? ' settings-seg__btn--active' : '')}
                  onClick={() => setLang(l)}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
