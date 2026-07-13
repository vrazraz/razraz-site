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

const LERP = 0.011
const ARRIVE_DIST = 10
/* одновременно 0–2 курсора */
const rollDesired = () => Math.floor(Math.random() * 3)

interface Ghost {
  id: number
  name: string
  color: string
  x: number
  y: number
  tx: number
  ty: number
  waitUntil: number
  leaveAt: number
  leaving: boolean
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

function makeGhost(id: number, taken: Set<string>): Ghost {
  const free = USERS.filter((u) => !taken.has(u))
  const name = free[Math.floor(Math.random() * free.length)] ?? USERS[0]
  const x = rand(AREA.x0, AREA.x1)
  const y = rand(AREA.y0, AREA.y1)
  return {
    id,
    name,
    color: COLORS[id % COLORS.length],
    x,
    y,
    tx: rand(AREA.x0, AREA.x1),
    ty: rand(AREA.y0, AREA.y1),
    waitUntil: 0,
    leaveAt: performance.now() + rand(25000, 60000),
    leaving: false,
  }
}

/** Псевдокурсоры «других посетителей»: блуждают по канвасу, без кликов */
export function GhostCursors({ scale }: { scale: number }) {
  const [ghosts, setGhosts] = useState<Ghost[]>([])
  const nextId = useRef(0)
  const desired = useRef(rollDesired())

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let alive: Ghost[] = []
    const spawnTimers = new Set<number>()

    const spawn = () => {
      const taken = new Set(alive.map((g) => g.name))
      alive = [...alive, makeGhost(nextId.current++, taken)]
    }

    for (let i = 0; i < desired.current; i++) spawn()

    /* Интервал вместо rAF: время учитывается явно, троттлинг фоновых
       вкладок не ломает движение */
    let last = performance.now()
    const step = () => {
      const now = performance.now()
      const frames = Math.min(5, (now - last) / 16.7)
      last = now
      const k = 1 - Math.pow(1 - LERP, frames)
      let changed = false
      alive = alive.map((g) => {
        if (g.leaving) return g
        if (now > g.leaveAt) {
          changed = true
          /* уходит; через паузу состав пополняется до желаемого */
          const t = window.setTimeout(() => {
            spawnTimers.delete(t)
            while (alive.filter((a) => !a.leaving).length < desired.current) spawn()
          }, rand(2500, 9000))
          spawnTimers.add(t)
          const gone = { ...g, leaving: true }
          window.setTimeout(() => {
            alive = alive.filter((a) => a.id !== gone.id)
          }, 500)
          return gone
        }
        if (now < g.waitUntil) return g
        const dx = g.tx - g.x
        const dy = g.ty - g.y
        if (Math.hypot(dx, dy) < ARRIVE_DIST) {
          return {
            ...g,
            waitUntil: now + rand(900, 4200),
            tx: rand(AREA.x0, AREA.x1),
            ty: rand(AREA.y0, AREA.y1),
          }
        }
        changed = true
        return { ...g, x: g.x + dx * k, y: g.y + dy * k }
      })
      if (changed) setGhosts(alive)
    }
    setGhosts(alive)
    const interval = window.setInterval(step, 40)

    /* Периодическая «смена посетителей»: даже после пустого зала
       кто-то может зайти, а лишние — уйти пораньше */
    const churn = window.setInterval(() => {
      desired.current = rollDesired()
      const active = alive.filter((a) => !a.leaving)
      if (active.length < desired.current) {
        while (alive.filter((a) => !a.leaving).length < desired.current) spawn()
      } else if (active.length > desired.current) {
        const extra = active.slice(desired.current)
        const now = performance.now()
        alive = alive.map((g) => (extra.some((e) => e.id === g.id) ? { ...g, leaveAt: now } : g))
      }
    }, 30000)

    return () => {
      window.clearInterval(interval)
      window.clearInterval(churn)
      spawnTimers.forEach((t) => window.clearTimeout(t))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const inv = 1 / scale
  return (
    <>
      {ghosts.map((g) => (
        <div
          key={g.id}
          className={'ghost-cursor' + (g.leaving ? ' ghost-cursor--leaving' : '')}
          style={{ left: g.x, top: g.y, transform: `scale(${inv})` }}
          aria-hidden="true"
        >
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
      ))}
    </>
  )
}
