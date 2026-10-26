import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnchorPanel } from './components/AnchorPanel'
import { DropZone } from './components/DropZone'
import { ExportPanel } from './components/ExportPanel'
import { FillPanel } from './components/FillPanel'
import { Header } from './components/Header'
import { IconAlert, IconClose } from './components/icons'
import { PreviewCard, type Backdrop, type View } from './components/PreviewCard'
import { Segmented } from './components/Segmented'
import { SizePanel } from './components/SizePanel'
import { SvgPanel } from './components/SvgPanel'
import { MESSAGES, MessagesContext, type Messages } from './i18n'
import { exportAll } from './lib/exportImages'
import { buildOutputNames, outputMimeType, sanitizeFilePart, splitExtension, subfigureLabel } from './lib/filenames'
import {
  ZERO_OFFSET,
  computeCrop,
  needsPadding,
  offsetForPosition,
  resolveTargetSize,
  type Anchor,
  type Offset,
  type Size,
  type SizeMode,
} from './lib/geometry'
import { detectKind, loadSourceImage, pixelSize, type SourceImage } from './lib/loadImage'
import { loadSettings, saveSettings, type Settings } from './lib/settings'

interface ImageItem {
  source: SourceImage
  offset: Offset
}

type Notice =
  | { id: number; type: 'unsupported' | 'loadFailed'; names: string[] }
  | { id: number; type: 'exportFailed'; names: string[] }

let nextNoticeId = 1

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
const sortByName = (items: ImageItem[]) => [...items].sort((a, b) => collator.compare(a.source.name, b.source.name))

function noticeText(t: Messages, n: Notice): string {
  const names = n.names.join(', ')
  if (n.type === 'unsupported') return t.unsupported(names)
  if (n.type === 'loadFailed') return t.loadFailed(names)
  return t.exportFailed(names)
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [items, setItems] = useState<ImageItem[]>([])
  const [view, setView] = useState<View>('crop')
  const [notices, setNotices] = useState<Notice[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [lastExport, setLastExport] = useState<{ count: number; name: string; key: string } | null>(null)
  const t = MESSAGES[settings.lang]

  useEffect(() => saveSettings(settings), [settings])
  useEffect(() => {
    document.documentElement.lang = settings.lang
  }, [settings.lang])

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), [])

  const addFiles = useCallback(async (files: File[]) => {
    const unsupported: string[] = []
    const failed: string[] = []
    const loaded = await Promise.all(
      files.map(async (file) => {
        const kind = detectKind(file)
        if (!kind) {
          unsupported.push(file.name)
          return null
        }
        try {
          return { source: await loadSourceImage(file, kind), offset: ZERO_OFFSET }
        } catch {
          failed.push(file.name)
          return null
        }
      }),
    )
    const ok = loaded.filter((x): x is ImageItem => x !== null)
    if (ok.length > 0) setItems((prev) => sortByName([...prev, ...ok]))
    const next: Notice[] = []
    if (unsupported.length > 0) next.push({ id: nextNoticeId++, type: 'unsupported', names: unsupported })
    if (failed.length > 0) next.push({ id: nextNoticeId++, type: 'loadFailed', names: failed })
    if (next.length > 0) setNotices((prev) => [...prev, ...next])
  }, [])

  // Accept files dropped anywhere, and keep the browser from opening them instead.
  useEffect(() => {
    let depth = 0
    const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes('Files') ?? false
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return
      depth++
      setDragActive(true)
    }
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return
      depth = Math.max(0, depth - 1)
      if (depth === 0) setDragActive(false)
    }
    const onOver = (e: DragEvent) => {
      if (!hasFiles(e) || !e.dataTransfer) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e) || !e.dataTransfer) return
      e.preventDefault()
      depth = 0
      setDragActive(false)
      void addFiles(Array.from(e.dataTransfer.files))
    }
    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('dragover', onOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [addFiles])

  const sized = useMemo(
    () => items.map((it) => ({ ...it, size: pixelSize(it.source, settings.svgScale) })),
    [items, settings.svgScale],
  )
  const target = useMemo(
    () =>
      resolveTargetSize(
        sized.map((s) => s.size),
        settings.sizeMode,
        { width: settings.customWidth, height: settings.customHeight },
      ),
    [sized, settings.sizeMode, settings.customWidth, settings.customHeight],
  )
  const crops = sized.map((s) => computeCrop(s.size, target, settings.anchor, s.offset))
  const paddedCount = sized.filter((s) => needsPadding(s.size, target)).length
  const names = buildOutputNames(
    items.map((i) => ({ name: i.source.name, kind: i.source.kind })),
    settings,
  )
  const mimes = names.map((n) => outputMimeType(splitExtension(n).ext))
  const hasJpgOutput = mimes.includes('image/jpeg')
  const refWidth = sized.reduce(
    (m, s, i) => Math.max(m, Math.max(s.size.width, crops[i].x + target.width) - Math.min(0, crops[i].x)),
    target.width,
  )
  const padFill: Backdrop = settings.fill === 'transparent' ? null : settings.fill === 'white' ? '#ffffff' : settings.fillColor
  const svgs = sized.filter((s) => s.source.kind === 'svg').map((s) => ({ name: s.source.name, size: s.size }))
  // Identifies what an export produced, so its success message hides once anything changes.
  const exportKey = JSON.stringify([target, crops.map((c) => [c.x, c.y]), names, padFill, settings.jpgQuality])

  const setMode = (mode: SizeMode) =>
    update(mode === 'custom' ? { sizeMode: mode, customWidth: target.width, customHeight: target.height } : { sizeMode: mode })
  const setCustom = (size: Size) => update({ sizeMode: 'custom', customWidth: size.width, customHeight: size.height })
  const setAnchor = (anchor: Anchor) => {
    update({ anchor })
    setItems((prev) => prev.map((i) => ({ ...i, offset: ZERO_OFFSET })))
  }
  const setOffset = (id: string, offset: Offset) =>
    setItems((prev) => prev.map((i) => (i.source.id === id ? { ...i, offset } : i)))
  const removeItem = (item: ImageItem) => {
    URL.revokeObjectURL(item.source.url)
    setItems((prev) => prev.filter((i) => i.source.id !== item.source.id))
  }
  const clearAll = () => {
    for (const i of items) URL.revokeObjectURL(i.source.url)
    setItems([])
  }

  const download = async () => {
    if (progress || items.length === 0) return
    const prefix = settings.naming === 'sequence' ? sanitizeFilePart(settings.prefix) : ''
    const zipName = `${prefix || 'subfigures'}_${target.width}x${target.height}.zip`
    setLastExport(null)
    setProgress({ done: 0, total: items.length })
    try {
      const result = await exportAll(
        items.map((it, i) => ({ source: it.source, name: names[i], mime: mimes[i], x: crops[i].x, y: crops[i].y })),
        { out: target, svgScale: settings.svgScale, quality: settings.jpgQuality / 100, fill: padFill, zipName },
        (done) => setProgress({ done, total: items.length }),
      )
      if (result.ok) setLastExport({ count: items.length, name: zipName, key: exportKey })
      else setNotices((prev) => [...prev, { id: nextNoticeId++, type: 'exportFailed', names: [result.failed] }])
    } finally {
      setProgress(null)
    }
  }

  return (
    <MessagesContext value={t}>
      <div className="app">
        <Header lang={settings.lang} onLang={(lang) => update({ lang })} />
        <div className="layout">
          <aside className="col col-side" aria-label={t.settingsLabel}>
            <SizePanel
              mode={settings.sizeMode}
              target={target}
              imageCount={items.length}
              paddedCount={paddedCount}
              onMode={setMode}
              onCustom={setCustom}
            />
            <AnchorPanel anchor={settings.anchor} onChange={setAnchor} />
            <FillPanel fill={settings.fill} fillColor={settings.fillColor} hasJpgOutput={hasJpgOutput} onChange={update} />
            <SvgPanel scale={settings.svgScale} svgs={svgs} onChange={(svgScale) => update({ svgScale })} />
          </aside>

          <main className="col col-main" aria-label={t.previewLabel}>
            <DropZone active={dragActive} hasImages={items.length > 0} onFiles={addFiles} onClear={clearAll} />

            {notices.map((n) => (
              <div key={n.id} className="notice" role="alert">
                <IconAlert />
                <span>{noticeText(t, n)}</span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={t.dismiss}
                  title={t.dismiss}
                  onClick={() => setNotices((prev) => prev.filter((x) => x.id !== n.id))}
                >
                  <IconClose />
                </button>
              </div>
            ))}

            {items.length === 0 ? (
              <div className="empty">
                <p className="strong">{t.emptyTitle}</p>
                <ol>
                  {t.emptySteps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            ) : (
              <>
                <div className="toolbar">
                  <Segmented
                    label={t.viewLabel}
                    options={[
                      { value: 'crop', label: t.viewCrop },
                      { value: 'result', label: t.viewResult },
                    ]}
                    value={view}
                    onChange={setView}
                  />
                  <p className="mono strong">{t.summary(items.length, target.width, target.height)}</p>
                </div>
                <div className="toolbar-hints hint">
                  <span>{view === 'crop' ? t.dragHint : t.resultHint}</span>
                  <span className="legend">
                    <span>{t.legendCrop}</span>
                    <span className="warn-text">{t.legendPad}</span>
                  </span>
                </div>
                <div className="cards">
                  {sized.map((s, i) => {
                    const jpg = mimes[i] === 'image/jpeg'
                    return (
                      <PreviewCard
                        key={s.source.id}
                        label={subfigureLabel(i)}
                        source={s.source}
                        svgScale={settings.svgScale}
                        size={s.size}
                        target={target}
                        crop={crops[i]}
                        refWidth={refWidth}
                        view={view}
                        padding={jpg ? (padFill ?? '#ffffff') : padFill}
                        imageBackdrop={jpg ? (padFill ?? '#ffffff') : null}
                        adjusted={s.offset.dx !== 0 || s.offset.dy !== 0}
                        onMove={(x, y) => setOffset(s.source.id, offsetForPosition(s.size, target, settings.anchor, x, y))}
                        onReset={() => setOffset(s.source.id, ZERO_OFFSET)}
                        onRemove={() => removeItem(s)}
                      />
                    )
                  })}
                </div>
              </>
            )}
          </main>

          <aside className="col col-side" aria-label={t.exportTitle}>
            <ExportPanel
              format={settings.format}
              jpgQuality={settings.jpgQuality}
              naming={settings.naming}
              suffix={settings.suffix}
              prefix={settings.prefix}
              names={names}
              hasSvg={svgs.length > 0}
              hasJpgOutput={hasJpgOutput}
              progress={progress}
              lastExport={lastExport?.key === exportKey ? t.exportDone(lastExport.count, lastExport.name) : null}
              onChange={update}
              onDownload={() => void download()}
            />
          </aside>
        </div>
      </div>
    </MessagesContext>
  )
}
