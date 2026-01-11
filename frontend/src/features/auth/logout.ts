import keycloak from './keycloak'

export function logout() {
  try {
    localStorage.clear()
    sessionStorage.clear()
    keycloak.logout({ redirectUri: window.location.origin })
  } catch (e) {
    console.warn('[Logout] Error during Keycloak logout:', e)
  }
}
