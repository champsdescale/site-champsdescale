import type { HeroContent } from '@/types/section'

export function HeroForm({ content, onChange }: { content: HeroContent; onChange: (c: HeroContent) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="hero-badge">Badge</label>
        <input
          id="hero-badge"
          className="w-full border px-3 py-2"
          value={content.badge}
          onChange={(e) => onChange({ ...content, badge: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="hero-titre">Titre</label>
        <input
          id="hero-titre"
          className="w-full border px-3 py-2"
          value={content.titre}
          onChange={(e) => onChange({ ...content, titre: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="hero-sous-titre">Sous-titre</label>
        <input
          id="hero-sous-titre"
          className="w-full border px-3 py-2"
          value={content.sousTitre}
          onChange={(e) => onChange({ ...content, sousTitre: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="hero-cta">Texte du bouton</label>
        <input
          id="hero-cta"
          className="w-full border px-3 py-2"
          value={content.texteCta}
          onChange={(e) => onChange({ ...content, texteCta: e.target.value })}
        />
      </div>
    </div>
  )
}
