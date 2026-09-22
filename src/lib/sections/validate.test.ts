import { describe, it, expect } from 'vitest'
import { validateContent } from './validate'
import { createDefaultContent, SECTION_TYPES } from '@/types/section'

describe('validateContent', () => {
  it('accepts a valid hero content', () => {
    const result = validateContent('hero', {
      badge: 'Accueil de loisirs périscolaire',
      titre: "Les Champs d'Escale",
      sousTitre: 'Un accueil chaleureux',
      texteCta: 'Nous contacter',
    })
    expect(result.ok).toBe(true)
  })

  it('rejects a hero content missing required fields', () => {
    const result = validateContent('hero', { titre: 'Only a title' })
    expect(result.ok).toBe(false)
  })

  it('accepts a valid faq content with items', () => {
    const result = validateContent('faq', {
      titre: 'Questions fréquentes',
      items: [{ question: 'Quels horaires ?', reponse: '7h30-18h30' }],
    })
    expect(result.ok).toBe(true)
  })

  it('rejects a documents content with a malformed file entry', () => {
    const result = validateContent('documents', {
      titre: 'Menu',
      fichiers: [{ nom: 'Menu de la semaine' }],
    })
    expect(result.ok).toBe(false)
  })

  it('validates the default content generated for every section type', () => {
    for (const type of SECTION_TYPES) {
      const result = validateContent(type, createDefaultContent(type))
      expect(result.ok, `default content for "${type}" should be valid`).toBe(true)
    }
  })
})
