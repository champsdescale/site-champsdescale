import { describe, it, expect, vi } from 'vitest'
import { requireSession } from './require-session'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('REDIRECT')
  }),
}))

describe('requireSession', () => {
  it('returns the session when the user is authenticated', async () => {
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      },
    }
    const user = await requireSession(client as never)
    expect(user.id).toBe('user-1')
  })

  it('redirects to /admin/login when there is no user', async () => {
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    }
    await expect(requireSession(client as never)).rejects.toThrow('REDIRECT')
  })
})
