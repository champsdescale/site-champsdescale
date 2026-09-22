import type { SupabaseClient } from '@supabase/supabase-js'
import type { Section, SectionType } from '@/types/section'
import { createDefaultContent } from '@/types/section'
import type { SectionsRepository } from './repository'

interface SectionRow {
  id: string
  type: SectionType
  position: number
  visible: boolean
  content: Record<string, unknown>
}

function toSection(row: SectionRow): Section {
  return {
    id: row.id,
    type: row.type,
    position: row.position,
    visible: row.visible,
    content: row.content,
  } as unknown as Section
}

export function createSupabaseSectionsRepository(client: SupabaseClient): SectionsRepository {
  return {
    async list() {
      const { data, error } = await client
        .from('sections')
        .select('*')
        .order('position', { ascending: true })
      if (error) throw error
      return (data as SectionRow[]).map(toSection)
    },

    async create(type: SectionType) {
      const { data: existing } = await client.from('sections').select('id')
      const position = existing?.length ?? 0
      const { data, error } = await client
        .from('sections')
        .insert({ type, position, visible: true, content: createDefaultContent(type) })
        .select()
        .single()
      if (error) throw error
      return toSection(data as SectionRow)
    },

    async update(id, patch) {
      const { error } = await client
        .from('sections')
        .update({
          ...(patch.visible !== undefined ? { visible: patch.visible } : {}),
          ...(patch.content !== undefined ? { content: patch.content } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    },

    async remove(id) {
      const { error } = await client.from('sections').delete().eq('id', id)
      if (error) throw error
    },

    async reorder(orderedIds) {
      await Promise.all(
        orderedIds.map((id, position) =>
          client.from('sections').update({ position }).eq('id', id)
        )
      )
    },

    async duplicate(id) {
      const { data: original, error: fetchError } = await client
        .from('sections')
        .select('*')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError
      const { data: existing } = await client.from('sections').select('id')
      const position = existing?.length ?? 0
      const row = original as SectionRow
      const { data, error } = await client
        .from('sections')
        .insert({ type: row.type, position, visible: row.visible, content: row.content })
        .select()
        .single()
      if (error) throw error
      return toSection(data as SectionRow)
    },
  }
}
