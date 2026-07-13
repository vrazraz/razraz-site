import { useEffect, useRef, useState } from 'react'

/** Утверждённый список псевдопользователей */
const USERS = [
  'Аня Пикселева',
  'Дима Сеточкин',
  'Оля Макетова',
  'Паша Оверлеев',
  'Лена Токенова',
  'Гоша Отступов',
  'token_ninja',
  'ux_babushka',
  'grid_goblin',
  'hover_lord',
  'autolayout_fan',
  'deadline_kid',
  'kern~master',
  'figma_enjoyer',
]

const COLORS = ['#ff6b6b', '#5b8cff', '#ffb020', '#9b5bfa', '#2fbf71', '#ff5da2']

/* Зона блужданий в мировых координатах — вокруг фреймов */
const AREA = { x0: -150, y0: -320, x1: 2320, y1: 2020 }

/* Точка первой NDA-карточки во фрейме «Проекты» — цель пасхалки */
const NDA_POINT = { x: 1120, y: 55 }

const ARRIVE_DIST = 10
/* Ритм: 1–2 быстрых дальних перелёта, затем 2–4 коротких медленных шага */
const DASH_SPEED = 0.034
const BROWSE_SPEED = 0.015
const DASH_MIN_DIST = 800
const BROWSE_DIST = [70, 280] as const
/* одновременно 0–2 курсора */
const rollDesired = () => Math.floor(Math.random() * 3)

type Mode = 'dash' | 'browse' | 'scene-go'

interface Ghost {
  id: number
  name: string
  color: string
  x: number
  y: number
  tx: number
  ty: number
  mode: Mode
  movesLeft: number
  speed: number
  waitUntil: number
  leaveAt: number
  leaving: boolean
  inScene: boolean
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

function pickTarget(x: number, y: number, mode: Mode): { tx: number; ty: number } {
  if (mode === 'scene-go') {
    return { tx: NDA_POINT.x + rand(-30, 30), ty: NDA_POINT.y + rand(-20, 20) }
  }
  if (mode === 'dash') {
    for (let i = 0; i < 20; i++) {
      const tx = rand(AREA.x0, AREA.x1)
      const ty = rand(AREA.y0, AREA.y1)
      if (Math.hypot(tx - x, ty - y) > DASH_MIN_DIST) return { tx, ty }
    }
    return { tx: rand(AREA.x0, AREA.x1), ty: rand(AREA.y0, AREA.y1) }
  }
  const angle = rand(0, Math.PI * 2)
  const r = rand(BROWSE_DIST[0], BROWSE_DIST[1])
  return {
    tx: clamp(x + Math.cos(angle) * r, AREA.x0, AREA.x1),
    ty: clamp(y + Math.sin(angle) * r, AREA.y0, AREA.y1),
  }
}

const rollMoves = (mode: Mode) => (mode === 'dash' ? Math.round(rand(1, 2)) : Math.round(rand(2, 4)))

function makeGhost(id: number, taken: Set<string>): Ghost {
  const free = USERS.filter((u) => !taken.has(u))
  const name = free[Math.floor(Math.random() * free.length)] ?? USERS[0]
  const x = rand(AREA.x0, AREA.x1)
  const y = rand(AREA.y0, AREA.y1)
  const mode: Mode = Math.random() < 0.5 ? 'dash' : 'browse'
  return {
    id,
    name,
    color: COLORS[id % COLORS.length],
    x,
    y,
    ...pickTarget(x, y, mode),
    mode,
    movesLeft: rollMoves(mode),
    speed: mode === 'dash' ? DASH_SPEED : BROWSE_SPEED,
    waitUntil: 0,
    leaveAt: performance.now() + rand(25000, 60000),
    leaving: false,
    inScene: false,
  }
}

/** Псевдокурсоры «других посетителей»: блуждают по канвасу, без кликов.
 *  Позиции пишутся в DOM напрямую (без setState на каждый тик);
 *  React управляет только появлением и уходом курсоров. */
export function GhostCursors({ scale }: { scale: number }) {
  const store = useRef<Map<number, Ghost>>(new Map())
  const els = useRef<Map<number, HTMLDivElement>>(new Map())
  const nextId = useRef(0)
  const desired = useRef(rollDesired())
  const [, bump] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timers = new Set<number>()
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t)
        fn()
      }, ms)
      timers.add(t)
    }

    const rerender = () => bump((v) => v + 1)

    const spawn = () => {
      const taken = new Set([...store.current.values()].map((g) => g.name))
      const g = makeGhost(nextId.current++, taken)
      store.current.set(g.id, g)
      rerender()
    }

    const activeCount = () => [...store.current.values()].filter((g) => !g.leaving).length

    const leave = (g: Ghost) => {
      g.leaving = true
      els.current.get(g.id)?.classList.add('ghost-cursor--leaving')
      later(() => {
        store.current.delete(g.id)
        rerender()
      }, 480)
      later(() => {
        if (activeCount() < desired.current) spawn()
      }, rand(2500, 9000))
    }

    for (let i = 0; i < desired.current; i++) spawn()

    /* Движение: время учитывается явно — троттлинг вкладок не ломает темп */
    let last = performance.now()
    const step = () => {
      const now = performance.now()
      const frames = Math.min(5, (now - last) / 16.7)
      last = now
      for (const g of store.current.values()) {
        if (g.leaving) continue
        if (now > g.leaveAt && !g.inScene) {
          leave(g)
          continue
        }
        if (now < g.waitUntil) continue
        const dx = g.tx - g.x
        const dy = g.ty - g.y
        if (Math.hypot(dx, dy) < ARRIVE_DIST) {
          if (g.mode === 'scene-go') {
            /* пасхалка: «клик» по NDA-карточке и мотание головой */
            const el = els.current.get(g.id)
            g.inScene = true
            g.waitUntil = now + 2400
            el?.classList.add('ghost-cursor--press')
            later(() => {
              el?.classList.remove('ghost-cursor--press')
              el?.classList.add('ghost-cursor--shake')
            }, 380)
            later(() => {
              el?.classList.remove('ghost-cursor--shake')
              const g2 = store.current.get(g.id)
              if (!g2) return
              g2.inScene = false
              g2.mode = 'browse'
              g2.movesLeft = rollMoves('browse')
              g2.speed = BROWSE_SPEED
              Object.assign(g2, pickTarget(g2.x, g2.y, 'browse'))
            }, 1500)
            continue
          }
          let mode: Mode = g.mode
          let movesLeft = g.movesLeft - 1
          if (movesLeft <= 0) {
            mode = g.mode === 'dash' ? 'browse' : 'dash'
            movesLeft = rollMoves(mode)
          }
          g.mode = mode
          g.movesLeft = movesLeft
          g.speed = mode === 'dash' ? DASH_SPEED : BROWSE_SPEED
          g.waitUntil = now + (mode === 'browse' ? rand(500, 2200) : rand(1200, 4200))
          Object.assign(g, pickTarget(g.x, g.y, mode))
          continue
        }
        const k = 1 - Math.pow(1 - g.speed, frames)
        g.x += dx * k
        g.y += dy * k
        const el = els.current.get(g.id)
        if (el) {
          el.style.left = `${g.x}px`
          el.style.top = `${g.y}px`
        }
      }
    }
    const moveInterval = window.setInterval(step, 40)

    /* Смена состава: даже после пустого зала кто-то может зайти */
    const churn = window.setInterval(() => {
      desired.current = rollDesired()
      const active = [...store.current.values()].filter((g) => !g.leaving)
      if (active.length < desired.current) {
        for (let i = active.length; i < desired.current; i++) spawn()
      } else if (active.length > desired.current) {
        active.slice(desired.current).forEach((g) => !g.inScene && leave(g))
      }
    }, 30000)

    /* Пасхалка: раз в 1.5–3 минуты кто-то идёт «кликать» NDA-кейс */
    let sceneTimer = 0
    const scheduleScene = () => {
      sceneTimer = window.setTimeout(() => {
        timers.delete(sceneTimer)
        const candidates = [...store.current.values()].filter((g) => !g.leaving && !g.inScene)
        const g = candidates[Math.floor(Math.random() * candidates.length)]
        if (g) {
          g.mode = 'scene-go'
          g.speed = DASH_SPEED
          g.waitUntil = 0
          g.leaveAt = Math.max(g.leaveAt, performance.now() + 15000)
          Object.assign(g, pickTarget(g.x, g.y, 'scene-go'))
        }
        scheduleScene()
      }, rand(90000, 180000))
      timers.add(sceneTimer)
    }
    scheduleScene()

    return () => {
      window.clearInterval(moveInterval)
      window.clearInterval(churn)
      timers.forEach((t) => window.clearTimeout(t))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const inv = 1 / scale
  return (
    <>
      {[...store.current.values()].map((g) => (
        <div
          key={g.id}
          ref={(el) => {
            if (el) {
              els.current.set(g.id, el)
              el.style.left = `${g.x}px`
              el.style.top = `${g.y}px`
            } else {
              els.current.delete(g.id)
            }
          }}
          className="ghost-cursor"
          style={{ transform: `scale(${inv})` }}
          aria-hidden="true"
        >
          <div className="ghost-cursor__inner">
            <svg width="20" height="22" viewBox="0 0 20 22">
              <path
                d="M3 1 L17 12 L10.5 13.2 L13.5 20 L10 21.4 L7.2 14.6 L3 18 Z"
                fill={g.color}
                stroke="#0c0c0e"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ghost-cursor__label" style={{ background: g.color }}>
              {g.name}
            </span>
          </div>
        </div>
      ))}
    </>
  )
}
