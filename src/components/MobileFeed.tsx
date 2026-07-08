import { useEffect, useRef } from 'react'
import { SECTIONS } from '../sections'
import type { Route, Theme } from '../hooks'
import { BottomNav } from './BottomNav'
import { GrainOverlay, Vignette } from './Decor'

interface Props {
  route: Route
  navigate: (section: string, postId?: string) => void
  theme: Theme
  onToggleTheme: () => void
}

export function MobileFeed({ route, navigate, theme, onToggleTheme }: Props) {
  const refs = useRef<Record<string, HTMLElement | null>>({})
  const started = useRef(false)

  useEffect(() => {
    refs.current[route.section]?.scrollIntoView({
      behavior: started.current ? 'smooth' : 'instant',
      block: 'start',
    })
    started.current = true
  }, [route.section])

  return (
    <div className="feed">
      <GrainOverlay />
      {SECTIONS.map((s) => (
        <section
          key={s.id}
          ref={(el) => {
            refs.current[s.id] = el
          }}
          className="feed__section toon-panel"
          aria-label={s.label}
        >
          <span className="frame__tag">● {s.label}</span>
          <div className="feed__body">{s.render(navigate)}</div>
        </section>
      ))}
      <Vignette />
      <BottomNav
        sections={SECTIONS}
        active={route.section}
        onSelect={(id) => navigate(id)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    </div>
  )
}
