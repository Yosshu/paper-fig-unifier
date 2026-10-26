import { useMessages } from '../i18n'
import type { Size } from '../lib/geometry'
import { SVG_SCALES } from '../lib/settings'
import { Panel } from './Panel'
import { Segmented } from './Segmented'

interface SvgPanelProps {
  scale: number
  svgs: readonly { name: string; size: Size }[]
  onChange: (scale: number) => void
}

export function SvgPanel({ scale, svgs, onChange }: SvgPanelProps) {
  const t = useMessages()
  const options = SVG_SCALES.map((s) => ({ value: s as number, label: `×${s}` }))
  return (
    <Panel step={4} title={t.svgTitle}>
      {svgs.length === 0 ? (
        <p className="hint">{t.svgNone}</p>
      ) : (
        <>
          <Segmented label={t.svgTitle} options={options} value={scale} onChange={onChange} mono />
          <p className="hint">
            {svgs.length === 1 ? t.svgHintOne(svgs[0].name, svgs[0].size.width, svgs[0].size.height) : t.svgHintMany(svgs.length)}
          </p>
          <p className="hint">{t.svgNote}</p>
        </>
      )}
    </Panel>
  )
}
