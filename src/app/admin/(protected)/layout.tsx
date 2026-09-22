import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/auth/require-session'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const client = await createSupabaseServerClient()
  await requireSession(client)
  return <>{children}</>
}
