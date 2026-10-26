import type { Size } from './geometry'

/** CSS pixels per unit, as browsers resolve SVG lengths (96 px per inch). */
const PX_PER_UNIT: Record<string, number> = {
  '': 1,
  px: 1,
  pt: 96 / 72,
  pc: 16,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  q: 96 / 101.6,
  em: 16,
  ex: 8,
}

/** Browsers fall back to 300×150 for replaced elements without a size. */
const DEFAULT_SIZE: Size = { width: 300, height: 150 }

/** Parses an SVG length such as "460.8pt" into CSS pixels. Percentages are not absolute, so they return null. */
export function parseLength(value: string | null | undefined): number | null {
  if (!value) return null
  const m = /^\s*\+?((?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*([a-z]*)\s*$/i.exec(value)
  if (!m) return null
  const factor = PX_PER_UNIT[m[2].toLowerCase()]
  if (factor === undefined) return null
  const px = parseFloat(m[1]) * factor
  return Number.isFinite(px) && px > 0 ? px : null
}

export function parseViewBox(value: string | null | undefined): Size | null {
  if (!value) return null
  const parts = value.trim().split(/[\s,]+/).map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null
  const [, , width, height] = parts
  return width > 0 && height > 0 ? { width, height } : null
}

/** Intrinsic size of an SVG in CSS pixels, from its root width/height/viewBox attributes. */
export function svgIntrinsicSize(attrs: {
  width?: string | null
  height?: string | null
  viewBox?: string | null
}): Size {
  const width = parseLength(attrs.width)
  const height = parseLength(attrs.height)
  if (width && height) return { width, height }
  const vb = parseViewBox(attrs.viewBox)
  if (vb) {
    if (width) return { width, height: (width * vb.height) / vb.width }
    if (height) return { width: (height * vb.width) / vb.height, height }
    return vb
  }
  return { width: width ?? DEFAULT_SIZE.width, height: height ?? DEFAULT_SIZE.height }
}

/** Pixel size an SVG is rendered at for a given import scale. */
export function scaledPixelSize(size: Size, scale: number): Size {
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  }
}
