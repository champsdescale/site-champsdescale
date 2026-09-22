import type { SectionsRepository } from './repository'
import type { Section } from '@/types/section'

export async function getVisibleSections(repository: SectionsRepository): Promise<Section[]> {
  const all = await repository.list()
  return all.filter((section) => section.visible)
}
