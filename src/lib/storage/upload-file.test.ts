import { describe, it, expect, vi } from 'vitest'
import { uploadFile } from './upload-file'

describe('uploadFile', () => {
  it('uploads the file to the section-files bucket and returns its public URL', async () => {
    const upload = vi.fn().mockResolvedValue({ data: { path: 'abc-menu.pdf' }, error: null })
    const getPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://xxxxx.supabase.co/storage/v1/object/public/section-files/abc-menu.pdf' },
    })
    const client = {
      storage: { from: vi.fn().mockReturnValue({ upload, getPublicUrl }) },
    }

    const file = new File(['content'], 'menu.pdf', { type: 'application/pdf' })
    const result = await uploadFile(client as never, file)

    expect(client.storage.from).toHaveBeenCalledWith('section-files')
    expect(upload).toHaveBeenCalled()
    expect(result.url).toContain('section-files')
  })

  it('throws when the upload fails', async () => {
    const upload = vi.fn().mockResolvedValue({ data: null, error: new Error('quota exceeded') })
    const client = {
      storage: { from: vi.fn().mockReturnValue({ upload, getPublicUrl: vi.fn() }) },
    }
    const file = new File(['content'], 'menu.pdf', { type: 'application/pdf' })

    await expect(uploadFile(client as never, file)).rejects.toThrow('quota exceeded')
  })
})
