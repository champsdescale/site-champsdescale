import type { Section, SectionType } from '@/types/section'

export interface SectionsRepository {
  list(): Promise<Section[]>
  create(type: SectionType): Promise<Section>
  update(id: string, patch: { content?: Section['content']; visible?: boolean }): Promise<void>
  remove(id: string): Promise<void>
  reorder(orderedIds: string[]): Promise<void>
  duplicate(id: string): Promise<Section>
}
