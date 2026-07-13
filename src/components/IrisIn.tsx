import { useEffect, useState } from 'react'

/** Круговое раскрытие из черноты при загрузке — как начало мультфильма 30-х */
export function IrisIn() {
  const [gone, setGone] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (gone) return
    const t = window.setTimeout(() => setGone(true), 1000)
    return () => window.clearTimeout(t)
  }, [gone])

  if (gone) return null
  return <div className="iris-in" aria-hidden="true" />
}
