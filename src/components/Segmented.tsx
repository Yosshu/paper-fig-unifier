export interface SegmentOption<T> {
  value: T
  label: string
}

interface SegmentedProps<T> {
  label: string
  options: readonly SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  mono?: boolean
}

/** A row of mutually exclusive toggle buttons. */
export function Segmented<T extends string | number>({ label, options, value, onChange, mono }: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="segmented"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={mono ? 'seg-btn mono' : 'seg-btn'}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
