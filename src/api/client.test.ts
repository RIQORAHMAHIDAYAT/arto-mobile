import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  clearTokens,
  downloadWithAuth,
  getApiUrl,
  getAccessToken,
  getRefreshToken,
  queryString,
  request,
  setTokens,
} from './client'

interface FileMockInstance {
  uri: string
  exists: boolean
  created: boolean
  deleted: boolean
  written: unknown
}

const { secureMock, expoFetchMock, fsMock, fileInstances } = vi.hoisted(() => {
  const fileInstances: FileMockInstance[] = []
  class FileMock {
    uri = 'file:///document/file'
    exists = false
    created = false
    deleted = false
    written: unknown = null

    constructor(..._parts: unknown[]) {
      fileInstances.push(this)
    }

    delete(): void {
      this.deleted = true
      this.exists = false
    }

    create(): void {
      this.created = true
      this.exists = true
    }

    write(content: unknown): void {
      this.written = content
    }
  }
  return {
    secureMock: {
      getItemAsync: vi.fn(),
      setItemAsync: vi.fn(),
      deleteItemAsync: vi.fn(),
    },
    expoFetchMock: { fetch: vi.fn() },
    fsMock: {
      File: FileMock,
      Paths: { document: { uri: 'file:///document' } },
    },
    fileInstances,
  }
})

vi.mock('expo-secure-store', () => secureMock)
vi.mock('expo/fetch', () => expoFetchMock)
vi.mock('expo-file-system', () => fsMock)

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
  expoFetchMock.fetch.mockReset()
  fileInstances.length = 0
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

  it('downloadWithAuth refresh-on-401 lalu menulis file dan mengembalikan uri', async () => {
    secureMock.getItemAsync.mockImplementation(async (key: string) =>
      key === 'arto.accessToken' ? 'expired' : 'rt-1',
    )
    expoFetchMock.fetch
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        bytes: async () => new Uint8Array([1, 2, 3]),
      })
    fetchMock.mockResolvedValueOnce(response(true, 200, { accessToken: 'at-new', refreshToken: 'rt-new' }))

    const result = await downloadWithAuth(`${getApiUrl()}/transactions/export/csv`, 'transactions.csv')

    expect(result.status).toBe(200)
    expect(expoFetchMock.fetch).toHaveBeenCalledTimes(2)
    const file = fileInstances.at(-1)
    expect(file?.created).toBe(true)
    expect(file?.written).toEqual(new Uint8Array([1, 2, 3]))
    expect(result.uri).toBe(file?.uri)
  })

  it('downloadWithAuth melempar ApiError saat respons gagal', async () => {
    secureMock.getItemAsync.mockResolvedValue('at-123')
    expoFetchMock.fetch.mockResolvedValueOnce({ status: 500, ok: false })

    await expect(
      downloadWithAuth(`${getApiUrl()}/transactions/export/pdf`, 'transactions.pdf'),
    ).rejects.toMatchObject({ name: 'ApiError', status: 500 })
    expect(fileInstances).toHaveLength(0)
  })
})