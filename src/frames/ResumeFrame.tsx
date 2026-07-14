import { getFrameDoc, resumeTimelines } from '../content'
import { useI18n } from '../i18n'

export function ResumeFrame() {
  const { lang, s } = useI18n()
  const doc = getFrameDoc(lang, 'resume')
  return (
    <>
      <h2 className="frame-title frame-title--md">
        {doc.meta.title ?? s.sections.resume}
        <span className="accent">.</span>
      </h2>
      {doc.meta.subtitle && <p className="frame-subtitle">{doc.meta.subtitle}</p>}
      <ol className="timeline">
        {resumeTimelines[lang].map((entry, i) => (
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
      {/* Кнопка «Скачать PDF» скрыта, пока в public/ не появится cv.pdf */}
    </>
  )
}
