import type { FaqContent } from '@/types/section'

export function FaqSection({ content }: { content: FaqContent }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-6">{content.titre}</h2>
      <div className="space-y-3">
        {content.items.map((item, index) => (
          <details key={index} className="border border-[var(--color-border)] bg-white/40 px-4 py-3">
            <summary className="font-semibold cursor-pointer">{item.question}</summary>
            <p className="mt-2 text-[var(--color-muted)]">{item.reponse}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
