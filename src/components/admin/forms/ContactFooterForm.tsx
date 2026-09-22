import type { ContactFooterContent } from '@/types/section'

export function ContactFooterForm({
  content,
  onChange,
}: {
  content: ContactFooterContent
  onChange: (c: ContactFooterContent) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="contact-adresse">Adresse</label>
        <input
          id="contact-adresse"
          className="w-full border px-3 py-2"
          value={content.adresse}
          onChange={(e) => onChange({ ...content, adresse: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="contact-telephone">Téléphone</label>
        <input
          id="contact-telephone"
          className="w-full border px-3 py-2"
          value={content.telephone}
          onChange={(e) => onChange({ ...content, telephone: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="contact-email">Adresse mail</label>
        <input
          id="contact-email"
          className="w-full border px-3 py-2"
          value={content.email}
          onChange={(e) => onChange({ ...content, email: e.target.value })}
        />
      </div>
    </div>
  )
}
