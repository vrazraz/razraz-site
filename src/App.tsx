import { useEffect, useState } from 'react'
import { blogPosts, projectsByLang, site } from './content'
import { useI18n } from './i18n'
import { useHashRoute, useIsMobile, useTheme } from './hooks'
import { CanvasView } from './components/CanvasView'
import { StandardView } from './components/StandardView'
import { MobileFeed } from './components/MobileFeed'
import { PostPanel } from './components/PostPanel'
import { ProjectPanel } from './components/ProjectPanel'
import { PasswordGate } from './components/PasswordGate'
import { HackerBubble } from './components/HackerBubble'
import { CommandPalette } from './components/CommandPalette'
import { IrisIn } from './components/IrisIn'

/* Яндекс.Метрика подключается, только если в site.json задан metrikaId */
declare global {
  interface Window {
    ym?: { (...args: unknown[]): void; a?: unknown[]; l?: number }
  }
}

function useMetrika(id: string | undefined) {
  useEffect(() => {
    if (!id) return
    const w = window
    w.ym =
      w.ym ||
      function (...args: unknown[]) {
        ;(w.ym!.a = w.ym!.a || []).push(args)
      }
    w.ym.l = new Date().getTime()
    const s = document.createElement('script')
    s.async = true
    s.src = 'https://mc.yandex.ru/metrika/tag.js'
    document.head.appendChild(s)
    w.ym(Number(id), 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true })
  }, [id])
}

export default function App() {
  const { lang } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const { route, navigate } = useHashRoute()
  const isMobile = useIsMobile()
  const [unlocked, setUnlocked] = useState<ReadonlySet<string>>(new Set())
  const [celebrating, setCelebrating] = useState(false)
  const [shakeFrame, setShakeFrame] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'canvas' | 'standard'>(() =>
    localStorage.getItem('view-mode') === 'canvas' ? 'canvas' : 'standard',
  )
  const changeView = (next: 'canvas' | 'standard') => {
    localStorage.setItem('view-mode', next)
    setViewMode(next)
  }

  useMetrika(site.metrikaId || undefined)

  const post = route.postId ? blogPosts.find((p) => p.id === route.postId) ?? null : null
  const projects = projectsByLang[lang]
  const projectIndex = route.projectSlug
    ? projects.findIndex((p) => p.slug === route.projectSlug)
    : -1
  const project = projectIndex >= 0 ? projects[projectIndex] : null
  const locked = !!project && project.nda && !unlocked.has(project.slug)

  const view = isMobile ? (
    <MobileFeed route={route} navigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
  ) : viewMode === 'canvas' ? (
    <CanvasView
      route={route}
      navigate={navigate}
      theme={theme}
      onToggleTheme={toggleTheme}
      shakeFrame={shakeFrame}
      viewMode={viewMode}
      onChangeView={changeView}
    />
  ) : (
    <StandardView
      route={route}
      navigate={navigate}
      theme={theme}
      onToggleTheme={toggleTheme}
      viewMode={viewMode}
      onChangeView={changeView}
    />
  )

  return (
    <>
      {view}
      {post && <PostPanel post={post} theme={theme} onClose={() => navigate('blog')} />}
      {project && !locked && (
        <ProjectPanel
          project={project}
          prevSlug={projectIndex > 0 ? projects[projectIndex - 1].slug : undefined}
          nextSlug={projectIndex < projects.length - 1 ? projects[projectIndex + 1].slug : undefined}
          onOpen={(slug) => navigate('projects', slug)}
          onClose={() => navigate('projects')}
        />
      )}
      {project && locked && (
        <PasswordGate
          title={project.meta.title ?? project.slug}
          onSuccess={() => {
            setUnlocked((prev) => new Set(prev).add(project.slug))
            setCelebrating(true)
          }}
          onTripleFail={() => {
            setShakeFrame('projects')
            window.setTimeout(() => setShakeFrame(null), 700)
          }}
          onClose={() => navigate('projects')}
        />
      )}
      {celebrating && <HackerBubble onDone={() => setCelebrating(false)} />}
      <CommandPalette navigate={navigate} />
      <IrisIn />
    </>
  )
}
