import { useEffect, useRef } from 'react'
import { layout } from '../content'
import { useCanvasEngine } from '../canvas/useCanvasEngine'
import { SECTIONS } from '../sections'
import type { Route, Theme } from '../hooks'
import { FrameShell } from './FrameShell'
import { BottomNav } from './BottomNav'
import { Minimap } from './Minimap'
import { CanvasDecor, GrainOverlay, Vignette } from './Decor'
import { CursorHint } from './CursorHint'
import { ClickBurst } from './ClickBurst'
import { ViewSwitcher, type ViewMode } from './ViewSwitcher'
import { GhostCursors } from './GhostCursors'
import { useI18n } from '../i18n'

interface Props {
  route: Route
  navigate: (section: string, postId?: string) => void
  theme: Theme
  onToggleTheme: () => void
  shakeFrame?: string | null
  viewMode: ViewMode
  onChangeView: (m: ViewMode) => void
}

export function CanvasView({ route, navigate, theme, onToggleTheme, shakeFrame, viewMode, onChangeView }: Props) {
  const { s } = useI18n()
  const engine = useCanvasEngine(layout)
  const started = useRef(false)

  /* Первый рендер — мгновенная позиция; смена hash — перелёт */
  useEffect(() => {
    engine.flyToFrame(route.section, !started.current)
    started.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.section])

  const onSelect = (id: string) => {
    if (id === route.section) {
      engine.flyToFrame(id) // hash не изменится — летим сами
    } else {
      navigate(id)
    }
  }

  const t = engine.transform
  const dot = 22 * t.scale

  return (
    <div
      ref={engine.rootRef}
      className={
        'canvas-root' +
        (engine.spaceHeld ? ' canvas-root--pan' : '') +
        (engine.moving ? ' canvas-root--moving' : '')
      }
      style={{
        backgroundPosition: `${t.x}px ${t.y}px`,
        backgroundSize: `${dot}px ${dot}px`,
      }}
      {...engine.rootHandlers}
    >
      <GrainOverlay />
      <div
        className="canvas-world"
        style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})` }}
      >
        <CanvasDecor scale={t.scale} spaceHeld={engine.spaceHeld} />
        <GhostCursors scale={t.scale} />
        {SECTIONS.map((sec) => (
          <FrameShell
            key={sec.id}
            id={sec.id}
            title={s.sections[sec.id]}
            rect={engine.positions[sec.id]}
            active={engine.activeFrame === sec.id}
            engine={engine}
            shake={shakeFrame === sec.id}
          >
            {sec.render(navigate)}
          </FrameShell>
        ))}
      </div>
      <Vignette />
      <CursorHint />
      <ClickBurst />
      <ViewSwitcher mode={viewMode} onChange={onChangeView} />
      <BottomNav
        sections={SECTIONS}
        active={engine.activeFrame ?? route.section}
        onSelect={onSelect}
        theme={theme}
        onToggleTheme={onToggleTheme}
        scale={t.scale}
        onResetZoom={engine.resetZoom}
      />
      <Minimap engine={engine} />
    </div>
  )
}
