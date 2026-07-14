import { getFrameDoc } from '../content'
import { useI18n } from '../i18n'

export function SkillsFrame() {
  const { lang, s } = useI18n()
  const doc = getFrameDoc(lang, 'skills')
  return (
    <>
      <h2 className="frame-title frame-title--md">
        {doc.meta.title ?? s.sections.skills}
      </h2>
      {doc.meta.subtitle && <p className="frame-subtitle">{doc.meta.subtitle}</p>}
      <div className="md" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </>
  )
}
