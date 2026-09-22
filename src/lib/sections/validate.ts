import { z } from 'zod'
import type { SectionType } from '@/types/section'

const heroSchema = z.object({
  badge: z.string().min(1),
  titre: z.string().min(1),
  sousTitre: z.string().min(1),
  texteCta: z.string().min(1),
})

const announcementSchema = z.object({
  texte: z.string().min(1),
})

const textSchema = z.object({
  titre: z.string().min(1),
  texte: z.string(),
})

const teamSchema = z.object({
  titre: z.string().min(1),
  membres: z.array(
    z.object({ nom: z.string().min(1), role: z.string(), photoUrl: z.string() })
  ),
})

const valuesSchema = z.object({
  titre: z.string().min(1),
  points: z.array(z.object({ label: z.string().min(1), texte: z.string() })),
})

const menusSchema = z.object({
  titre: z.string().min(1),
  lundi: z.string(),
  mardi: z.string(),
  mercredi: z.string(),
  jeudi: z.string(),
  vendredi: z.string(),
})

const documentsSchema = z.object({
  titre: z.string().min(1),
  fichiers: z.array(z.object({ nom: z.string().min(1), url: z.string() })),
})

const gallerySchema = z.object({
  titre: z.string().min(1),
  photos: z.array(z.object({ url: z.string(), alt: z.string() })),
})

const faqSchema = z.object({
  titre: z.string().min(1),
  items: z.array(z.object({ question: z.string().min(1), reponse: z.string() })),
})

const mapSchema = z.object({
  titre: z.string().min(1),
  adresse: z.string(),
  latLng: z.object({ lat: z.number(), lng: z.number() }).nullable(),
})

const testimonialsSchema = z.object({
  titre: z.string().min(1),
  citations: z.array(z.object({ texte: z.string().min(1), auteur: z.string() })),
})

const contactFooterSchema = z.object({
  adresse: z.string(),
  telephone: z.string(),
  email: z.string(),
})

const SCHEMAS: Record<SectionType, z.ZodTypeAny> = {
  hero: heroSchema,
  announcement: announcementSchema,
  text: textSchema,
  team: teamSchema,
  values: valuesSchema,
  menus: menusSchema,
  documents: documentsSchema,
  gallery: gallerySchema,
  faq: faqSchema,
  map: mapSchema,
  testimonials: testimonialsSchema,
  contact_footer: contactFooterSchema,
}

export function validateContent(
  type: SectionType,
  content: unknown
): { ok: true } | { ok: false; errors: string[] } {
  const schema = SCHEMAS[type]
  const result = schema.safeParse(content)
  if (result.success) return { ok: true }
  return { ok: false, errors: result.error.issues.map((issue) => issue.message) }
}
