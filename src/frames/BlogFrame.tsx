import { useState } from 'react'
import { blogPosts } from '../content'

const fmt = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', year: 'numeric' })

const VISIBLE_POSTS = 7

export function BlogFrame({ onOpenPost }: { onOpenPost: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? blogPosts : blogPosts.slice(0, VISIBLE_POSTS)
  return (
    <>
      <h2 className="frame-title frame-title--md">
        Блог<span className="accent">.</span>
      </h2>
      <p className="frame-subtitle">Посты приезжают из Telegram-канала</p>
      {blogPosts.length === 0 && <p className="md">Пока пусто — скоро здесь появятся посты.</p>}
      <div className="post-list">
        {shown.map((p) => (
          <button key={p.id} className="post-item" onClick={() => onOpenPost(p.id)}>
            <span className="post-item__title">{p.title}</span>
            <span className="post-item__meta">
              {fmt.format(new Date(p.date))}
              {p.tags?.length ? ` · ${p.tags.join(', ')}` : ''}
            </span>
          </button>
        ))}
      </div>
      {blogPosts.length > VISIBLE_POSTS && (
        <button className="blog-more interactive" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Свернуть' : `Смотреть все (${blogPosts.length})`}
        </button>
      )}
    </>
  )
}
