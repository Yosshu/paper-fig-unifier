import { describe, expect, it } from 'vitest'
import { parseLength, parseViewBox, scaledPixelSize, svgIntrinsicSize } from './svgSize'

describe('parseLength', () => {
  it('converts absolute units to CSS pixels', () => {
    expect(parseLength('100')).toBe(100)
    expect(parseLength('100px')).toBe(100)
    expect(parseLength('72pt')).toBeCloseTo(96)
    expect(parseLength('1in')).toBe(96)
    expect(parseLength('25.4mm')).toBeCloseTo(96)
    expect(parseLength(' 2.54cm ')).toBeCloseTo(96)
    expect(parseLength('1e2')).toBe(100)
  })

  it('rejects relative, invalid or non-positive values', () => {
    expect(parseLength('100%')).toBeNull()
    expect(parseLength('auto')).toBeNull()
    expect(parseLength('0')).toBeNull()
    expect(parseLength('-5px')).toBeNull()
    expect(parseLength('10furlongs')).toBeNull()
    expect(parseLength(null)).toBeNull()
  })
})

describe('parseViewBox', () => {
  it('reads width and height', () => {
    expect(parseViewBox('0 0 460.8 345.6')).toEqual({ width: 460.8, height: 345.6 })
    expect(parseViewBox('-10,-10,200,100')).toEqual({ width: 200, height: 100 })
  })

  it('rejects malformed boxes', () => {
    expect(parseViewBox('0 0 100')).toBeNull()
    expect(parseViewBox('0 0 0 100')).toBeNull()
    expect(parseViewBox('a b c d')).toBeNull()
  })
})

describe('svgIntrinsicSize', () => {
  it('uses width and height when both are absolute (matplotlib style)', () => {
    const size = svgIntrinsicSize({ width: '460.8pt', height: '345.6pt', viewBox: '0 0 460.8 345.6' })
    expect(size.width).toBeCloseTo(614.4)
    expect(size.height).toBeCloseTo(460.8)
  })

  it('derives the missing side from the viewBox aspect ratio', () => {
    expect(svgIntrinsicSize({ width: '400', viewBox: '0 0 200 100' })).toEqual({ width: 400, height: 200 })
    expect(svgIntrinsicSize({ height: '50', viewBox: '0 0 200 100' })).toEqual({ width: 100, height: 50 })
  })

  it('falls back to the viewBox, then to 300×150', () => {
    expect(svgIntrinsicSize({ width: '100%', height: '100%', viewBox: '0 0 640 480' })).toEqual({ width: 640, height: 480 })
    expect(svgIntrinsicSize({})).toEqual({ width: 300, height: 150 })
  })
})

describe('scaledPixelSize', () => {
  it('rounds to whole pixels and never returns 0', () => {
    expect(scaledPixelSize({ width: 614.4, height: 460.8 }, 2)).toEqual({ width: 1229, height: 922 })
    expect(scaledPixelSize({ width: 0.2, height: 0.2 }, 1)).toEqual({ width: 1, height: 1 })
  })
})
