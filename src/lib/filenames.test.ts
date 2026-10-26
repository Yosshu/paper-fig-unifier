import { describe, expect, it } from 'vitest'
import { buildOutputNames, outputExtension, sanitizeFilePart, splitExtension, subfigureLabel } from './filenames'

describe('subfigureLabel', () => {
  it('counts a…z then aa, ab', () => {
    expect([0, 1, 25, 26, 27, 51, 52].map(subfigureLabel)).toEqual(['a', 'b', 'z', 'aa', 'ab', 'az', 'ba'])
  })
})

describe('splitExtension', () => {
  it('splits the last extension and lowercases it', () => {
    expect(splitExtension('fig.v2.PNG')).toEqual({ stem: 'fig.v2', ext: 'png' })
    expect(splitExtension('noext')).toEqual({ stem: 'noext', ext: '' })
    expect(splitExtension('.hidden')).toEqual({ stem: '.hidden', ext: '' })
  })
})

describe('sanitizeFilePart', () => {
  it('drops characters invalid in file names', () => {
    expect(sanitizeFilePart(' a/b\\c:d*e?f"g<h>i|j ')).toBe('abcdefghij')
  })
})

describe('outputExtension', () => {
  it('keeps the original type, except SVG which becomes PNG', () => {
    expect(outputExtension('png', 'original', 'png')).toBe('png')
    expect(outputExtension('jpg', 'original', 'jpeg')).toBe('jpeg')
    expect(outputExtension('jpg', 'original', 'jpg')).toBe('jpg')
    expect(outputExtension('svg', 'original', 'svg')).toBe('png')
  })

  it('follows an explicit format', () => {
    expect(outputExtension('svg', 'jpg', 'svg')).toBe('jpg')
    expect(outputExtension('jpg', 'png', 'jpg')).toBe('png')
  })
})

describe('buildOutputNames', () => {
  const items = [
    { name: 'a_loss.png', kind: 'png' as const },
    { name: 'b_tsne.svg', kind: 'svg' as const },
    { name: 'c_attn.jpeg', kind: 'jpg' as const },
  ]

  it('appends the suffix to the original name', () => {
    expect(buildOutputNames(items, { naming: 'suffix', suffix: '_crop', prefix: '', format: 'original' })).toEqual([
      'a_loss_crop.png',
      'b_tsne_crop.png',
      'c_attn_crop.jpeg',
    ])
  })

  it('numbers files with the prefix', () => {
    expect(buildOutputNames(items, { naming: 'sequence', suffix: '', prefix: 'fig3', format: 'png' })).toEqual([
      'fig3_a.png',
      'fig3_b.png',
      'fig3_c.png',
    ])
    expect(buildOutputNames(items, { naming: 'sequence', suffix: '', prefix: '', format: 'jpg' })).toEqual([
      'a.jpg',
      'b.jpg',
      'c.jpg',
    ])
  })

  it('makes clashing names unique', () => {
    const clash = [
      { name: 'plot.png', kind: 'png' as const },
      { name: 'plot.svg', kind: 'svg' as const },
      { name: 'PLOT.png', kind: 'png' as const },
    ]
    expect(buildOutputNames(clash, { naming: 'suffix', suffix: '', prefix: '', format: 'original' })).toEqual([
      'plot.png',
      'plot-2.png',
      'PLOT-3.png',
    ])
  })
})
