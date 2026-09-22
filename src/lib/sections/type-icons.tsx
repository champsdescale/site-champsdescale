import {
  Home, Megaphone, FileText, Users, Heart, UtensilsCrossed, FileDown, Image as ImageIcon,
  HelpCircle, MapPin, Quote, Phone,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { SectionType } from '@/types/section'

export const SECTION_TYPE_ICONS: Record<SectionType, ComponentType<{ size?: number }>> = {
  hero: Home,
  announcement: Megaphone,
  text: FileText,
  team: Users,
  values: Heart,
  menus: UtensilsCrossed,
  documents: FileDown,
  gallery: ImageIcon,
  faq: HelpCircle,
  map: MapPin,
  testimonials: Quote,
  contact_footer: Phone,
}
