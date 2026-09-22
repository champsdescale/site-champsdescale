import { redirect } from 'next/navigation'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export async function requireSession(client: SupabaseClient): Promise<User> {
  const { data } = await client.auth.getUser()
  if (!data.user) {
    redirect('/admin/login')
  }
  return data.user
}
