'use server'

// Temporary local-only mirror of src/app/admin/(protected)/actions.ts,
// delegating to the in-memory preview store instead of Supabase, and
// faking file "upload" with a data: URL instead of Supabase Storage.
// Delete along with preview-store.ts and /preview once a real Supabase
// project is connected.
import { previewRepository } from '@/lib/sections/preview-store'
import { previewSettingsRepository } from '@/lib/site-settings/preview-store'
import type { Section, SectionType } from '@/types/section'
import type { SiteSettings } from '@/types/site-settings'

export async function addSection(type: SectionType): Promise<Section> {
  return previewRepository.create(type)
}

export async function updateSectionContent(id: string, content: Section['content']): Promise<void> {
  await previewRepository.update(id, { content })
}

export async function updateSectionVisibility(id: string, visible: boolean): Promise<void> {
  await previewRepository.update(id, { visible })
}

export async function deleteSection(id: string): Promise<void> {
  await previewRepository.remove(id)
}

export async function duplicateSection(id: string): Promise<Section> {
  return previewRepository.duplicate(id)
}

export async function reorderSections(orderedIds: string[]): Promise<void> {
  await previewRepository.reorder(orderedIds)
}

export async function uploadPreviewFile(formData: FormData): Promise<{ url: string }> {
  const file = formData.get('file') as File
  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')
  return { url: `data:${file.type};base64,${base64}` }
}

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  await previewSettingsRepository.update(settings)
}
