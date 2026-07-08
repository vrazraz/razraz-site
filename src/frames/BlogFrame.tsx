import { blogPosts } from '../content'

const fmt = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', year: 'numeric' })

export function BlogFrame({ onOpenPost }: { onOpenPost: (id: string) => void }) {
  return (
    <>
      <h2 className="frame-title frame-title--md">
        Блог<span className="accent">.</span>
      </h2>
      <p className="frame-subtitle">Посты приезжают из Telegram-канала</p>
      {blogPosts.length === 0 && <p className="md">Пока пусто — скоро здесь появятся посты.</p>}
      <div className="post-list">
        {blogPosts.map((p) => (
          <button key={p.id} className="post-item" onClick={() => onOpenPost(p.id)}>
            <span className="post-item__title">{p.title}</span>
            <span className="post-item__meta">
              {fmt.format(new Date(p.date))}
              {p.tags?.length ? ` · ${p.tags.join(', ')}` : ''}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
