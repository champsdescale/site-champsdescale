import type { Section } from '@/types/section'
import { HeroSection } from './sections/HeroSection'
import { AnnouncementSection } from './sections/AnnouncementSection'
import { TextSection } from './sections/TextSection'
import { TeamSection } from './sections/TeamSection'
import { ValuesSection } from './sections/ValuesSection'
import { MenusSection } from './sections/MenusSection'
import { DocumentsSection } from './sections/DocumentsSection'
import { GallerySection } from './sections/GallerySection'
import { FaqSection } from './sections/FaqSection'
import { MapSection } from './sections/MapSection'
import { TestimonialsSection } from './sections/TestimonialsSection'
import { ContactFooterSection } from './sections/ContactFooterSection'

export function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case 'hero':
      return <HeroSection content={section.content} />
    case 'announcement':
      return <AnnouncementSection content={section.content} />
    case 'text':
      return <TextSection content={section.content} />
    case 'team':
      return <TeamSection content={section.content} />
    case 'values':
      return <ValuesSection content={section.content} />
    case 'menus':
      return <MenusSection content={section.content} />
    case 'documents':
      return <DocumentsSection content={section.content} />
    case 'gallery':
      return <GallerySection content={section.content} />
    case 'faq':
      return <FaqSection content={section.content} />
    case 'map':
      return <MapSection content={section.content} />
    case 'testimonials':
      return <TestimonialsSection content={section.content} />
    case 'contact_footer':
      return <ContactFooterSection content={section.content} />
    default: {
      const exhaustiveCheck: never = section
      throw new Error(`Unhandled section type: ${JSON.stringify(exhaustiveCheck)}`)
    }
  }
}
