import { useEffect, useRef, useState } from 'react'

interface Burst {
  id: number
  x: number
  y: number
}

/** Комикс-звезда «хлопок» в точке клика */
export function ClickBurst() {
  const [bursts, setBursts] = useState<Burst[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      const target = e.target as HTMLElement | null
      if (target && typeof target.closest === 'function' && target.closest('input, textarea, [contenteditable]'))
        return
      const id = ++nextId.current
      setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }])
      window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 500)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  return (
    <>
      {bursts.map((b) => (
        <svg
          key={b.id}
          className="click-burst"
          style={{ left: b.x, top: b.y }}
          width="48"
          height="48"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M24 4 L27 17 L38 8 L31 20 L44 22 L31 27 L40 38 L27 31 L24 44 L21 31 L8 38 L17 27 L4 22 L17 20 L10 8 L21 17 Z"
            fill="var(--decor-paper)"
            stroke="var(--outline)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </>
  )
}
