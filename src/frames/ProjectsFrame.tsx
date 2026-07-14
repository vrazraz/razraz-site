import { projectsByLang, site } from '../content'
import { useI18n } from '../i18n'

export function ProjectsFrame({ onOpenProject }: { onOpenProject: (slug: string) => void }) {
  const { lang, s } = useI18n()
  const behance = site.social.find((so) => so.label === 'Behance')?.url
  return (
    <>
      <h2 className="frame-title frame-title--md">
        {s.sections.projects}
      </h2>
      <div className="project-grid">
        {projectsByLang[lang].map((p) => (
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
              {p.year && <div className="project-card__year">{p.year}</div>}
            </div>
          </article>
        ))}
      </div>
      {behance && (
        <p className="projects-more">
          {s.olderWorks}{' '}
          <a className="interactive" href={behance} target="_blank" rel="noreferrer">
            Behance ↗
          </a>
        </p>
      )}
    </>
  )
}
