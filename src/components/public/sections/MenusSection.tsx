import type { MenusContent } from '@/types/section'

const DAYS: { key: keyof Omit<MenusContent, 'titre'>; label: string }[] = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
]

export function MenusSection({ content }: { content: MenusContent }) {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">{content.titre}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {DAYS.map(({ key, label }) => (
          <div key={key} className="border border-[var(--color-border)] bg-white/40 px-3 py-3 text-center">
            <p className="text-xs uppercase tracking-widest font-semibold border-b border-[var(--color-accent)] pb-2 mb-2">
              {label}
            </p>
            <p className="text-sm text-[var(--color-muted)] whitespace-pre-line">{content[key]}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
