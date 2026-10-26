import { ANCHORS, type Anchor, type SizeMode } from './geometry'
import type { Naming, OutputFormat } from './filenames'

export type Lang = 'ja' | 'en'
export type Fill = 'white' | 'transparent' | 'custom'

export interface Settings {
  lang: Lang
  sizeMode: SizeMode
  customWidth: number
  customHeight: number
  anchor: Anchor
  fill: Fill
  fillColor: string
  svgScale: number
  format: OutputFormat
  jpgQuality: number
  naming: Naming
  suffix: string
  prefix: string
}

export const SVG_SCALES = [1, 2, 3, 4] as const
export const MAX_SIDE = 20000
/** Safari refuses canvases above 16,777,216 pixels; other browsers allow more. */
export const SAFE_CANVAS_PIXELS = 16_777_216

const STORAGE_KEY = 'paper-fig-unifier:settings:v1'

export function detectLang(languages: readonly string[]): Lang {
  for (const l of languages) {
    const code = l.toLowerCase()
    if (code.startsWith('ja')) return 'ja'
    if (code.startsWith('en')) return 'en'
  }
  return 'en'
}

export function defaultSettings(lang: Lang): Settings {
  return {
    lang,
    sizeMode: 'min',
    customWidth: 1000,
    customHeight: 750,
    anchor: { x: 0.5, y: 0.5 },
    fill: 'white',
    fillColor: '#ffffff',
    svgScale: 2,
    format: 'original',
    jpgQuality: 95,
    naming: 'suffix',
    suffix: '_crop',
    prefix: 'fig1',
  }
}

const oneOf =
  <T extends string | number>(values: readonly T[]) =>
  (v: unknown): v is T =>
    values.includes(v as T)

const isSide = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= MAX_SIDE
const isQuality = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 50 && (v as number) <= 100
const isColor = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.length <= 100
const isAnchor = (v: unknown): v is Anchor =>
  typeof v === 'object' && v !== null && ANCHORS.some((a) => a.x === (v as Anchor).x && a.y === (v as Anchor).y)

/** Keeps every valid field of `raw` and falls back to `defaults` for the rest. */
export function sanitizeSettings(raw: unknown, defaults: Settings): Settings {
  if (typeof raw !== 'object' || raw === null) return defaults
  const r = raw as Record<string, unknown>
  const take = <K extends keyof Settings>(key: K, valid: (v: unknown) => v is Settings[K]): Settings[K] =>
    valid(r[key]) ? r[key] : defaults[key]
  const anchor = take('anchor', isAnchor)
  return {
    lang: take('lang', oneOf<Lang>(['ja', 'en'])),
    sizeMode: take('sizeMode', oneOf<SizeMode>(['min', 'max', 'custom'])),
    customWidth: take('customWidth', isSide),
    customHeight: take('customHeight', isSide),
    anchor: { x: anchor.x, y: anchor.y },
    fill: take('fill', oneOf<Fill>(['white', 'transparent', 'custom'])),
    fillColor: take('fillColor', isColor),
    svgScale: take('svgScale', oneOf<number>(SVG_SCALES)),
    format: take('format', oneOf<OutputFormat>(['original', 'png', 'jpg'])),
    jpgQuality: take('jpgQuality', isQuality),
    naming: take('naming', oneOf<Naming>(['suffix', 'sequence'])),
    suffix: take('suffix', isText),
    prefix: take('prefix', isText),
  }
}

export function loadSettings(): Settings {
  const defaults = defaultSettings(detectLang(typeof navigator === 'undefined' ? [] : navigator.languages))
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? sanitizeSettings(JSON.parse(stored), defaults) : defaults
  } catch {
    return defaults
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage can be unavailable (private mode, blocked site data); settings then last for the session only.
  }
}
