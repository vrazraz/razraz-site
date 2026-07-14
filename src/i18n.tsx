import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'ru' | 'en'

/** Все строки интерфейса. Контент (markdown) переводится файлами *.en.md */
export const STR = {
  ru: {
    siteName: 'Виталий Матыцин',
    sections: {
      about: 'Обо мне',
      projects: 'Проекты',
      blog: 'Блог',
      resume: 'Резюме',
      skills: 'Навыки',
    } as Record<string, string>,
    navAria: 'Разделы',
    resetZoom: 'Сбросить масштаб',
    settings: 'Настройки',
    theme: 'Тема',
    themeDark: 'Тёмная',
    themeLight: 'Светлая',
    language: 'Язык',
    viewMode: 'Режим отображения',
    viewStandard: 'Стандартный',
    viewCanvas: 'Экспериментальный',
    hint: 'Перемещение: пробел, ПКМ или скролл тачпадом',
    map: 'Карта',
    minimapAria: 'Мини-карта: клик перемещает вьюпорт',
    paletteAria: 'Быстрый переход',
    palettePlaceholder: 'Куда перейти? Разделы, кейсы, посты…',
    paletteEmpty: 'Ничего не нашлось',
    paletteFoot: '↑↓ выбор · Enter перейти · Esc закрыть',
    hintSection: 'Раздел',
    hintCase: 'Кейс',
    hintCaseNda: 'Кейс · NDA',
    hintPost: 'Пост',
    ndaTitle: 'Кейс под NDA',
    ndaText: (title: string) => `«${title}» защищён паролем — запросите его у Виталия.`,
    password: 'Пароль',
    open: 'Открыть',
    wrongPassword: 'Неверный пароль',
    close: 'Закрыть',
    prevCase: 'Предыдущий кейс',
    nextCase: 'Следующий кейс',
    openInTelegram: 'Открыть в Telegram ↗',
    blogSubtitle: 'Посты приезжают из Telegram-канала',
    blogEmpty: 'Пока пусто — скоро здесь появятся посты.',
    blogNote: 'Посты — на русском',
    collapse: 'Свернуть',
    seeAll: (n: number) => `Смотреть все (${n})`,
    olderWorks: 'Более старые работы — на',
    copyEmail: 'Email — копировать',
    copied: 'Скопировано ✓',
    crashTitle: 'Что-то сломалось',
    crashText: 'Похоже, я перестарался с анимациями. Обновите страницу — обычно помогает.',
    reload: 'Обновить',
    dateLocale: 'ru',
  },
  en: {
    siteName: 'Vitaly Matitsyn',
    sections: {
      about: 'About',
      projects: 'Projects',
      blog: 'Blog',
      resume: 'Resume',
      skills: 'Skills',
    } as Record<string, string>,
    navAria: 'Sections',
    resetZoom: 'Reset zoom',
    settings: 'Settings',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    language: 'Language',
    viewMode: 'View mode',
    viewStandard: 'Standard',
    viewCanvas: 'Experimental',
    hint: 'Pan with Space, right mouse button or touchpad scroll',
    map: 'Map',
    minimapAria: 'Minimap: click to move the viewport',
    paletteAria: 'Quick navigation',
    palettePlaceholder: 'Jump to… sections, cases, posts',
    paletteEmpty: 'Nothing found',
    paletteFoot: '↑↓ select · Enter go · Esc close',
    hintSection: 'Section',
    hintCase: 'Case',
    hintCaseNda: 'Case · NDA',
    hintPost: 'Post',
    ndaTitle: 'Case under NDA',
    ndaText: (title: string) => `“${title}” is password-protected — ask Vitaly for access.`,
    password: 'Password',
    open: 'Open',
    wrongPassword: 'Wrong password',
    close: 'Close',
    prevCase: 'Previous case',
    nextCase: 'Next case',
    openInTelegram: 'Open in Telegram ↗',
    blogSubtitle: 'Posts arrive from my Telegram channel',
    blogEmpty: 'Nothing here yet — posts are coming soon.',
    blogNote: 'Posts are in Russian',
    collapse: 'Collapse',
    seeAll: (n: number) => `Show all (${n})`,
    olderWorks: 'Older works live on',
    copyEmail: 'Email — copy',
    copied: 'Copied ✓',
    crashTitle: 'Something broke',
    crashText: 'Looks like I overdid the animations. Refreshing the page usually helps.',
    reload: 'Reload',
    dateLocale: 'en',
  },
} as const

export type Strings = (typeof STR)[Lang]

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  s: Strings
}

const LangContext = createContext<LangContextValue | null>(null)

const detectLang = (): Lang => {
  const saved = localStorage.getItem('lang')
  if (saved === 'ru' || saved === 'en') return saved
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => {
    localStorage.setItem('lang', l)
    setLangState(l)
  }

  return <LangContext.Provider value={{ lang, setLang, s: STR[lang] }}>{children}</LangContext.Provider>
}

export function useI18n(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useI18n вне LangProvider')
  return ctx
}
