import { useMemo, type ReactNode } from 'react'
import type { FrameRect } from '../content'
import type { CanvasEngine } from '../canvas/useCanvasEngine'

interface Props {
  id: string
  title: string
  rect: FrameRect
  active: boolean
  engine: CanvasEngine
  children: ReactNode
}

export function FrameShell({ id, title, rect, active, engine, children }: Props) {
  const dragHandlers = useMemo(() => engine.frameDragHandlers(id), [engine, id])
  const visible = engine.isFrameVisible(id)
  return (
    <section
      className={'frame' + (active ? ' frame--active' : '')}
      style={{
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: rect.w,
        height: rect.h,
      }}
      aria-label={title}
      {...dragHandlers}
    >
      <span className={'frame__tag' + (active ? ' frame__tag--active' : '')}>● {title}</span>
      <div className="frame__body frame-scroll">{visible ? children : null}</div>
    </section>
  )
}
