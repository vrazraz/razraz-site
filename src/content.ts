import { marked } from 'marked'
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

/** Файлы вида name.md — русские, name.en.md — английские */
function splitByLang(files: Record<string, string>): Record<Lang, Record<string, string>> {
  const out: Record<Lang, Record<string, string>> = { ru: {}, en: {} }
  for (const [path, raw] of Object.entries(files)) {
    const file = path.split('/').pop()!.replace(/\.md$/, '')
    if (file.endsWith('.en')) out.en[file.slice(0, -3)] = raw
    else out.ru[file] = raw
  }
  return out
}

const frameRaw = splitByLang(frameFiles)

export const frameDocs: Record<Lang, Record<string, MarkdownDoc>> = {
  ru: Object.fromEntries(Object.entries(frameRaw.ru).map(([slug, raw]) => [slug, toDoc(raw)])),
  en: Object.fromEntries(Object.entries(frameRaw.en).map(([slug, raw]) => [slug, toDoc(raw)])),
}

/** Документ фрейма с фолбэком на русский */
export function getFrameDoc(lang: Lang, slug: string): MarkdownDoc {
  return frameDocs[lang][slug] ?? frameDocs.ru[slug]
}

function toProject(slug: string, raw: string): ProjectDoc {
  const doc = toDoc(raw)
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

const projectRaw = splitByLang(projectFiles)

const projectsRu: ProjectDoc[] = Object.entries(projectRaw.ru)
  .map(([slug, raw]) => toProject(slug, raw))
  .sort((a, b) => a.slug.localeCompare(b.slug))

/** Английский список повторяет порядок русского; недостающие кейсы — фолбэк */
export const projectsByLang: Record<Lang, ProjectDoc[]> = {
  ru: projectsRu,
  en: projectsRu.map((p) => (projectRaw.en[p.slug] ? toProject(p.slug, projectRaw.en[p.slug]) : p)),
}

export const projects = projectsRu
