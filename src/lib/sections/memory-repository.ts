import type { Section, SectionType } from '@/types/section'
import { createDefaultContent } from '@/types/section'
import type { SectionsRepository } from './repository'
import { renumberPositions } from './order'

export function createMemoryRepository(initial: Section[] = []): SectionsRepository {
  let sections = renumberPositions(initial)

  return {
    async list() {
      return [...sections].sort((a, b) => a.position - b.position)
    },

    async create(type: SectionType) {
      const section = {
        id: crypto.randomUUID(),
        type,
        position: sections.length,
        visible: true,
        content: createDefaultContent(type),
      } as Section
      sections = [...sections, section]
      return section
    },

    async update(id, patch) {
      sections = sections.map((section) =>
        section.id === id
          ? ({
              ...section,
              ...(patch.visible !== undefined ? { visible: patch.visible } : {}),
              ...(patch.content !== undefined ? { content: patch.content } : {}),
            } as Section)
          : section
      )
    },

    async remove(id) {
      sections = renumberPositions(sections.filter((section) => section.id !== id))
    },

    async reorder(orderedIds) {
      const byId = new Map(sections.map((section) => [section.id, section]))
      sections = renumberPositions(
        orderedIds.map((id) => byId.get(id)).filter((s): s is Section => !!s)
      )
    },

    async duplicate(id) {
      const original = sections.find((section) => section.id === id)
      if (!original) throw new Error(`Section ${id} not found`)
      const copy = {
        ...original,
        id: crypto.randomUUID(),
        position: sections.length,
      } as Section
      sections = [...sections, copy]
      return copy
    },
  }
}
