import { marked } from 'marked'
import siteJson from '../content/site.json'
import layoutJson from '../content/layout.json'
import blogJson from '../content/blog.json'
import resumeJson from '../content/resume.json'

export interface FrameRect {
  x: number
  y: number
  w: number
  h: number
}

export interface BlogPost {
  id: string
  url: string
  title: string
  date: string
  tags?: string[]
  hidden?: boolean
}

export interface MarkdownDoc {
  meta: Record<string, string>
  html: string
}

export interface ProjectDoc extends MarkdownDoc {
  slug: string
  tags: string[]
  link?: string
  cover?: string
  nda: boolean
}

export interface TimelineEntry {
  period: string
  role: string
  company: string
  details: string
}

export const site = siteJson
export const layout: Record<string, FrameRect> = layoutJson
export const resumeTimeline: TimelineEntry[] = resumeJson.timeline

export const blogPosts: BlogPost[] = (blogJson.posts as BlogPost[]).filter((p) => !p.hidden)

/** Минимальный разбор фронтматтера: строки `key: value` между `---`.
 *  Значения-списки вида [a, b] превращаются в массивы. */
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { meta: {}, body: raw }
  const meta: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { meta, body: raw.slice(match[0].length) }
}

function parseList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function toDoc(raw: string): MarkdownDoc {
  const { meta, body } = parseFrontmatter(raw)
  return { meta, html: marked.parse(body, { async: false }) }
}

const frameFiles = import.meta.glob('../content/frames/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const projectFiles = import.meta.glob('../content/projects/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const frameDocs: Record<string, MarkdownDoc> = Object.fromEntries(
  Object.entries(frameFiles).map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    return [slug, toDoc(raw)]
  }),
)

export const projects: ProjectDoc[] = Object.entries(projectFiles)
  .map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    const doc = toDoc(raw)
    return {
      ...doc,
      slug,
      tags: parseList(doc.meta.tags),
      link: doc.meta.link,
      cover: doc.meta.cover,
      nda: doc.meta.nda === 'true',
    }
  })
  .sort((a, b) => a.slug.localeCompare(b.slug))
