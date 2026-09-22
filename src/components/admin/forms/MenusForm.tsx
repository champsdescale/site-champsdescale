import type { MenusContent } from '@/types/section'

const DAYS: { key: keyof Omit<MenusContent, 'titre'>; label: string }[] = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
]

export function MenusForm({
  content,
  onChange,
}: {
  content: MenusContent
  onChange: (c: MenusContent) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="menus-titre">Titre</label>
        <input
          id="menus-titre"
          className="w-full border px-3 py-2"
          value={content.titre}
          onChange={(e) => onChange({ ...content, titre: e.target.value })}
        />
      </div>
      {DAYS.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-sm mb-1" htmlFor={`menus-${key}`}>{label}</label>
          <textarea
            id={`menus-${key}`}
            className="w-full border px-3 py-2 h-16"
            value={content[key]}
            onChange={(e) => onChange({ ...content, [key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  )
}
