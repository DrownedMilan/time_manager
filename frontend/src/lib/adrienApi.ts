const API_BASE = 'http://localhost:8000'

async function getJson(path: string) {
  const response = await fetch(API_BASE + path, {
    credentials: 'include', // important pour ton auth actuelle
  })

  if (!response.ok) {
    throw new Error('Erreur API ' + response.status)
  }

  return response.json()
}

export const adrienApi = {
  users: () => getJson('/users/'),
  teams: () => getJson('/teams/'),
  clocks: () => getJson('/clocks/'),
  kpiSummary: () => getJson('/kpi/summary'),
}
