import type { Section } from '@/types/section'

export function renumberPositions(sections: Section[]): Section[] {
  return sections.map((section, index) => ({ ...section, position: index }))
}

export function moveSection(sections: Section[], fromIndex: number, toIndex: number): Section[] {
  if (fromIndex === toIndex) return sections
  const next = [...sections]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return renumberPositions(next)
}
