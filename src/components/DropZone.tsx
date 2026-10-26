import { useRef } from 'react'
import { useMessages } from '../i18n'
import { ACCEPT } from '../lib/loadImage'
import { IconUpload } from './icons'

interface DropZoneProps {
  active: boolean
  hasImages: boolean
  onFiles: (files: File[]) => void
  onClear: () => void
}

/** Files can be dropped anywhere on the page; this zone shows where and offers a file picker. */
export function DropZone({ active, hasImages, onFiles, onClear }: DropZoneProps) {
  const t = useMessages()
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className={active ? 'dropzone active' : 'dropzone'}>
      <span className="dropzone-icon" aria-hidden="true">
        <IconUpload />
      </span>
      <div className="dropzone-text">
        <p className="strong">{t.dropTitle}</p>
        <p className="hint">{t.dropSub}</p>
      </div>
      {hasImages && (
        <button type="button" className="btn btn-ghost" onClick={onClear}>
          {t.clearAll}
        </button>
      )}
      <button type="button" className="btn" onClick={() => input.current?.click()}>
        {t.chooseFiles}
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) onFiles(Array.from(e.target.files))
          e.target.value = ''
        }}
      />
    </div>
  )
}
