// Temporary, local-only singleton used by /preview and /preview-admin so the
// UI can be smoke-tested in a browser before a real Supabase project exists.
// Not part of the plan's task list — delete this file and the two preview
// routes once .env.local points at a real project (Task 5/14).
import { createMemoryRepository } from './memory-repository'
import type { Section } from '@/types/section'

const seedSections: Section[] = [
  {
    id: 'preview-hero',
    type: 'hero',
    position: 0,
    visible: true,
    content: {
      badge: 'Accueil de loisirs périscolaire',
      titre: "Les Champs d'Escale",
      sousTitre: "Un accueil chaleureux pour vos enfants avant et après l'école",
      texteCta: 'Découvrir nos services',
    },
  },
  {
    id: 'preview-text',
    type: 'text',
    position: 1,
    visible: true,
    content: {
      titre: 'Le périscolaire',
      texte: "Nous accueillons vos enfants tous les matins et tous les soirs d'école, dans un cadre bienveillant.",
    },
  },
  {
    id: 'preview-team',
    type: 'team',
    position: 2,
    visible: true,
    content: {
      titre: 'Notre équipe',
      membres: [{ nom: 'Julie Martin', role: 'Directrice', photoUrl: '' }],
    },
  },
  {
    id: 'preview-faq',
    type: 'faq',
    position: 3,
    visible: true,
    content: {
      titre: 'Questions fréquentes',
      items: [{ question: 'Quels horaires ?', reponse: '7h30-18h30' }],
    },
  },
  {
    id: 'preview-contact',
    type: 'contact_footer',
    position: 4,
    visible: true,
    content: {
      adresse: '7 chemin de la souffel',
      telephone: '09.62.23.88.62',
      email: 'champsdescale@gmail.com',
    },
  },
]

// A module-level singleton: Next.js dev runs a single Node process, so this
// instance persists across requests until the dev server restarts.
export const previewRepository = createMemoryRepository(seedSections)
