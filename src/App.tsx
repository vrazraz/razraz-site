import { useState } from 'react'
import { blogPosts, projects } from './content'
import { useHashRoute, useIsMobile, useTheme } from './hooks'
import { CanvasView } from './components/CanvasView'
import { MobileFeed } from './components/MobileFeed'
import { PostPanel } from './components/PostPanel'
import { ProjectPanel } from './components/ProjectPanel'
import { PasswordGate } from './components/PasswordGate'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { route, navigate } = useHashRoute()
  const isMobile = useIsMobile()
  const [unlocked, setUnlocked] = useState<ReadonlySet<string>>(new Set())

  const post = route.postId ? blogPosts.find((p) => p.id === route.postId) ?? null : null
  const project = route.projectSlug
    ? projects.find((p) => p.slug === route.projectSlug) ?? null
    : null
  const locked = !!project && project.nda && !unlocked.has(project.slug)

  const view = isMobile ? (
    <MobileFeed route={route} navigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
  ) : (
    <CanvasView route={route} navigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
  )

  return (
    <>
      {view}
      {post && <PostPanel post={post} theme={theme} onClose={() => navigate('blog')} />}
      {project && !locked && <ProjectPanel project={project} onClose={() => navigate('projects')} />}
      {project && locked && (
        <PasswordGate
          title={project.meta.title ?? project.slug}
          onSuccess={() => setUnlocked((prev) => new Set(prev).add(project.slug))}
          onClose={() => navigate('projects')}
        />
      )}
    </>
  )
}
