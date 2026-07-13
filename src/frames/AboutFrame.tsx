import { useState } from 'react'
import { frameDocs, site } from '../content'

export function AboutFrame() {
  const doc = frameDocs.about
  const title = (doc.meta.title ?? 'Обо мне').replace(/\.$/, '')
  const [avatarOk, setAvatarOk] = useState(true)
  return (
    <>
      <header className="about-head">
        {avatarOk && (
          <span className="about-avatar-wrap">
            <span className="about-avatar">
              <img
                src={`${import.meta.env.BASE_URL}avatar.webp`}
                alt={site.name}
                width={104}
                height={104}
                onError={() => setAvatarOk(false)}
              />
            </span>
          </span>
        )}
        <div className="about-head__text">
          <h1 className="frame-title">
            {title}
            <span className="accent">.</span>
          </h1>
          {doc.meta.subtitle && <p className="frame-subtitle">{doc.meta.subtitle}</p>}
        </div>
      </header>
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
