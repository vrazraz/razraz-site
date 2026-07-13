import { describe, it, expect } from 'vitest'
import { visibleArea, MIN_SCALE, MAX_SCALE } from '../src/canvas/useCanvasEngine'

const rect = { x: 0, y: 0, w: 100, h: 100 }

describe('visibleArea', () => {
  it('фрейм целиком во вьюпорте — полная площадь', () => {
    expect(visibleArea(rect, { x: 10, y: 10, scale: 1 }, 500, 500)).toBe(100 * 100)
  })

  it('фрейм за пределами вьюпорта — ноль', () => {
    expect(visibleArea(rect, { x: -1000, y: 0, scale: 1 }, 500, 500)).toBe(0)
  })

  it('частичное перекрытие считается по пересечению', () => {
    // левая половина фрейма за левым краем
    expect(visibleArea(rect, { x: -50, y: 0, scale: 1 }, 500, 500)).toBe(50 * 100)
  })

  it('масштаб влияет на экранную площадь', () => {
    expect(visibleArea(rect, { x: 0, y: 0, scale: 0.5 }, 500, 500)).toBe(50 * 50)
  })

  it('границы зума заданы разумно', () => {
    expect(MIN_SCALE).toBeLessThan(MAX_SCALE)
    expect(MIN_SCALE).toBeGreaterThan(0)
  })
})
