import { describe, it, expect, vi, afterEach } from 'vitest'

const fallbackApiUrl = 'http://localhost:4000/api'

const loadApiModule = async () => {
  vi.resetModules()
  return import('../services/api')
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('API client configuration', () => {
  it('uses VITE_API_URL when provided', async () => {
    vi.stubEnv('VITE_API_URL', 'http://example.test')
    const mod = await loadApiModule()
    expect(mod.API_URL).toBe('http://example.test/api')
    expect(mod.api.defaults.baseURL).toBe(mod.API_URL)
    expect(mod.api.defaults.headers?.['Content-Type']).toBe('application/json')
  })

  it('falls back when VITE_API_URL is empty', async () => {
    vi.stubEnv('VITE_API_URL', '')
    const mod = await loadApiModule()
    expect(mod.API_URL).toBe(fallbackApiUrl)
  })
})
