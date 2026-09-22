import type { ValuesContent } from '@/types/section'

export function ValuesSection({ content }: { content: ValuesContent }) {
  return (
    <section className="max-w-3xl mx-auto py-12 px-6 text-center">
      <h2 className="text-2xl font-semibold mb-8">{content.titre}</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {content.points.map((point, index) => (
          <div key={index} className="w-40">
            <p className="font-semibold mb-1">{point.label}</p>
            <p className="text-sm text-[var(--color-muted)]">{point.texte}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
