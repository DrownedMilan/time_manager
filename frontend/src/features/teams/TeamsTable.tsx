import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Team } from "../../types";
import { Users, Edit } from "lucide-react";

interface TeamsTableProps {
  teams: Team[];
  onTeamClick?: (team: Team) => void;
  onEditTeam?: (team: Team) => void;
}

export default function TeamsTable({ teams, onTeamClick, onEditTeam }: TeamsTableProps) {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-white/5">
            <TableHead className="text-white/80">Team Name</TableHead>
            <TableHead className="text-white/80">Manager</TableHead>
            <TableHead className="text-white/80">Members</TableHead>
            <TableHead className="text-white/80">Created</TableHead>
            {onEditTeam && <TableHead className="text-white/80">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow 
              key={team.id} 
              className="border-white/10 hover:bg-white/10 transition-colors"
            >
              <TableCell 
                className="text-white/90 cursor-pointer"
                onClick={() => onTeamClick?.(team)}
              >
                {team.name}
              </TableCell>
              <TableCell 
                className="text-white/70 cursor-pointer"
                onClick={() => onTeamClick?.(team)}
              >
                {team.manager 
                  ? `${team.manager.first_name} ${team.manager.last_name}`
                  : "No Manager"}
              </TableCell>
              <TableCell 
                className="cursor-pointer"
                onClick={() => onTeamClick?.(team)}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-300" />
                  <span className="text-white/90">{team.members.length}</span>
                </div>
              </TableCell>
              <TableCell 
                className="text-white/70 cursor-pointer"
                onClick={() => onTeamClick?.(team)}
              >
                {new Date(team.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </TableCell>
              {onEditTeam && (
                <TableCell>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTeam(team);
                    }}
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
