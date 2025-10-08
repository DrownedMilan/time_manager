import { useEffect, useState } from "react";
import { getUsers } from "@/services/users";
import type { User } from "@/types/users";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  return (
    <div className="p-4">
      <h1>Liste des utilisateurs</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.first_name} {u.last_name} — {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
