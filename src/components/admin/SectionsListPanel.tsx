'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Copy, Trash2, Plus, CheckCircle2 } from 'lucide-react'
import type { Section, SectionType } from '@/types/section'
import { SECTION_TYPES, SECTION_TYPE_LABELS, SECTION_TYPE_DESCRIPTIONS } from '@/types/section'
import { SECTION_TYPE_ICONS } from '@/lib/sections/type-icons'

interface Props {
  sections: Section[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (type: SectionType) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onToggleVisible: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}

function SortableRow({
  section,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisible,
}: {
  section: Section
  selected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleVisible: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id })
  const Icon = SECTION_TYPE_ICONS[section.type]
  const title = 'titre' in section.content ? section.content.titre : SECTION_TYPE_LABELS[section.type]

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border ${selected ? 'border-2 border-[#3B2F23] bg-[#A3A374]/25' : 'border-[#d8d0b8] bg-white/40'}`}
    >
      {/* The whole card selects the section — not just the title — so a
          first-time user doesn't have to find the "right" bit of text to
          click. Action buttons stop propagation so duplicating/deleting/
          toggling doesn't also fire a selection underneath it. */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Modifier « ${title} »`}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect()
          }
        }}
        className="flex flex-col gap-2 p-3 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Réordonner la section"
            className="cursor-grab text-[#5b4f3f] shrink-0"
            onClick={(event) => event.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-[#5b4f3f]">
            <Icon size={14} /> {SECTION_TYPE_LABELS[section.type]}
          </span>
          {selected && (
            <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#3B2F23]">
              <CheckCircle2 size={14} /> En cours d'édition
            </span>
          )}
        </div>

        <p className="font-semibold">{title}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            aria-label={section.visible ? 'Masquer la section' : 'Afficher la section'}
            onClick={(event) => {
              event.stopPropagation()
              onToggleVisible()
            }}
            className="flex items-center gap-1"
          >
            {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            {section.visible ? 'Visible sur le site' : 'Masqué'}
          </button>
          <button
            type="button"
            aria-label="Dupliquer la section"
            onClick={(event) => {
              event.stopPropagation()
              onDuplicate()
            }}
            className="flex items-center gap-1"
          >
            <Copy size={14} /> Dupliquer
          </button>
          <button
            type="button"
            aria-label="Supprimer la section"
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
            className="flex items-center gap-1 text-red-800"
          >
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      </div>
    </li>
  )
}

export function SectionsListPanel({
  sections,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onDuplicate,
  onToggleVisible,
  onReorder,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = sections.findIndex((s) => s.id === active.id)
    const toIndex = sections.findIndex((s) => s.id === over.id)
    if (fromIndex === -1 || toIndex === -1) return
    onReorder(fromIndex, toIndex)
  }

  return (
    <div className="flex flex-col gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {sections.map((section) => (
              <SortableRow
                key={section.id}
                section={section}
                selected={section.id === selectedId}
                onSelect={() => onSelect(section.id)}
                onDelete={() => onDelete(section.id)}
                onDuplicate={() => onDuplicate(section.id)}
                onToggleVisible={() => onToggleVisible(section.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="relative">
        <button
          type="button"
          className="flex items-center gap-2 border px-3 py-2 w-full justify-center hover:bg-[#EDE6D3] active:bg-[#e3dbc4] transition-colors cursor-pointer"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Plus size={16} /> Ajouter un élément à la page
        </button>
        {menuOpen && (
          // Opens upward (bottom-full), not downward: this button sits right
          // after the section list, often near the bottom of the scrollable
          // sidebar — a menu growing downward from there renders below the
          // visible area and needs a scroll the user has no reason to make,
          // effectively invisible.
          <ul className="absolute z-10 bottom-full mb-1 bg-white border w-full max-h-80 overflow-y-auto shadow-lg">
            {SECTION_TYPES.map((type) => {
              const Icon = SECTION_TYPE_ICONS[type]
              return (
                <li key={type}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-[#EDE6D3] flex items-start gap-2"
                    onClick={() => {
                      onAdd(type)
                      setMenuOpen(false)
                    }}
                  >
                    <Icon size={18} />
                    <span>
                      <span className="block font-semibold">{SECTION_TYPE_LABELS[type]}</span>
                      <span className="block text-xs text-[#5b4f3f]">{SECTION_TYPE_DESCRIPTIONS[type]}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
