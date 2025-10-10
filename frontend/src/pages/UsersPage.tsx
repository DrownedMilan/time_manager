import { useEffect, useState } from "react";
import { getUsers } from "@/services/users";
import type { User } from "@/types/users";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
} from "@mui/material";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((data) => setUsers(data))
      .catch((err) => console.error("Ca marche pas !!! :", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (users.length === 0)
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6" color="text.secondary">
          Aucun utilisateur trouvé
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Liste des employés
      </Typography>

      <Box
  sx={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(265px, 2fr))",
    gap: 2,
    backgroundColor: "#fdfdfdff",
    minHeight: "60vh",
  }}
>
  {users.map((u) => (
    <Card key={u.id} elevation={3} sx={{borderRadius: 3}}>
      <CardContent sx={{ display: "flex", alignItems: "center" }}>  
        <Avatar sx={{ bgcolor: "primary.main", color: "white", mr: 2 }}>
          {u.first_name ? u.first_name[0].toUpperCase() : "?"}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ color: "#040605ff" }}>
            {u.first_name} {u.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {u.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {u.phone_number}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  ))}
</Box>
    </Box>
  );
}
