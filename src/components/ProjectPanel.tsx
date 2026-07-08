import { useEffect } from 'react'
import type { ProjectDoc } from '../content'

export function ProjectPanel({ project, onClose }: { project: ProjectDoc; onClose: () => void }) {
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
      <aside className="post-panel post-panel--wide toon-panel" role="dialog" aria-label={project.meta.title ?? project.slug}>
        <header className="post-panel__head">
          <div>
            <h3 className="post-panel__title">{project.meta.title ?? project.slug}</h3>
            {project.tags.length > 0 && (
              <span className="post-panel__date">{project.tags.join(' · ')}</span>
            )}
          </div>
          <button className="post-panel__close" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </header>
        <div className="post-panel__body frame-scroll">
          <div className="md" dangerouslySetInnerHTML={{ __html: project.html }} />
          {project.link && (
            <a className="post-panel__source interactive" href={project.link} target="_blank" rel="noreferrer">
              Открыть проект ↗
            </a>
          )}
        </div>
      </aside>
    </>
  )
}
