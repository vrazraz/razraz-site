import { useMemo, type CSSProperties, type ReactNode } from 'react'
import type { FrameRect } from '../content'
import type { CanvasEngine } from '../canvas/useCanvasEngine'
import type { Theme } from '../hooks'

/** Фонарь: в светлой теме — рисованные варианты (glight*w) */
export const lampSrc = (active: boolean, theme: Theme) =>
  `${import.meta.env.BASE_URL}glight${active ? 1 : 2}${theme === 'light' ? 'w' : ''}.png`

/** Рассинхрон покачивания фонарей: стабильная задержка из id раздела */
export function lampDelayStyle(id: string): CSSProperties {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 997
  return { '--lamp-delay': `${-(hash % 60) / 10}s` } as CSSProperties
}

interface Props {
  id: string
  title: string
  rect: FrameRect
  active: boolean
  engine: CanvasEngine
  theme: Theme
  shake?: boolean
  children: ReactNode
}

export function FrameShell({ id, title, rect, active, engine, theme, shake, children }: Props) {
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
        style={lampDelayStyle(id)}
        src={lampSrc(active, theme)}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <div className="frame__body frame-scroll">{visible ? children : null}</div>
    </section>
  )
}
