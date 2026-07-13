/**
 * Синхронизация блога с публичным Telegram-каналом.
 * Читает https://t.me/s/<канал>, добавляет новые посты в content/blog.json.
 * Ручные правки существующих записей (title, tags, hidden) не затираются.
 * Запуск: npm run sync-telegram (канал берётся из content/site.json).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { parsePosts, mergePosts } from './telegram-lib.mjs'

const SITE_PATH = 'content/site.json'
const BLOG_PATH = 'content/blog.json'

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

const found = parsePosts(html, channel)
if (found.length === 0) {
  console.error('Не найдено ни одного поста — вероятно, изменилась разметка t.me/s или канал пуст')
  process.exit(1)
}

const blog = JSON.parse(readFileSync(BLOG_PATH, 'utf8'))
const { posts, freshCount, freshIds } = mergePosts(blog.posts, found)

if (freshCount === 0) {
  console.log('Новых постов нет')
  process.exit(0)
}

writeFileSync(BLOG_PATH, `${JSON.stringify({ ...blog, posts }, null, 2)}\n`)
console.log(`Добавлено постов: ${freshCount} (${freshIds.join(', ')})`)
