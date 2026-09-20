import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  clearTokens,
  getApiUrl,
  getAccessToken,
  getRefreshToken,
  queryString,
  request,
  setTokens,
} from './client'

const { secureMock, legacyMock } = vi.hoisted(() => ({
  secureMock: {
    getItemAsync: vi.fn(),
    setItemAsync: vi.fn(),
    deleteItemAsync: vi.fn(),
  },
  legacyMock: {
    downloadAsync: vi.fn(),
  },
}))

vi.mock('expo-secure-store', () => secureMock)
vi.mock('expo-file-system/legacy', () => legacyMock)

function response(ok: boolean, status: number, body: unknown) {
  return {
    ok,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  }
}

const fetchMock = vi.fn()

beforeEach(() => {
  vi.restoreAllMocks()
  globalThis.fetch = fetchMock as unknown as typeof fetch
  fetchMock.mockReset()
  secureMock.getItemAsync.mockResolvedValue(null)
  secureMock.setItemAsync.mockResolvedValue(undefined)
  secureMock.deleteItemAsync.mockResolvedValue(undefined)
})

describe('client', () => {
  it('getApiUrl mengembalikan base URL tanpa slash di akhir', () => {
    expect(getApiUrl().endsWith('/')).toBe(false)
  })

  it('queryString mengabaikan nilai kosong', () => {
    expect(queryString({ page: 1, q: '', limit: 10 })).toBe('?page=1&limit=10')
    expect(queryString({})).toBe('')
  })

  it('mengirim token Authorization dan mem-parsing badan JSON', async () => {
    secureMock.getItemAsync.mockResolvedValue('at-123')
    fetchMock.mockResolvedValue(response(true, 200, { ok: true }))

    const result = await request<{ ok: boolean }>('/users/me')

    expect(result).toEqual({ ok: true })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${getApiUrl()}/users/me`)
    expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer at-123' })
  })

  it('melempar ApiError dengan pesan dari body saat gagal', async () => {
    secureMock.getItemAsync.mockResolvedValue('at-123')
    fetchMock.mockResolvedValue(response(false, 400, { message: 'Email sudah terdaftar' }))

    await expect(request('/anything')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Email sudah terdaftar',
    })
  })

  it('sekali refresh-on-401 lalu mencoba ulang', async () => {
    secureMock.getItemAsync.mockImplementation(async (key: string) =>
      key === 'arto.accessToken' ? 'expired' : 'rt-1',
    )
    fetchMock
      .mockResolvedValueOnce(response(false, 401, { message: 'Unauthorized' }))
      .mockResolvedValueOnce(response(true, 200, { accessToken: 'at-new', refreshToken: 'rt-new' }))
      .mockResolvedValueOnce(response(true, 200, { ok: true }))

    const result = await request<{ ok: boolean }>('/users/me')

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(secureMock.setItemAsync).toHaveBeenCalledWith('arto.accessToken', 'at-new')
  })

  it('request tanpa refresh token tidak mencoba refresh', async () => {
    secureMock.getItemAsync.mockResolvedValue(null)
    fetchMock.mockResolvedValue(response(false, 401, { message: 'Unauthorized' }))

    await expect(request('/users/me')).rejects.toBeInstanceOf(ApiError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('setTokens/clearTokens bekerja via secure store', async () => {
    await setTokens('a', 'b')
    expect(secureMock.setItemAsync).toHaveBeenCalledWith('arto.accessToken', 'a')
    expect(secureMock.setItemAsync).toHaveBeenCalledWith('arto.refreshToken', 'b')

    await clearTokens()
    expect(secureMock.deleteItemAsync).toHaveBeenCalledWith('arto.accessToken')
    expect(secureMock.deleteItemAsync).toHaveBeenCalledWith('arto.refreshToken')
  })

  it('getAccessToken/getRefreshToken membaca dari secure store', async () => {
    secureMock.getItemAsync.mockImplementation(async (key: string) => (key === 'arto.accessToken' ? 'tok' : 'rf'))
    expect(await getAccessToken()).toBe('tok')
    expect(await getRefreshToken()).toBe('rf')
  })
})