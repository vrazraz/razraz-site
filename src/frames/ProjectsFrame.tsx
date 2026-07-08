import { projects } from '../content'

export function ProjectsFrame() {
  return (
    <>
      <h2 className="frame-title frame-title--md">
        Проекты<span className="accent">.</span>
      </h2>
      <div className="project-list">
        {projects.map((p) => (
          <article key={p.slug} className="project-card">
            <header className="project-card__head">
              <h3>{p.meta.title ?? p.slug}</h3>
              {p.link && (
                <a className="interactive project-card__link" href={p.link} target="_blank" rel="noreferrer">
                  Открыть ↗
                </a>
              )}
            </header>
            <div className="md" dangerouslySetInnerHTML={{ __html: p.html }} />
            {p.tags.length > 0 && (
              <div className="chips chips--sm">
                {p.tags.map((t) => (
                  <span key={t} className="chip chip--sm">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  )
}
