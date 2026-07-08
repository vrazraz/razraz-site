import { useEffect, useState } from 'react'

const HINT_TEXT = 'Для передвижения используйте пробел или ПКМ'
const TYPE_MS = 38
const HOLD_MS = 3000

/** Подсказка у курсора при открытии канваса: печатается, висит 3 с, тает. */
export function CursorHint() {
  const [typed, setTyped] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? HINT_TEXT.length : 0,
  )
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  /* Число символов считается от прошедшего времени: троттлинг таймеров
     в фоновых вкладках не ломает анимацию, печать просто догоняет */
  useEffect(() => {
    if (typed >= HINT_TEXT.length) return
    const start = performance.now()
    const from = typed
    const id = window.setInterval(() => {
      const n = Math.min(HINT_TEXT.length, from + Math.floor((performance.now() - start) / TYPE_MS))
      setTyped(n)
      if (n >= HINT_TEXT.length) window.clearInterval(id)
    }, TYPE_MS)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typed < HINT_TEXT.length) return
    const hold = window.setTimeout(() => setFading(true), HOLD_MS)
    return () => window.clearTimeout(hold)
  }, [typed])

  /* Страховка на случай, когда transitionend не приходит (фоновая вкладка) */
  useEffect(() => {
    if (!fading) return
    const t = window.setTimeout(() => setGone(true), 2500)
    return () => window.clearTimeout(t)
  }, [fading])

  if (gone || typed === 0) return null
  return (
    <div
      className={'cursor-hint' + (fading ? ' cursor-hint--fading' : '')}
      style={pos ? { left: pos.x + 20, top: pos.y + 24 } : { left: '50%', top: '58%' }}
      onTransitionEnd={() => setGone(true)}
      aria-hidden="true"
    >
      {HINT_TEXT.slice(0, typed)}
    </div>
  )
}
