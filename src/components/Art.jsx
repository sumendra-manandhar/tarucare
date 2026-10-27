import { useId } from 'react'

/** Shade a hex color by a percentage (-100..100). */
export function shade(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * pct)
  const clamp = (v) => Math.max(0, Math.min(255, v))
  const r = clamp((n >> 16) + amt)
  const g = clamp(((n >> 8) & 0xff) + amt)
  const b = clamp((n & 0xff) + amt)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

const SPECKS = [
  [42, 52, 2.2], [70, 88, 1.6], [98, 46, 1.8], [130, 96, 2.4], [160, 58, 1.5], [188, 84, 2], [58, 104, 1.4],
  [112, 72, 1.3], [176, 108, 1.7], [150, 40, 1.2], [84, 64, 1.1], [200, 54, 1.4], [122, 112, 1.5],
]

/** A handcrafted soap bar illustration, tinted per product. */
export function SoapBar({ base = '#e9b949', accent = '#b9770e', label = 'TARU', className = '' }) {
  const id = useId().replace(/:/g, '')
  const light = base.toLowerCase() === '#efe8d6' || base.toLowerCase() === '#d9b38c'
  const textColor = light ? shade(base, -28) : shade(base, 18)
  return (
    <svg viewBox="0 0 240 170" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`top${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(base, 16)} />
          <stop offset="0.55" stopColor={base} />
          <stop offset="1" stopColor={shade(base, -10)} />
        </linearGradient>
        <linearGradient id={`side${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(base, -14)} />
          <stop offset="1" stopColor={shade(base, -30)} />
        </linearGradient>
        <radialGradient id={`gl${id}`} cx="0.3" cy="0.25" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`sh${id}`} x="-30%" y="-30%" width="160%" height="200%">
          <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#0f2a20" floodOpacity="0.28" />
        </filter>
      </defs>
      <g filter={`url(#sh${id})`}>
        <rect x="14" y="34" width="212" height="112" rx="40" fill={`url(#side${id})`} />
        <rect x="14" y="20" width="212" height="112" rx="40" fill={`url(#top${id})`} />
      </g>
      <rect x="30" y="34" width="180" height="84" rx="30" fill="none" stroke={shade(base, -18)} strokeOpacity="0.35" strokeWidth="2" />
      {SPECKS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={accent} opacity={0.45} />
      ))}
      {/* embossed leaf */}
      <path d="M120 46c-12 6-16 18-10 28 10-2 18-12 10-28z" fill={textColor} opacity="0.75" />
      <path d="M116 72c1-8 3-14 6-20" stroke={shade(base, -20)} strokeOpacity=".5" strokeWidth="1.2" fill="none" />
      <text x="120" y="100" textAnchor="middle" fontFamily="Playfair Display, serif" fontWeight="700" fontSize="20" letterSpacing="6" fill={textColor} opacity="0.85">
        {label}
      </text>
      <rect x="14" y="20" width="212" height="112" rx="40" fill={`url(#gl${id})`} />
    </svg>
  )
}

/** Hand-drawn style ingredient illustrations. */
export function Ingredient({ name, className = '' }) {
  const id = useId().replace(/:/g, '')
  const common = { viewBox: '0 0 120 120', className, 'aria-hidden': true }
  switch (name) {
    case 'turmeric':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`t${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d99a4e" />
              <stop offset="1" stopColor="#9a5a20" />
            </linearGradient>
          </defs>
          <path d="M18 70c4-14 20-20 34-16 6-10 20-14 30-6 10-4 22 4 20 16-2 12-16 14-24 10-8 10-24 12-34 6-12 6-28 2-26-10z" fill={`url(#t${id})`} />
          <path d="M30 66c6 2 12 2 16-2M60 60c4 3 10 4 14 1M84 66c3 2 7 2 10 0" stroke="#7a4513" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".6" />
          <circle cx="82" cy="34" r="16" fill="#f2a71b" stroke="#b56b0b" strokeWidth="3" />
          <circle cx="82" cy="34" r="9" fill="#ffc53d" />
          <circle cx="82" cy="34" r="3" fill="#f2a71b" />
          <circle cx="30" cy="96" r="3" fill="#f2a71b" /><circle cx="44" cy="100" r="2" fill="#f2a71b" /><circle cx="38" cy="92" r="1.6" fill="#f2a71b" />
        </svg>
      )
    case 'beetroot':
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`b${id}`} cx="0.35" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#d0436d" />
              <stop offset="1" stopColor="#6b1030" />
            </radialGradient>
          </defs>
          <path d="M60 40c-10-14-26-22-30-16-4 6 10 18 26 20z" fill="#4f8a3f" />
          <path d="M62 40c4-18 14-30 22-26 6 4-4 20-20 28z" fill="#5f9b4b" />
          <path d="M58 40c-2-12 0-24 4-28" stroke="#a4244b" strokeWidth="3" fill="none" />
          <path d="M60 40c22 0 38 14 34 34-4 18-22 26-34 34-12-8-30-16-34-34-4-20 12-34 34-34z" fill={`url(#b${id})`} />
          <path d="M60 108c0 4-1 8-3 10" stroke="#6b1030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="46" cy="60" rx="6" ry="10" fill="#fff" opacity=".18" />
        </svg>
      )
    case 'sandalwood':
      return (
        <svg {...common}>
          <rect x="16" y="54" width="70" height="30" rx="15" fill="#a87a4f" transform="rotate(-14 50 70)" />
          <ellipse cx="88" cy="58" rx="12" ry="15" fill="#e8c9a0" stroke="#8a5a32" strokeWidth="3" transform="rotate(-14 88 58)" />
          <ellipse cx="88" cy="58" rx="6" ry="8" fill="none" stroke="#b78a5c" strokeWidth="2" transform="rotate(-14 88 58)" />
          <rect x="22" y="80" width="62" height="24" rx="12" fill="#8a5a32" transform="rotate(8 52 92)" />
          <ellipse cx="84" cy="96" rx="10" ry="12" fill="#e2bf91" stroke="#6e4524" strokeWidth="3" transform="rotate(8 84 96)" />
          <circle cx="84" cy="96" r="4" fill="none" stroke="#b78a5c" strokeWidth="1.6" />
          <path d="M30 30c6-8 2-14 8-20M44 34c6-8 2-14 8-20" stroke="#b07d4f" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".55" />
        </svg>
      )
    case 'titepati':
      return (
        <svg {...common}>
          <path d="M60 112C58 80 62 46 70 10" stroke="#3a5f2f" strokeWidth="3" fill="none" strokeLinecap="round" />
          {[
            [64, 30, -40], [68, 46, 35], [62, 60, -38], [65, 76, 32], [60, 90, -34],
          ].map(([x, y, r], i) => (
            <path
              key={i}
              d="M0 0c10-10 26-12 38-6-4 2-6 6-10 6 2 2 4 4 4 6-4 0-8 0-10 2 0 2 2 4 0 6-8 0-16-4-22-14z"
              fill={i % 2 ? '#6f9f5a' : '#5d8a4e'}
              transform={`translate(${x} ${y}) rotate(${r}) ${r > 0 ? '' : 'scale(-1 1)'}`}
            />
          ))}
          <path d="M70 10c-6 2-8 8-6 12 6-2 8-8 6-12z" fill="#82b86b" />
        </svg>
      )
    case 'tulsi':
      return (
        <svg {...common}>
          <path d="M60 114V24" stroke="#4a6b33" strokeWidth="3" strokeLinecap="round" />
          {[
            [32, 1], [52, 1.2], [74, 1.35], [96, 1.1],
          ].map(([y, s], i) => (
            <g key={i}>
              <ellipse cx={60 - 14 * s} cy={y} rx={14 * s} ry={7 * s} fill="#3f7d3a" transform={`rotate(-24 ${60 - 14 * s} ${y})`} />
              <ellipse cx={60 + 14 * s} cy={y} rx={14 * s} ry={7 * s} fill="#4f8f44" transform={`rotate(24 ${60 + 14 * s} ${y})`} />
            </g>
          ))}
          <path d="M60 24c-2-6 0-12 2-16M60 24c4-4 8-6 12-6" stroke="#8a5a9e" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <circle cx="62" cy="8" r="2.4" fill="#9b6bb0" /><circle cx="72" cy="18" r="2.4" fill="#9b6bb0" />
        </svg>
      )
    case 'honey':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`h${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f8c14a" />
              <stop offset="1" stopColor="#d6820a" />
            </linearGradient>
          </defs>
          <path d="M84 12L50 62" stroke="#8a5a32" strokeWidth="5" strokeLinecap="round" />
          <g transform="rotate(34 42 74)">
            <rect x="26" y="56" width="32" height="36" rx="12" fill="#c08552" />
            <rect x="24" y="62" width="36" height="5" rx="2.5" fill="#8a5a32" />
            <rect x="24" y="72" width="36" height="5" rx="2.5" fill="#8a5a32" />
            <rect x="24" y="82" width="36" height="5" rx="2.5" fill="#8a5a32" />
          </g>
          <path d="M34 96c0 6-6 8-6 14a6 6 0 0012 0c0-6-6-8-6-14z" fill={`url(#h${id})`} />
          <path d="M88 70l10 6v12l-10 6-10-6V76z" fill="#f0a830" stroke="#b56b0b" strokeWidth="2" />
          <path d="M100 90l8 5v10l-8 5-8-5V95z" fill="#f8c14a" stroke="#b56b0b" strokeWidth="2" opacity=".8" />
        </svg>
      )
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M20 100C20 50 50 20 104 16c0 54-30 86-84 84z" fill="currentColor" />
          <path d="M20 100C44 76 66 52 96 24" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" />
        </svg>
      )
    case 'drop':
      return (
        <svg {...common}>
          <path d="M60 10C44 40 28 58 28 78a32 32 0 0064 0c0-20-16-38-32-68z" fill="currentColor" />
          <ellipse cx="48" cy="76" rx="6" ry="12" fill="#fff" opacity=".35" />
        </svg>
      )
    case 'flower':
      return (
        <svg {...common}>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="60" cy="34" rx="14" ry="24" fill="currentColor" transform={`rotate(${r} 60 60)`} opacity=".85" />
          ))}
          <circle cx="60" cy="60" r="11" fill="#f0a830" />
        </svg>
      )
    default:
      return null
  }
}

/** Maps a product to the illustration that best represents its hero ingredient. */
export const productIngredient = {
  turmeric: 'turmeric',
  beetroot: 'beetroot',
  sandalwood: 'sandalwood',
  titepati: 'titepati',
  honey: 'honey',
  'goatmilk-tulsi': 'tulsi',
  charcoal: 'leaf',
}

export function Logo({ className = '', light = false }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${light ? 'bg-cream/10 text-amber' : 'bg-forest text-amber'}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M12 2C7 6 5 10 5 13.5A7 7 0 0012 21a7 7 0 007-7.5C19 10 17 6 12 2zm0 17V9" />
          <path d="M12 19V9M12 13l-3-2M12 16l3-2" stroke={light ? '#1b4332' : '#fdfbf7'} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block font-serif text-lg font-bold tracking-wide ${light ? 'text-cream' : 'text-forest'}`}>TARU CARE</span>
        <span className={`block text-[10px] uppercase tracking-[0.3em] ${light ? 'text-cream/60' : 'text-slate-400'}`}>Herbal Soap</span>
      </span>
    </span>
  )
}
