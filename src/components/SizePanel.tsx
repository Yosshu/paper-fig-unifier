import { useState } from 'react'
import { useMessages } from '../i18n'
import type { Size, SizeMode } from '../lib/geometry'
import { MAX_SIDE, SAFE_CANVAS_PIXELS } from '../lib/settings'
import { IconAlert, IconCheck } from './icons'
import { Panel } from './Panel'
import { Segmented } from './Segmented'

function NumberField({ id, label, value, onCommit }: { id: string; label: string; value: number; onCommit: (n: number) => void }) {
  // Keep the raw text while typing so the field can be empty or partial.
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <div className="field">
      <label htmlFor={id}>{label} (px)</label>
      <input
        id={id}
        className="input mono"
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_SIDE}
        step={1}
        value={draft ?? String(value)}
        onChange={(e) => {
          setDraft(e.target.value)
          const n = Number(e.target.value)
          if (Number.isInteger(n) && n >= 1 && n <= MAX_SIDE) onCommit(n)
        }}
        onBlur={() => setDraft(null)}
      />
    </div>
  )
}

interface SizePanelProps {
  mode: SizeMode
  target: Size
  imageCount: number
  paddedCount: number
  onMode: (mode: SizeMode) => void
  onCustom: (size: Size) => void
}

export function SizePanel({ mode, target, imageCount, paddedCount, onMode, onCustom }: SizePanelProps) {
  const t = useMessages()
  const options = [
    { value: 'min', label: t.sizeMin },
    { value: 'max', label: t.sizeMax },
    { value: 'custom', label: t.sizeCustom },
  ] as const
  return (
    <Panel step={1} title={t.sizeTitle}>
      <Segmented label={t.sizeTitle} options={options} value={mode} onChange={onMode} />
      <div className="size-fields">
        <NumberField
          id="out-width"
          label={t.width}
          value={target.width}
          onCommit={(width) => onCustom({ width, height: target.height })}
        />
        <span className="times" aria-hidden="true">
          ×
        </span>
        <NumberField
          id="out-height"
          label={t.height}
          value={target.height}
          onCommit={(height) => onCustom({ width: target.width, height })}
        />
      </div>
      {imageCount === 0 ? (
        <p className="status">{t.statusEmpty}</p>
      ) : paddedCount === 0 ? (
        <p className="status ok">
          <IconCheck />
          {t.statusCropOnly(imageCount)}
        </p>
      ) : (
        <p className="status warn">
          <IconAlert />
          {t.statusPadded(paddedCount)}
        </p>
      )}
      {target.width * target.height > SAFE_CANVAS_PIXELS && (
        <p className="status warn">
          <IconAlert />
          {t.sizeTooLarge}
        </p>
      )}
    </Panel>
  )
}
