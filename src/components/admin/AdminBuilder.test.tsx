import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminBuilder } from './AdminBuilder'
import type { Section } from '@/types/section'
import { DEFAULT_SITE_SETTINGS } from '@/types/site-settings'

const initialSections: Section[] = [
  { id: '1', type: 'hero', position: 0, visible: true, content: { badge: '', titre: 'Hero', sousTitre: '', texteCta: '' } },
]

function makeActions() {
  return {
    addSection: vi.fn().mockResolvedValue({ id: '2', type: 'text', position: 1, visible: true, content: { titre: 'Nouvelle rubrique', texte: '' } }),
    updateSectionContent: vi.fn().mockResolvedValue(undefined),
    updateSectionVisibility: vi.fn().mockResolvedValue(undefined),
    deleteSection: vi.fn().mockResolvedValue(undefined),
    duplicateSection: vi.fn().mockResolvedValue({ id: '3', type: 'hero', position: 1, visible: true, content: { badge: '', titre: 'Hero', sousTitre: '', texteCta: '' } }),
    reorderSections: vi.fn().mockResolvedValue(undefined),
    uploadFile: vi.fn(),
    updateSiteSettings: vi.fn().mockResolvedValue(undefined),
  }
}

describe('AdminBuilder', () => {
  // getByRole('button', { name: `Modifier « ${title} »` }) rather than
  // getByText: the live preview (SectionRenderer) renders the same section
  // title as the list panel's card ("Hero" in the list row and in the
  // preview's <h1>, same for a newly added section's default title), so a
  // plain text query matches both and TestingLibraryElementError: multiple
  // elements. The card's explicit aria-label disambiguates it from the
  // preview without depending on layout, and doubles as the accessible
  // name for the whole clickable card (not just its title text).

  it('selects a section and shows its editor form', async () => {
    render(<AdminBuilder initialSections={initialSections} initialSettings={DEFAULT_SITE_SETTINGS} actions={makeActions()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Modifier « Hero »' }))
    expect(screen.getByLabelText('Titre')).toBeInTheDocument()
  })

  it('adds a new section through the actions and shows it in the list', async () => {
    const actions = makeActions()
    render(<AdminBuilder initialSections={initialSections} initialSettings={DEFAULT_SITE_SETTINGS} actions={actions} />)
    await userEvent.click(screen.getByText('Ajouter un élément à la page'))
    await userEvent.click(screen.getByText('Paragraphe de texte'))
    expect(actions.addSection).toHaveBeenCalledWith('text')
    expect(
      await screen.findByRole('button', { name: 'Modifier « Nouvelle rubrique »' })
    ).toBeInTheDocument()
  })

  it('edits the selected section content and triggers the autosave action', async () => {
    // Real timers on purpose: userEvent's internal typing delays hang
    // forever under vi.useFakeTimers() unless userEvent itself is
    // configured with { advanceTimers }. A real ~1s wait for the autosave
    // debounce is simpler and avoids that footgun entirely.
    const actions = makeActions()
    render(<AdminBuilder initialSections={initialSections} initialSettings={DEFAULT_SITE_SETTINGS} actions={actions} />)
    await userEvent.click(screen.getByRole('button', { name: 'Modifier « Hero »' }))

    const titreInput = screen.getByLabelText('Titre')
    await userEvent.clear(titreInput)
    await userEvent.type(titreInput, 'Titre modifié')

    await waitFor(
      () =>
        expect(actions.updateSectionContent).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ titre: 'Titre modifié' })
        ),
      { timeout: 2000 }
    )
  })

  it('selects a section by clicking it directly in the live preview', async () => {
    render(<AdminBuilder initialSections={initialSections} initialSettings={DEFAULT_SITE_SETTINGS} actions={makeActions()} />)
    expect(screen.queryByLabelText('Titre')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: "Modifier Bannière d'accueil" }))
    expect(screen.getByLabelText('Titre')).toBeInTheDocument()
  })
})
