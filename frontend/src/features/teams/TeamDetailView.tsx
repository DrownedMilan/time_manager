import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Team } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Clock as ClockIcon, Calendar } from "lucide-react";
import { mockClocks, mockUsers } from "../../lib/mockData";

interface TeamDetailViewProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TeamDetailView({ team, open, onOpenChange }: TeamDetailViewProps) {
  if (!team) return null;

  // Get current team members for display
  const currentMembers = team.members;

  // Get all clock records for team members
  const memberIds = currentMembers.map(m => m.id);
  const teamClocks = mockClocks.filter(clock => memberIds.includes(clock.user_id));

  // Group clocks by user
  const clocksByUser = currentMembers.map(member => {
    const userClocks = teamClocks.filter(clock => clock.user_id === member.id);
    return {
      member,
      clocks: userClocks.sort((a, b) => new Date(b.clock_in).getTime() - new Date(a.clock_in).getTime())
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white/90">{team.name}</DialogTitle>
          <DialogDescription className="text-white/60">
            {team.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Info */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/50 text-xs mb-1">Manager</p>
                <p className="text-white/90">
                  {team.manager 
                    ? `${team.manager.first_name} ${team.manager.last_name}`
                    : "No Manager"}
                </p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Created</p>
                <p className="text-white/90">
                  {new Date(team.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Total Members</p>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-300" />
                  <p className="text-white/90">{currentMembers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employees and their clock records */}
          <div>
            <h3 className="text-white/80 mb-4">Team Members & Clock Records</h3>
            {currentMembers.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Users className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/60">No team members yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clocksByUser.map(({ member, clocks }) => (
                  <div key={member.id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                    {/* Employee Header */}
                    <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
                      <div>
                        <p className="text-white/90">
                          {member.first_name} {member.last_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-white/40" />
                          <p className="text-white/60 text-xs">{member.email}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="bg-blue-500/10 text-blue-300 border-blue-500/30"
                      >
                        {member.role}
                      </Badge>
                    </div>

                    {/* Clock Records */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ClockIcon className="w-4 h-4 text-white/60" />
                        <p className="text-white/70 text-sm">Recent Clock Records ({clocks.length})</p>
                      </div>
                      
                      {clocks.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-white/50 text-xs">No clock records found</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {clocks.slice(0, 5).map((clock) => {
                            const duration = clock.clock_out 
                              ? (() => {
                                  const diff = new Date(clock.clock_out).getTime() - new Date(clock.clock_in).getTime();
                                  const hours = Math.floor(diff / (1000 * 60 * 60));
                                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                  return `${hours}h ${minutes}m`;
                                })()
                              : "In Progress";

                            return (
                              <div 
                                key={clock.id} 
                                className="bg-white/5 rounded-lg p-3 border border-white/5 text-xs"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-white/50" />
                                    <span className="text-white/60">
                                      {new Date(clock.clock_in).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded ${
                                    clock.clock_out 
                                      ? 'bg-green-500/10 text-green-300 border border-green-500/30' 
                                      : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                                  }`}>
                                    {clock.clock_out ? 'Completed' : 'Active'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-white/70">
                                  <div>
                                    <span className="text-white/50">In: </span>
                                    <span>
                                      {new Date(clock.clock_in).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: false
                                      })}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-white/50">Out: </span>
                                    <span>
                                      {clock.clock_out 
                                        ? new Date(clock.clock_out).toLocaleTimeString('en-US', { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            hour12: false
                                          })
                                        : '-'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-white/50">Duration: </span>
                                    <span className="text-white/90">{duration}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
