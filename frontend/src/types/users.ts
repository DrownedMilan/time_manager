// src/types/user.ts
export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string // optionnel, si présent dans le backend plus tard
  role?: 'EMPLOYEE' | 'MANAGER'
}
