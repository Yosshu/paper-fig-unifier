import { useMessages } from '../i18n'
import type { Naming, OutputFormat } from '../lib/filenames'
import { IconDownload } from './icons'
import { Panel } from './Panel'
import { Segmented } from './Segmented'

interface ExportPanelProps {
  format: OutputFormat
  jpgQuality: number
  naming: Naming
  suffix: string
  prefix: string
  names: readonly string[]
  hasSvg: boolean
  hasJpgOutput: boolean
  progress: { done: number; total: number } | null
  lastExport: string | null
  onChange: (patch: { format?: OutputFormat; jpgQuality?: number; naming?: Naming; suffix?: string; prefix?: string }) => void
  onDownload: () => void
}

export function ExportPanel(p: ExportPanelProps) {
  const t = useMessages()
  const formats = [
    { value: 'original', label: t.formatOriginal },
    { value: 'png', label: 'PNG' },
    { value: 'jpg', label: 'JPG' },
  ] as const
  const namings = [
    { value: 'suffix', label: t.namingSuffix },
    { value: 'sequence', label: t.namingSequence },
  ] as const
  const isSequence = p.naming === 'sequence'
  return (
    <>
      <Panel step={5} title={t.exportTitle}>
        <div className="field">
          <span className="field-label" id="format-label">
            {t.formatLabel}
          </span>
          <Segmented label={t.formatLabel} options={formats} value={p.format} onChange={(format) => p.onChange({ format })} />
          {p.hasSvg && p.format === 'original' && <p className="hint">{t.svgToPng}</p>}
        </div>

        {p.hasJpgOutput && (
          <div className="field">
            <div className="field-row">
              <label htmlFor="jpg-quality">{t.jpgQuality}</label>
              <span className="mono">{p.jpgQuality}</span>
            </div>
            <input
              id="jpg-quality"
              className="range"
              type="range"
              min={50}
              max={100}
              step={1}
              value={p.jpgQuality}
              onChange={(e) => p.onChange({ jpgQuality: Number(e.target.value) })}
            />
            <p className="hint">{t.jpgNote}</p>
          </div>
        )}

        <div className="field">
          <span className="field-label">{t.namingLabel}</span>
          <Segmented label={t.namingLabel} options={namings} value={p.naming} onChange={(naming) => p.onChange({ naming })} />
          <div className="inline-field">
            <label htmlFor="name-part">{isSequence ? t.prefixLabel : t.suffixLabel}</label>
            <input
              id="name-part"
              className="input mono"
              type="text"
              maxLength={100}
              value={isSequence ? p.prefix : p.suffix}
              onChange={(e) => p.onChange(isSequence ? { prefix: e.target.value } : { suffix: e.target.value })}
            />
          </div>
        </div>

        {p.names.length > 0 && (
          <div className="field">
            <span className="field-label">{t.filesLabel}</span>
            <ul className="file-list mono">
              {p.names.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <button type="button" className="btn btn-primary btn-download" disabled={p.names.length === 0 || p.progress !== null} onClick={p.onDownload}>
        <IconDownload />
        {p.progress ? t.exporting(p.progress.done, p.progress.total) : t.download(p.names.length)}
      </button>
      <p className="export-status" role="status">
        {p.lastExport}
      </p>
    </>
  )
}
