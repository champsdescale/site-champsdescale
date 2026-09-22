import type { HeroContent } from '@/types/section'

export function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section className="text-center py-16 px-6">
      <span className="inline-block border border-[var(--color-text)] text-[10px] tracking-widest uppercase px-4 py-1 mb-6">
        {content.badge}
      </span>
      <h1 className="text-4xl md:text-5xl mb-4">{content.titre}</h1>
      <p className="text-[var(--color-muted)] max-w-xl mx-auto mb-8">{content.sousTitre}</p>
      <span className="inline-block bg-[var(--color-text)] text-[var(--color-bg)] font-semibold px-6 py-3">
        {content.texteCta}
      </span>
    </section>
  )
}
