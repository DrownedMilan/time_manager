import { describe, it, expect, vi } from 'vitest'

describe('API client configuration', () => {
  it('uses the configured API_URL for axios baseURL', async () => {
    vi.resetModules()
    const mod = await import('../services/api')
    expect(mod.API_URL).toBe('http://localhost:4000/api')
    expect(mod.api.defaults.baseURL).toBe(mod.API_URL)
    expect(mod.api.defaults.headers?.['Content-Type']).toBe('application/json')
  })
})
