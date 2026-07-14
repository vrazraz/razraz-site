import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import blog from './content/blog.json'
import site from './content/site.json'

const ORIGIN = 'https://razraz.pro'

interface Post {
  id: string
  url: string
  title: string
  date: string
  hidden?: boolean
}

const posts = (blog.posts as Post[]).filter((p) => !p.hidden)

/** SEO для статей из Telegram: JSON-LD в index.html + статическая
 *  страница blog.html, sitemap.xml и robots.txt в dist. Синк блога
 *  коммитит blog.json — каждая пересборка обновляет и SEO-слой. */
function seoArtifacts(): Plugin {
  let outDir = 'dist'
  return {
    name: 'seo-artifacts',
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
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(ld),
          injectTo: 'head',
        },
      ]
    },
    closeBundle() {
      const items = posts
        .map(
          (p) =>
            `    <li><a href="${p.url}" rel="noopener">${p.title}</a> <time datetime="${p.date}">${p.date}</time></li>`,
        )
        .join('\n')
      const blogHtml = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Блог Виталия Матыцина — про UX, UI и AI</title>
  <meta name="description" content="Заметки продуктового дизайнера про интерфейсы, UX и AI-инструменты. Полные тексты — в Telegram-канале." />
  <link rel="canonical" href="${ORIGIN}/blog.html" />
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    li { margin-bottom: 10px; }
    time { color: #777; font-size: 0.85em; margin-left: 8px; }
  </style>
</head>
<body>
  <p><a href="${ORIGIN}/">← Виталий Матыцин — продуктовый дизайнер</a></p>
  <h1>Блог: про UX, UI и AI</h1>
  <p>Заметки выходят в Telegram-канале <a href="https://t.me/${site.telegramChannel}" rel="noopener">@${site.telegramChannel}</a>; здесь — оглавление.</p>
  <ul>
${items}
  </ul>
</body>
</html>
`
      const lastmod = posts[0]?.date ?? new Date().toISOString().slice(0, 10)
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${ORIGIN}/</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>${ORIGIN}/blog.html</loc><lastmod>${lastmod}</lastmod></url>
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
  plugins: [react(), seoArtifacts()],
})
