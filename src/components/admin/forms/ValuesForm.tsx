import type { ValuesContent } from '@/types/section'

export function ValuesForm({ content, onChange }: { content: ValuesContent; onChange: (c: ValuesContent) => void }) {
  return (
    <div className="space-y-3">
      <input
        aria-label="Titre"
        className="w-full border px-3 py-2"
        value={content.titre}
        onChange={(e) => onChange({ ...content, titre: e.target.value })}
      />
      {content.points.map((point, index) => (
        <div key={index} className="border p-3 space-y-2">
          <input
            aria-label={`Label du point ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Label"
            value={point.label}
            onChange={(e) => {
              const points = [...content.points]
              points[index] = { ...point, label: e.target.value }
              onChange({ ...content, points })
            }}
          />
          <textarea
            aria-label={`Texte du point ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Texte"
            value={point.texte}
            onChange={(e) => {
              const points = [...content.points]
              points[index] = { ...point, texte: e.target.value }
              onChange({ ...content, points })
            }}
          />
          <button
            type="button"
            onClick={() => onChange({ ...content, points: content.points.filter((_, i) => i !== index) })}
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, points: [...content.points, { label: '', texte: '' }] })}
      >
        Ajouter un point
      </button>
    </div>
  )
}
