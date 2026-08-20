import { useCallback, useEffect, useRef, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook ringan untuk memuat data async dengan state loading/error.
 * `deps` mengontrol kapan data dimuat ulang.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: ReadonlyArray<unknown> = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const loaderRef = useRef(loader)
  loaderRef.current = loader
  const requestId = useRef(0)

  const run = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const result = await loaderRef.current()
      if (requestId.current === id) setData(result)
    } catch (err) {
      if (requestId.current === id) setError(err instanceof Error ? err : new Error('Terjadi kesalahan tak terduga.'))
    } finally {
      if (requestId.current === id) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refetch: run }
}