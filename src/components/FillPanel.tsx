import { useMessages } from '../i18n'
import type { Fill } from '../lib/settings'
import { Panel } from './Panel'

interface FillPanelProps {
  fill: Fill
  fillColor: string
  hasJpgOutput: boolean
  onChange: (patch: { fill?: Fill; fillColor?: string }) => void
}

export function FillPanel({ fill, fillColor, hasJpgOutput, onChange }: FillPanelProps) {
  const t = useMessages()
  const options: { value: Fill; label: string; swatch: string; color: string }[] = [
    { value: 'white', label: t.fillWhite, swatch: 'swatch', color: '#ffffff' },
    { value: 'transparent', label: t.fillTransparent, swatch: 'swatch checker', color: '#ffffff' },
    { value: 'custom', label: t.fillCustom, swatch: 'swatch', color: fillColor },
  ]
  return (
    <Panel step={3} title={t.fillTitle}>
      <div role="group" aria-label={t.fillTitle} className="fill-options">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="fill-btn"
            aria-pressed={fill === o.value}
            onClick={() => onChange({ fill: o.value })}
          >
            <span className={o.swatch} style={{ backgroundColor: o.color }} />
            {o.label}
          </button>
        ))}
      </div>
      {fill === 'custom' && (
        <div className="inline-field">
          <label htmlFor="fill-color">{t.fillColorLabel}</label>
          <input
            id="fill-color"
            type="color"
            className="color-input"
            value={fillColor}
            onChange={(e) => onChange({ fillColor: e.target.value })}
          />
          <span className="mono">{fillColor}</span>
        </div>
      )}
      <p className="hint">{t.fillHint}</p>
      {hasJpgOutput && fill === 'transparent' && <p className="hint warn-text">{t.fillJpgNote}</p>}
    </Panel>
  )
}
