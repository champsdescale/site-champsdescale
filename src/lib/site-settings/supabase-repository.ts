import type { SupabaseClient } from '@supabase/supabase-js'
import type { FontChoice, SiteSettings } from '@/types/site-settings'
import type { SiteSettingsRepository } from './repository'

const ROW_ID = 'default'

interface SiteSettingsRow {
  color_bg: string
  color_text: string
  color_accent: string
  font_family: FontChoice
}

function toSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    colorBg: row.color_bg,
    colorText: row.color_text,
    colorAccent: row.color_accent,
    fontFamily: row.font_family,
  }
}

export function createSupabaseSiteSettingsRepository(client: SupabaseClient): SiteSettingsRepository {
  return {
    async get() {
      const { data, error } = await client
        .from('site_settings')
        .select('*')
        .eq('id', ROW_ID)
        .single()
      if (error) throw error
      return toSiteSettings(data as SiteSettingsRow)
    },

    async update(settings) {
      const { error } = await client
        .from('site_settings')
        .update({
          color_bg: settings.colorBg,
          color_text: settings.colorText,
          color_accent: settings.colorAccent,
          font_family: settings.fontFamily,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ROW_ID)
      if (error) throw error
    },
  }
}
