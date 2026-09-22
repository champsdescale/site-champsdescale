// Temporary local-only smoke test of the public page, backed by the
// in-memory store instead of Supabase. Delete along with preview-store.ts
// and /preview-admin once a real Supabase project is connected.
import { previewRepository } from '@/lib/sections/preview-store'
import { previewSettingsRepository } from '@/lib/site-settings/preview-store'
import { getVisibleSections } from '@/lib/sections/get-sections'
import { SectionRenderer } from '@/components/public/SectionRenderer'
import { googleFontsHref, siteThemeCss } from '@/types/site-settings'

export const dynamic = 'force-dynamic'

export default async function PreviewPage() {
  const sections = await getVisibleSections(previewRepository)
  const settings = await previewSettingsRepository.get()

  return (
    <>
      <style>{siteThemeCss(settings)}</style>
      <link rel="stylesheet" href={googleFontsHref(settings.fontFamily)} />
      <main>
        {sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>
    </>
  )
}
