export type FontChoice = 'inter' | 'poppins' | 'quicksand' | 'nunito' | 'lora' | 'playfair'

export interface FontOption {
  label: string
  stack: string
  googleFont: string
}

export const FONT_OPTIONS: Record<FontChoice, FontOption> = {
  inter: { label: 'Inter — moderne et neutre', stack: "'Inter', sans-serif", googleFont: 'Inter:wght@400;600;700' },
  poppins: { label: 'Poppins — rond et chaleureux', stack: "'Poppins', sans-serif", googleFont: 'Poppins:wght@400;600;700' },
  quicksand: { label: 'Quicksand — doux, adapté à un site pour enfants', stack: "'Quicksand', sans-serif", googleFont: 'Quicksand:wght@400;600;700' },
  nunito: { label: 'Nunito — arrondi et lisible', stack: "'Nunito', sans-serif", googleFont: 'Nunito:wght@400;600;700' },
  lora: { label: 'Lora — classique et chaleureux', stack: "'Lora', serif", googleFont: 'Lora:wght@400;600;700' },
  playfair: { label: 'Playfair Display — élégant', stack: "'Playfair Display', serif", googleFont: 'Playfair+Display:wght@400;600;700' },
}

export const FONT_CHOICES: FontChoice[] = ['inter', 'poppins', 'quicksand', 'nunito', 'lora', 'playfair']

export interface SiteSettings {
  colorBg: string
  colorText: string
  colorAccent: string
  fontFamily: FontChoice
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  colorBg: '#EDE6D3',
  colorText: '#3B2F23',
  colorAccent: '#A3A374',
  fontFamily: 'quicksand',
}

export interface ThemePreset {
  id: string
  label: string
  settings: SiteSettings
}

// A handful of ready-made "ambiances" a non-technical editor can pick with
// one click, instead of facing raw color pickers as the first option. The
// fine-grained pickers still exist behind "Personnaliser" for anyone who
// wants to go further than a preset — see SiteSettingsBar.
export const THEME_PRESETS: ThemePreset[] = [
  { id: 'chaleureux', label: 'Chaleureux', settings: DEFAULT_SITE_SETTINGS },
  {
    id: 'nature',
    label: 'Nature',
    settings: { colorBg: '#EEF3E6', colorText: '#26362B', colorAccent: '#6B8F58', fontFamily: 'nunito' },
  },
  {
    id: 'pastel',
    label: 'Doux pastel',
    settings: { colorBg: '#FBEFEA', colorText: '#4A3F3F', colorAccent: '#E3A9A0', fontFamily: 'quicksand' },
  },
  {
    id: 'ensoleille',
    label: 'Ensoleillé',
    settings: { colorBg: '#FFF6E0', colorText: '#5C3A21', colorAccent: '#E8A33D', fontFamily: 'poppins' },
  },
  {
    id: 'ocean',
    label: 'Océan',
    settings: { colorBg: '#EAF3F5', colorText: '#1F3A3D', colorAccent: '#5B9AA0', fontFamily: 'poppins' },
  },
  {
    id: 'classique',
    label: 'Classique élégant',
    settings: { colorBg: '#F5F1E8', colorText: '#2B2118', colorAccent: '#8C7A5B', fontFamily: 'playfair' },
  },
]

export function googleFontsHref(fontFamily: FontChoice): string {
  return `https://fonts.googleapis.com/css2?family=${FONT_OPTIONS[fontFamily].googleFont}&display=swap`
}

export function siteThemeCss(settings: SiteSettings): string {
  return `:root { --color-bg: ${settings.colorBg}; --color-text: ${settings.colorText}; --color-accent: ${settings.colorAccent}; --font-family: ${FONT_OPTIONS[settings.fontFamily].stack}; }`
}
