import { useId } from 'react'
import { ingredientLabels } from '../data'

// Deterministic pseudo-random so herb flecks look organic but stay stable between renders.
function seeded(seed) {
  let s = 0
  for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Rectangular handmade bar with embossed TARU / CARE stamp, modelled on the brochure.
export function SoapBar({ bar, seed = 'soap', className = '' }) {
  const id = useId().replace(/:/g, '')
  const rand = seeded(seed)
  const flecks = Array.from({ length: 40 }, () => ({
    x: 16 + rand() * 132,
    y: 52 + rand() * 82,
    r: 0.6 + rand() * 1.6,
    o: 0.2 + rand() * 0.4,
  })).filter((f) => ((f.x - 86) / 40) ** 2 + ((f.y - 90) / 26) ** 2 > 1)

  return (
    <svg viewBox="0 0 200 160" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`front-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bar.light} />
          <stop offset=".6" stopColor={bar.base} />
          <stop offset="1" stopColor={bar.dark} stopOpacity=".9" />
        </linearGradient>
        <linearGradient id={`top-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={bar.base} />
          <stop offset="1" stopColor={bar.light} />
        </linearGradient>
        <linearGradient id={`side-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={bar.dark} />
          <stop offset="1" stopColor={bar.dark} stopOpacity=".85" />
        </linearGradient>
        <filter id={`rough-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="table" tableValues="0 .18" /></feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <ellipse cx="96" cy="148" rx="86" ry="7" fill="#000" opacity=".16" />
      {/* top face */}
      <path d="M14 50 L42 26 H186 L158 50 Z" fill={`url(#top-${id})`} />
      {/* right side */}
      <path d="M158 50 L186 26 V118 L158 142 Z" fill={`url(#side-${id})`} />
      {/* front face */}
      <rect x="14" y="50" width="144" height="92" rx="3" fill={`url(#front-${id})`} />
      {flecks.map((f, i) => (
        <circle key={i} cx={f.x} cy={f.y} r={f.r} fill={bar.fleck} opacity={f.o} />
      ))}
      <rect x="14" y="50" width="144" height="92" rx="3" fill="#000" filter={`url(#rough-${id})`} />
      <path d="M14 50 L42 26 H186" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1" />
      {/* embossed stamp */}
      <g transform="translate(86 96)" opacity=".75">
        <g fill="none" stroke={bar.dark} strokeWidth="1.2">
          <path d="M0 -26c-4-5-3-10 0-13 3 3 4 8 0 13z" />
          <path d="M-2 -25c-6-2-10-6-10-10 5 0 9 3 10 10zM2 -25c6-2 10-6 10-10-5 0-9 3-10 10z" />
        </g>
        <text y="6" textAnchor="middle" fontFamily="Playfair Display, serif" fontWeight="700" fontSize="24" letterSpacing="1" fill={bar.dark} fillOpacity=".55" stroke="#fff" strokeOpacity=".25" strokeWidth=".6">
          TARU
        </text>
        <path d="M-26 14h14M12 14h14" stroke={bar.dark} strokeOpacity=".5" strokeWidth="1" />
        <text y="17" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="600" fontSize="7.5" letterSpacing="2.5" fill={bar.dark} fillOpacity=".55">
          CARE
        </text>
      </g>
    </svg>
  )
}

// Neem-style sprig: leaflets placed along a quadratic curve, alternating sides.
function Sprig({ from, ctrl, to, leaves = 9, color = '#4f7a3a' }) {
  const pt = (t) => [0, 1].map((k) => (1 - t) ** 2 * from[k] + 2 * (1 - t) * t * ctrl[k] + t ** 2 * to[k])
  const tan = (t) => [0, 1].map((k) => 2 * (1 - t) * (ctrl[k] - from[k]) + 2 * t * (to[k] - ctrl[k]))
  return (
    <g>
      <path d={`M${from} Q${ctrl} ${to}`} fill="none" stroke={color} strokeWidth="1.2" />
      {Array.from({ length: leaves }, (_, i) => {
        const t = 0.15 + (i / leaves) * 0.85
        const [x, y] = pt(t)
        const [dx, dy] = tan(t)
        const a = (Math.atan2(dy, dx) * 180) / Math.PI + (i % 2 ? 55 : -55)
        const len = 10 - i * 0.5
        return (
          <ellipse key={i} cx={x} cy={y} rx={len} ry={2.6} fill={i % 3 ? color : '#6d9a4e'} opacity=".9"
            transform={`rotate(${a} ${x} ${y}) translate(${len * 0.8} 0)`} />
        )
      })}
      <ellipse cx={to[0]} cy={to[1]} rx="7" ry="2.6" fill="#6d9a4e" transform={`rotate(-60 ${to[0]} ${to[1]})`} />
    </g>
  )
}

// Kraft-paper retail box modelled on the TARU CARE packaging, personalised per product.
export function SoapBox({ product, className = '' }) {
  const id = useId().replace(/:/g, '')
  const accent = product.bar?.base ?? '#8db35f'
  const title = (product.name || 'Herbal Soap').replace(/\s+soap$/i, '').toUpperCase()
  const titleSize = Math.min(17, 150 / (title.length * 0.66))
  const keys = product.ingredients ?? []
  const herbLine = keys.map((k) => ingredientLabels[k]?.toUpperCase()).filter(Boolean).join('  |  ') || 'PURE HERBAL INGREDIENTS'
  const ink = '#3b2a1c'
  const green = '#1f3d2b'

  return (
    <svg viewBox="0 0 320 270" className={className} role="img" aria-label={`${product.name} box`}>
      <defs>
        <filter id={`kraft-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4" />
          <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .33  0 0 0 0 .2  0 0 0 .22 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`wash-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="18" />
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <linearGradient id={`front-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4d3b2" />
          <stop offset="1" stopColor="#cfb88f" />
        </linearGradient>
        <clipPath id={`clip-${id}`}><rect x="40" y="40" width="262" height="210" /></clipPath>
        <path id={`seal-${id}`} d="M-15 0a15 15 0 1 1 30 0a15 15 0 1 1 -30 0" />
      </defs>

      <ellipse cx="170" cy="258" rx="150" ry="9" fill="#000" opacity=".22" />
      {/* top */}
      <path d="M40 40 L302 40 L286 24 L22 24 Z" fill="#dccaa7" />
      <ellipse cx="160" cy="32" rx="44" ry="5" fill="none" stroke={ink} strokeOpacity=".18" strokeWidth=".8" />
      <ellipse cx="160" cy="32" rx="30" ry="3.4" fill="none" stroke={ink} strokeOpacity=".15" strokeWidth=".6" />
      {/* side panel */}
      <path d="M22 24 L40 40 L40 250 L22 236 Z" fill={green} />
      <path d="M22 24 L40 40 L40 250 L22 236 Z" fill="#000" opacity=".15" />
      <text transform="translate(34 150) rotate(-90)" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="9" fontWeight="700" fill="#e8dcc2" letterSpacing="1.5">
        TARU care · Handcrafted by Nature
      </text>

      {/* front */}
      <g clipPath={`url(#clip-${id})`}>
        <rect x="40" y="40" width="262" height="210" fill={`url(#front-${id})`} />
        <rect x="40" y="40" width="262" height="210" fill="#000" filter={`url(#kraft-${id})`} />
        {/* watercolour wash in the product's colour */}
        <ellipse cx="270" cy="165" rx="52" ry="58" fill={accent} opacity=".45" filter={`url(#wash-${id})`} />
        <ellipse cx="290" cy="110" rx="26" ry="30" fill="#7fae5f" opacity=".35" filter={`url(#wash-${id})`} />
        <Sprig from={[52, 200]} ctrl={[58, 120]} to={[104, 64]} />
        {/* mortar & pestle sketch */}
        <g fill="none" stroke={ink} strokeOpacity=".35" strokeWidth=".9">
          <path d="M50 186 h34 q-2 18 -17 18 q-15 0 -17 -18z" />
          <path d="M60 204 h14 l2 5 h-18z" />
          <path d="M72 186 l14 -16 a3 3 0 0 1 4 4 l-12 14" />
        </g>
        {keys[0] && <g transform="translate(228 96) scale(.8)">{herbs[keys[0]]}</g>}
        {keys[1] && <g transform="translate(250 150) scale(.48)">{herbs[keys[1]]}</g>}
        <text x="290" y="58" textAnchor="end" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="6.5" fontWeight="600" fill={ink} letterSpacing="1">MADE IN</text>
        <text x="290" y="68" textAnchor="end" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="8" fontWeight="800" fill={ink} letterSpacing="1">NEPAL</text>

        {/* logo */}
        <g transform="translate(168 70)">
          <path d="M0 14 C-3 6 -1 -4 8 -12 C12 -3 9 8 0 14z" fill="#3e6b34" />
          <path d="M-1 14 C-10 13 -16 6 -15 -2 C-7 -1 -2 6 -1 14z" fill="none" stroke="#3e6b34" strokeWidth="1.4" />
          <path d="M2 14 C10 15 17 10 18 3 C10 2 4 8 2 14z" fill="#5c8d45" />
          <path d="M1 12 L6 -6" stroke="#e4d3b2" strokeWidth=".8" />
        </g>
        <text x="171" y="120" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="34" fontWeight="700" fill={ink} letterSpacing="2">TARU</text>
        <text x="171" y="140" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="19" fill={ink} letterSpacing="2">care</text>
        <path d="M110 153 h16 M216 153 h16" stroke={green} strokeWidth=".8" />
        <text x="171" y="156" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontSize="9" fill={green}>Handcrafted by Nature</text>
        <text x="171" y="172" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="6" fontWeight="600" fill={ink} letterSpacing="1.2">HANDMADE ARTISAN HERBAL SOAP</text>
        <text x="171" y={186 + titleSize * 0.15} textAnchor="middle" fontFamily="Playfair Display, serif" fontSize={titleSize} fontWeight="700" fill={green} letterSpacing=".5">{title}</text>
        <text x="171" y="203" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="5.8" fontWeight="700" fill={ink} letterSpacing=".8">{herbLine}</text>

        {/* badge band */}
        <rect x="40" y="212" width="262" height="2.5" fill={accent} />
        <rect x="40" y="214.5" width="262" height="36" fill={green} />
        {[['100%', 'NATURAL'], ['AYURVEDIC', 'GOODNESS'], ['COLD', 'PRESSED'], ['CRUELTY', 'FREE']].map(([a, b], i) => (
          <g key={a} transform={`translate(${70 + i * 46} 230)`} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="5.2" fontWeight="600" fill="#efe6d2" textAnchor="middle" letterSpacing=".5">
            <text y="0">{a}</text>
            <text y="7">{b}</text>
            {i < 3 && <path d="M23 -7 v16" stroke="#efe6d2" strokeOpacity=".3" strokeWidth=".6" />}
          </g>
        ))}
        {/* Himalaya seal */}
        <g transform="translate(272 222)">
          <circle r="21" fill="#2e2219" stroke="#c9a46a" strokeWidth="1" />
          <circle r="17.5" fill="none" stroke="#c9a46a" strokeOpacity=".5" strokeWidth=".5" />
          <path d="M-9 4 L-3 -4 L0 0 L4 -6 L10 4z" fill="#c9a46a" />
          <text fontFamily="Plus Jakarta Sans, sans-serif" fontSize="4.6" fontWeight="700" fill="#e8d7b5" letterSpacing=".6">
            <textPath href={`#seal-${id}`} startOffset="2%">INSPIRED BY ✦ HIMALAYAS ✦</textPath>
          </text>
        </g>
      </g>
      {/* edge highlight */}
      <path d="M40 40 L302 40" stroke="#fff" strokeOpacity=".35" />
    </svg>
  )
}

// Uploaded photo when the admin has added one, otherwise the illustrated retail box.
export function ProductVisual({ p, className = '' }) {
  return p.image ? (
    <img src={p.image} alt={p.name} className={`aspect-[4/3] w-full rounded-2xl object-cover ${className}`} loading="lazy" />
  ) : (
    <SoapBox product={p} className={`w-full ${className}`} />
  )
}

// Brand mark: leaf sprout over TARU / — CARE — / HERBAL SOAP
export function Logo({ className = '', light = false, compact = false }) {
  const ink = light ? '#fdfbf7' : '#1b4332'
  return (
    <div className={`flex flex-col items-center leading-none ${className}`} style={{ color: ink }}>
      <svg viewBox="0 0 40 24" className={compact ? 'h-3.5 w-6' : 'h-5 w-8'} aria-hidden="true">
        <path d="M20 22c-4-6-3-14 0-20 3 6 4 14 0 20z" fill={light ? '#95d5b2' : '#2d6a4f'} />
        <path d="M18 22C10 22 4 17 3 10c8 0 14 5 15 12z" fill={light ? '#d4a373' : '#3f7d5a'} />
        <path d="M22 22c8 0 14-5 15-12-8 0-14 5-15 12z" fill={light ? '#d4a373' : '#3f7d5a'} />
      </svg>
      <span className={`font-serif font-bold tracking-wide ${compact ? 'text-xl' : 'text-3xl'}`}>TARU</span>
      <span className={`flex items-center gap-1.5 font-semibold tracking-[0.3em] ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
        <span className="h-px w-3 bg-current opacity-60" />CARE<span className="h-px w-3 bg-current opacity-60" />
      </span>
    </div>
  )
}

export function Mountains({ className = '', color = '#fdfbf7' }) {
  return (
    <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M0 200 L120 120 L200 160 L330 60 L420 130 L520 80 L640 170 L760 40 L880 140 L980 90 L1100 160 L1220 70 L1340 140 L1440 100 V260 H0Z" fill={color} opacity=".18" />
      <path d="M330 60 L360 84 L344 80 L330 92 L316 78 L300 84Z M760 40 L796 70 L776 66 L760 78 L742 64 L724 70Z M1220 70 L1250 94 L1234 90 L1220 100 L1206 88 L1192 94Z" fill="#fdfbf7" opacity=".5" />
      <path d="M0 230 L160 170 L300 210 L460 150 L620 215 L800 160 L960 220 L1120 170 L1280 215 L1440 180 V260 H0Z" fill={color} opacity=".1" />
    </svg>
  )
}

const herbs = {
  turmeric: (
    <>
      <path d="M18 60c-4-10 4-18 14-16 6-8 18-8 24-2 8-4 18 0 20 8 8 2 10 12 4 18-4 6-14 6-20 4-6 6-18 6-24 0-10 4-18-2-18-12z" fill="#c98a2e" />
      <path d="M30 50c2 4 8 4 10 0M56 46c2 4 6 4 8 0M44 66c2 4 8 4 10 0" stroke="#8a5a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="74" cy="70" r="16" fill="#b8741c" />
      <circle cx="74" cy="70" r="13" fill="#f2a516" />
      <circle cx="74" cy="70" r="7" fill="#f8c445" />
    </>
  ),
  beetroot: (
    <>
      <path d="M50 30c-6-12-16-18-24-16 2 10 10 16 22 18z" fill="#3f8f4a" />
      <path d="M52 30c4-14 14-20 24-20-2 12-10 18-22 22z" fill="#2f7a3c" />
      <path d="M50 32v-6" stroke="#8c2049" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="56" r="24" fill="#a8325e" />
      <path d="M50 80c0 6-2 10-4 14" stroke="#8c2049" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="42" cy="48" rx="7" ry="10" fill="#cf5c86" opacity=".6" />
    </>
  ),
  sandalwood: (
    <>
      <rect x="16" y="58" width="68" height="12" rx="4" fill="#c69a6b" transform="rotate(-18 50 64)" />
      <rect x="18" y="44" width="64" height="12" rx="4" fill="#d9b48a" transform="rotate(8 50 50)" />
      <path d="M26 46c12 2 24 6 46 6M24 66c16-4 30-8 48-14" stroke="#a37a4e" strokeWidth="1.2" fill="none" opacity=".7" />
      <circle cx="30" cy="82" r="5" fill="#e3c39c" />
      <circle cx="44" cy="86" r="3.5" fill="#c69a6b" />
      <circle cx="68" cy="82" r="4" fill="#d9b48a" />
    </>
  ),
  titepati: (
    <>
      <path d="M50 92V20" stroke="#4a6b3a" strokeWidth="3" strokeLinecap="round" />
      {[
        [50, 30, -1], [50, 30, 1], [50, 48, -1], [50, 48, 1], [50, 66, -1], [50, 66, 1],
      ].map(([x, y, d], i) => (
        <path
          key={i}
          d={`M${x} ${y}c${d * 8}-6 ${d * 16}-6 ${d * 22}-2c${-d * 4} 2 ${-d * 4} 4 ${-d * 1} 6c${-d * 6} 0 ${-d * 8} 2 ${-d * 8} 4c${-d * 6}-2 ${-d * 10}-2 ${-d * 13}-8z`}
          fill={i % 2 ? '#7aa865' : '#93bf7c'}
        />
      ))}
      <path d="M50 20c-4-6 0-12 0-12s4 6 0 12z" fill="#93bf7c" />
    </>
  ),
  tulsi: (
    <>
      <path d="M50 94c0-24 2-44 0-66" stroke="#6b4a6e" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="34" cy="62" rx="16" ry="9" fill="#4f9a5e" transform="rotate(-25 34 62)" />
      <ellipse cx="66" cy="56" rx="16" ry="9" fill="#3f8a50" transform="rotate(25 66 56)" />
      <ellipse cx="38" cy="40" rx="13" ry="7" fill="#6ab27a" transform="rotate(-35 38 40)" />
      <ellipse cx="62" cy="36" rx="13" ry="7" fill="#5aa66b" transform="rotate(35 62 36)" />
      <path d="M50 28c-3-8 0-16 0-16s3 8 0 16z" fill="#8a5c8e" />
      <path d="M22 66l24-6M78 60l-24-6" stroke="#2f6b3c" strokeWidth="1" opacity=".6" />
    </>
  ),
  honey: (
    <>
      {[[34, 40], [54, 40], [44, 57], [24, 57], [64, 57], [34, 74], [54, 74]].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 10}l9 5v10l-9 5-9-5v-10z`}
          fill={i % 3 === 0 ? '#f0bf55' : '#e0a332'}
          stroke="#b97a14"
          strokeWidth="1.5"
        />
      ))}
      <path d="M78 22v26" stroke="#8a5a1a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="78" cy="54" rx="7" ry="9" fill="#d99a2b" />
      <path d="M78 63c0 6-3 8-3 12a3 3 0 006 0c0-4-3-6-3-12z" fill="#f0bf55" />
    </>
  ),
  milk: (
    <>
      <path d="M50 14C36 36 28 48 28 62a22 22 0 0044 0c0-14-8-26-22-48z" fill="#fbf7ee" stroke="#d8ccb2" strokeWidth="2" />
      <ellipse cx="42" cy="58" rx="5" ry="9" fill="#fff" />
    </>
  ),
  charcoal: (
    <>
      <path d="M22 66l10-20 18-4 12 14-6 18-22 4z" fill="#2a2c2e" />
      <path d="M52 50l18-10 14 12-4 18-16 2z" fill="#3b3e41" />
      <path d="M32 46l18-4M62 56l-6 18" stroke="#6b7075" strokeWidth="1.2" opacity=".7" />
    </>
  ),
}

export function Ingredient({ name, className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {herbs[name]}
    </svg>
  )
}

export function LeafShape({ className = '', fill = 'currentColor' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M4 36C4 18 16 6 36 4c0 20-12 32-32 32z" fill={fill} />
      <path d="M6 34L28 12" stroke="#000" strokeOpacity=".2" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
