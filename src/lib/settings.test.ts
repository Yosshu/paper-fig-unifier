import { describe, expect, it } from 'vitest'
import { defaultSettings, detectLang, sanitizeSettings } from './settings'

describe('detectLang', () => {
  it('picks the first supported language', () => {
    expect(detectLang(['ja-JP', 'en-US'])).toBe('ja')
    expect(detectLang(['fr-FR', 'en-GB', 'ja'])).toBe('en')
    expect(detectLang(['de-DE'])).toBe('en')
    expect(detectLang([])).toBe('en')
  })
})

describe('sanitizeSettings', () => {
  const defaults = defaultSettings('ja')

  it('returns the defaults for non-objects', () => {
    expect(sanitizeSettings(null, defaults)).toEqual(defaults)
    expect(sanitizeSettings('x', defaults)).toEqual(defaults)
  })

  it('keeps valid fields', () => {
    const raw = { ...defaults, lang: 'en', sizeMode: 'custom', customWidth: 1200, anchor: { x: 1, y: 0 }, svgScale: 3 }
    expect(sanitizeSettings(raw, defaults)).toEqual(raw)
  })

  it('replaces invalid fields with defaults and drops unknown keys', () => {
    const raw = {
      lang: 'fr',
      customWidth: 0,
      customHeight: 1.5,
      anchor: { x: 0.3, y: 0 },
      fillColor: 'red',
      svgScale: 10,
      jpgQuality: 20,
      suffix: 42,
      extra: true,
    }
    expect(sanitizeSettings(raw, defaults)).toEqual(defaults)
  })
})
