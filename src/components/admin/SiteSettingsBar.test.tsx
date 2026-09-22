import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteSettingsBar } from './SiteSettingsBar'
import { DEFAULT_SITE_SETTINGS, THEME_PRESETS } from '@/types/site-settings'

describe('SiteSettingsBar', () => {
  it('applies a preset\'s full settings when clicked', async () => {
    const onChange = vi.fn()
    render(<SiteSettingsBar settings={DEFAULT_SITE_SETTINGS} onChange={onChange} />)

    const natureButton = screen.getByRole('button', { name: /Nature/ })
    await userEvent.click(natureButton)

    const nature = THEME_PRESETS.find((preset) => preset.id === 'nature')!
    expect(onChange).toHaveBeenLastCalledWith(nature.settings)
  })

  it('resets to the default settings when clicking "Par défaut"', async () => {
    const onChange = vi.fn()
    const customSettings = { ...DEFAULT_SITE_SETTINGS, colorAccent: '#ff00ff' }
    render(<SiteSettingsBar settings={customSettings} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /Par défaut/ }))

    expect(onChange).toHaveBeenLastCalledWith(DEFAULT_SITE_SETTINGS)
  })

  it('reveals the advanced pickers behind "Personnaliser" and reports a color change', async () => {
    const onChange = vi.fn()
    render(<SiteSettingsBar settings={DEFAULT_SITE_SETTINGS} onChange={onChange} />)

    expect(screen.queryByLabelText('Couleur de fond')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Personnaliser/ }))

    const bgInput = screen.getByLabelText('Couleur de fond')
    fireEvent.change(bgInput, { target: { value: '#ff0000' } })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ colorBg: '#ff0000' })
    )
  })

  it('reports a font change from the advanced panel', async () => {
    const onChange = vi.fn()
    render(<SiteSettingsBar settings={DEFAULT_SITE_SETTINGS} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /Personnaliser/ }))
    await userEvent.selectOptions(screen.getByLabelText('Police du site'), 'lora')

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ fontFamily: 'lora' })
    )
  })
})
