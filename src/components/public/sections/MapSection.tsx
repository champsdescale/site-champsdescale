import type { MapContent } from '@/types/section'

export function MapSection({ content }: { content: MapContent }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-6 text-center">
      <h2 className="text-2xl font-semibold mb-4">{content.titre}</h2>
      {content.latLng ? (
        <iframe
          title={content.titre}
          className="w-full h-64 border-0"
          src={`https://www.google.com/maps?q=${content.latLng.lat},${content.latLng.lng}&output=embed`}
        />
      ) : (
        <div className="w-full h-64 bg-[var(--color-placeholder)] flex items-center justify-center" />
      )}
      <p className="mt-3 text-[var(--color-muted)]">{content.adresse}</p>
    </section>
  )
}
