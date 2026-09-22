import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionsListPanel } from './SectionsListPanel'
import type { Section } from '@/types/section'

const sections: Section[] = [
  { id: '1', type: 'hero', position: 0, visible: true, content: { badge: '', titre: 'Hero', sousTitre: '', texteCta: '' } },
  { id: '2', type: 'text', position: 1, visible: false, content: { titre: 'Le périscolaire', texte: '' } },
]

describe('SectionsListPanel', () => {
  it('lists every section by its title and calls onSelect on click', async () => {
    const onSelect = vi.fn()
    render(
      <SectionsListPanel
        sections={sections}
        selectedId={null}
        onSelect={onSelect}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onToggleVisible={vi.fn()}
        onReorder={vi.fn()}
      />
    )
    expect(screen.getByText('Hero')).toBeInTheDocument()
    expect(screen.getByText('Le périscolaire')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Hero'))
    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('selects the section when clicking anywhere on its card, not just the title', async () => {
    const onSelect = vi.fn()
    render(
      <SectionsListPanel
        sections={sections}
        selectedId={null}
        onSelect={onSelect}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onToggleVisible={vi.fn()}
        onReorder={vi.fn()}
      />
    )
    // "Paragraphe de texte" is the type badge on section '2''s card, not
    // its title ("Le périscolaire") — clicking it should still select the
    // card, since the whole card is the clickable target now.
    await userEvent.click(screen.getByText('Paragraphe de texte'))
    expect(onSelect).toHaveBeenCalledWith('2')
  })

  it('does not also select the card when clicking an action button on it', async () => {
    const onSelect = vi.fn()
    render(
      <SectionsListPanel
        sections={sections}
        selectedId={null}
        onSelect={onSelect}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onToggleVisible={vi.fn()}
        onReorder={vi.fn()}
      />
    )
    await userEvent.click(screen.getAllByLabelText('Supprimer la section')[0])
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('calls onDelete and onDuplicate for the right section', async () => {
    const onDelete = vi.fn()
    const onDuplicate = vi.fn()
    render(
      <SectionsListPanel
        sections={sections}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onToggleVisible={vi.fn()}
        onReorder={vi.fn()}
      />
    )
    await userEvent.click(screen.getAllByLabelText('Supprimer la section')[0])
    expect(onDelete).toHaveBeenCalledWith('1')

    await userEvent.click(screen.getAllByLabelText('Dupliquer la section')[1])
    expect(onDuplicate).toHaveBeenCalledWith('2')
  })

  it('calls onToggleVisible when the visibility button is clicked', async () => {
    const onToggleVisible = vi.fn()
    render(
      <SectionsListPanel
        sections={sections}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onToggleVisible={onToggleVisible}
        onReorder={vi.fn()}
      />
    )
    // Section '2' starts hidden (visible: false), so its toggle button is
    // labelled "Afficher la section" (the other section's is "Masquer la
    // section") — the aria-label reflects the current state instead of a
    // generic "Afficher ou masquer", so a screen reader user hears which
    // action the button performs, not just that it toggles something.
    await userEvent.click(screen.getByLabelText('Afficher la section'))
    expect(onToggleVisible).toHaveBeenCalledWith('2')
  })

  it('opens the type menu and calls onAdd with the chosen type', async () => {
    const onAdd = vi.fn()
    render(
      <SectionsListPanel
        sections={sections}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={onAdd}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onToggleVisible={vi.fn()}
        onReorder={vi.fn()}
      />
    )
    await userEvent.click(screen.getByText('Ajouter un élément à la page'))
    await userEvent.click(screen.getByText('Questions fréquentes'))
    expect(onAdd).toHaveBeenCalledWith('faq')
  })
})
