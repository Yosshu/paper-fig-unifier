import { zipSync, type Zippable } from 'fflate'
import type { Size } from './geometry'
import { loadDrawable, type SourceImage } from './loadImage'

export interface RenderOptions {
  out: Size
  /** Output window position in source pixels (negative = padding). */
  x: number
  y: number
  svgScale: number
  mime: 'image/png' | 'image/jpeg'
  /** 0–1, used for JPEG only. */
  quality: number
  /** Padding color, or null for transparent. */
  fill: string | null
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))), mime, quality)
  })
}

/** Copies the output window out of the source at 1:1, so pixels are never resampled. */
export async function renderCrop(source: SourceImage, opts: RenderOptions): Promise<Blob> {
  const { image, size, release } = await loadDrawable(source, opts.svgScale)
  const canvas = document.createElement('canvas')
  try {
    canvas.width = opts.out.width
    canvas.height = opts.out.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    const left = -opts.x
    const top = -opts.y
    if (opts.mime === 'image/jpeg') {
      // JPEG has no alpha, so everything transparent (padding included) gets the fill color.
      ctx.fillStyle = opts.fill ?? '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (opts.fill) {
      // Fill only the padding so a PNG keeps its own transparency.
      ctx.fillStyle = opts.fill
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.clearRect(left, top, size.width, size.height)
    }
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(image, left, top, size.width, size.height)
    return await canvasToBlob(canvas, opts.mime, opts.quality)
  } finally {
    release()
    // Release the backing store right away; large canvases add up quickly.
    canvas.width = 0
    canvas.height = 0
  }
}

export function zipFiles(files: readonly { name: string; data: Uint8Array }[]): Blob {
  const entries: Zippable = {}
  // PNG and JPEG are already compressed, so they are stored as-is.
  for (const f of files) entries[f.name] = [f.data, { level: 0 }]
  return new Blob([zipSync(entries).slice()], { type: 'application/zip' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export interface ExportJob {
  source: SourceImage
  name: string
  mime: RenderOptions['mime']
  x: number
  y: number
}

export interface ExportOptions {
  out: Size
  svgScale: number
  quality: number
  fill: string | null
  zipName: string
}

/** Renders every job one at a time (to bound memory), then downloads them as one ZIP. */
export async function exportAll(
  jobs: readonly ExportJob[],
  opts: ExportOptions,
  onProgress: (done: number) => void,
): Promise<{ ok: true } | { ok: false; failed: string }> {
  const files: { name: string; data: Uint8Array }[] = []
  for (const [i, job] of jobs.entries()) {
    let blob: Blob
    try {
      blob = await renderCrop(job.source, {
        out: opts.out,
        x: job.x,
        y: job.y,
        svgScale: opts.svgScale,
        mime: job.mime,
        quality: opts.quality,
        fill: opts.fill,
      })
    } catch {
      return { ok: false, failed: job.name }
    }
    files.push({ name: job.name, data: new Uint8Array(await blob.arrayBuffer()) })
    onProgress(i + 1)
  }
  downloadBlob(zipFiles(files), opts.zipName)
  return { ok: true }
}
