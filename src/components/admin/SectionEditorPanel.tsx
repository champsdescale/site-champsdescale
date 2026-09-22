import type { Section } from '@/types/section'
import { HeroForm } from './forms/HeroForm'
import { AnnouncementForm } from './forms/AnnouncementForm'
import { TextForm } from './forms/TextForm'
import { TeamForm } from './forms/TeamForm'
import { ValuesForm } from './forms/ValuesForm'
import { MenusForm } from './forms/MenusForm'
import { DocumentsForm } from './forms/DocumentsForm'
import { GalleryForm } from './forms/GalleryForm'
import { FaqForm } from './forms/FaqForm'
import { MapForm } from './forms/MapForm'
import { TestimonialsForm } from './forms/TestimonialsForm'
import { ContactFooterForm } from './forms/ContactFooterForm'

interface Props {
  section: Section
  onChange: (content: Section['content']) => void
  uploadFile: (file: File) => Promise<{ url: string }>
}

export function SectionEditorPanel({ section, onChange, uploadFile }: Props) {
  switch (section.type) {
    case 'hero':
      return <HeroForm content={section.content} onChange={onChange} />
    case 'announcement':
      return <AnnouncementForm content={section.content} onChange={onChange} />
    case 'text':
      return <TextForm content={section.content} onChange={onChange} />
    case 'team':
      return <TeamForm content={section.content} onChange={onChange} uploadFile={uploadFile} />
    case 'values':
      return <ValuesForm content={section.content} onChange={onChange} />
    case 'menus':
      return <MenusForm content={section.content} onChange={onChange} />
    case 'documents':
      return <DocumentsForm content={section.content} onChange={onChange} uploadFile={uploadFile} />
    case 'gallery':
      return <GalleryForm content={section.content} onChange={onChange} uploadFile={uploadFile} />
    case 'faq':
      return <FaqForm content={section.content} onChange={onChange} />
    case 'map':
      return <MapForm content={section.content} onChange={onChange} />
    case 'testimonials':
      return <TestimonialsForm content={section.content} onChange={onChange} />
    case 'contact_footer':
      return <ContactFooterForm content={section.content} onChange={onChange} />
    default: {
      const exhaustiveCheck: never = section
      throw new Error(`Unhandled section type: ${JSON.stringify(exhaustiveCheck)}`)
    }
  }
}
