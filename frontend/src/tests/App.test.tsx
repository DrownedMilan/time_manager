import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

vi.mock('@/routes/AppRoutes', () => ({
  AppRoutes: () => <div>App Routes placeholder</div>,
}))

describe('App', () => {
  it('renders the application routes', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText(/app routes placeholder/i)).toBeInTheDocument()
  })
})
