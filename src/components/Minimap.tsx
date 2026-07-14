import { useState } from 'react'
import type { CanvasEngine } from '../canvas/useCanvasEngine'
import { useI18n } from '../i18n'

const BOX_W = 150
const BOX_H = 96
const WORLD_PAD = 160

export function Minimap({ engine }: { engine: CanvasEngine }) {
  const { s } = useI18n()
  const [hover, setHover] = useState(false)
  const root = engine.rootRef.current
  const rects = Object.entries(engine.positions)

  if (!root || rects.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [, r] of rects) {
    minX = Math.min(minX, r.x)
    minY = Math.min(minY, r.y)
    maxX = Math.max(maxX, r.x + r.w)
    maxY = Math.max(maxY, r.y + r.h)
  }
  minX -= WORLD_PAD
  minY -= WORLD_PAD
  maxX += WORLD_PAD
  maxY += WORLD_PAD

  const k = Math.min(BOX_W / (maxX - minX), BOX_H / (maxY - minY))
  const offX = (BOX_W - (maxX - minX) * k) / 2
  const offY = (BOX_H - (maxY - minY) * k) / 2
  const toBox = (wx: number, wy: number) => ({
    x: (wx - minX) * k + offX,
    y: (wy - minY) * k + offY,
  })

  const t = engine.transform
  const vp0 = toBox(-t.x / t.scale, -t.y / t.scale)
  const vpW = (root.clientWidth / t.scale) * k
  const vpH = (root.clientHeight / t.scale) * k

  const onPick = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const wx = (e.clientX - box.left - offX) / k + minX
    const wy = (e.clientY - box.top - offY) / k + minY
    engine.setViewportCenter(wx, wy)
  }

  return (
    <div
      className={'minimap toon-panel' + (engine.moving || hover ? ' minimap--visible' : '')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="micro-label">{s.map}</div>
      <div
        className="minimap__box interactive"
        style={{ width: BOX_W, height: BOX_H }}
        onClick={onPick}
        role="button"
        aria-label={s.minimapAria}
      >
        {rects.map(([id, r]) => {
          const p = toBox(r.x, r.y)
          return (
            <div
              key={id}
              className={'minimap__frame' + (engine.activeFrame === id ? ' minimap__frame--active' : '')}
              style={{ left: p.x, top: p.y, width: r.w * k, height: r.h * k }}
            />
          )
        })}
        <div
          className="minimap__viewport"
          style={{ left: vp0.x, top: vp0.y, width: vpW, height: vpH }}
        />
      </div>
    </div>
  )
}
