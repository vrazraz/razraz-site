import { useEffect, useRef } from 'react'
import type { BlogPost } from '../content'
import type { Theme } from '../hooks'

const fmt = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', year: 'numeric' })

export function PostPanel({ post, theme, onClose }: { post: BlogPost; theme: Theme; onClose: () => void }) {
  const holder = useRef<HTMLDivElement | null>(null)

  /* Официальный embed-виджет Telegram */
  useEffect(() => {
    const el = holder.current
    if (!el) return
    el.innerHTML = ''
    const s = document.createElement('script')
    s.src = 'https://telegram.org/js/telegram-widget.js?22'
    s.async = true
    s.setAttribute('data-telegram-post', post.url.replace(/^https?:\/\/t\.me\//, ''))
    s.setAttribute('data-width', '100%')
    if (theme === 'dark') s.setAttribute('data-dark', '1')
    el.appendChild(s)
    return () => {
      el.innerHTML = ''
    }
  }, [post.id, post.url, theme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="post-backdrop" onClick={onClose} />
      <aside className="post-panel toon-panel" role="dialog" aria-label={post.title}>
        <header className="post-panel__head">
          <div>
            <h3 className="post-panel__title">{post.title}</h3>
            <span className="post-panel__date">{fmt.format(new Date(post.date))}</span>
          </div>
          <button className="post-panel__close" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </header>
        <div className="post-panel__body frame-scroll">
          <div ref={holder} data-nodrag />
          <a className="post-panel__source interactive" href={post.url} target="_blank" rel="noreferrer">
            Открыть в Telegram ↗
          </a>
        </div>
      </aside>
    </>
  )
}
