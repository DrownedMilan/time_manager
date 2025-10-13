import { useEffect, useState } from 'react'
import { getUsers } from '@/services/users' // Appelle l’API pour récupérer tous les utilisateurs
import type { User } from '@/types/users'
import { api } from '@/services/api' //  on utilise l’instance axios configurée
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Button,
} from '@mui/material'

export default function UsersPage() {
  // 🧩 Déclaration des états React
  const [users, setUsers] = useState<User[]>([]) // Liste des utilisateurs
  const [loading, setLoading] = useState(true) // Chargement en cours ?
  const [processing, setProcessing] = useState<number | null>(null) // ID de l’utilisateur cliqué
  const [clockedUsers, setClockedUsers] = useState<number[]>([]) // IDs des utilisateurs actuellement “clockés”

  // useEffect → s’exécute au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Récupération de la liste des utilisateurs
        const usersData = await getUsers()
        setUsers(Array.isArray(usersData) ? usersData : [])

        // Récupération de tous les clocks existants
        const clocksRes = await api.get('/clocks/') //
        const clocksData = Array.isArray(clocksRes.data)
          ? clocksRes.data
          : clocksRes.data?.clocks || []

        // On garde uniquement ceux qui n’ont pas encore de "clock_out"
        const activeClocks = clocksData.filter((c: any) => c.clock_out === null)

        // On stocke la liste des user_id clockés
        setClockedUsers(activeClocks.map((c: any) => c.user_id))
      } catch (err) {
        console.error('❌ Erreur chargement données :', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 🕒 Fonction Clock IN / OUT
  const handleClock = async (userId: number) => {
    setProcessing(userId)
    try {
      // ✅ Appel à l’API /clocks/
      const res = await api.post('/clocks/', { user_id: userId })

      // Si le back renvoie clock_out === null → Clock IN
      const isClockIn = res.data.clock_out === null

      if (isClockIn) {
        // Clock IN → ajoute l’utilisateur dans la liste
        setClockedUsers((prev) => [...prev, userId])
      } else {
        // Clock OUT → retire l’utilisateur de la liste
        setClockedUsers((prev) => prev.filter((id) => id !== userId))
      }
    } catch (err) {
      console.error('❌ Erreur Clock:', err)
      alert('Erreur pendant Clock In/Out')
    } finally {
      setProcessing(null)
    }
  }

  // Si les données chargent encore
  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )

  // Si aucun utilisateur trouvé
  if (!Array.isArray(users) || users.length === 0)
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h6" color="text.secondary">
          Aucun utilisateur trouvé
        </Typography>
      </Box>
    )

  // Affichage principal
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Résumé
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 2fr))',
          gap: 2,
          backgroundColor: '#fdfdfdff',
          minHeight: '60vh',
        }}
      >
        {users.map((u) => {
          const isClockedIn = clockedUsers.includes(u.id)
          return (
            <Card key={u.id} elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/*  infos utilisateur */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', color: 'white', mr: 2 }}>
                    {u.first_name ? u.first_name[0].toUpperCase() : '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#040605ff' }}>
                      {u.first_name} {u.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {u.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {u.phone_number}
                    </Typography>
                  </Box>
                </Box>

                {/* bouton Clock IN / OUT */}
                <Button
                  variant="contained"
                  color={isClockedIn ? 'secondary' : 'primary'}
                  size="small"
                  disabled={processing === u.id}
                  onClick={() => handleClock(u.id)}
                >
                  {processing === u.id ? '...' : isClockedIn ? 'Clock OUT' : 'Clock IN'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}
