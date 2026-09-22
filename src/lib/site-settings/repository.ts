import type { SiteSettings } from '@/types/site-settings'

export interface SiteSettingsRepository {
  get(): Promise<SiteSettings>
  update(settings: SiteSettings): Promise<void>
}
