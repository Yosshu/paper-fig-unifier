export type SourceKind = 'png' | 'jpg' | 'svg'
export type OutputFormat = 'original' | 'png' | 'jpg'
export type Naming = 'suffix' | 'sequence'

export interface NamingOptions {
  naming: Naming
  suffix: string
  prefix: string
  format: OutputFormat
}

/** a, b, …, z, aa, ab, … — the usual subfigure labels. */
export function subfigureLabel(index: number): string {
  let n = index
  let label = ''
  do {
    label = String.fromCharCode(97 + (n % 26)) + label
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return label
}

export function splitExtension(name: string): { stem: string; ext: string } {
  const dot = name.lastIndexOf('.')
  if (dot <= 0) return { stem: name, ext: '' }
  return { stem: name.slice(0, dot), ext: name.slice(dot + 1).toLowerCase() }
}

/** Removes characters that are invalid in file names on common systems. */
export function sanitizeFilePart(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').trim()
}

/** SVG cannot be written back as a cropped raster, so "original" means PNG for it. */
export function outputExtension(kind: SourceKind, format: OutputFormat, originalExt: string): string {
  if (format === 'png') return 'png'
  if (format === 'jpg') return 'jpg'
  if (kind === 'jpg') return originalExt === 'jpeg' ? 'jpeg' : 'jpg'
  return 'png'
}

export function outputMimeType(ext: string): 'image/png' | 'image/jpeg' {
  return ext === 'png' ? 'image/png' : 'image/jpeg'
}

/** Output file names in list order, made unique (case-insensitively) with -2, -3, … */
export function buildOutputNames(
  items: readonly { name: string; kind: SourceKind }[],
  opts: NamingOptions,
): string[] {
  const suffix = sanitizeFilePart(opts.suffix)
  const prefix = sanitizeFilePart(opts.prefix)
  const used = new Set<string>()
  return items.map((item, i) => {
    const { stem, ext } = splitExtension(item.name)
    const outExt = outputExtension(item.kind, opts.format, ext)
    const label = subfigureLabel(i)
    const base = opts.naming === 'sequence' ? (prefix ? `${prefix}_${label}` : label) : `${stem}${suffix}`
    let name = `${base}.${outExt}`
    for (let n = 2; used.has(name.toLowerCase()); n++) name = `${base}-${n}.${outExt}`
    used.add(name.toLowerCase())
    return name
  })
}
