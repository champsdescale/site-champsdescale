import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutosave } from './use-autosave'

describe('useAutosave', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls onSave after the debounce delay and reports "saved"', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result, rerender } = renderHook(
      ({ value }) => useAutosave({ value, onSave, delayMs: 1000 }),
      { initialProps: { value: 'a' } }
    )

    rerender({ value: 'b' })
    expect(result.current.status).toBe('pending')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(onSave).toHaveBeenCalledWith('b')
    expect(result.current.status).toBe('saved')
  })

  it('reports "error" and keeps the value for a manual retry when onSave rejects', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('network down'))
    const { result, rerender } = renderHook(
      ({ value }) => useAutosave({ value, onSave, delayMs: 1000 }),
      { initialProps: { value: 'a' } }
    )

    rerender({ value: 'b' })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(result.current.status).toBe('error')
  })

  it('does not call onSave when the value never changes', () => {
    const onSave = vi.fn()
    renderHook(({ value }) => useAutosave({ value, onSave, delayMs: 1000 }), {
      initialProps: { value: 'a' },
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onSave).not.toHaveBeenCalled()
  })
})
