import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionRenderer } from './SectionRenderer'
import type { Section } from '@/types/section'

describe('SectionRenderer', () => {
  it('renders the hero title for a hero section', () => {
    const section: Section = {
      id: '1',
      type: 'hero',
      position: 0,
      visible: true,
      content: {
        badge: 'Accueil de loisirs périscolaire',
        titre: "Les Champs d'Escale",
        sousTitre: 'Sous-titre',
        texteCta: 'Découvrir',
      },
    }
    render(<SectionRenderer section={section} />)
    expect(screen.getByText("Les Champs d'Escale")).toBeInTheDocument()
  })

  it('renders the FAQ questions for a faq section', () => {
    const section: Section = {
      id: '2',
      type: 'faq',
      position: 1,
      visible: true,
      content: {
        titre: 'Questions fréquentes',
        items: [{ question: 'Quels horaires ?', reponse: '7h30-18h30' }],
      },
    }
    render(<SectionRenderer section={section} />)
    expect(screen.getByText('Quels horaires ?')).toBeInTheDocument()
  })

  it('renders the contact footer fields', () => {
    const section: Section = {
      id: '3',
      type: 'contact_footer',
      position: 2,
      visible: true,
      content: {
        adresse: '7 chemin de la souffel',
        telephone: '09.62.23.88.62',
        email: 'champsdescale@gmail.com',
      },
    }
    render(<SectionRenderer section={section} />)
    expect(screen.getByText('champsdescale@gmail.com')).toBeInTheDocument()
  })
})
