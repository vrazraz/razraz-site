import { useRef, useState } from 'react'
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

const SWIPE_DISTANCE = 60
const SWIPE_VELOCITY = 0.5

export function MobileFeed({ route, navigate, theme, onToggleTheme }: Props) {
  const index = Math.max(
    0,
    SECTIONS.findIndex((s) => s.id === route.section),
  )
  const [drag, setDrag] = useState(0)
  const touch = useRef<{ x: number; y: number; t: number; lock: 'h' | 'v' | null } | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY, t: performance.now(), lock: null }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const st = touch.current
    if (!st) return
    const t = e.touches[0]
    const dx = t.clientX - st.x
    const dy = t.clientY - st.y
    if (!st.lock) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      st.lock = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
    }
    if (st.lock !== 'h') return
    // Резиновое сопротивление на краях
    const atEdge = (index === 0 && dx > 0) || (index === SECTIONS.length - 1 && dx < 0)
    setDrag(atEdge ? dx * 0.3 : dx)
  }

  const onTouchEnd = () => {
    const st = touch.current
    touch.current = null
    if (!st || st.lock !== 'h') {
      setDrag(0)
      return
    }
    const dt = performance.now() - st.t
    const velocity = Math.abs(drag) / Math.max(dt, 1)
    if (Math.abs(drag) > SWIPE_DISTANCE || velocity > SWIPE_VELOCITY) {
      const next = drag < 0 ? index + 1 : index - 1
      if (next >= 0 && next < SECTIONS.length) navigate(SECTIONS[next].id)
    }
    setDrag(0)
  }

  return (
    <div className="feed">
      <GrainOverlay />
      <div
        className={`feed__track${drag !== 0 ? ' feed__track--dragging' : ''}`}
        style={{ transform: `translateX(calc(${-index * 100}% + ${drag}px))` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {SECTIONS.map((s) => (
          <div key={s.id} className="feed__slide">
            <section className="feed__section toon-panel" aria-label={s.label} aria-hidden={s.id !== route.section}>
              <img
                key={s.id === route.section ? 'on' : 'off'}
                className={'frame__lamp' + (s.id === route.section ? ' frame__lamp--on' : '')}
                src={`${import.meta.env.BASE_URL}${s.id === route.section ? 'glight1.png' : 'glight2.png'}`}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
              <div className="feed__body">{s.render(navigate)}</div>
            </section>
          </div>
        ))}
      </div>
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
