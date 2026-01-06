import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { AppRoutes } from '../routes/AppRoutes'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/features/auth/LoginPage', () => ({
  default: () => <div>Login Page</div>,
}))

vi.mock('@/features/dashboard/EmployeeDashboard', () => ({
  default: () => <div>Employee Dashboard</div>,
}))

vi.mock('@/features/dashboard/ManagerDashboard', () => ({
  default: () => <div>Manager Dashboard</div>,
}))

vi.mock('@/features/dashboard/OrganizationDashboard', () => ({
  default: () => <div>Organization Dashboard</div>,
}))

vi.mock('@/layouts/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}))

const mockedUseAuth = vi.mocked(useAuth)

const buildAuthState = (overrides: Partial<ReturnType<typeof useAuth>> = {}) => ({
  keycloak: { tokenParsed: { realm_access: { roles: [] } } } as any,
  authenticated: false,
  initialized: true,
  logout: vi.fn(),
  user: null,
  ...overrides,
})

const renderWithRouter = (initialPath: string, authState: any) => {
  mockedUseAuth.mockReturnValue(authState)

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('AppRoutes protected navigation', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('redirects unauthenticated users to login', () => {
    const authState = buildAuthState({ authenticated: false })

    renderWithRouter('/dashboard', authState)

    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })

  it('allows employees to access the employee dashboard', () => {
    const authState = buildAuthState({
      authenticated: true,
      keycloak: { tokenParsed: { realm_access: { roles: ['employee'] } } } as any,
    })

    renderWithRouter('/dashboard', authState)

    expect(screen.getByText(/employee dashboard/i)).toBeInTheDocument()
  })

  it('allows organization users to access the organization dashboard', () => {
    const authState = buildAuthState({
      authenticated: true,
      keycloak: { tokenParsed: { realm_access: { roles: ['organization'] } } } as any,
    })

    renderWithRouter('/organization', authState)

    expect(screen.getByText(/organization dashboard/i)).toBeInTheDocument()
  })

  it('redirects managers away from the login page to their home route', () => {
    const authState = buildAuthState({
      authenticated: true,
      keycloak: { tokenParsed: { realm_access: { roles: ['manager'] } } } as any,
    })

    renderWithRouter('/login', authState)

    expect(screen.getByText(/manager dashboard/i)).toBeInTheDocument()
  })

  it('redirects the root path to the login page', () => {
    const authState = buildAuthState({ authenticated: false })

    renderWithRouter('/', authState)

    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })

  it('blocks unauthorized roles from accessing a protected route', () => {
    const authState = buildAuthState({
      authenticated: true,
      keycloak: { tokenParsed: { realm_access: { roles: ['employee'] } } } as any,
    })

    renderWithRouter('/manager', authState)

    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
  })

  it('renders a 404 for unknown routes', () => {
    const authState = buildAuthState()

    renderWithRouter('/some-unknown-route', authState)

    expect(screen.getByText(/404 not found/i)).toBeInTheDocument()
  })
})
