import type { TeamContent } from '@/types/section'

export function TeamSection({ content }: { content: TeamContent }) {
  return (
    <section className="max-w-3xl mx-auto py-12 px-6 text-center">
      <h2 className="text-2xl font-semibold mb-8">{content.titre}</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {content.membres.map((membre, index) => (
          <div key={index}>
            {membre.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={membre.photoUrl}
                alt={membre.nom}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[var(--color-accent)] mx-auto mb-2" />
            )}
            <p className="font-semibold">{membre.nom}</p>
            <p className="text-sm text-[var(--color-muted)]">{membre.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
