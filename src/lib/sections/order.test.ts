import { describe, it, expect } from 'vitest'
import { moveSection, renumberPositions } from './order'
import type { Section } from '@/types/section'

function makeSection(id: string, position: number): Section {
  return {
    id,
    type: 'text',
    position,
    visible: true,
    content: { titre: id, texte: '' },
  }
}

describe('moveSection', () => {
  it('moves an item from one index to another and renumbers positions', () => {
    const sections = [makeSection('a', 0), makeSection('b', 1), makeSection('c', 2)]
    const result = moveSection(sections, 0, 2)
    expect(result.map((s) => s.id)).toEqual(['b', 'c', 'a'])
    expect(result.map((s) => s.position)).toEqual([0, 1, 2])
  })

  it('does nothing when fromIndex equals toIndex', () => {
    const sections = [makeSection('a', 0), makeSection('b', 1)]
    const result = moveSection(sections, 1, 1)
    expect(result.map((s) => s.id)).toEqual(['a', 'b'])
  })
})

describe('renumberPositions', () => {
  it('reassigns sequential positions regardless of current values', () => {
    const sections = [makeSection('a', 5), makeSection('b', 12)]
    const result = renumberPositions(sections)
    expect(result.map((s) => s.position)).toEqual([0, 1])
  })
})
