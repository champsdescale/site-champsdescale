import type { AnnouncementContent } from '@/types/section'

export function AnnouncementForm({
  content,
  onChange,
}: {
  content: AnnouncementContent
  onChange: (c: AnnouncementContent) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="announcement-texte">
          Message de l&apos;annonce
        </label>
        <textarea
          id="announcement-texte"
          className="w-full border px-3 py-2 h-24"
          value={content.texte}
          onChange={(e) => onChange({ ...content, texte: e.target.value })}
        />
      </div>
    </div>
  )
}
