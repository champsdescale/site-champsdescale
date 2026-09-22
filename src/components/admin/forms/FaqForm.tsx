import type { FaqContent } from '@/types/section'

export function FaqForm({ content, onChange }: { content: FaqContent; onChange: (c: FaqContent) => void }) {
  return (
    <div className="space-y-3">
      <input
        aria-label="Titre"
        className="w-full border px-3 py-2"
        value={content.titre}
        onChange={(e) => onChange({ ...content, titre: e.target.value })}
      />
      {content.items.map((item, index) => (
        <div key={index} className="border p-3 space-y-2">
          <input
            aria-label={`Question ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Question"
            value={item.question}
            onChange={(e) => {
              const items = [...content.items]
              items[index] = { ...item, question: e.target.value }
              onChange({ ...content, items })
            }}
          />
          <textarea
            aria-label={`Réponse ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Réponse"
            value={item.reponse}
            onChange={(e) => {
              const items = [...content.items]
              items[index] = { ...item, reponse: e.target.value }
              onChange({ ...content, items })
            }}
          />
          <button
            type="button"
            onClick={() => onChange({ ...content, items: content.items.filter((_, i) => i !== index) })}
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, items: [...content.items, { question: '', reponse: '' }] })}
      >
        Ajouter une question
      </button>
    </div>
  )
}
