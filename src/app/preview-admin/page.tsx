// Temporary local-only mirror of src/app/admin/(protected)/page.tsx, with no
// auth guard and no Supabase, so the builder UI can be smoke-tested before a
// real Supabase project exists. Delete along with preview-store.ts and
// /preview once a real Supabase project is connected.
import { previewRepository } from '@/lib/sections/preview-store'
import { previewSettingsRepository } from '@/lib/site-settings/preview-store'
import { AdminBuilder } from '@/components/admin/AdminBuilder'
import {
  addSection,
  updateSectionContent,
  updateSectionVisibility,
  deleteSection,
  duplicateSection,
  reorderSections,
  uploadPreviewFile,
  updateSiteSettings,
} from './actions'

export const dynamic = 'force-dynamic'

export default async function PreviewAdminPage() {
  const sections = await previewRepository.list()
  const settings = await previewSettingsRepository.get()

  async function uploadFile(file: File) {
    'use server'
    const formData = new FormData()
    formData.set('file', file)
    return uploadPreviewFile(formData)
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
