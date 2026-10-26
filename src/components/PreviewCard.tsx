import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { useMessages } from '../i18n'
import { cropEdges, needsPadding, type Crop, type Size } from '../lib/geometry'
import type { SourceImage } from '../lib/loadImage'
import { IconClose, IconReset } from './icons'

export type View = 'crop' | 'result'

/** A fill color, or null for transparent (drawn as a checkerboard). */
export type Backdrop = string | null

interface PreviewCardProps {
  label: string
  source: SourceImage
  svgScale: number
  /** Pixel size the image is cropped from. */
  size: Size
  target: Size
  crop: Crop
  /** Widest crop-view stage among all cards, in source pixels; keeps every card at the same scale. */
  refWidth: number
  view: View
  padding: Backdrop
  /** What shows through transparent pixels of the image itself in the result. */
  imageBackdrop: Backdrop
  adjusted: boolean
  onMove: (x: number, y: number) => void
  onReset: () => void
  onRemove: () => void
}

const pct = (value: number, total: number) => `${(value / total) * 100}%`

const KEY_STEPS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

function backdropProps(backdrop: Backdrop, base: string): { className: string; style: CSSProperties } {
  return backdrop === null
    ? { className: `${base} checker`, style: {} }
    : { className: base, style: { backgroundColor: backdrop } }
}

export function PreviewCard(p: PreviewCardProps) {
  const t = useMessages()
  const { size, target, crop } = p
  const drag = useRef<{ id: number; x: number; y: number; cropX: number; cropY: number; kx: number; ky: number } | null>(null)

  // The crop view shows the union of the image and the output window.
  const sx0 = Math.min(0, crop.x)
  const sy0 = Math.min(0, crop.y)
  const sw = Math.max(size.width, crop.x + target.width) - sx0
  const sh = Math.max(size.height, crop.y + target.height) - sy0
  const isCrop = p.view === 'crop'
  const box = isCrop
    ? { w: sw, h: sh, left: -sx0, top: -sy0 }
    : { w: target.width, h: target.height, left: -crop.x, top: -crop.y }

  // On an axis where the image is smaller than the output, the frame fills the stage and
  // dragging moves the image instead, so the window moves the opposite way.
  const signX = size.width >= target.width ? 1 : -1
  const signY = size.height >= target.height ? 1 : -1

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    const stage = e.currentTarget.parentElement?.getBoundingClientRect()
    if (!stage || stage.width === 0 || stage.height === 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
      kx: (sw / stage.width) * signX,
      ky: (sh / stage.height) * signY,
    }
  }
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    p.onMove(Math.round(d.cropX + (e.clientX - d.x) * d.kx), Math.round(d.cropY + (e.clientY - d.y) * d.ky))
  }
  const endDrag = () => {
    drag.current = null
  }
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = KEY_STEPS[e.key]
    if (!step) return
    e.preventDefault()
    const n = e.shiftKey ? 10 : 1
    p.onMove(crop.x + step[0] * n * signX, crop.y + step[1] * n * signY)
  }

  const edges = cropEdges(size, target, crop)
  const edgeValues = [edges.left, edges.right, edges.top, edges.bottom]
  const padded = needsPadding(size, target)
  const tag = p.source.kind === 'svg' ? `SVG ×${p.svgScale}` : p.source.kind.toUpperCase()
  const stage = isCrop ? { className: 'stage hatch', style: {} } : backdropProps(p.padding, 'stage')
  const image = backdropProps(isCrop ? null : p.imageBackdrop, 'stage-img')

  return (
    <article className="card">
      <header className="card-head">
        <span className="card-label mono">({p.label})</span>
        <span className="card-name" title={p.source.name}>
          {p.source.name}
        </span>
        <span className="tag mono">{tag}</span>
        <button
          type="button"
          className="icon-btn"
          aria-label={t.removeImage(p.source.name)}
          title={t.removeImage(p.source.name)}
          onClick={p.onRemove}
        >
          <IconClose />
        </button>
      </header>

      <div className="stage-wrap">
        <div
          className={stage.className}
          style={{ ...stage.style, width: pct(box.w, p.refWidth), aspectRatio: `${box.w} / ${box.h}` }}
        >
          <img
            src={p.source.url}
            alt=""
            draggable={false}
            className={image.className}
            style={{
              ...image.style,
              left: pct(box.left, box.w),
              top: pct(box.top, box.h),
              width: pct(size.width, box.w),
              height: pct(size.height, box.h),
            }}
          />
          {isCrop && (
            <button
              type="button"
              className="frame"
              aria-label={t.cropFrameLabel(p.source.name)}
              style={{
                left: pct(crop.x - sx0, sw),
                top: pct(crop.y - sy0, sh),
                width: pct(target.width, sw),
                height: pct(target.height, sh),
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={onKeyDown}
            >
              <span className="frame-label mono">
                {target.width} × {target.height}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="card-meta">
        <span className="mono size-change">
          {size.width} × {size.height} → {target.width} × {target.height}
        </span>
        {edgeValues.map((v, i) => (
          <span key={i} className={v > 0 ? 'edge crop' : v < 0 ? 'edge pad' : 'edge zero'}>
            {t.edges[i]} {v > 0 ? `−${v}` : v < 0 ? `+${-v}` : '0'}
          </span>
        ))}
      </div>

      <div className="card-foot">
        <span className={padded ? 'badge warn' : 'badge ok'}>{padded ? t.chipPadded : t.chipCropOnly}</span>
        {p.adjusted && (
          <button type="button" className="btn btn-small" onClick={p.onReset}>
            <IconReset />
            {t.resetPosition}
          </button>
        )}
      </div>
    </article>
  )
}
