/** Rubber-hose декор в мировых координатах + плёночные оверлеи в экранных. */

function GloveHand({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <svg
      className="decor"
      style={{ left: x, top: y, transform: flip ? 'scaleX(-1)' : undefined }}
      width="170"
      height="120"
      viewBox="0 0 170 120"
      aria-hidden="true"
    >
      <path
        d="M8 112 C 40 118, 60 78, 92 72"
        stroke="var(--outline)"
        strokeWidth="15"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M8 112 C 40 118, 60 78, 92 72"
        stroke="var(--decor-paper)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <g transform="translate(88,44) rotate(12)">
        <path
          d="M6 30 Q -2 22 4 14 Q 10 8 20 12 L 22 10 Q 14 2 22 -4 Q 29 -9 36 -1 L 60 8 Q 74 13 70 26 Q 66 40 50 38 L 22 36 Q 10 38 6 30 Z"
          fill="var(--decor-paper)"
          stroke="var(--outline)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M22 10 Q 30 4 38 10 M22 22 Q 32 16 42 20"
          stroke="var(--outline)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M36 -1 L 62 -14 Q 70 -18 73 -11 Q 76 -4 68 0 L 44 8"
          fill="var(--decor-paper)"
          stroke="var(--outline)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

function Star({ x, y, size = 34, accent = false }: { x: number; y: number; size?: number; accent?: boolean }) {
  return (
    <svg className="decor" style={{ left: x, top: y }} width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <path
        d="M17 3 l3.5 9 9.5 1 -7 6.5 2.5 10 -8.5 -5.5 -8.5 5.5 2.5 -10 -7 -6.5 9.5 -1 z"
        fill={accent ? 'var(--accent)' : 'var(--decor-paper)'}
        stroke="var(--outline)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MotionLines({ x, y }: { x: number; y: number }) {
  return (
    <svg className="decor" style={{ left: x, top: y }} width="120" height="90" viewBox="0 0 120 90" aria-hidden="true">
      <path
        d="M10 20 Q 25 10 40 20 M6 40 Q 24 28 44 38 M12 60 Q 26 52 40 60"
        stroke="var(--decor-ink)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Растровый спрайт-виньетка. Прячется сам, пока файла нет в public/. */
function Sprite({ src, x, y, w, rot }: { src: string; x: number; y: number; w: number; rot: number }) {
  return (
    <img
      className="decor decor-sprite"
      style={{ left: x, top: y, width: w, transform: `rotate(${rot}deg)` }}
      src={`${import.meta.env.BASE_URL}${src}`}
      alt=""
      aria-hidden="true"
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}

/** Наклоны ±20°, размеры каждого спрайта варьируются в пределах ±10% от базовых 150px */
const SPRITES = [
  { src: 'decor-bulb.png', x: 790, y: -40, w: 138, rot: -14 },
  { src: 'decor-books.png', x: 160, y: 655, w: 165, rot: 9 },
  { src: 'decor-cursor.png', x: 700, y: 1150, w: 150, rot: -18 },
  { src: 'decor-design.png', x: 1360, y: 640, w: 160, rot: 6 },
  { src: 'decor-folder.png', x: 300, y: 1640, w: 143, rot: 16 },
  { src: 'decor-lamp.png', x: 1780, y: 1240, w: 152, rot: -11 },
]

/** Виньетки между фреймами; координаты подобраны под content/layout.json */
export function CanvasDecor() {
  return (
    <>
      <GloveHand x={-210} y={180} />
      <Star x={840} y={-180} accent />
      <MotionLines x={870} y={-140} />
      <Star x={780} y={760} size={24} />
      <MotionLines x={-160} y={880} />
      <Star x={1850} y={560} size={28} accent />
      {SPRITES.map((s) => (
        <Sprite key={s.src} {...s} />
      ))}
    </>
  )
}

/** Зерно и царапины — только на фоне канваса, под фреймами */
export function GrainOverlay() {
  return (
    <div className="grain" aria-hidden="true">
      <span className="grain__scratch" style={{ left: '23%' }} />
      <span className="grain__scratch grain__scratch--dim" style={{ left: '71%' }} />
    </div>
  )
}

/** Виньетка по краям экрана — поверх всего, клики пропускает */
export function Vignette() {
  return <div className="vignette" aria-hidden="true" />
}
