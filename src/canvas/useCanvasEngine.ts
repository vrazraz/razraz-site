import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FrameRect } from '../content'

export interface Transform {
  x: number
  y: number
  scale: number
}

export const MIN_SCALE = 0.25
export const MAX_SCALE = 1.5
const FLIGHT_MS = 600
const MOVE_IDLE_MS = 1500
const INERTIA_DECAY = 0.92

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function clampScale(s: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
}

/** Каково пересечение фрейма с вьюпортом (в px² экрана) */
function visibleArea(rect: FrameRect, t: Transform, vw: number, vh: number) {
  const left = rect.x * t.scale + t.x
  const top = rect.y * t.scale + t.y
  const right = left + rect.w * t.scale
  const bottom = top + rect.h * t.scale
  const w = Math.min(right, vw) - Math.max(left, 0)
  const h = Math.min(bottom, vh) - Math.max(top, 0)
  return w > 0 && h > 0 ? w * h : 0
}

export function useCanvasEngine(initialLayout: Record<string, FrameRect>) {
  const [positions, setPositions] = useState<Record<string, FrameRect>>(initialLayout)
  const [transform, setTransformState] = useState<Transform>({ x: 0, y: 0, scale: 1 })
  const [moving, setMoving] = useState(false)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [landedFrame, setLandedFrame] = useState<string | null>(null)
  const [draggingFrame, setDraggingFrame] = useState<string | null>(null)
  const landTimer = useRef(0)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const transformRef = useRef(transform)
  const positionsRef = useRef(positions)
  const movingTimer = useRef<number>(0)
  const flightRaf = useRef<number>(0)
  const inertiaRaf = useRef<number>(0)
  const velocity = useRef({ x: 0, y: 0 })
  const lastPointer = useRef({ x: 0, y: 0, t: 0 })
  const panning = useRef(false)
  const dragging = useRef<{ id: string } | null>(null)
  const spaceRef = useRef(false)

  positionsRef.current = positions

  const markMoving = useCallback(() => {
    setMoving(true)
    window.clearTimeout(movingTimer.current)
    movingTimer.current = window.setTimeout(() => setMoving(false), MOVE_IDLE_MS)
  }, [])

  const setTransform = useCallback(
    (t: Transform) => {
      transformRef.current = t
      setTransformState(t)
      markMoving()
    },
    [markMoving],
  )

  const stopAnimations = useCallback(() => {
    cancelAnimationFrame(flightRaf.current)
    cancelAnimationFrame(inertiaRaf.current)
  }, [])

  const panBy = useCallback(
    (dx: number, dy: number) => {
      const t = transformRef.current
      setTransform({ ...t, x: t.x + dx, y: t.y + dy })
    },
    [setTransform],
  )

  const zoomAt = useCallback(
    (cx: number, cy: number, factor: number) => {
      const t = transformRef.current
      const scale = clampScale(t.scale * factor)
      const k = scale / t.scale
      setTransform({
        scale,
        x: cx - (cx - t.x) * k,
        y: cy - (cy - t.y) * k,
      })
    },
    [setTransform],
  )

  const resetZoom = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    zoomAt(root.clientWidth / 2, root.clientHeight / 2, 1 / transformRef.current.scale)
  }, [zoomAt])

  /** Целевой transform, чтобы фрейм поместился во вьюпорт с полями */
  const fitTransform = useCallback((rect: FrameRect): Transform => {
    const root = rootRef.current
    if (!root) return transformRef.current
    const vw = root.clientWidth
    const vh = root.clientHeight
    const scale = clampScale(Math.min((vw - 160) / rect.w, (vh - 220) / rect.h))
    return {
      scale,
      x: vw / 2 - (rect.x + rect.w / 2) * scale,
      y: vh / 2 - (rect.y + rect.h / 2) * scale,
    }
  }, [])

  const animateTo = useCallback(
    (target: Transform) => {
      stopAnimations()
      if (prefersReducedMotion()) {
        setTransform(target)
        return
      }
      const from = { ...transformRef.current }
      const start = performance.now()
      // easeOutBack с мягким overshoot
      const ease = (p: number) => {
        const c1 = 0.8
        const c3 = c1 + 1
        return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2)
      }
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / FLIGHT_MS)
        const e = ease(p)
        setTransform({
          x: from.x + (target.x - from.x) * e,
          y: from.y + (target.y - from.y) * e,
          scale: from.scale + (target.scale - from.scale) * e,
        })
        if (p < 1) flightRaf.current = requestAnimationFrame(step)
      }
      flightRaf.current = requestAnimationFrame(step)
    },
    [setTransform, stopAnimations],
  )

  const flyToFrame = useCallback(
    (id: string, instant = false) => {
      const rect = positionsRef.current[id]
      if (!rect) return
      const target = fitTransform(rect)
      if (instant) {
        stopAnimations()
        setTransform(target)
      } else {
        animateTo(target)
        /* squash & stretch «приземление» фрейма в конце перелёта */
        window.clearTimeout(landTimer.current)
        landTimer.current = window.setTimeout(() => {
          setLandedFrame(id)
          landTimer.current = window.setTimeout(() => setLandedFrame(null), 550)
        }, FLIGHT_MS - 80)
      }
    },
    [animateTo, fitTransform, setTransform, stopAnimations],
  )

  const setViewportCenter = useCallback(
    (wx: number, wy: number) => {
      const root = rootRef.current
      if (!root) return
      const t = transformRef.current
      setTransform({
        ...t,
        x: root.clientWidth / 2 - wx * t.scale,
        y: root.clientHeight / 2 - wy * t.scale,
      })
    },
    [setTransform],
  )

  const moveFrame = useCallback((id: string, dxWorld: number, dyWorld: number) => {
    setPositions((prev) => ({
      ...prev,
      [id]: { ...prev[id], x: prev[id].x + dxWorld, y: prev[id].y + dyWorld },
    }))
  }, [])

  /* ===== Пробел ===== */
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) =>
      e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable]')
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTyping(e)) {
        e.preventDefault()
        spaceRef.current = true
        setSpaceHeld(true)
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceRef.current = false
        setSpaceHeld(false)
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  /* ===== Клавиатура: стрелки и +/- ===== */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return
      const root = rootRef.current
      if (!root) return
      const PAN = 80
      switch (e.key) {
        case 'ArrowLeft':
          panBy(PAN, 0)
          break
        case 'ArrowRight':
          panBy(-PAN, 0)
          break
        case 'ArrowUp':
          panBy(0, PAN)
          break
        case 'ArrowDown':
          panBy(0, -PAN)
          break
        case '+':
        case '=':
          zoomAt(root.clientWidth / 2, root.clientHeight / 2, 1.15)
          break
        case '-':
          zoomAt(root.clientWidth / 2, root.clientHeight / 2, 1 / 1.15)
          break
        default:
          return
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panBy, zoomAt])

  /* ===== Обработчики корневого элемента ===== */
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const isPanButton = e.button === 2 || (e.button === 0 && spaceRef.current)
      if (!isPanButton) return
      stopAnimations()
      panning.current = true
      velocity.current = { x: 0, y: 0 }
      lastPointer.current = { x: e.clientX, y: e.clientY, t: performance.now() }
      document.body.classList.add('no-select')
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [stopAnimations],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!panning.current) return
      const now = performance.now()
      const dx = e.clientX - lastPointer.current.x
      const dy = e.clientY - lastPointer.current.y
      const dt = Math.max(1, now - lastPointer.current.t)
      velocity.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 }
      lastPointer.current = { x: e.clientX, y: e.clientY, t: now }
      panBy(dx, dy)
    },
    [panBy],
  )

  const startInertia = useCallback(() => {
    if (prefersReducedMotion()) return
    const step = () => {
      velocity.current.x *= INERTIA_DECAY
      velocity.current.y *= INERTIA_DECAY
      const { x, y } = velocity.current
      if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return
      panBy(x, y)
      inertiaRaf.current = requestAnimationFrame(step)
    }
    inertiaRaf.current = requestAnimationFrame(step)
  }, [panBy])

  const onPointerUp = useCallback(() => {
    if (!panning.current) return
    panning.current = false
    document.body.classList.remove('no-select')
    startInertia()
  }, [startInertia])

  /* Wheel вешаем нативно: нужен passive:false, чтобы preventDefault работал */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onWheel = (e: WheelEvent) => {
      // над скроллящимся содержимым фрейма отдаём колесо нативному скроллу
      const scroller = (e.target as HTMLElement).closest('.frame-scroll')
      if (scroller && scroller.scrollHeight > scroller.clientHeight) {
        const canScroll =
          e.deltaY > 0
            ? scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1
            : scroller.scrollTop > 0
        if (canScroll) return
      }
      e.preventDefault()
      stopAnimations()
      if (e.ctrlKey) {
        /* щипок на тачпаде (браузер шлёт wheel+ctrlKey) и ctrl+колесо */
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01))
        return
      }
      /* Скролл двумя пальцами по тачпаду — панорамирование (как в Figma).
         Эвристика: тачпад шлёт пиксельные дельты с горизонтальной
         составляющей или мелким шагом; колесо мыши — крупные шаги. */
      const isTouchpadScroll =
        e.deltaMode === WheelEvent.DOM_DELTA_PIXEL &&
        (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) < 50)
      if (isTouchpadScroll) {
        panBy(-e.deltaX, -e.deltaY)
      } else {
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0018))
      }
    }
    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [zoomAt, panBy, stopAnimations])

  useEffect(() => () => stopAnimations(), [stopAnimations])

  /* ===== Драг фрейма (вызывается из FrameShell) ===== */
  const frameDragHandlers = useCallback(
    (id: string) => ({
      onPointerDown: (e: React.PointerEvent) => {
        if (e.button !== 0 || spaceRef.current) return
        const target = e.target as HTMLElement
        if (target.closest('a, button, [role="button"], input, textarea, iframe, [data-nodrag]'))
          return
        e.stopPropagation()
        dragging.current = { id }
        setDraggingFrame(id)
        lastPointer.current = { x: e.clientX, y: e.clientY, t: performance.now() }
        document.body.classList.add('no-select')
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (dragging.current?.id !== id) return
        const dx = e.clientX - lastPointer.current.x
        const dy = e.clientY - lastPointer.current.y
        lastPointer.current = { x: e.clientX, y: e.clientY, t: performance.now() }
        const s = transformRef.current.scale
        moveFrame(id, dx / s, dy / s)
      },
      onPointerUp: () => {
        dragging.current = null
        setDraggingFrame(null)
        document.body.classList.remove('no-select')
      },
    }),
    [moveFrame],
  )

  /* ===== Производные ===== */
  const activeFrame = useMemo(() => {
    const root = rootRef.current
    if (!root) return null
    let best: string | null = null
    let bestArea = 0
    for (const [id, rect] of Object.entries(positions)) {
      const area = visibleArea(rect, transform, root.clientWidth, root.clientHeight)
      if (area > bestArea) {
        bestArea = area
        best = id
      }
    }
    return best
  }, [positions, transform])

  const isFrameVisible = useCallback(
    (id: string) => {
      const root = rootRef.current
      if (!root) return true
      const rect = positions[id]
      const t = transform
      const margin = Math.max(root.clientWidth, root.clientHeight)
      const left = rect.x * t.scale + t.x
      const top = rect.y * t.scale + t.y
      return (
        left < root.clientWidth + margin &&
        top < root.clientHeight + margin &&
        left + rect.w * t.scale > -margin &&
        top + rect.h * t.scale > -margin
      )
    },
    [positions, transform],
  )

  return {
    rootRef,
    transform,
    positions,
    moving,
    spaceHeld,
    landedFrame,
    draggingFrame,
    activeFrame,
    isFrameVisible,
    flyToFrame,
    resetZoom,
    setViewportCenter,
    frameDragHandlers,
    rootHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
  }
}

export type CanvasEngine = ReturnType<typeof useCanvasEngine>
