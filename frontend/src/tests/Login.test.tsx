import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../features/auth/LoginPage'
import { AuthContext, type AuthContextType } from '../features/auth/AuthContext'

const renderWithAuth = (overrides: Partial<AuthContextType> = {}) => {
  const login = vi.fn()
  const logout = vi.fn()

  const ctx: AuthContextType = {
    keycloak: { login } as any,
    authenticated: false,
    initialized: true,
    logout,
    user: null,
    ...overrides,
  }

  return {
    ...render(
      <AuthContext.Provider value={ctx}>
        <LoginPage />
      </AuthContext.Provider>,
    ),
    ctx,
  }
}

describe('LoginPage', () => {
  it('triggers Keycloak login when clicking "Se connecter"', async () => {
    const user = userEvent.setup()
    const { ctx } = renderWithAuth()

    await user.click(screen.getByRole('button', { name: /se connecter/i }))
    expect(ctx.keycloak.login).toHaveBeenCalledWith({ redirectUri: window.location.origin })
  })

  it('shows logout action when already authenticated', async () => {
    const user = userEvent.setup()
    const logout = vi.fn()

    renderWithAuth({
      authenticated: true,
      keycloak: { login: vi.fn() } as any,
      logout,
    })

    await user.click(screen.getByRole('button', { name: /se d.*connecter/i }))
    expect(logout).toHaveBeenCalled()
  })
})
