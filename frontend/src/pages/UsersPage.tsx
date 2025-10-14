import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { getUserClocks, toggleClock } from '@/services/clocks'
import type { User } from '@/types/users'
import {
  Box,
  Typography,
  Card,
  Avatar,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from '@mui/material'

export default function UserPage() {
  const USER_ID = 1 // utilisateur fixe / données en dur

  const [user, setUser] = useState<User | null>(null)
  const [clocks, setClocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // --- CHARGEMENT DES DONNÉES UTILISATEUR + CLOCKS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get(`/users/${USER_ID}`)
        setUser(userRes.data)

        const userClocks = await getUserClocks(USER_ID)
        setClocks(userClocks)

        // Vérifie si un clock actif existe
        const activeClock = userClocks.some((c: any) => c.clock_out === null)
        setIsClockedIn(activeClock)
      } catch (err) {
        console.error('❌ Error Loading user :', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // --- CLOCK IN / OUT ---
  const handleClock = async () => {
    setProcessing(true)
    try {
      const res = await toggleClock(USER_ID)
      const updatedClocks = await getUserClocks(USER_ID)
      setClocks(updatedClocks)
      setIsClockedIn(res.clock_out === null)
    } catch (err) {
      alert('Error during Clock In/Out')
    } finally {
      setProcessing(false)
    }
  }

  // --- TRI DES CLOCKS ---
  const sortedClocks = [...clocks].sort((a, b) => {
    const dateA = new Date(a.clock_in).getTime()
    const dateB = new Date(b.clock_in).getTime()
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
  })

  const handleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  // --- AFFICHAGE EN CAS DE CHARGEMENT / ERREUR ---
  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )

  if (!user)
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h6" color="text.secondary">
          No user found.
        </Typography>
      </Box>
    )

  // --- AFFICHAGE PRINCIPAL ---
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', p: 4, gap: 3 }}>
      {/* --- CARTE UTILISATEUR --- */}
      <Card
        elevation={3}
        sx={{
          width: 320,
          height: 'fit-content',
          borderRadius: 3,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.main', color: 'white', mb: 2, width: 64, height: 64 }}>
          {user.first_name ? user.first_name[0].toUpperCase() : '?'}
        </Avatar>
        <Typography variant="h5" sx={{ color: '#040605ff', mb: 1 }}>
          {user.first_name} {user.last_name}
		  
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.email}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {user.phone_number}
        </Typography>

        <Button
          variant="contained"
          color={isClockedIn ? 'secondary' : 'primary'}
          disabled={processing}
          onClick={handleClock}
        >
          {processing ? '...' : isClockedIn ? 'Clock OUT' : 'Clock IN'}
        </Button>

        {/* --- ÉTAT ACTIF / INACTIF --- */}
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            fontWeight: 600,
            color: isClockedIn ? 'green' : 'red',
          }}
        >
          {isClockedIn ? '🟢 Active' : '🔴 Inactive'}
        </Typography>
      </Card>

      {/* --- Historic clocks --- */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" align="center" gutterBottom>
          <b>Time Card History</b>
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Number</b>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={true}
                    direction={sortOrder}
                    onClick={handleSort}
                  >
                    <b>Clock IN</b>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <b>Clock OUT</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedClocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No scorings found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedClocks.map((clock: any) => (
                  <TableRow key={clock.id}>
                    <TableCell>{clock.id}</TableCell>
                    <TableCell>{new Date(clock.clock_in).toLocaleString()}</TableCell>
                    <TableCell>
                      {clock.clock_out ? (
                        new Date(clock.clock_out).toLocaleString()
                      ) : (
                        <span style={{ color: 'green', fontWeight: 600 }}>In progress</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}
