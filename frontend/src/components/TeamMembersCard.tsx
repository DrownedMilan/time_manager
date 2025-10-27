import { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { UserMinimal, UserRole, User } from "../types";
import { Users } from "lucide-react";
import { mockUsers } from "../lib/mockData";
import EmployeeDetailView from "./EmployeeDetailView";

interface TeamMembersCardProps {
  members: UserMinimal[];
  title?: string;
}

export default function TeamMembersCard({ members, title = "Team Members" }: TeamMembersCardProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleMemberClick = (member: UserMinimal) => {
    // Find the full user object from mockUsers
    const fullUser = mockUsers.find(u => u.id === member.id);
    if (fullUser) {
      setSelectedEmployee(fullUser);
      setIsDetailOpen(true);
    }
  };
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

  if (members.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <p className="text-white/60">No team members found</p>
      </div>
    );
  }

  return (
    <>
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 h-full flex flex-col">
        <h3 className="text-white/90 mb-4">{title}</h3>
        <div className="space-y-3 flex-1 overflow-auto">
          {members.map((member) => (
            <div
              key={member.id}
              onClick={() => handleMemberClick(member)}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
            >
              <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400">
                <AvatarFallback className="bg-transparent text-white text-sm">
                  {getInitials(member.first_name, member.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm truncate">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-white/60 text-xs truncate">{member.email}</p>
              </div>
              <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(member.role)}`}>
                {member.role}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <EmployeeDetailView 
        user={selectedEmployee}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );
}
