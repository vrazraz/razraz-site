import { useMemo, type ReactNode } from 'react'
import type { FrameRect } from '../content'
import type { CanvasEngine } from '../canvas/useCanvasEngine'

interface Props {
  id: string
  title: string
  rect: FrameRect
  active: boolean
  engine: CanvasEngine
  shake?: boolean
  children: ReactNode
}

export function FrameShell({ id, title, rect, active, engine, shake, children }: Props) {
  const dragHandlers = useMemo(() => engine.frameDragHandlers(id), [engine, id])
  const visible = engine.isFrameVisible(id)
  const cls =
    'frame' +
    (active ? ' frame--active' : '') +
    (engine.landedFrame === id ? ' frame--landed' : '') +
    (engine.draggingFrame === id ? ' frame--dragging' : '') +
    (shake ? ' frame--shake' : '')
  return (
    <section
      className={cls}
      style={{
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: rect.w,
        height: rect.h,
      }}
      aria-label={title}
      {...dragHandlers}
    >
      <img
        key={active ? 'on' : 'off'}
        className={'frame__lamp' + (active ? ' frame__lamp--on' : '')}
        src={`${import.meta.env.BASE_URL}${active ? 'glight1.png' : 'glight2.png'}`}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <div className="frame__body frame-scroll">{visible ? children : null}</div>
    </section>
  )
}
