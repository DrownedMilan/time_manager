import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EmployeeDashboard from '../features/dashboard/EmployeeDashboard'
import ManagerDashboard from '../features/dashboard/ManagerDashboard'
import OrganizationDashboard from '../features/dashboard/OrganizationDashboard'
import { UserContext } from '@/hooks/useUserContext'
import { mockUsers } from '@/lib/mockData'

vi.mock('recharts', () => {
  const Mock = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  return {
    ResponsiveContainer: Mock,
    CartesianGrid: Mock,
    Tooltip: Mock,
    Legend: Mock,
    XAxis: Mock,
    YAxis: Mock,
    BarChart: Mock,
    Bar: Mock,
    LineChart: Mock,
    Line: Mock,
  }
})

vi.mock('@/components/common/StatCard', () => ({
  __esModule: true,
  default: ({ title, value }: { title: string; value: string }) => (
    <div data-testid={`stat-${title}`}>{`${title}: ${value}`}</div>
  ),
}))

vi.mock('@/components/common/ClockWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="clock-widget" />,
}))

vi.mock('@/components/ClockRecordsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="clock-records" />,
}))

vi.mock('@/components/common/TeamMembersCard', () => ({
  __esModule: true,
  default: () => <div data-testid="team-members" />,
}))

vi.mock('@/components/common/ExportDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="export-dialog" />,
}))

vi.mock('@/features/employees/EmployeeRankingDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="ranking-dialog" />,
}))

vi.mock('@/components/UsersTable', () => ({
  __esModule: true,
  default: () => <div data-testid="users-table" />,
}))

vi.mock('@/features/teams/TeamsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="teams-table" />,
}))

vi.mock('@/features/teams/TeamDetailView', () => ({
  __esModule: true,
  default: () => <div data-testid="team-detail" />,
}))

vi.mock('@/features/teams/AddTeamDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="add-team-dialog" />,
}))

vi.mock('@/features/employees/EmployeeEditDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="employee-edit-dialog" />,
}))

vi.mock('@/features/teams/TeamEditDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="team-edit-dialog" />,
}))

vi.mock('@/components/ui/button', () => ({
  __esModule: true,
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/tabs', () => ({
  __esModule: true,
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/dialog', () => ({
  __esModule: true,
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const renderWithUser = (node: React.ReactNode, user = mockUsers[2]) =>
  render(<UserContext.Provider value={{ user, setUser: vi.fn() }}>{node}</UserContext.Provider>)

describe('Dashboard pages', () => {
  it('renders employee dashboard with user data', async () => {
    const employee = mockUsers.find((u) => u.role === 'Employee')!

    renderWithUser(<EmployeeDashboard />, employee)

    // Dashboard title
    expect(await screen.findByText(/employee dashboard/i)).toBeInTheDocument()

    // Email can appear multiple times (header, list, etc.) → use getAllByText
    const emailOccurrences = screen.getAllByText(employee.email)
    expect(emailOccurrences.length).toBeGreaterThan(0)
  })

  it('renders manager dashboard with team information', () => {
    const manager = mockUsers.find((u) => u.role === 'Manager')!

    renderWithUser(<ManagerDashboard />, manager)

    expect(screen.getByText(/team information/i)).toBeInTheDocument()

    // "Investment Banking" appears in multiple places → accept multiple occurrences
    const teamNameOccurrences = screen.getAllByText(/investment banking/i)
    expect(teamNameOccurrences.length).toBeGreaterThan(0)
  })

  it('renders organization dashboard overview', () => {
    const orgUser = mockUsers.find((u) => u.role === 'Organization')!

    renderWithUser(<OrganizationDashboard />, orgUser)

    expect(screen.getByText(/organization dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/all employees/i)).toBeInTheDocument()
    expect(screen.getByText(/all teams/i)).toBeInTheDocument()
  })
})
