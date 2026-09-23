import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import blog from './content/blog.json'
import site from './content/site.json'
import { escapeHtml, jsonForScript, readCases, toDoc, type CaseFile } from './build/content-lib'

const ORIGIN = 'https://razraz.pro'

interface Post {
  id: string
  url: string
  title: string
  date: string
  hidden?: boolean
}

const posts = (blog.posts as Post[]).filter((p) => !p.hidden)

/** Импорты вида `file.md?doc` отдают уже разобранный { meta, html }:
 *  markdown превращается в HTML при сборке, marked не едет в браузер. */
function markdownDocs(): Plugin {
  return {
    name: 'markdown-docs',
    enforce: 'pre',
    load(id) {
      const m = /^(.*\.md)\?doc$/.exec(id)
      if (!m) return null
      this.addWatchFile(m[1])
      return `export default ${JSON.stringify(toDoc(readFileSync(m[1], 'utf8')))}`
    },
  }
}

const STATIC_STYLE = `
    body { font-family: system-ui, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1c1c20; }
    img, video { max-width: 100%; height: auto; border-radius: 8px; }
    li { margin-bottom: 10px; }
    time, .meta { color: #777; font-size: 0.85em; }
    .note { padding: 14px 16px; background: #f4f4f5; border-radius: 10px; }`

function page(opts: {
  lang: 'ru' | 'en'
  title: string
  description: string
  canonical: string
  alternates?: { lang: string; href: string }[]
  body: string
}): string {
  const alt = (opts.alternates ?? [])
    .map((a) => `  <link rel="alternate" hreflang="${a.lang}" href="${a.href}" />`)
    .join('\n')
  return `<!doctype html>
<html lang="${opts.lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}" />
  <link rel="canonical" href="${opts.canonical}" />
${alt}
  <link rel="icon" type="image/png" href="${ORIGIN}/glight1.png" />
  <style>${STATIC_STYLE}
  </style>
</head>
<body>
${opts.body}
</body>
</html>
`
}

/** Страница кейса для поисковиков. Кейсы под NDA публикуются без тела:
 *  их содержимое не должно индексироваться. */
function casePage(c: CaseFile, hasEn: boolean): string {
  const ru = c.lang === 'ru'
  const title = c.doc.meta.title ?? c.slug
  const url = `${ORIGIN}/cases/${c.slug}${ru ? '' : '.en'}.html`
  const nda = c.doc.meta.nda === 'true'
  const body = nda
    ? `  <p class="note">${
        ru
          ? 'Кейс под NDA: подробности открываются на сайте по паролю.'
          : 'This case is under NDA: details are available on the site with a password.'
      }</p>`
    : c.doc.html.replace(/src="\.\//g, 'src="../')
  const plain = c.doc.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const description = nda ? title : plain.slice(0, 160)
  const alternates = hasEn
    ? [
        { lang: 'ru', href: `${ORIGIN}/cases/${c.slug}.html` },
        { lang: 'en', href: `${ORIGIN}/cases/${c.slug}.en.html` },
        { lang: 'x-default', href: `${ORIGIN}/cases/${c.slug}.html` },
      ]
    : []
  return page({
    lang: c.lang,
    title: `${title} — ${ru ? 'Виталий Матыцин' : 'Vitaly Matitsyn'}`,
    description,
    canonical: url,
    alternates,
    body: `  <p><a href="../">← ${ru ? 'Виталий Матыцин — продуктовый дизайнер' : 'Vitaly Matitsyn — product designer'}</a></p>
  <h1>${escapeHtml(title)}</h1>
  ${c.doc.meta.year ? `<p class="meta">${escapeHtml(c.doc.meta.year)}</p>` : ''}
${body}
  <p><a href="../#/projects/${c.slug}">${ru ? 'Открыть кейс на сайте →' : 'Open the case on the site →'}</a></p>`,
  })
}

/** SEO: JSON-LD в index.html, статические blog.html и страницы кейсов,
 *  sitemap.xml и robots.txt. Синк блога вызывает пересборку — слой обновляется сам. */
function seoArtifacts(): Plugin {
  let outDir = 'dist'
  return {
    name: 'seo-artifacts',
    /* Только сборка: Vitest тоже поднимает этот конфиг и иначе
       записал бы файлы в свою фиктивную outDir в корне репозитория */
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    transformIndexHtml() {
      const ld = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Person',
            name: 'Виталий Матыцин',
            alternateName: 'Vitaly Matitsyn',
            jobTitle: 'AI-powered product designer',
            email: `mailto:${site.email}`,
            url: `${ORIGIN}/`,
            sameAs: site.social.map((s) => s.url).filter((u) => u.startsWith('http')),
          },
          {
            '@type': 'Blog',
            name: 'Блог Виталия Матыцина — про UX, UI и AI',
            url: `${ORIGIN}/blog.html`,
            inLanguage: 'ru',
            blogPost: posts.map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              datePublished: p.date,
              url: p.url,
              author: { '@type': 'Person', name: 'Виталий Матыцин' },
            })),
          },
        ],
      }
      /* Внутренние ссылки для краулеров, которые не исполняют JS */
      const ruCases = readCases(resolve(__dirname, 'content/projects')).filter((c) => c.lang === 'ru')
      const noscript = `
    <h1>Виталий Матыцин — AI-powered product designer</h1>
    <ul>
${ruCases
  .map((c) => `      <li><a href="./cases/${c.slug}.html">${escapeHtml(c.doc.meta.title ?? c.slug)}</a></li>`)
  .join('\n')}
      <li><a href="./blog.html">Блог: про UX, UI и AI</a></li>
    </ul>`
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: jsonForScript(ld),
          injectTo: 'head',
        },
        { tag: 'noscript', children: noscript, injectTo: 'body' },
      ]
    },
    closeBundle() {
      const items = posts
        .map(
          (p) =>
            `    <li><a href="${escapeHtml(p.url)}" rel="noopener">${escapeHtml(p.title)}</a> <time datetime="${escapeHtml(p.date)}">${escapeHtml(p.date)}</time></li>`,
        )
        .join('\n')
      const blogHtml = page({
        lang: 'ru',
        title: 'Блог Виталия Матыцина — про UX, UI и AI',
        description: 'Заметки продуктового дизайнера про интерфейсы, UX и AI-инструменты. Полные тексты — в Telegram-канале.',
        canonical: `${ORIGIN}/blog.html`,
        body: `  <p><a href="${ORIGIN}/">← Виталий Матыцин — продуктовый дизайнер</a></p>
  <h1>Блог: про UX, UI и AI</h1>
  <p>Заметки выходят в Telegram-канале <a href="https://t.me/${site.telegramChannel}" rel="noopener">@${site.telegramChannel}</a>; здесь — оглавление.</p>
  <ul>
${items}
  </ul>`,
      })

      const cases = readCases(resolve(__dirname, 'content/projects'))
      const enSlugs = new Set(cases.filter((c) => c.lang === 'en').map((c) => c.slug))
      mkdirSync(resolve(outDir, 'cases'), { recursive: true })
      for (const c of cases) {
        const file = `${c.slug}${c.lang === 'en' ? '.en' : ''}.html`
        writeFileSync(resolve(outDir, 'cases', file), casePage(c, enSlugs.has(c.slug)))
      }

      const lastmod = posts[0]?.date ?? new Date().toISOString().slice(0, 10)
      const caseUrls = cases
        .map((c) => `  <url><loc>${ORIGIN}/cases/${c.slug}${c.lang === 'en' ? '.en' : ''}.html</loc></url>`)
        .join('\n')
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${ORIGIN}/</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>${ORIGIN}/blog.html</loc><lastmod>${lastmod}</lastmod></url>
${caseUrls}
</urlset>
`
      const robots = `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`
      writeFileSync(resolve(outDir, 'blog.html'), blogHtml)
      writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap)
      writeFileSync(resolve(outDir, 'robots.txt'), robots)
    },
  }
}

// base: './' — сайт работает и на <user>.github.io/<repo>, и на своём домене
export default defineConfig({
  base: './',
  plugins: [markdownDocs(), react(), seoArtifacts()],
})
