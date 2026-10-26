import { describe, expect, it } from 'vitest'
import {
  ANCHORS,
  computeCrop,
  cropEdges,
  needsPadding,
  offsetForPosition,
  resolveTargetSize,
  type Anchor,
} from './geometry'

const center: Anchor = { x: 0.5, y: 0.5 }
const topLeft: Anchor = { x: 0, y: 0 }
const bottomRight: Anchor = { x: 1, y: 1 }

describe('resolveTargetSize', () => {
  const sizes = [
    { width: 820, height: 610 },
    { width: 760, height: 640 },
    { width: 900, height: 580 },
  ]
  const custom = { width: 500, height: 400 }

  it('takes the smallest width and height independently', () => {
    expect(resolveTargetSize(sizes, 'min', custom)).toEqual({ width: 760, height: 580 })
  })

  it('takes the largest width and height independently', () => {
    expect(resolveTargetSize(sizes, 'max', custom)).toEqual({ width: 900, height: 640 })
  })

  it('returns the custom size in custom mode or when there are no images', () => {
    expect(resolveTargetSize(sizes, 'custom', custom)).toEqual(custom)
    expect(resolveTargetSize([], 'min', custom)).toEqual(custom)
  })
})

describe('computeCrop', () => {
  const src = { width: 820, height: 610 }
  const out = { width: 640, height: 580 }

  it('centers the window for the center anchor', () => {
    expect(computeCrop(src, out, center)).toMatchObject({ x: 90, y: 15 })
  })

  it('places the window by the anchor on each axis', () => {
    expect(computeCrop(src, out, topLeft)).toMatchObject({ x: 0, y: 0 })
    expect(computeCrop(src, out, bottomRight)).toMatchObject({ x: 180, y: 30 })
  })

  it('applies the offset but keeps the window inside a larger image', () => {
    expect(computeCrop(src, out, center, { dx: 20, dy: -5 })).toMatchObject({ x: 110, y: 10 })
    expect(computeCrop(src, out, center, { dx: 1000, dy: -1000 })).toMatchObject({ x: 180, y: 0 })
  })

  it('pads around an image smaller than the output', () => {
    const small = { width: 600, height: 500 }
    expect(computeCrop(small, out, center)).toMatchObject({ x: -20, y: -40 })
    expect(computeCrop(small, out, topLeft)).toMatchObject({ x: 0, y: 0 })
    expect(computeCrop(small, out, bottomRight)).toMatchObject({ x: -40, y: -80 })
    // The image may move inside the window, but never out of it.
    expect(computeCrop(small, out, center, { dx: -100, dy: 100 })).toMatchObject({ x: -40, y: 0 })
  })

  it('returns whole pixels', () => {
    const odd = { width: 641, height: 581 }
    const c = computeCrop(odd, out, center, { dx: 0.4, dy: 0.6 })
    expect(Number.isInteger(c.x)).toBe(true)
    expect(Number.isInteger(c.y)).toBe(true)
  })

  it('never crops when the image already has the output size', () => {
    for (const a of ANCHORS) {
      expect(computeCrop(out, out, a, { dx: 50, dy: 50 })).toMatchObject({ x: 0, y: 0 })
    }
  })
})

describe('offsetForPosition', () => {
  const src = { width: 820, height: 610 }
  const out = { width: 640, height: 580 }

  it('returns the offset that reaches the requested position', () => {
    const off = offsetForPosition(src, out, center, 100, 0)
    expect(off).toEqual({ dx: 10, dy: -15 })
    expect(computeCrop(src, out, center, off)).toMatchObject({ x: 100, y: 0 })
  })

  it('clamps the requested position', () => {
    const off = offsetForPosition(src, out, center, -50, 999)
    expect(computeCrop(src, out, center, off)).toMatchObject({ x: 0, y: 30 })
    expect(off).toEqual({ dx: -90, dy: 15 })
  })
})

describe('cropEdges / needsPadding', () => {
  const out = { width: 640, height: 580 }

  it('reports cropped pixels as positive and padding as negative', () => {
    const src = { width: 820, height: 560 }
    const crop = computeCrop(src, out, center)
    expect(cropEdges(src, out, crop)).toEqual({ left: 90, right: 90, top: -10, bottom: -10 })
    expect(needsPadding(src, out)).toBe(true)
  })

  it('needs no padding when the image covers the output', () => {
    expect(needsPadding({ width: 640, height: 600 }, out)).toBe(false)
  })
})
