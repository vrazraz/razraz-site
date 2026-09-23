/** Чистая логика синка с Telegram — вынесена из CLI для тестируемости. */

const TITLE_MAX = 80

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

/** Раскодирует именованные и числовые (&#33;, &#x21;) сущности.
 *  &amp; обрабатывается в том же проходе, поэтому «&amp;#33;» даёт
 *  буквальный «&#33;», а не «!». */
export function decodeEntities(s) {
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code) => {
      if (code[0] === '#') {
        const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
        return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : whole
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? whole
    })
    .trim()
}

/** Парсинг блоков сообщений из HTML-превью канала t.me/s/<канал> */
export function parsePosts(pageHtml, channel) {
  const posts = []
  const blocks = pageHtml.split('tgme_widget_message_wrap').slice(1)
  for (const block of blocks) {
    const idMatch = /data-post="[^"]+\/(\d+)"/.exec(block)
    if (!idMatch) continue
    const id = idMatch[1]

    const textMatch = /class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(block)
    const text = textMatch ? decodeEntities(textMatch[1]) : ''
    const firstLine = (text.split('\n').find((l) => l.trim()) ?? '').trim()
    const title =
      firstLine.length > TITLE_MAX ? `${firstLine.slice(0, TITLE_MAX - 1)}…` : firstLine || `Пост №${id}`

    const dateMatch = /datetime="([^"]+)"/.exec(block)
    const date = dateMatch ? dateMatch[1].slice(0, 10) : new Date().toISOString().slice(0, 10)

    posts.push({ id, url: `https://t.me/${channel}/${id}`, title, date })
  }
  return posts
}

/** Слияние: ручные правки существующих записей не затираются,
 *  новые добавляются, сортировка по id по убыванию. */
export function mergePosts(existing, found) {
  const known = new Set(existing.map((p) => p.id))
  const fresh = found.filter((p) => !known.has(p.id))
  return {
    posts: [...existing, ...fresh].sort((a, b) => Number(b.id) - Number(a.id)),
    freshCount: fresh.length,
    freshIds: fresh.map((p) => p.id),
  }
}
