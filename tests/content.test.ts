import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { escapeHtml, jsonForScript, parseList, readCases, toDoc } from '../build/content-lib'
import { STR } from '../src/i18n'

const CONTENT = join(__dirname, '..', 'content')

describe('escapeHtml', () => {
  it('экранирует все опасные символы', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;',
    )
  })
})

describe('jsonForScript', () => {
  it('не даёт данным закрыть тег <script>', () => {
    const out = jsonForScript({ title: 'x</script><script>alert(1)</script>' })
    expect(out).not.toContain('<')
    expect(JSON.parse(out).title).toBe('x</script><script>alert(1)</script>')
  })
})

describe('toDoc / parseList', () => {
  it('разбирает фронтматтер и markdown', () => {
    const doc = toDoc('---\ntitle: Кейс\ntags: [a, b]\n---\n\n**жирный**')
    expect(doc.meta.title).toBe('Кейс')
    expect(parseList(doc.meta.tags)).toEqual(['a', 'b'])
    expect(doc.html).toContain('<strong>жирный</strong>')
  })
})

describe('переводы', () => {
  it('словари ru и en содержат одинаковые ключи', () => {
    expect(Object.keys(STR.en).sort()).toEqual(Object.keys(STR.ru).sort())
    expect(Object.keys(STR.en.sections).sort()).toEqual(Object.keys(STR.ru.sections).sort())
  })

  it.each(['frames', 'projects'])('у каждого файла в content/%s есть английская пара', (dir) => {
    const files = readdirSync(join(CONTENT, dir)).filter((f) => f.endsWith('.md'))
    const ru = files.filter((f) => !f.endsWith('.en.md'))
    const missing = ru.filter((f) => !files.includes(f.replace(/\.md$/, '.en.md')))
    expect(missing).toEqual([])
  })

  it('английский кейс совпадает с русским по NDA, году и обложке', () => {
    const cases = readCases(join(CONTENT, 'projects'))
    for (const en of cases.filter((c) => c.lang === 'en')) {
      const ru = cases.find((c) => c.lang === 'ru' && c.slug === en.slug)!
      for (const key of ['nda', 'year', 'cover']) expect(en.doc.meta[key], `${en.slug}: ${key}`).toBe(ru.doc.meta[key])
    }
  })
})
