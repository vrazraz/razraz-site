import { useEffect, useRef, useState } from 'react'
import { SECTIONS } from '../sections'
import type { Route, Theme } from '../hooks'
import { BottomNav } from './BottomNav'
import { GrainOverlay, StandardDecor, Vignette } from './Decor'
import { ViewSwitcher, type ViewMode } from './ViewSwitcher'
import { lampDelayStyle } from './FrameShell'
import { useI18n } from '../i18n'

interface Props {
  route: Route
  navigate: (section: string, postId?: string) => void
  theme: Theme
  onToggleTheme: () => void
  viewMode: ViewMode
  onChangeView: (m: ViewMode) => void
}

/** Стандартный режим: обычная вертикальная страница вместо канваса */
export function StandardView({ route, navigate, theme, onToggleTheme, viewMode, onChangeView }: Props) {
  const { s } = useI18n()
  const refs = useRef<Record<string, HTMLElement | null>>({})
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [visibleId, setVisibleId] = useState(route.section)
  const started = useRef(false)
  const scrollingTo = useRef<string | null>(null)

  const scrollRaf = useRef(0)

  /* Своя анимация: нативный smooth-scroll местами отключён/прерывается */
  const scrollToSection = (id: string, smooth: boolean) => {
    const el = refs.current[id]
    const root = rootRef.current
    if (!el || !root) return
    const to = Math.max(0, el.offsetTop - 24)
    cancelAnimationFrame(scrollRaf.current)
    if (!smooth || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.scrollTop = to
      return
    }
    const from = root.scrollTop
    const dist = to - from
    if (Math.abs(dist) < 2) return
    const dur = Math.min(700, 300 + Math.abs(dist) * 0.12)
    const start = performance.now()
    const ease = (p: number) => 1 - Math.pow(1 - p, 3)
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      root.scrollTop = from + dist * ease(p)
      if (p < 1) scrollRaf.current = requestAnimationFrame(step)
    }
    scrollRaf.current = requestAnimationFrame(step)
  }

  useEffect(() => () => cancelAnimationFrame(scrollRaf.current), [])

  useEffect(() => {
    scrollingTo.current = route.section
    setVisibleId(route.section)
    scrollToSection(route.section, started.current)
    started.current = true
    const t = window.setTimeout(() => {
      scrollingTo.current = null
    }, 900)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.section])

  /* Подсветка активного раздела следует за скроллом */
  const onScroll = () => {
    if (scrollingTo.current) return
    const root = rootRef.current
    if (!root) return
    const mid = root.scrollTop + root.clientHeight * 0.35
    let current = SECTIONS[0].id
    for (const s of SECTIONS) {
      const el = refs.current[s.id]
      if (el && el.offsetTop <= mid) current = s.id
    }
    setVisibleId(current)
  }

  return (
    <div ref={rootRef} className="standard" onScroll={onScroll}>
      <GrainOverlay />
      <StandardDecor />
      <div className="standard__inner">
        {SECTIONS.map((sec) => (
          <section
            key={sec.id}
            ref={(el) => {
              refs.current[sec.id] = el
            }}
            className="standard__section toon-panel"
            aria-label={s.sections[sec.id]}
          >
            <img
              key={visibleId === sec.id ? 'on' : 'off'}
              className={'frame__lamp' + (visibleId === sec.id ? ' frame__lamp--on' : '')}
              style={lampDelayStyle(sec.id)}
              src={`${import.meta.env.BASE_URL}${visibleId === sec.id ? 'glight1.png' : 'glight2.png'}`}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
            <div className="standard__body">{sec.render(navigate)}</div>
          </section>
        ))}
      </div>
      <Vignette />
      <ViewSwitcher mode={viewMode} onChange={onChangeView} />
      <BottomNav
        sections={SECTIONS}
        active={visibleId}
        onSelect={(id) => {
          if (id === route.section) {
            scrollToSection(id, true)
          } else {
            navigate(id)
          }
        }}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    </div>
  )
}
