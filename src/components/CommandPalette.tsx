import { useEffect, useMemo, useRef, useState } from 'react'
import { SECTIONS } from '../sections'
import { blogPosts, projectsByLang } from '../content'
import { useI18n } from '../i18n'

interface Item {
  id: string
  label: string
  hint: string
  run: () => void
}

/** Командная палитра (Cmd/Ctrl+K): быстрый переход к разделам, кейсам и постам */
export function CommandPalette({ navigate }: { navigate: (section: string, detail?: string) => void }) {
  const { lang, s } = useI18n()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo<Item[]>(
    () => [
      ...SECTIONS.map((sec) => ({
        id: 'section-' + sec.id,
        label: s.sections[sec.id],
        hint: s.hintSection,
        run: () => navigate(sec.id),
      })),
      ...projectsByLang[lang].map((p) => ({
        id: 'project-' + p.slug,
        label: p.meta.title ?? p.slug,
        hint: p.nda ? s.hintCaseNda : s.hintCase,
        run: () => navigate('projects', p.slug),
      })),
      ...blogPosts.map((b) => ({
        id: 'post-' + b.id,
        label: b.title,
        hint: s.hintPost,
        run: () => navigate('blog', b.id),
      })),
    ],
    [navigate, lang, s],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items
    return pool.slice(0, 9)
  }, [items, query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
        setQuery('')
        setIndex(0)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => setIndex(0), [query])

  if (!open) return null

  const run = (item?: Item) => {
    if (!item) return
    setOpen(false)
    item.run()
  }

  return (
    <>
      <div className="post-backdrop" onClick={() => setOpen(false)} />
      <div className="palette toon-panel" role="dialog" aria-label={s.paletteAria}>
        <input
          ref={inputRef}
          className="palette__input"
          placeholder={s.palettePlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setIndex((i) => Math.min(filtered.length - 1, i + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setIndex((i) => Math.max(0, i - 1))
            } else if (e.key === 'Enter') {
              run(filtered[index])
            }
          }}
        />
        <ul className="palette__list">
          {filtered.map((it, i) => (
            <li key={it.id}>
              <button
                className={'palette__item' + (i === index ? ' palette__item--active' : '')}
                onMouseEnter={() => setIndex(i)}
                onClick={() => run(it)}
              >
                <span className="palette__label">{it.label}</span>
                <span className="palette__hint">{it.hint}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="palette__empty">{s.paletteEmpty}</li>}
        </ul>
        <div className="palette__foot">{s.paletteFoot}</div>
      </div>
    </>
  )
}
