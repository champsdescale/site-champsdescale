'use client'

import { useId, useState } from 'react'
import { Upload, Check } from 'lucide-react'

// The browser's native <input type="file"> renders as "Choisir un fichier /
// Aucun fichier choisi", which looks out of place next to the rest of the
// admin UI and gives a non-technical editor no feedback once a file is
// actually attached. This wraps it in the standard accessible pattern (a
// styled <label htmlFor> triggering a visually-hidden input) so it looks
// like the app's other buttons, with its own "Envoi..." / "Photo ajoutée"
// state instead of the input's own (unreliable across re-renders) display.
export function FileUploadButton({
  label,
  ariaLabel,
  accept,
  hasFile,
  onFileSelected,
}: {
  label: string
  ariaLabel?: string
  accept?: string
  hasFile?: boolean
  onFileSelected: (file: File) => void | Promise<void>
}) {
  const inputId = useId()
  const [uploading, setUploading] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={inputId}
        className="inline-flex items-center gap-1.5 border border-[#d8d0b8] px-3 py-1.5 text-sm cursor-pointer hover:bg-[#EDE6D3] transition-colors"
      >
        <Upload size={14} /> {uploading ? 'Envoi...' : label}
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        aria-label={ariaLabel}
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          setUploading(true)
          try {
            await onFileSelected(file)
          } finally {
            setUploading(false)
            // Allows re-selecting the same file a second time (e.g. after
            // removing it), which a file input otherwise silently ignores.
            event.target.value = ''
          }
        }}
      />
      {!uploading && hasFile && (
        <span className="flex items-center gap-1 text-xs text-[#5b4f3f]">
          <Check size={14} /> Photo ajoutée
        </span>
      )}
    </div>
  )
}
