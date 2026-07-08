import { frameDocs, resumeTimeline } from '../content'

export function ResumeFrame() {
  const doc = frameDocs.resume
  return (
    <>
      <h2 className="frame-title frame-title--md">
        {doc.meta.title ?? 'Резюме'}
        <span className="accent">.</span>
      </h2>
      {doc.meta.subtitle && <p className="frame-subtitle">{doc.meta.subtitle}</p>}
      <ol className="timeline">
        {resumeTimeline.map((entry, i) => (
          <li key={i} className={`timeline__item${i === 0 ? ' timeline__item--current' : ''}`}>
            <span className="timeline__dot" aria-hidden="true" />
            <span className="timeline__period">{entry.period}</span>
            <h3 className="timeline__role">
              {entry.role} · {entry.company}
            </h3>
            <p className="timeline__details">{entry.details}</p>
          </li>
        ))}
      </ol>
      <div className="md" dangerouslySetInnerHTML={{ __html: doc.html }} />
      <a className="chip chip--accent interactive resume-download" href={`${import.meta.env.BASE_URL}cv.pdf`} download>
        Скачать PDF
      </a>
    </>
  )
}
