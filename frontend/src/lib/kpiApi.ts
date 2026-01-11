const API_BASE = 'http://localhost:8000'

async function getJson(path: string) {
  const response = await fetch(API_BASE + path, {
    credentials: 'include', // important for your current auth
  })

  if (!response.ok) {
    throw new Error('API Error ' + response.status)
  }

  return response.json()
}

export const kpisApi = {
  users: () => getJson('/users/'),
  teams: () => getJson('/teams/'),
  clocks: () => getJson('/clocks/'),
  kpiSummary: () => getJson('/kpi/summary'),
}
