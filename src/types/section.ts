export type SectionType =
  | 'hero'
  | 'announcement'
  | 'text'
  | 'team'
  | 'values'
  | 'menus'
  | 'documents'
  | 'gallery'
  | 'faq'
  | 'map'
  | 'testimonials'
  | 'contact_footer'

export const SECTION_TYPES: SectionType[] = [
  'hero', 'announcement', 'text', 'team', 'values', 'menus', 'documents',
  'gallery', 'faq', 'map', 'testimonials', 'contact_footer',
]

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "Bannière d'accueil",
  announcement: 'Annonce',
  text: 'Paragraphe de texte',
  team: 'Notre équipe',
  values: 'Notre pédagogie',
  menus: 'Menus de la semaine',
  documents: 'Documents à télécharger',
  gallery: 'Galerie de photos',
  faq: 'Questions fréquentes',
  map: 'Nous trouver',
  testimonials: 'Avis des parents',
  contact_footer: 'Coordonnées',
}

export const SECTION_TYPE_DESCRIPTIONS: Record<SectionType, string> = {
  hero: 'La grande image et le titre tout en haut de la page',
  announcement: 'Un message important mis en avant, par exemple une fermeture exceptionnelle',
  text: 'Un bloc de texte libre, avec un titre',
  team: "Présente les membres de l'équipe avec leur photo",
  values: 'Présente vos valeurs ou votre pédagogie en quelques points',
  menus: 'Le menu du lundi au vendredi, un texte libre par jour',
  documents: 'Des fichiers à télécharger (menus, règlement...)',
  gallery: 'Une série de photos',
  faq: 'Une liste de questions et de réponses',
  map: 'Votre adresse et une carte pour vous trouver',
  testimonials: 'Des avis ou citations de parents',
  contact_footer: 'Adresse, téléphone et email en bas de page',
}

export interface HeroContent {
  badge: string
  titre: string
  sousTitre: string
  texteCta: string
}

export interface AnnouncementContent {
  texte: string
}

export interface TextContent {
  titre: string
  texte: string
}

export interface TeamMember {
  nom: string
  role: string
  photoUrl: string
}

export interface TeamContent {
  titre: string
  membres: TeamMember[]
}

export interface ValuePoint {
  label: string
  texte: string
}

export interface ValuesContent {
  titre: string
  points: ValuePoint[]
}

export interface MenusContent {
  titre: string
  lundi: string
  mardi: string
  mercredi: string
  jeudi: string
  vendredi: string
}

export interface DocumentFile {
  nom: string
  url: string
}

export interface DocumentsContent {
  titre: string
  fichiers: DocumentFile[]
}

export interface GalleryPhoto {
  url: string
  alt: string
}

export interface GalleryContent {
  titre: string
  photos: GalleryPhoto[]
}

export interface FaqItem {
  question: string
  reponse: string
}

export interface FaqContent {
  titre: string
  items: FaqItem[]
}

export interface MapContent {
  titre: string
  adresse: string
  latLng: { lat: number; lng: number } | null
}

export interface TestimonialItem {
  texte: string
  auteur: string
}

export interface TestimonialsContent {
  titre: string
  citations: TestimonialItem[]
}

export interface ContactFooterContent {
  adresse: string
  telephone: string
  email: string
}

export type SectionContentMap = {
  hero: HeroContent
  announcement: AnnouncementContent
  text: TextContent
  team: TeamContent
  values: ValuesContent
  menus: MenusContent
  documents: DocumentsContent
  gallery: GalleryContent
  faq: FaqContent
  map: MapContent
  testimonials: TestimonialsContent
  contact_footer: ContactFooterContent
}

export type Section = {
  [T in SectionType]: {
    id: string
    type: T
    position: number
    visible: boolean
    content: SectionContentMap[T]
  }
}[SectionType]

// Every default below is filled with a concrete, plausible example rather
// than an empty shell: a first-time editor adding a section sees exactly
// what a finished one looks like, and edits it in place instead of facing
// a blank form with no idea what's expected in each field.
export function createDefaultContent<T extends SectionType>(type: T): SectionContentMap[T] {
  const defaults: SectionContentMap = {
    hero: {
      badge: 'Accueil de loisirs périscolaire',
      titre: "Les Champs d'Escale",
      sousTitre: "Un accueil chaleureux pour vos enfants avant et après l'école",
      texteCta: 'Découvrir nos services',
    },
    announcement: {
      texte: 'Fermeture exceptionnelle le vendredi 3 octobre — merci de votre compréhension.',
    },
    text: {
      titre: 'Notre histoire',
      texte:
        "Les Champs d'Escale accueille les enfants du quartier avant et après l'école depuis plusieurs années. Notre équipe propose des activités variées dans un cadre chaleureux et sécurisant, pour que chaque enfant se sente bien en dehors des heures de classe.",
    },
    team: {
      titre: 'Notre équipe',
      membres: [
        { nom: 'Julie Martin', role: 'Directrice', photoUrl: '' },
        { nom: 'Thomas Petit', role: 'Animateur', photoUrl: '' },
        { nom: 'Sophie Bernard', role: 'Animatrice', photoUrl: '' },
      ],
    },
    values: {
      titre: 'Notre pédagogie',
      points: [
        { label: 'Bienveillance', texte: 'Un accueil chaleureux où chaque enfant est écouté et respecté.' },
        { label: 'Autonomie', texte: 'Des activités qui encouragent les enfants à prendre des initiatives.' },
        { label: 'Partage', texte: 'Des moments collectifs pour apprendre à vivre ensemble.' },
      ],
    },
    menus: {
      titre: 'Menus de la semaine',
      lundi: 'Purée de carottes, poulet rôti, riz, fromage blanc',
      mardi: 'Salade de blé, sauté de bœuf, haricots verts, compote',
      mercredi: 'Œuf mimosa, gratin de poisson, épinards, yaourt',
      jeudi: 'Carottes râpées, rôti de dinde, purée, fruit de saison',
      vendredi: 'Taboulé, poisson pané, petits pois, crème dessert',
    },
    documents: {
      titre: 'Documents utiles',
      fichiers: [
        { nom: 'Règlement intérieur', url: '' },
        { nom: 'Menu de la semaine', url: '' },
      ],
    },
    gallery: {
      titre: 'En images',
      photos: [
        { url: '', alt: 'Activité manuelle avec les enfants' },
        { url: '', alt: 'Sortie au parc' },
        { url: '', alt: 'Goûter collectif' },
      ],
    },
    faq: {
      titre: 'Questions fréquentes',
      items: [
        { question: 'Quels sont les horaires ?', reponse: "Nous accueillons vos enfants de 7h30 à 8h30 et de 16h30 à 18h30, les jours d'école." },
        { question: 'Faut-il inscrire son enfant à l\'année ?', reponse: "Non, vous pouvez réserver au mois ou à la semaine selon vos besoins." },
      ],
    },
    map: {
      titre: 'Nous trouver',
      adresse: '7 chemin de la Souffel, 67460 Souffelweyersheim',
      latLng: null,
    },
    testimonials: {
      titre: 'Ce qu\'en disent les parents',
      citations: [
        { texte: "Une équipe à l'écoute, mon fils est toujours content d'y aller !", auteur: 'Karim, papa de Nour' },
        { texte: 'Un cadre chaleureux et des activités variées, on recommande.', auteur: 'Anaïs, maman de Léo' },
      ],
    },
    contact_footer: {
      adresse: '7 chemin de la Souffel, 67460 Souffelweyersheim',
      telephone: '09.62.23.88.62',
      email: 'champsdescale@gmail.com',
    },
  }
  return defaults[type]
}
