import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionEditorPanel } from './SectionEditorPanel'
import type { Section } from '@/types/section'

describe('SectionEditorPanel', () => {
  it('renders the hero form and reports edits through onChange', () => {
    const onChange = vi.fn()
    const section: Section = {
      id: '1',
      type: 'hero',
      position: 0,
      visible: true,
      content: { badge: 'Badge', titre: 'Titre', sousTitre: 'Sous-titre', texteCta: 'CTA' },
    }
    render(<SectionEditorPanel section={section} onChange={onChange} uploadFile={vi.fn()} />)

    // fireEvent.change, not userEvent.clear + userEvent.type: this panel is
    // rendered directly with a fixed `section` prop and no stateful parent
    // feeding onChange back into it (that wiring is Task 13's AdminBuilder,
    // exercised there instead). Typing character-by-character into a
    // controlled input whose value prop never updates between keystrokes
    // re-syncs to the stale prop after every character, so the result is
    // garbled ("Titree") rather than the typed string. A single atomic
    // value-set is what this test actually needs: confirming one edit
    // reports the right full content object through onChange.
    const titreInput = screen.getByLabelText('Titre')
    fireEvent.change(titreInput, { target: { value: 'Nouveau titre' } })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ titre: 'Nouveau titre' })
    )
  })

  it('renders the documents form and uploads a file on selection', async () => {
    const onChange = vi.fn()
    const uploadFile = vi.fn().mockResolvedValue({ url: 'https://example.com/menu.pdf' })
    const section: Section = {
      id: '2',
      type: 'documents',
      position: 0,
      visible: true,
      content: { titre: 'Menu', fichiers: [] },
    }
    render(<SectionEditorPanel section={section} onChange={onChange} uploadFile={uploadFile} />)

    const file = new File(['content'], 'menu.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText('Ajouter un fichier')
    await userEvent.upload(input, file)

    expect(uploadFile).toHaveBeenCalledWith(file)
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        fichiers: [{ nom: 'menu.pdf', url: 'https://example.com/menu.pdf' }],
      })
    )
  })
})
