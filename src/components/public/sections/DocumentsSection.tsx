import type { DocumentsContent } from '@/types/section'

export function DocumentsSection({ content }: { content: DocumentsContent }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-6">{content.titre}</h2>
      <ul className="space-y-2">
        {content.fichiers.map((fichier, index) =>
          fichier.url ? (
            <li key={index}>
              <a href={fichier.url} className="underline decoration-[var(--color-accent)]" download>
                {fichier.nom}
              </a>
            </li>
          ) : (
            <li key={index} className="text-[var(--color-muted)]">
              {fichier.nom}
            </li>
          )
        )}
      </ul>
    </section>
  )
}
