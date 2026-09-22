'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { Section, SectionType } from '@/types/section'
import { SECTION_TYPE_LABELS } from '@/types/section'
import type { SiteSettings } from '@/types/site-settings'
import { googleFontsHref, siteThemeCss } from '@/types/site-settings'
import { SectionsListPanel } from './SectionsListPanel'
import { SectionEditorPanel } from './SectionEditorPanel'
import { SiteSettingsBar } from './SiteSettingsBar'
import { SectionRenderer } from '@/components/public/SectionRenderer'
import { useAutosave } from '@/hooks/use-autosave'
import { moveSection } from '@/lib/sections/order'
import { SECTION_TYPE_ICONS } from '@/lib/sections/type-icons'

export interface AdminActions {
  addSection: (type: SectionType) => Promise<Section>
  updateSectionContent: (id: string, content: Section['content']) => Promise<void>
  updateSectionVisibility: (id: string, visible: boolean) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  duplicateSection: (id: string) => Promise<Section>
  reorderSections: (orderedIds: string[]) => Promise<void>
  uploadFile: (file: File) => Promise<{ url: string }>
  updateSiteSettings: (settings: SiteSettings) => Promise<void>
}

function SortablePreviewSection({
  section,
  selected,
  onSelect,
}: {
  section: Section
  selected: boolean
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        // Without an explicit z-index, the dragged item paints in normal DOM
        // order — a later sibling it's currently sliding over would render
        // on top of it instead of the other way round, since these sections
        // are tall and often overlap mid-drag.
        zIndex: isDragging ? 10 : undefined,
      }}
      className={`relative group bg-[var(--color-bg)] ${isDragging ? 'opacity-50' : ''}`}
    >
      <button
        type="button"
        aria-label="Réordonner cette section"
        onClick={(event) => event.stopPropagation()}
        className="absolute top-2 left-2 z-10 cursor-grab bg-white/80 border border-[#d8d0b8] rounded p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      <div
        id={`preview-section-${section.id}`}
        role="button"
        tabIndex={0}
        aria-label={`Modifier ${SECTION_TYPE_LABELS[section.type]}`}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect()
          }
        }}
        className={`cursor-pointer transition ${
          selected
            ? 'outline outline-4 -outline-offset-4 outline-[#A3A374]'
            : 'outline outline-2 -outline-offset-2 outline-transparent hover:outline-[#A3A374]/50'
        }`}
      >
        <SectionRenderer section={section} />
      </div>
    </div>
  )
}

function EditingSectionAutosave({
  section,
  onSave,
}: {
  section: Section
  onSave: (content: Section['content']) => Promise<void>
}) {
  const { status } = useAutosave({ value: section.content, onSave, delayMs: 1000 })
  const label = { idle: '', pending: 'Modifié...', saving: 'Enregistrement...', saved: 'Enregistré', error: 'Erreur, réessai...' }[status]
  return <p className="text-xs text-[#5b4f3f] mb-2">{label}</p>
}

const SETTINGS_STATUS_LABEL = {
  idle: '',
  pending: 'Modifié...',
  saving: 'Enregistrement...',
  saved: 'Enregistré',
  error: 'Erreur, réessai...',
}

export function AdminBuilder({
  initialSections,
  initialSettings,
  actions,
}: {
  initialSections: Section[]
  initialSettings: SiteSettings
  actions: AdminActions
}) {
  const [sections, setSections] = useState(initialSections)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [settings, setSettings] = useState(initialSettings)
  const { status: settingsStatus } = useAutosave({
    value: settings,
    onSave: actions.updateSiteSettings,
    delayMs: 1000,
  })

  const selectedSection = sections.find((s) => s.id === selectedId) ?? null

  useEffect(() => {
    if (!selectedId) return
    // jsdom (tests) doesn't implement scrollIntoView, hence the extra
    // optional chaining on the method itself, not just the element.
    document.getElementById(`preview-section-${selectedId}`)?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    })
  }, [selectedId])

  async function handleAdd(type: SectionType) {
    const created = await actions.addSection(type)
    // The repository always appends at the end; move it up to just after
    // the first section (position 1) so a newly added element doesn't get
    // buried at the bottom of a long page where it's easy to miss.
    const withNew = [...sections, created]
    const targetIndex = Math.min(1, withNew.length - 1)
    const reordered = moveSection(withNew, withNew.length - 1, targetIndex)
    setSections(reordered)
    setSelectedId(created.id)
    void actions.reorderSections(reordered.map((s) => s.id))
  }

  async function handleDelete(id: string) {
    await actions.deleteSection(id)
    setSections((current) => current.filter((s) => s.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  async function handleDuplicate(id: string) {
    const copy = await actions.duplicateSection(id)
    setSections((current) => [...current, copy])
  }

  async function handleToggleVisible(id: string) {
    const target = sections.find((s) => s.id === id)
    if (!target) return
    const nextVisible = !target.visible
    setSections((current) => current.map((s) => (s.id === id ? { ...s, visible: nextVisible } : s)))
    await actions.updateSectionVisibility(id, nextVisible)
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    const reordered = moveSection(sections, fromIndex, toIndex)
    setSections(reordered)
    void actions.reorderSections(reordered.map((s) => s.id))
  }

  const previewSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const visibleSections = sections.filter((s) => s.visible)

  function handlePreviewDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    // Indices into the full `sections` array (not the visible-only subset
    // rendered here), same as SectionsListPanel's own drag handler — hidden
    // sections keep their relative position even though they're not shown
    // in this preview to drag against.
    const fromIndex = sections.findIndex((s) => s.id === active.id)
    const toIndex = sections.findIndex((s) => s.id === over.id)
    if (fromIndex === -1 || toIndex === -1) return
    handleReorder(fromIndex, toIndex)
  }

  function handleContentChange(content: Section['content']) {
    if (!selectedSection) return
    setSections((current) =>
      current.map((s) => (s.id === selectedSection.id ? ({ ...s, content } as Section) : s))
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Applies the live-edited colors/font immediately to this page's
          :root, ahead of the debounced save — so the whole builder (central
          preview included, since it shares the same section components as
          the public site) reflects a change the instant it's made. */}
      <style>{siteThemeCss(settings)}</style>
      <link rel="stylesheet" href={googleFontsHref(settings.fontFamily)} />

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SiteSettingsBar settings={settings} onChange={setSettings} />
        </div>
        <span className="text-xs text-[#5b4f3f] pr-4">{SETTINGS_STATUS_LABEL[settingsStatus]}</span>
      </div>

      <div className="flex flex-1 min-h-0">
        <aside className="w-80 border-r p-3 overflow-y-auto">
          <SectionsListPanel
            sections={sections}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={handleAdd}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onToggleVisible={handleToggleVisible}
            onReorder={handleReorder}
          />
        </aside>

        <main className="flex-1 overflow-y-auto">
          <DndContext sensors={previewSensors} collisionDetection={closestCenter} onDragEnd={handlePreviewDragEnd}>
            <SortableContext items={visibleSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {visibleSections.map((section) => (
                <SortablePreviewSection
                  key={section.id}
                  section={section}
                  selected={section.id === selectedId}
                  onSelect={() => setSelectedId(section.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </main>

        <aside className="w-80 border-l p-3 overflow-y-auto">
          {selectedSection ? (
            <>
              <div className="mb-3 pb-3 border-b border-[#d8d0b8]">
                <p className="text-xs uppercase tracking-wide text-[#5b4f3f]">Vous modifiez</p>
                <p className="flex items-center gap-2 font-semibold text-lg">
                  {(() => {
                    const Icon = SECTION_TYPE_ICONS[selectedSection.type]
                    return <Icon size={18} />
                  })()}
                  {SECTION_TYPE_LABELS[selectedSection.type]}
                </p>
              </div>
              <EditingSectionAutosave
                key={selectedSection.id}
                section={selectedSection}
                onSave={(content) => actions.updateSectionContent(selectedSection.id, content)}
              />
              <SectionEditorPanel
                section={selectedSection}
                onChange={handleContentChange}
                uploadFile={actions.uploadFile}
              />
            </>
          ) : (
            <p className="text-sm text-[#5b4f3f]">
              Clique sur un élément dans la liste à gauche pour le modifier ici.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
