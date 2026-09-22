import { Trash2, Plus } from 'lucide-react'
import type { TeamContent } from '@/types/section'
import { FileUploadButton } from './FileUploadButton'

export function TeamForm({
  content,
  onChange,
  uploadFile,
}: {
  content: TeamContent
  onChange: (c: TeamContent) => void
  uploadFile: (file: File) => Promise<{ url: string }>
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="team-titre">Titre</label>
        <input
          id="team-titre"
          className="w-full border px-3 py-2"
          value={content.titre}
          onChange={(e) => onChange({ ...content, titre: e.target.value })}
        />
      </div>
      {content.membres.map((membre, index) => (
        <div key={index} className="border p-3 space-y-2">
          <input
            aria-label={`Nom du membre ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Nom"
            value={membre.nom}
            onChange={(e) => {
              const membres = [...content.membres]
              membres[index] = { ...membre, nom: e.target.value }
              onChange({ ...content, membres })
            }}
          />
          <input
            aria-label={`Rôle du membre ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Rôle"
            value={membre.role}
            onChange={(e) => {
              const membres = [...content.membres]
              membres[index] = { ...membre, role: e.target.value }
              onChange({ ...content, membres })
            }}
          />
          <FileUploadButton
            label="Photo"
            ariaLabel={`Photo du membre ${index + 1}`}
            accept="image/*"
            hasFile={!!membre.photoUrl}
            onFileSelected={async (file) => {
              const { url } = await uploadFile(file)
              const membres = [...content.membres]
              membres[index] = { ...membre, photoUrl: url }
              onChange({ ...content, membres })
            }}
          />
          <button
            type="button"
            onClick={() => onChange({ ...content, membres: content.membres.filter((_, i) => i !== index) })}
            className="flex items-center gap-1 text-xs text-red-800"
          >
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange({ ...content, membres: [...content.membres, { nom: '', role: '', photoUrl: '' }] })
        }
        className="flex items-center gap-1.5 border border-[#d8d0b8] px-3 py-1.5 text-sm hover:bg-[#EDE6D3] transition-colors"
      >
        <Plus size={14} /> Ajouter un membre
      </button>
    </div>
  )
}
