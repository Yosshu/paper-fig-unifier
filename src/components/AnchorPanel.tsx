import { useMessages } from '../i18n'
import { ANCHORS, type Anchor } from '../lib/geometry'
import { Panel } from './Panel'

export function AnchorPanel({ anchor, onChange }: { anchor: Anchor; onChange: (anchor: Anchor) => void }) {
  const t = useMessages()
  const selected = ANCHORS.findIndex((a) => a.x === anchor.x && a.y === anchor.y)
  const name = t.anchorNames[selected] ?? ''
  return (
    <Panel step={2} title={t.anchorTitle}>
      <div className="anchor-row">
        <div role="group" aria-label={t.anchorTitle} className="anchor-grid">
          {ANCHORS.map((a, i) => (
            <button
              key={i}
              type="button"
              className="anchor-btn"
              aria-label={t.anchorNames[i]}
              title={t.anchorNames[i]}
              aria-pressed={i === selected}
              onClick={() => onChange(a)}
            >
              <span className="anchor-dot" />
            </button>
          ))}
        </div>
        <div>
          <p className="anchor-name">{name}</p>
          <p className="hint">{t.anchorHint(name)}</p>
        </div>
      </div>
      <p className="hint">{t.anchorNote}</p>
    </Panel>
  )
}
