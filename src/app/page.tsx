import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseSectionsRepository } from '@/lib/sections/supabase-repository'
import { createSupabaseSiteSettingsRepository } from '@/lib/site-settings/supabase-repository'
import { getVisibleSections } from '@/lib/sections/get-sections'
import { SectionRenderer } from '@/components/public/SectionRenderer'
import { googleFontsHref, siteThemeCss } from '@/types/site-settings'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const client = await createSupabaseServerClient()
  const repository = createSupabaseSectionsRepository(client)
  const sections = await getVisibleSections(repository)
  const settings = await createSupabaseSiteSettingsRepository(client).get()

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
