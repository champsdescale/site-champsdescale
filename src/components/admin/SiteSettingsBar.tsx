'use client'

import { useState } from 'react'
import { Palette, RotateCcw, SlidersHorizontal, Check } from 'lucide-react'
import type { SiteSettings, FontChoice } from '@/types/site-settings'
import { FONT_CHOICES, FONT_OPTIONS, THEME_PRESETS, DEFAULT_SITE_SETTINGS } from '@/types/site-settings'

function settingsEqual(a: SiteSettings, b: SiteSettings) {
  return a.colorBg === b.colorBg && a.colorText === b.colorText && a.colorAccent === b.colorAccent && a.fontFamily === b.fontFamily
}

export function SiteSettingsBar({
  settings,
  onChange,
}: {
  settings: SiteSettings
  onChange: (settings: SiteSettings) => void
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <div className="border-b border-[#d8d0b8] bg-white/60 px-4 py-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1 text-sm font-semibold text-[#3B2F23] shrink-0">
          <Palette size={16} /> Ambiance du site
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {THEME_PRESETS.map((preset) => {
            const active = settingsEqual(settings, preset.settings)
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange(preset.settings)}
                className={`flex items-center gap-1.5 border px-2 py-1 text-xs ${
                  active ? 'border-2 border-[#3B2F23] font-semibold' : 'border-[#d8d0b8]'
                }`}
              >
                <span className="flex -space-x-1">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white"
                    style={{ backgroundColor: preset.settings.colorBg }}
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white"
                    style={{ backgroundColor: preset.settings.colorAccent }}
                  />
                </span>
                {preset.label}
                {active && <Check size={12} />}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_SITE_SETTINGS)}
            className="flex items-center gap-1 text-xs text-[#5b4f3f]"
          >
            <RotateCcw size={14} /> Par défaut
          </button>
          <button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            className="flex items-center gap-1 border border-[#d8d0b8] px-2 py-1 text-xs"
          >
            <SlidersHorizontal size={14} /> {advancedOpen ? 'Fermer' : 'Personnaliser'}
          </button>
        </div>
      </div>

      {advancedOpen && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 pt-2 border-t border-[#d8d0b8]">
          <div className="flex items-center gap-1.5">
            <label htmlFor="settings-color-bg" className="text-xs text-[#5b4f3f]">
              Couleur de fond
            </label>
            <input
              id="settings-color-bg"
              type="color"
              value={settings.colorBg}
              onChange={(event) => onChange({ ...settings, colorBg: event.target.value })}
              className="h-7 w-9 border border-[#d8d0b8] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="settings-color-text" className="text-xs text-[#5b4f3f]">
              Couleur du texte
            </label>
            <input
              id="settings-color-text"
              type="color"
              value={settings.colorText}
              onChange={(event) => onChange({ ...settings, colorText: event.target.value })}
              className="h-7 w-9 border border-[#d8d0b8] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="settings-color-accent" className="text-xs text-[#5b4f3f]">
              Couleur d&apos;accent
            </label>
            <input
              id="settings-color-accent"
              type="color"
              value={settings.colorAccent}
              onChange={(event) => onChange({ ...settings, colorAccent: event.target.value })}
              className="h-7 w-9 border border-[#d8d0b8] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="settings-font" className="text-xs text-[#5b4f3f]">
              Police du site
            </label>
            <select
              id="settings-font"
              value={settings.fontFamily}
              onChange={(event) => onChange({ ...settings, fontFamily: event.target.value as FontChoice })}
              className="border border-[#d8d0b8] px-2 py-1 text-sm bg-white"
            >
              {FONT_CHOICES.map((choice) => (
                <option key={choice} value={choice}>
                  {FONT_OPTIONS[choice].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
