import { projects } from '../content'

export function ProjectsFrame({ onOpenProject }: { onOpenProject: (slug: string) => void }) {
  return (
    <>
      <h2 className="frame-title frame-title--md">
        Проекты<span className="accent">.</span>
      </h2>
      <div className="project-grid">
        {projects.map((p) => (
          <article
            key={p.slug}
            className="project-card project-card--clickable interactive"
            role="button"
            tabIndex={0}
            onClick={() => onOpenProject(p.slug)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenProject(p.slug)
              }
            }}
          >
            {p.cover && (
              <div className={'project-card__cover' + (p.nda ? ' project-card__cover--nda' : '')}>
                <img src={p.cover} alt="" loading="lazy" />
                {p.nda && <span className="project-card__nda">NDA</span>}
              </div>
            )}
            <div className="project-card__body">
              <h3>{p.meta.title ?? p.slug}</h3>
              {p.tags.length > 0 && (
                <div className="chips chips--sm">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} className="chip chip--sm">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
