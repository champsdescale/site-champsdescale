import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'section-files'

export async function uploadFile(client: SupabaseClient, file: File): Promise<{ url: string }> {
  const path = `${crypto.randomUUID()}-${file.name}`
  const { error } = await client.storage.from(BUCKET).upload(path, file)
  if (error) throw error

  const { data } = client.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl }
}
