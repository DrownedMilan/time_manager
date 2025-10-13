import { useEffect, useState } from 'react'
import { getUsers } from '@/services/users' // appelle l’API pour récupérer tous les utilisateurs.
import type { User } from '@/types/users' // Typescript(id, email, etc.).
import axios from 'axios' // APPEL HTTP vers le back
import { Box, Typography, Card, CardContent, Avatar, CircularProgress, Button } from '@mui/material'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)  // booléen qui indique si les données sont encore en cours de chargement
  const [processing, setProcessing] = useState<number | null>(null) // id de l’utilisateur
  const [clockedUsers, setClockedUsers] = useState<number[]>([])

  //  Charger les utilisateurs + vérifier qui est clocké
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getUsers()
        setUsers(Array.isArray(usersData) ? usersData : [])

        
        const clocksRes = await axios.get('http://127.0.0.1:8000/api/clocks/') // FASTAPI retourne tous les clocks
        const clocksData = Array.isArray(clocksRes.data)
          ? clocksRes.data
          : clocksRes.data?.clocks || []
        const activeClocks = clocksData.filter((c: any) => c.clock_out === null) // On garde uniquement les clocks qui n’ont pas encore d’heure de sortie (clock_out == null)
        setClockedUsers(activeClocks.map((c: any) => c.user_id)) // On extrait les user_id des clocks actifs
      } catch (err) {
        console.error('Erreur chargement données :', err) // // Gestion d’erreur
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ✅ Clock IN / OUT
  const handleClock = async (userId: number) => {
    setProcessing(userId)
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/clocks/', {  // envoi d'une requete post vers api si le user --> pas clocké --> back crée une entrée --> si déjà clocké  --> back ferme l'entrée 
        user_id: userId,
      })
      const isClockIn = res.data.clock_out === null

      // // Si Clock IN → on ajoute l’utilisateur à la liste des clockés
      if (isClockIn) {
        setClockedUsers((prev) => [...prev, userId])
      } else {
        setClockedUsers((prev) => prev.filter((id) => id !== userId))
      }
    } catch (err) {
      console.error('❌ Erreur Clock:', err)
      alert('Erreur pendant Clock In/Out')
    } finally {
      setProcessing(null)
    }
  }

  // conditionnel : si loading → spinner
  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )

  if (!Array.isArray(users) || users.length === 0) // si pas d'users dans le base
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h6" color="text.secondary">
          Aucun utilisateur trouvé
        </Typography>
      </Box>
    )

    // affichage principal
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Resume
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
