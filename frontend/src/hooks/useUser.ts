import { useContext } from 'react'
import { UserContext } from '@/hooks/useUserContext'

export const useUser = () => useContext(UserContext)
