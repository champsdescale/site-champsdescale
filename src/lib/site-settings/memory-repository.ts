import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/types/site-settings'
import type { SiteSettingsRepository } from './repository'

export function createMemorySiteSettingsRepository(
  initial: SiteSettings = DEFAULT_SITE_SETTINGS
): SiteSettingsRepository {
  let settings = initial

  return {
    async get() {
      return settings
    },
    async update(next) {
      settings = next
    },
  }
}
