import siteJson from '../content/site.json'
import layoutJson from '../content/layout.json'
import blogJson from '../content/blog.json'
import resumeJson from '../content/resume.json'
import resumeEnJson from '../content/resume.en.json'
import type { Lang } from './i18n'

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
  year?: string
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

export const resumeTimelines: Record<Lang, TimelineEntry[]> = {
  ru: resumeJson.timeline,
  en: resumeEnJson.timeline,
}

export const blogPosts: BlogPost[] = (blogJson.posts as BlogPost[]).filter((p) => !p.hidden)

function parseList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/* Markdown разбирается при сборке плагином markdown-docs (vite.config.ts) */
const frameFiles = import.meta.glob('../content/frames/*.md', {
  query: '?doc',
  import: 'default',
  eager: true,
}) as Record<string, MarkdownDoc>

const projectFiles = import.meta.glob('../content/projects/*.md', {
  query: '?doc',
  import: 'default',
  eager: true,
}) as Record<string, MarkdownDoc>

/** Файлы вида name.md — русские, name.en.md — английские */
function splitByLang(files: Record<string, MarkdownDoc>): Record<Lang, Record<string, MarkdownDoc>> {
  const out: Record<Lang, Record<string, MarkdownDoc>> = { ru: {}, en: {} }
  for (const [path, doc] of Object.entries(files)) {
    const file = path.split('/').pop()!.replace(/\.md$/, '')
    if (file.endsWith('.en')) out.en[file.slice(0, -3)] = doc
    else out.ru[file] = doc
  }
  return out
}

const frameDocs = splitByLang(frameFiles)

/** Документ фрейма с фолбэком на русский */
export function getFrameDoc(lang: Lang, slug: string): MarkdownDoc {
  return frameDocs[lang][slug] ?? frameDocs.ru[slug]
}

function toProject(slug: string, doc: MarkdownDoc): ProjectDoc {
  return {
    ...doc,
    slug,
    tags: parseList(doc.meta.tags),
    link: doc.meta.link,
    cover: doc.meta.cover,
    year: doc.meta.year,
    nda: doc.meta.nda === 'true',
  }
}

const projectDocs = splitByLang(projectFiles)

const projectsRu: ProjectDoc[] = Object.entries(projectDocs.ru)
  .map(([slug, doc]) => toProject(slug, doc))
  .sort((a, b) => a.slug.localeCompare(b.slug))

/** Английский список повторяет порядок русского; недостающие кейсы — фолбэк */
export const projectsByLang: Record<Lang, ProjectDoc[]> = {
  ru: projectsRu,
  en: projectsRu.map((p) => (projectDocs.en[p.slug] ? toProject(p.slug, projectDocs.en[p.slug]) : p)),
}
