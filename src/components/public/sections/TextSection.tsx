import type { TextContent } from '@/types/section'

export function TextSection({ content }: { content: TextContent }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-4">{content.titre}</h2>
      <p className="whitespace-pre-line text-[var(--color-muted)]">{content.texte}</p>
    </section>
  )
}
