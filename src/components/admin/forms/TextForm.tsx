import type { TextContent } from '@/types/section'

export function TextForm({ content, onChange }: { content: TextContent; onChange: (c: TextContent) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="text-titre">Titre</label>
        <input
          id="text-titre"
          className="w-full border px-3 py-2"
          value={content.titre}
          onChange={(e) => onChange({ ...content, titre: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="text-texte">Texte</label>
        <textarea
          id="text-texte"
          className="w-full border px-3 py-2 h-40"
          value={content.texte}
          onChange={(e) => onChange({ ...content, texte: e.target.value })}
        />
      </div>
    </div>
  )
}
