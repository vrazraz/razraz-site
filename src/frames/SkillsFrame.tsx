import { frameDocs } from '../content'

export function SkillsFrame() {
  const doc = frameDocs.skills
  return (
    <>
      <h2 className="frame-title frame-title--md">
        {doc.meta.title ?? 'Навыки'}
        <span className="accent">.</span>
      </h2>
      {doc.meta.subtitle && <p className="frame-subtitle">{doc.meta.subtitle}</p>}
      <div className="md" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </>
  )
}
