import type { ContactFooterContent } from '@/types/section'

export function ContactFooterSection({ content }: { content: ContactFooterContent }) {
  return (
    <footer className="bg-[var(--color-text)] text-[var(--color-bg)] py-12 px-6">
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <p className="uppercase text-xs tracking-widest mb-2">Adresse</p>
          <p>{content.adresse}</p>
        </div>
        <div>
          <p className="uppercase text-xs tracking-widest mb-2">Téléphone</p>
          <p>{content.telephone}</p>
        </div>
        <div>
          <p className="uppercase text-xs tracking-widest mb-2">Adresse mail</p>
          <p>{content.email}</p>
        </div>
      </div>
    </footer>
  )
}
