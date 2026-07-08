/**
 * Синхронизация блога с публичным Telegram-каналом.
 * Читает https://t.me/s/<канал>, добавляет новые посты в content/blog.json.
 * Ручные правки существующих записей (title, tags, hidden) не затираются.
 * Запуск: npm run sync-telegram (канал берётся из content/site.json).
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SITE_PATH = 'content/site.json'
const BLOG_PATH = 'content/blog.json'
const TITLE_MAX = 80

const site = JSON.parse(readFileSync(SITE_PATH, 'utf8'))
const channel = site.telegramChannel
if (!channel) {
  console.log('site.json: telegramChannel не задан — синхронизация пропущена')
  process.exit(0)
}

const res = await fetch(`https://t.me/s/${channel}`, {
  headers: { 'user-agent': 'Mozilla/5.0 (blog-sync)' },
})
if (!res.ok) {
  console.error(`t.me/s/${channel}: HTTP ${res.status}`)
  process.exit(1)
}
const html = await res.text()

function decodeEntities(s) {
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

/** Парсинг блоков сообщений из HTML-превью канала */
function parsePosts(pageHtml) {
  const posts = []
  const blocks = pageHtml.split('tgme_widget_message_wrap').slice(1)
  for (const block of blocks) {
    const idMatch = /data-post="[^"]+\/(\d+)"/.exec(block)
    if (!idMatch) continue
    const id = idMatch[1]

    const textMatch = /class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(block)
    const text = textMatch ? decodeEntities(textMatch[1]) : ''
    const firstLine = text.split('\n').find((l) => l.trim()) ?? ''
    const title =
      firstLine.length > TITLE_MAX ? `${firstLine.slice(0, TITLE_MAX - 1)}…` : firstLine || `Пост №${id}`

    const dateMatch = /datetime="([^"]+)"/.exec(block)
    const date = dateMatch ? dateMatch[1].slice(0, 10) : new Date().toISOString().slice(0, 10)

    posts.push({ id, url: `https://t.me/${channel}/${id}`, title, date })
  }
  return posts
}

const found = parsePosts(html)
if (found.length === 0) {
  console.error('Не найдено ни одного поста — вероятно, изменилась разметка t.me/s или канал пуст')
  process.exit(1)
}

const blog = JSON.parse(readFileSync(BLOG_PATH, 'utf8'))
const known = new Set(blog.posts.map((p) => p.id))
const fresh = found.filter((p) => !known.has(p.id))

if (fresh.length === 0) {
  console.log('Новых постов нет')
  process.exit(0)
}

blog.posts = [...blog.posts, ...fresh].sort((a, b) => Number(b.id) - Number(a.id))
writeFileSync(BLOG_PATH, `${JSON.stringify(blog, null, 2)}\n`)
console.log(`Добавлено постов: ${fresh.length} (${fresh.map((p) => p.id).join(', ')})`)
