import { Megaphone } from 'lucide-react'
import type { AnnouncementContent } from '@/types/section'

export function AnnouncementSection({ content }: { content: AnnouncementContent }) {
  return (
    <section className="bg-[var(--color-accent)] text-[var(--color-text)] py-4 px-6">
      <p className="max-w-3xl mx-auto flex items-center justify-center gap-2 text-center font-bold">
        <Megaphone size={18} className="shrink-0" />
        {content.texte}
      </p>
    </section>
  )
}
