import { X } from 'lucide-react'
import type { GalleryContent } from '@/types/section'
import { FileUploadButton } from './FileUploadButton'

export function GalleryForm({
  content,
  onChange,
  uploadFile,
}: {
  content: GalleryContent
  onChange: (c: GalleryContent) => void
  uploadFile: (file: File) => Promise<{ url: string }>
}) {
  return (
    <div className="space-y-3">
      <input
        aria-label="Titre"
        className="w-full border px-3 py-2"
        value={content.titre}
        onChange={(e) => onChange({ ...content, titre: e.target.value })}
      />
      <div className="grid grid-cols-3 gap-2">
        {content.photos.map((photo, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div key={index} className="relative">
            <img src={photo.url} alt={photo.alt} className="w-full h-20 object-cover" />
            <button
              type="button"
              aria-label={`Supprimer la photo ${index + 1}`}
              className="absolute top-1 right-1 bg-white/90 p-0.5 text-red-800"
              onClick={() => onChange({ ...content, photos: content.photos.filter((_, i) => i !== index) })}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <FileUploadButton
        label="Ajouter une photo"
        accept="image/*"
        onFileSelected={async (file) => {
          const { url } = await uploadFile(file)
          onChange({ ...content, photos: [...content.photos, { url, alt: file.name }] })
        }}
      />
    </div>
  )
}
