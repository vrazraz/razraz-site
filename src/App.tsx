import { blogPosts } from './content'
import { useHashRoute, useIsMobile, useTheme } from './hooks'
import { CanvasView } from './components/CanvasView'
import { MobileFeed } from './components/MobileFeed'
import { PostPanel } from './components/PostPanel'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { route, navigate } = useHashRoute()
  const isMobile = useIsMobile()

  const post = route.postId ? blogPosts.find((p) => p.id === route.postId) ?? null : null

  const view = isMobile ? (
    <MobileFeed route={route} navigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
  ) : (
    <CanvasView route={route} navigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
  )

  return (
    <>
      {view}
      {post && <PostPanel post={post} theme={theme} onClose={() => navigate('blog')} />}
    </>
  )
}
