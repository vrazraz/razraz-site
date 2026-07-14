import { useMemo, useState } from 'react'
import { blogPosts } from '../content'
import { useI18n } from '../i18n'

const VISIBLE_POSTS = 7

export function BlogFrame({ onOpenPost }: { onOpenPost: (id: string) => void }) {
  const { s } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const fmt = useMemo(
    () => new Intl.DateTimeFormat(s.dateLocale, { day: 'numeric', month: 'long', year: 'numeric' }),
    [s.dateLocale],
  )
  const shown = expanded ? blogPosts : blogPosts.slice(0, VISIBLE_POSTS)
  return (
    <>
      <h2 className="frame-title frame-title--md">
        {s.sections.blog}
      </h2>
      {blogPosts.length === 0 && <p className="md">{s.blogEmpty}</p>}
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
          {expanded ? s.collapse : s.seeAll(blogPosts.length)}
        </button>
      )}
    </>
  )
}
