import { useEffect, useState } from 'react'

/** Комикс-бабл «Ай да хакер!» после верного пароля NDA:
 *  живёт 5 секунд слева от боковой панели, затем убирается. */
export function HackerBubble({ onDone }: { onDone: () => void }) {
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const hide = window.setTimeout(() => setHiding(true), 4400)
    const done = window.setTimeout(onDone, 5000)
    return () => {
      window.clearTimeout(hide)
      window.clearTimeout(done)
    }
  }, [onDone])

  return (
    <div className={'hacker-bubble' + (hiding ? ' hacker-bubble--hide' : '')} aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}hacker-bubble.png`} alt="" draggable={false} />
    </div>
  )
}
