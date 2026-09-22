// Temporary local-only singleton, mirroring src/lib/sections/preview-store.ts.
// Delete along with the rest of the preview-only files once a real Supabase
// project is connected.
import { createMemorySiteSettingsRepository } from './memory-repository'

export const previewSettingsRepository = createMemorySiteSettingsRepository()
