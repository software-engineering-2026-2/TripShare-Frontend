import { useAuth } from '../auth/useAuth'

export function DashboardPage() {
  const { session, signOut } = useAuth()

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Olá, {session?.user.name}.</p>
      <button type="button" onClick={signOut}>
        Sair
      </button>
    </main>
  )
}
