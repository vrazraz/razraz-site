/** Разбор контента на этапе сборки (Node): markdown → HTML, фронтматтер,
 *  экранирование для генерируемых SEO-страниц. В клиентский бандл не попадает. */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { marked } from 'marked'

export type Lang = 'ru' | 'en'

export interface MarkdownDoc {
  meta: Record<string, string>
  html: string
}

/** Минимальный разбор фронтматтера: строки `key: value` между `---` */
export function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
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

export function toDoc(raw: string): MarkdownDoc {
  const { meta, body } = parseFrontmatter(raw)
  return { meta, html: marked.parse(body, { async: false }) }
}

export function parseList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** JSON для вставки внутрь <script>: «</script>» в данных не закроет тег */
export function jsonForScript(value: unknown): string {
  const esc = (code: string) => String.fromCharCode(92) + 'u' + code
  return JSON.stringify(value)
    .replace(/</g, esc('003c'))
    .split(String.fromCharCode(0x2028)).join(esc('2028'))
    .split(String.fromCharCode(0x2029)).join(esc('2029'))
}

export interface CaseFile {
  slug: string
  lang: Lang
  doc: MarkdownDoc
}

/** Кейсы из content/projects: name.md — русский, name.en.md — английский */
export function readCases(dir: string): CaseFile[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const base = f.replace(/\.md$/, '')
      const en = base.endsWith('.en')
      return {
        slug: en ? base.slice(0, -3) : base,
        lang: (en ? 'en' : 'ru') as Lang,
        doc: toDoc(readFileSync(join(dir, f), 'utf8')),
      }
    })
}
