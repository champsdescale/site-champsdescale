import { useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

interface UseAutosaveOptions<T> {
  value: T
  onSave: (value: T) => Promise<void>
  delayMs?: number
}

export function useAutosave<T>({ value, onSave, delayMs = 1000 }: UseAutosaveOptions<T>) {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const isFirstRender = useRef(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setStatus('pending')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      setStatus('saving')
      try {
        await onSave(value)
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    }, delayMs)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs])

  return { status }
}
