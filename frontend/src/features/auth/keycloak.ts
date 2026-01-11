import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL, // ex: http://localhost:4000/auth
  realm: import.meta.env.VITE_KEYCLOAK_REALM, // ex: time-manager
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID, // ex: frontend
})

export default keycloak
