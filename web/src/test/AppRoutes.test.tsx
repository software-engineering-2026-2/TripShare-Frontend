import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import {
  SESSION_STORAGE_KEY,
  type Session,
} from '../auth/auth-storage'
import { AppRoutes } from '../App'

function renderRoutes(initialEntry: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>,
  )
}

function saveSession(expiresAt: number) {
  const session: Session = {
    user: { id: 'alvaro', name: 'Alvaro' },
    expiresAt,
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

describe('rotas protegidas', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it('redireciona usuários não autenticados para o login', () => {
    renderRoutes('/dashboard')

    expect(screen.getByRole('heading', { name: 'Entrar no TripShare' })).toBeInTheDocument()
  })

  it('permite acesso à rota protegida com uma sessão válida', () => {
    saveSession(Date.now() + 60_000)

    renderRoutes('/dashboard')

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Olá, Alvaro.')).toBeInTheDocument()
  })

  it('redireciona para o login quando a sessão expira', async () => {
    vi.useFakeTimers()
    saveSession(Date.now() + 1_000)
    renderRoutes('/dashboard')

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(1_001)
    })

    expect(
      screen.getByRole('heading', { name: 'Entrar no TripShare' }),
    ).toBeInTheDocument()
  })

  it('retorna à rota protegida após o login', async () => {
    const user = userEvent.setup()
    renderRoutes('/dashboard')

    await user.type(screen.getByLabelText('Nome'), 'Alvaro')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })
})
