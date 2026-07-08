import { frameDocs, site } from '../content'

export function AboutFrame() {
  const doc = frameDocs.about
  const title = (doc.meta.title ?? 'Обо мне').replace(/\.$/, '')
  return (
    <>
      <h1 className="frame-title">
        {title}
        <span className="accent">.</span>
      </h1>
      {doc.meta.subtitle && <p className="frame-subtitle">{doc.meta.subtitle}</p>}
      <div className="md" dangerouslySetInnerHTML={{ __html: doc.html }} />
      <div className="chips">
        {site.social.map((s) => (
          <a key={s.label} className="chip interactive" href={s.url} target="_blank" rel="noreferrer">
            {s.label}
          </a>
        ))}
      </div>
    </>
  )
}
