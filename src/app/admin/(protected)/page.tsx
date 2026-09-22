import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseSectionsRepository } from '@/lib/sections/supabase-repository'
import { createSupabaseSiteSettingsRepository } from '@/lib/site-settings/supabase-repository'
import { AdminBuilder } from '@/components/admin/AdminBuilder'
import {
  addSection,
  updateSectionContent,
  updateSectionVisibility,
  deleteSection,
  duplicateSection,
  reorderSections,
  uploadSectionFile,
  updateSiteSettings,
} from './actions'

export default async function AdminPage() {
  const client = await createSupabaseServerClient()
  const repository = createSupabaseSectionsRepository(client)
  const sections = await repository.list()
  const settings = await createSupabaseSiteSettingsRepository(client).get()

  async function uploadFile(file: File) {
    'use server'
    const formData = new FormData()
    formData.set('file', file)
    return uploadSectionFile(formData)
  }

  return (
    <AdminBuilder
      initialSections={sections}
      initialSettings={settings}
      actions={{
        addSection,
        updateSectionContent,
        updateSectionVisibility,
        deleteSection,
        duplicateSection,
        reorderSections,
        uploadFile,
        updateSiteSettings,
      }}
    />
  )
}
