import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { User, UserRole } from "../types";
import { Edit } from "lucide-react";

interface UsersTableProps {
  users: User[];
  onEditUser?: (user: User) => void;
}

export default function UsersTable({
  users,
  onEditUser,
}: UsersTableProps) {
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [joinedFilter, setJoinedFilter] = useState("all");

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return "bg-purple-500/10 border-purple-500/30 text-purple-300";
      case UserRole.ORGANIZATION:
        return "bg-blue-500/10 border-blue-500/30 text-blue-300";
      default:
        return "bg-green-500/10 border-green-500/30 text-green-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Extract unique values for dropdown filters
  const uniqueEmployees = useMemo(() => {
    const employees = new Set(
      users.map(user => `${user.first_name} ${user.last_name}`)
    );
    return Array.from(employees).sort();
  }, [users]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(users.map(user => user.role));
    return Array.from(roles).sort();
  }, [users]);

  const uniqueTeams = useMemo(() => {
    const teams = new Set(
      users
        .map(user => user.team?.name || user.managed_team?.name || "No Team")
    );
    return Array.from(teams).sort();
  }, [users]);

  const uniqueDates = useMemo(() => {
    const dates = new Set(users.map(user => formatDate(user.created_at)));
    return Array.from(dates).sort();
  }, [users]);

  // Filter users based on filter values
  const filteredUsers = users.filter((user) => {
    const employeeMatch = employeeFilter === "all" || 
      `${user.first_name} ${user.last_name}` === employeeFilter;
    
    const roleMatch = roleFilter === "all" || user.role === roleFilter;
    
    const teamName = user.team?.name || user.managed_team?.name || "No Team";
    const teamMatch = teamFilter === "all" || teamName === teamFilter;
    
    const joinedMatch = joinedFilter === "all" || 
      formatDate(user.created_at) === joinedFilter;
    
    return employeeMatch && roleMatch && teamMatch && joinedMatch;
  });

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 bg-white/5">
            <TableHead className="p-2">
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="h-8 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="all" className="text-white">All Employees</SelectItem>
                  {uniqueEmployees.map((employee) => (
                    <SelectItem key={employee} value={employee} className="text-white">
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>
            <TableHead className="p-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-8 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="all" className="text-white">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role} className="text-white">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>
            <TableHead className="p-2">
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="h-8 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="all" className="text-white">All Teams</SelectItem>
                  {uniqueTeams.map((team) => (
                    <SelectItem key={team} value={team} className="text-white">
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>
            <TableHead className="p-2">
              <Select value={joinedFilter} onValueChange={setJoinedFilter}>
                <SelectTrigger className="h-8 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="all" className="text-white">All Dates</SelectItem>
                  {uniqueDates.map((date) => (
                    <SelectItem key={date} value={date} className="text-white">
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>
            {onEditUser && (
              <TableHead className="p-2 text-white/80">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow
              key={user.id}
              className="border-white/10 hover:bg-white/5"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400">
                    <AvatarFallback className="bg-transparent text-white text-xs">
                      {getInitials(
                        user.first_name,
                        user.last_name,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white/90">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getRoleBadgeColor(user.role)}
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-white/70">
                {user.team?.name ||
                  user.managed_team?.name ||
                  "No Team"}
              </TableCell>
              <TableCell className="text-white/70">
                {formatDate(user.created_at)}
              </TableCell>
              {onEditUser && (
                <TableCell>
                  <Button
                    onClick={() => onEditUser(user)}
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-8 px-3"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}