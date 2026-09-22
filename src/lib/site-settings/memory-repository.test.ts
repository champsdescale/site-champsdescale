import { describe, it, expect } from 'vitest'
import { createMemorySiteSettingsRepository } from './memory-repository'
import { DEFAULT_SITE_SETTINGS } from '@/types/site-settings'

describe('createMemorySiteSettingsRepository', () => {
  it('returns the default settings when none were given', async () => {
    const repo = createMemorySiteSettingsRepository()
    expect(await repo.get()).toEqual(DEFAULT_SITE_SETTINGS)
  })

  it('returns the initial settings passed at creation', async () => {
    const initial = { ...DEFAULT_SITE_SETTINGS, colorAccent: '#ff0000' }
    const repo = createMemorySiteSettingsRepository(initial)
    expect(await repo.get()).toEqual(initial)
  })

  it('persists an update and returns it on the next get', async () => {
    const repo = createMemorySiteSettingsRepository()
    const updated = { ...DEFAULT_SITE_SETTINGS, colorAccent: '#00ff00', fontFamily: 'lora' as const }
    await repo.update(updated)
    expect(await repo.get()).toEqual(updated)
  })
})
