import { useCallback, useEffect, useState } from 'react'

/* ===== Тема ===== */
export type Theme = 'dark' | 'light'
const THEME_KEY = 'theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme) || 'dark',
  )
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])
  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  )
  return { theme, toggleTheme }
}

/* ===== Мобильный режим: узкий экран либо тач без мыши ===== */
const MOBILE_QUERY = '(max-width: 767px), ((pointer: coarse) and (hover: none))'

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return mobile
}

/* ===== Hash-роутинг: #/about, #/blog, #/blog/<id> ===== */
export interface Route {
  section: string
  postId: string | null
  projectSlug: string | null
}

export const SECTION_IDS = ['about', 'projects', 'blog', 'resume'] as const

function parseHash(): Route {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const section = (SECTION_IDS as readonly string[]).includes(parts[0]) ? parts[0] : 'about'
  return {
    section,
    postId: section === 'blog' && parts[1] ? parts[1] : null,
    projectSlug: section === 'projects' && parts[1] ? decodeURIComponent(parts[1]) : null,
  }
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(parseHash)
  useEffect(() => {
    const onChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  const navigate = useCallback((section: string, detail?: string) => {
    window.location.hash = detail ? `/${section}/${encodeURIComponent(detail)}` : `/${section}`
  }, [])
  return { route, navigate }
}
