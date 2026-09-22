import { describe, it, expect } from 'vitest'
import { createMemoryRepository } from './memory-repository'

describe('createMemoryRepository', () => {
  it('starts empty and creates a section with default content', async () => {
    const repo = createMemoryRepository()
    const created = await repo.create('text')
    expect(created.type).toBe('text')
    expect(created.position).toBe(0)
    const all = await repo.list()
    expect(all).toHaveLength(1)
  })

  it('updates the content and visibility of an existing section', async () => {
    const repo = createMemoryRepository()
    const created = await repo.create('text')
    await repo.update(created.id, { visible: false, content: { titre: 'Édité', texte: 'contenu' } })
    const [updated] = await repo.list()
    expect(updated.visible).toBe(false)
    expect(updated.content).toEqual({ titre: 'Édité', texte: 'contenu' })
  })

  it('removes a section', async () => {
    const repo = createMemoryRepository()
    const created = await repo.create('text')
    await repo.remove(created.id)
    expect(await repo.list()).toHaveLength(0)
  })

  it('reorders sections by a list of ids', async () => {
    const repo = createMemoryRepository()
    const a = await repo.create('text')
    const b = await repo.create('team')
    await repo.reorder([b.id, a.id])
    const all = await repo.list()
    expect(all.map((s) => s.id)).toEqual([b.id, a.id])
    expect(all.map((s) => s.position)).toEqual([0, 1])
  })

  it('duplicates a section with the same content, appended at the end', async () => {
    const repo = createMemoryRepository()
    const original = await repo.create('text')
    await repo.update(original.id, { content: { titre: 'Original', texte: 'x' } })
    const copy = await repo.duplicate(original.id)
    expect(copy.id).not.toBe(original.id)
    expect(copy.content).toEqual({ titre: 'Original', texte: 'x' })
    expect(await repo.list()).toHaveLength(2)
  })
})
