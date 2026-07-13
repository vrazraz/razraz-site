import { useState } from 'react'
import { frameDocs, site } from '../content'

export function AboutFrame() {
  const doc = frameDocs.about
  const title = (doc.meta.title ?? 'Обо мне').replace(/\.$/, '')
  const [avatarOk, setAvatarOk] = useState(true)
  const [copied, setCopied] = useState(false)

  const markCopied = () => {
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const copyEmail = () => {
    navigator.clipboard
      .writeText(site.email)
      .then(markCopied)
      .catch(() => {
        /* фолбэк для окружений без Clipboard API */
        const ta = document.createElement('textarea')
        ta.value = site.email
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        try {
          if (document.execCommand('copy')) markCopied()
        } finally {
          ta.remove()
        }
      })
  }
  return (
    <>
      <header className="about-head">
        {avatarOk && (
          <span className="about-avatar-wrap ray-glow">
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
        {site.social.map((s) =>
          s.label === 'Gmail' ? (
            <button key={s.label} className="chip interactive" onClick={copyEmail}>
              {copied ? 'Скопировано ✓' : 'Email — копировать'}
            </button>
          ) : (
            <a key={s.label} className="chip interactive" href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ),
        )}
      </div>
    </>
  )
}
