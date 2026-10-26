/**
 * Crop geometry. Everything here is pure and works in source-image pixels.
 *
 * The output window (W×H) is placed on the source image (w×h) by an anchor,
 * optionally nudged by a per-image offset. The window is clamped so that it
 * never moves further than necessary:
 *   - source larger than output on an axis  → window stays inside the image (pure crop)
 *   - source smaller than output on an axis → image stays inside the window (padding)
 */

export interface Size {
  width: number
  height: number
}

/** 0 = left/top, 0.5 = center, 1 = right/bottom. */
export type AnchorPos = 0 | 0.5 | 1

export interface Anchor {
  x: AnchorPos
  y: AnchorPos
}

/** Per-image adjustment relative to the anchored position, in source pixels. */
export interface Offset {
  dx: number
  dy: number
}

export type SizeMode = 'min' | 'max' | 'custom'

/** The nine anchors in reading order (top-left … bottom-right). */
export const ANCHORS: readonly Anchor[] = [
  { x: 0, y: 0 },
  { x: 0.5, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 0.5 },
  { x: 0.5, y: 0.5 },
  { x: 1, y: 0.5 },
  { x: 0, y: 1 },
  { x: 0.5, y: 1 },
  { x: 1, y: 1 },
]

export const ZERO_OFFSET: Offset = { dx: 0, dy: 0 }

export interface Crop {
  /** Left edge of the output window in source pixels. Negative means padding on the left. */
  x: number
  /** Top edge of the output window in source pixels. Negative means padding on the top. */
  y: number
  /** Position from the anchor alone, before the offset. */
  baseX: number
  baseY: number
}

/** Pixels removed (> 0) or added as padding (< 0) on each side. */
export interface Edges {
  left: number
  right: number
  top: number
  bottom: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

function placeAxis(src: number, out: number, anchor: number, offset: number) {
  const base = Math.round((src - out) * anchor)
  const lo = Math.min(0, src - out)
  const hi = Math.max(0, src - out)
  return { base, pos: clamp(base + Math.round(offset), lo, hi) }
}

/** Output size for a set of images. `min` guarantees that every image only needs cropping. */
export function resolveTargetSize(sizes: readonly Size[], mode: SizeMode, custom: Size): Size {
  if (mode === 'custom' || sizes.length === 0) return custom
  const pick = mode === 'min' ? Math.min : Math.max
  return {
    width: pick(...sizes.map((s) => s.width)),
    height: pick(...sizes.map((s) => s.height)),
  }
}

export function computeCrop(src: Size, out: Size, anchor: Anchor, offset: Offset = ZERO_OFFSET): Crop {
  const h = placeAxis(src.width, out.width, anchor.x, offset.dx)
  const v = placeAxis(src.height, out.height, anchor.y, offset.dy)
  return { x: h.pos, y: v.pos, baseX: h.base, baseY: v.base }
}

/** The offset that moves the window as close as allowed to (x, y). */
export function offsetForPosition(src: Size, out: Size, anchor: Anchor, x: number, y: number): Offset {
  const base = computeCrop(src, out, anchor)
  const crop = computeCrop(src, out, anchor, { dx: x - base.x, dy: y - base.y })
  return { dx: crop.x - crop.baseX, dy: crop.y - crop.baseY }
}

export function cropEdges(src: Size, out: Size, crop: Pick<Crop, 'x' | 'y'>): Edges {
  return {
    left: crop.x,
    right: src.width - out.width - crop.x,
    top: crop.y,
    bottom: src.height - out.height - crop.y,
  }
}

export function needsPadding(src: Size, out: Size): boolean {
  return src.width < out.width || src.height < out.height
}
