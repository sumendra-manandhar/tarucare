// Derive the four soap-bar shades from one base colour so admins only pick one swatch.
const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb) => `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`
const mix = (hex, target, amt) => toHex(toRgb(hex).map((c, i) => c + (target[i] - c) * amt))

export function barFromBase(base) {
  return {
    base,
    light: mix(base, [255, 255, 255], 0.25),
    dark: mix(base, [0, 0, 0], 0.28),
    fleck: mix(base, [0, 0, 0], 0.5),
  }
}
