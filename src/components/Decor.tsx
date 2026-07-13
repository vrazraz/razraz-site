/** Rubber-hose декор в мировых координатах + плёночные оверлеи в экранных. */
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

function Star({ size = 34, accent = false }: { size?: number; accent?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <path
        d="M17 3 l3.5 9 9.5 1 -7 6.5 2.5 10 -8.5 -5.5 -8.5 5.5 2.5 -10 -7 -6.5 9.5 -1 z"
        fill={accent ? 'var(--accent)' : 'var(--decor-paper)'}
        stroke="var(--outline)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MotionLines() {
  return (
    <svg width="120" height="90" viewBox="0 0 120 90" aria-hidden="true">
      <path
        d="M10 20 Q 25 10 40 20 M6 40 Q 24 28 44 38 M12 60 Q 26 52 40 60"
        stroke="var(--decor-ink)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Обёртка, позволяющая таскать элемент декора мышью по канвасу.
 *  Движение курсора переводится в мировые координаты через текущий зум. */
function Draggable({
  x,
  y,
  scale,
  spaceHeld,
  children,
}: {
  x: number
  y: number
  scale: number
  spaceHeld: boolean
  children: ReactNode
}) {
  const [pos, setPos] = useState({ x, y })
  const last = useRef<{ x: number; y: number } | null>(null)
  const scaleRef = useRef(scale)
  scaleRef.current = scale

  const stop = () => {
    last.current = null
    document.body.classList.remove('no-select')
  }

  return (
    <div
      className="decor decor--draggable"
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={(e) => {
        if (e.button !== 0 || spaceHeld) return
        e.stopPropagation()
        last.current = { x: e.clientX, y: e.clientY }
        document.body.classList.add('no-select')
        try {
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        } catch {
          /* синтетические события без активного указателя */
        }
      }}
      onPointerMove={(e) => {
        const lc = last.current
        if (!lc) return
        const s = scaleRef.current
        const dx = (e.clientX - lc.x) / s
        const dy = (e.clientY - lc.y) / s
        last.current = { x: e.clientX, y: e.clientY }
        setPos((p) => ({ x: p.x + dx, y: p.y + dy }))
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      {children}
    </div>
  )
}

/** Наклоны ±20°, размеры каждого спрайта варьируются в пределах ±10% от базовых 150px */
const SPRITES = [
  { src: 'decor-bulb.png', x: 790, y: -40, w: 138, rot: -14 },
  { src: 'decor-books.png', x: 160, y: 655, w: 165, rot: 9 },
  { src: 'decor-cursor.png', x: 700, y: 1150, w: 150, rot: -18 },
  { src: 'decor-design.png', x: 1360, y: 640, w: 160, rot: 6 },
  { src: 'decor-folder.png', x: 300, y: 1640, w: 143, rot: 16 },
  { src: 'decor-lamp.png', x: 1780, y: 1240, w: 152, rot: -11 },
  { src: 'decor-password.png', x: 2230, y: 130, w: 145, rot: -13 },
]

const VECTOR_DECOR: { key: string; x: number; y: number; node: ReactNode }[] = [
  { key: 'star-1', x: 840, y: -180, node: <Star accent /> },
  { key: 'lines-1', x: 870, y: -140, node: <MotionLines /> },
  { key: 'star-2', x: 780, y: 760, node: <Star size={24} /> },
  { key: 'lines-2', x: -160, y: 880, node: <MotionLines /> },
  { key: 'star-3', x: 1850, y: 560, node: <Star size={28} accent /> },
]

/** Виньетки между фреймами; координаты подобраны под content/layout.json */
export function CanvasDecor({ scale, spaceHeld }: { scale: number; spaceHeld: boolean }) {
  return (
    <>
      {VECTOR_DECOR.map((d) => (
        <Draggable key={d.key} x={d.x} y={d.y} scale={scale} spaceHeld={spaceHeld}>
          {d.node}
        </Draggable>
      ))}
      {SPRITES.map((s) => (
        <Draggable key={s.src} x={s.x} y={s.y} scale={scale} spaceHeld={spaceHeld}>
          <img
            className="decor-sprite"
            style={{ width: s.w, transform: `rotate(${s.rot}deg)` }}
            src={`${import.meta.env.BASE_URL}${s.src}`}
            alt=""
            aria-hidden="true"
            draggable={false}
            onError={(e) => {
              ;((e.target as HTMLImageElement).parentElement as HTMLElement).style.display = 'none'
            }}
          />
        </Draggable>
      ))}
    </>
  )
}

/** Декор стандартного режима: закреплён на фоне (fixed), по краям экрана.
 *  Раскладка случайная на каждую загрузку: спрайты тасуются между левой
 *  и правой полосами, вертикальные слоты и наклоны рандомизируются. */
const STD_SPRITES = [
  'decor-bulb.png',
  'decor-books.png',
  'decor-cursor.png',
  'decor-design.png',
  'decor-folder.png',
  'decor-lamp.png',
]

function scatter(): { src: string; style: CSSProperties; w: number; rot: number }[] {
  const shuffled = [...STD_SPRITES].sort(() => Math.random() - 0.5)
  /* три вертикальных слота на каждую полосу, чтобы не слипались */
  const slots = [
    [4, 24],
    [34, 56],
    [66, 84],
  ]
  return shuffled.map((src, i) => {
    const left = i < 3
    const slot = slots[i % 3]
    const style: CSSProperties = {
      top: `${slot[0] + Math.random() * (slot[1] - slot[0])}%`,
      [left ? 'left' : 'right']: `${1.5 + Math.random() * 5}%`,
    }
    return {
      src,
      style,
      w: Math.round(120 * (0.9 + Math.random() * 0.2)),
      rot: Math.round(-20 + Math.random() * 40),
    }
  })
}

export function StandardDecor() {
  const [sprites] = useState(scatter)
  return (
    <>
      {sprites.map((s) => (
        <span key={s.src} className="std-decor-item" style={s.style} aria-hidden="true">
          <img
            className="decor-sprite"
            style={{ width: s.w, transform: `rotate(${s.rot}deg)` }}
            src={`${import.meta.env.BASE_URL}${s.src}`}
            alt=""
            draggable={false}
            onError={(e) => {
              ;((e.target as HTMLImageElement).parentElement as HTMLElement).style.display = 'none'
            }}
          />
        </span>
      ))}
    </>
  )
}

/** Зерно и царапины — только на фоне канваса, под фреймами */
export function GrainOverlay() {
  return (
    <div className="grain" aria-hidden="true">
      <span className="grain__scratch" style={{ left: '23%' }} />
      <span className="grain__scratch grain__scratch--dim" style={{ left: '71%' }} />
    </div>
  )
}

/** Виньетка по краям экрана — поверх всего, клики пропускает */
export function Vignette() {
  return <div className="vignette" aria-hidden="true" />
}
