import type { TestimonialsContent } from '@/types/section'

export function TestimonialsSection({ content }: { content: TestimonialsContent }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">{content.titre}</h2>
      <div className="space-y-4">
        {content.citations.map((citation, index) => (
          <blockquote key={index} className="border-l-4 border-[var(--color-accent)] bg-white/40 px-4 py-3 italic">
            "{citation.texte}"
            <footer className="mt-2 not-italic text-sm text-[var(--color-muted)]">— {citation.auteur}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
