import { createBrowserRouter } from 'react-router-dom'
import UsersPage from '@/pages/UsersPage'

export const router = createBrowserRouter([{ path: '/', element: <UsersPage /> }])
