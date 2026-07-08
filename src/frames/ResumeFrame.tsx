import { frameDocs } from '../content'

export function ResumeFrame() {
  const doc = frameDocs.resume
  return (
    <>
      <h2 className="frame-title frame-title--md">
        {doc.meta.title ?? 'Резюме'}
        <span className="accent">.</span>
      </h2>
      {doc.meta.subtitle && <p className="frame-subtitle">{doc.meta.subtitle}</p>}
      <div className="md" dangerouslySetInnerHTML={{ __html: doc.html }} />
      <a className="chip chip--accent interactive resume-download" href={`${import.meta.env.BASE_URL}cv.pdf`} download>
        Скачать PDF
      </a>
    </>
  )
}
