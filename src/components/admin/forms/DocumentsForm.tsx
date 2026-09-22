import { Trash2 } from 'lucide-react'
import type { DocumentsContent } from '@/types/section'
import { FileUploadButton } from './FileUploadButton'

export function DocumentsForm({
  content,
  onChange,
  uploadFile,
}: {
  content: DocumentsContent
  onChange: (c: DocumentsContent) => void
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
      <ul className="space-y-1">
        {content.fichiers.map((fichier, index) => (
          <li key={index} className="flex items-center justify-between border px-3 py-2">
            <span>{fichier.nom}</span>
            <button
              type="button"
              onClick={() =>
                onChange({ ...content, fichiers: content.fichiers.filter((_, i) => i !== index) })
              }
              className="flex items-center gap-1 text-xs text-red-800"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          </li>
        ))}
      </ul>
      <FileUploadButton
        label="Ajouter un fichier"
        accept="application/pdf"
        onFileSelected={async (file) => {
          const { url } = await uploadFile(file)
          onChange({ ...content, fichiers: [...content.fichiers, { nom: file.name, url }] })
        }}
      />
    </div>
  )
}
