import { createContext } from 'react'
import type { User } from '@/types'

export interface UserContextType {
  user: User | null
  setUser: (u: User | null) => void
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
})
