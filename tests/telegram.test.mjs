import { describe, it, expect } from 'vitest'
import { decodeEntities, parsePosts, mergePosts } from '../scripts/telegram-lib.mjs'

const FIXTURE = `
<div class="tgme_widget_message_wrap js-widget_message_wrap">
  <div class="tgme_widget_message" data-post="prouxui/974">
    <div class="tgme_widget_message_text js-message_text" dir="auto">А у меня новая ачивка) Она навела меня на мысль.<br/>Вторая строка</div>
    <time datetime="2026-07-06T09:15:04+00:00" class="time"></time>
  </div>
</div>
<div class="tgme_widget_message_wrap js-widget_message_wrap">
  <div class="tgme_widget_message" data-post="prouxui/975">
    <div class="tgme_widget_message_text js-message_text" dir="auto">${'Очень длинный заголовок '.repeat(6)}конец</div>
    <time datetime="2026-07-08T10:00:00+00:00" class="time"></time>
  </div>
</div>
<div class="tgme_widget_message_wrap js-widget_message_wrap">
  <div class="tgme_widget_message" data-post="prouxui/976">
    <time datetime="2026-07-09T10:00:00+00:00" class="time"></time>
  </div>
</div>
`

describe('decodeEntities', () => {
  it('убирает теги и раскодирует сущности', () => {
    expect(decodeEntities('a &amp; b<br/>c <b>жирный</b>&nbsp;&#39;x&#039;'.replace('&#039;', '&#39;'))).toBe(
      "a & b\nc жирный 'x'",
    )
  })
})

describe('parsePosts', () => {
  const posts = parsePosts(FIXTURE, 'prouxui')

  it('находит все посты с id, url и датой', () => {
    expect(posts.map((p) => p.id)).toEqual(['974', '975', '976'])
    expect(posts[0].url).toBe('https://t.me/prouxui/974')
    expect(posts[0].date).toBe('2026-07-06')
  })

  it('берёт первую строку как заголовок', () => {
    expect(posts[0].title).toBe('А у меня новая ачивка) Она навела меня на мысль.')
  })

  it('обрезает длинные заголовки до 80 символов с многоточием', () => {
    expect(posts[1].title.length).toBe(80)
    expect(posts[1].title.endsWith('…')).toBe(true)
  })

  it('пост без текста получает заголовок-заглушку', () => {
    expect(posts[2].title).toBe('Пост №976')
  })

  it('возвращает пусто на неожиданной разметке', () => {
    expect(parsePosts('<html><body>что-то другое</body></html>', 'x')).toEqual([])
  })
})

describe('mergePosts', () => {
  const existing = [
    { id: '974', url: 'https://t.me/prouxui/974', title: 'Ручной заголовок', date: '2026-07-06', hidden: true, tags: ['ai'] },
    { id: '900', url: 'https://t.me/prouxui/900', title: 'Старый', date: '2026-01-01' },
  ]
  const found = parsePosts(FIXTURE, 'prouxui')
  const { posts, freshCount, freshIds } = mergePosts(existing, found)

  it('не затирает ручные правки существующих записей', () => {
    const p974 = posts.find((p) => p.id === '974')
    expect(p974.title).toBe('Ручной заголовок')
    expect(p974.hidden).toBe(true)
    expect(p974.tags).toEqual(['ai'])
  })

  it('добавляет только новые и сортирует по id по убыванию', () => {
    expect(freshCount).toBe(2)
    expect(freshIds).toEqual(['975', '976'])
    expect(posts.map((p) => p.id)).toEqual(['976', '975', '974', '900'])
  })

  it('без новых постов freshCount равен нулю', () => {
    expect(mergePosts(posts, found).freshCount).toBe(0)
  })
})
