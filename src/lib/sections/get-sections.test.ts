import { describe, it, expect } from 'vitest'
import { getVisibleSections } from './get-sections'
import { createMemoryRepository } from './memory-repository'

describe('getVisibleSections', () => {
  it('returns only visible sections, sorted by position', async () => {
    const repo = createMemoryRepository()
    const a = await repo.create('hero')
    const b = await repo.create('text')
    await repo.update(b.id, { visible: false })
    const result = await getVisibleSections(repo)
    expect(result.map((s) => s.id)).toEqual([a.id])
  })

  it('returns an empty array when the repository has no sections', async () => {
    const repo = createMemoryRepository()
    expect(await getVisibleSections(repo)).toEqual([])
  })
})
