import type { TestimonialsContent } from '@/types/section'

export function TestimonialsForm({
  content,
  onChange,
}: {
  content: TestimonialsContent
  onChange: (c: TestimonialsContent) => void
}) {
  return (
    <div className="space-y-3">
      <input
        aria-label="Titre"
        className="w-full border px-3 py-2"
        value={content.titre}
        onChange={(e) => onChange({ ...content, titre: e.target.value })}
      />
      {content.citations.map((citation, index) => (
        <div key={index} className="border p-3 space-y-2">
          <textarea
            aria-label={`Citation ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Citation"
            value={citation.texte}
            onChange={(e) => {
              const citations = [...content.citations]
              citations[index] = { ...citation, texte: e.target.value }
              onChange({ ...content, citations })
            }}
          />
          <input
            aria-label={`Auteur ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Auteur"
            value={citation.auteur}
            onChange={(e) => {
              const citations = [...content.citations]
              citations[index] = { ...citation, auteur: e.target.value }
              onChange({ ...content, citations })
            }}
          />
          <button
            type="button"
            onClick={() =>
              onChange({ ...content, citations: content.citations.filter((_, i) => i !== index) })
            }
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange({ ...content, citations: [...content.citations, { texte: '', auteur: '' }] })
        }
      >
        Ajouter un témoignage
      </button>
    </div>
  )
}
