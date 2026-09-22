import { Image as ImageIcon } from 'lucide-react'
import type { GalleryContent } from '@/types/section'

export function GallerySection({ content }: { content: GalleryContent }) {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">{content.titre}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {content.photos.map((photo, index) =>
          photo.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              src={photo.url}
              alt={photo.alt}
              className="w-full h-32 object-cover"
            />
          ) : (
            <div
              key={index}
              className="w-full h-32 bg-[var(--color-placeholder)] flex flex-col items-center justify-center gap-1 text-center px-2"
            >
              <ImageIcon size={20} className="text-[var(--color-muted)]" />
              <span className="text-xs text-[var(--color-muted)]">{photo.alt}</span>
            </div>
          )
        )}
      </div>
    </section>
  )
}
