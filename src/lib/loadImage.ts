import type { Size } from './geometry'
import type { SourceKind } from './filenames'
import { scaledPixelSize, svgIntrinsicSize } from './svgSize'

export interface SourceImage {
  id: string
  name: string
  kind: SourceKind
  /** Pixel size for PNG/JPG; CSS-pixel size at ×1 for SVG. */
  baseSize: Size
  /** Object URL shown in the preview. */
  url: string
  /** Root element of the SVG, cloned when rendering at a scale. */
  svg?: SVGSVGElement
}

const EXTENSIONS: Record<string, SourceKind> = { png: 'png', jpg: 'jpg', jpeg: 'jpg', svg: 'svg' }
const MIME_TYPES: Record<string, SourceKind> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg' }

export const ACCEPT = '.png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml'

export function detectKind(file: File): SourceKind | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return MIME_TYPES[file.type] ?? EXTENSIONS[ext] ?? null
}

/** Pixel size the image is cropped from. */
export function pixelSize(source: SourceImage, svgScale: number): Size {
  return source.kind === 'svg' ? scaledPixelSize(source.baseSize, svgScale) : source.baseSize
}

let nextId = 1

async function decode(url: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  await img.decode()
  return img
}

/**
 * Serializes the SVG with an explicit pixel size. A viewBox is added when
 * missing so that the drawing scales with the new width and height.
 */
function svgMarkup(root: SVGSVGElement, base: Size, size: Size): string {
  const clone = root.cloneNode(true) as SVGSVGElement
  if (!clone.hasAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`)
  clone.setAttribute('width', String(size.width))
  clone.setAttribute('height', String(size.height))
  return new XMLSerializer().serializeToString(clone)
}

const svgUrl = (markup: string) => URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))

export async function loadSourceImage(file: File, kind: SourceKind): Promise<SourceImage> {
  const id = `img-${nextId++}`
  if (kind === 'svg') {
    const doc = new DOMParser().parseFromString(await file.text(), 'image/svg+xml')
    const root = doc.documentElement
    if (doc.getElementsByTagName('parsererror').length > 0 || root.localName !== 'svg') {
      throw new Error('Not an SVG document')
    }
    const svg = root as unknown as SVGSVGElement
    const baseSize = svgIntrinsicSize({
      width: svg.getAttribute('width'),
      height: svg.getAttribute('height'),
      viewBox: svg.getAttribute('viewBox'),
    })
    const url = svgUrl(svgMarkup(svg, baseSize, baseSize))
    try {
      await decode(url)
    } catch (err) {
      URL.revokeObjectURL(url)
      throw err
    }
    return { id, name: file.name, kind, baseSize, url, svg }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = await decode(url)
    return { id, name: file.name, kind, baseSize: { width: img.naturalWidth, height: img.naturalHeight }, url }
  } catch (err) {
    URL.revokeObjectURL(url)
    throw err
  }
}

/** A decoded image at the exact pixel size it is cropped from. Call `release` when done. */
export async function loadDrawable(
  source: SourceImage,
  svgScale: number,
): Promise<{ image: HTMLImageElement; size: Size; release: () => void }> {
  const size = pixelSize(source, svgScale)
  if (source.kind !== 'svg' || !source.svg) {
    return { image: await decode(source.url), size, release: () => {} }
  }
  const url = svgUrl(svgMarkup(source.svg, source.baseSize, size))
  try {
    return { image: await decode(url), size, release: () => URL.revokeObjectURL(url) }
  } catch (err) {
    URL.revokeObjectURL(url)
    throw err
  }
}
