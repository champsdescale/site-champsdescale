'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseSectionsRepository } from '@/lib/sections/supabase-repository'
import { createSupabaseSiteSettingsRepository } from '@/lib/site-settings/supabase-repository'
import { uploadFile as uploadFileToStorage } from '@/lib/storage/upload-file'
import type { Section, SectionType } from '@/types/section'
import type { SiteSettings } from '@/types/site-settings'

async function getRepository() {
  const client = await createSupabaseServerClient()
  return { client, repository: createSupabaseSectionsRepository(client) }
}

export async function addSection(type: SectionType): Promise<Section> {
  const { repository } = await getRepository()
  return repository.create(type)
}

export async function updateSectionContent(id: string, content: Section['content']): Promise<void> {
  const { repository } = await getRepository()
  await repository.update(id, { content })
}

export async function updateSectionVisibility(id: string, visible: boolean): Promise<void> {
  const { repository } = await getRepository()
  await repository.update(id, { visible })
}

export async function deleteSection(id: string): Promise<void> {
  const { repository } = await getRepository()
  await repository.remove(id)
}

export async function duplicateSection(id: string): Promise<Section> {
  const { repository } = await getRepository()
  return repository.duplicate(id)
}

export async function reorderSections(orderedIds: string[]): Promise<void> {
  const { repository } = await getRepository()
  await repository.reorder(orderedIds)
}

export async function uploadSectionFile(formData: FormData): Promise<{ url: string }> {
  const file = formData.get('file') as File
  const { client } = await getRepository()
  return uploadFileToStorage(client, file)
}

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  const client = await createSupabaseServerClient()
  await createSupabaseSiteSettingsRepository(client).update(settings)
}
