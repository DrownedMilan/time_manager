import { useState } from "react";
import StatCard from "../../components/common/StatCard";
import ClockWidget from "../../components/common/ClockWidget";
import ClockRecordsTable from "../../components/ClockRecordsTable";
import TeamMembersCard from "../../components/common/TeamMembersCard";
import EmployeeRankingDialog from "@/features/employees/EmployeeRankingDialog";
import ExportDialog from "../../components/common/ExportDialog";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Clock,
  Calendar,
  TrendingUp,
  Timer,
  Award,
  ClockAlert,
  User as UserIcon,
  Download,
} from "lucide-react";
import type { User, Clock as ClockType } from "@/types";
import { mockClocks, mockTeams } from "@/lib/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ManagerDashboardProps {
  user: User;
}

export default function ManagerDashboard({
  user,
}: ManagerDashboardProps) {
  const [metricDialogOpen, setMetricDialogOpen] = useState<
    "workTime" | "lateTime" | "overtime" | null
  >(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("employee");

  // Manager's own clock records (since managers are also employees)
  const [managerClocks, setManagerClocks] = useState<
    ClockType[]
  >(mockClocks.filter((c) => c.user_id === user.id));

  const currentClock =
    managerClocks.find((c) => !c.clock_out) || null;

  const team = mockTeams.find((t) => t.manager_id === user.id);
  const teamMemberIds = team?.members.map((m) => m.id) || [];
  const teamClocks = mockClocks.filter((c) =>
    teamMemberIds.includes(c.user_id),
  );

  const activeClocks = teamClocks.filter(
    (c) => !c.clock_out,
  ).length;
  const completedClocksThisWeek = teamClocks.filter(
    (c) => c.clock_out,
  ).length;

  const totalHoursThisWeek = teamClocks.reduce((acc, clock) => {
    if (clock.clock_out) {
      const diff =
        new Date(clock.clock_out).getTime() -
        new Date(clock.clock_in).getTime();
      return acc + diff / (1000 * 60 * 60);
    }
    return acc;
  }, 0);

  // Calculate average total hours per team member
  const avgTotalHours =
    team && team.members.length > 0
      ? totalHoursThisWeek / team.members.length
      : 0;

  // Calculate working days this month for the manager (since manager is also an employee)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Calculate total working days in current month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let totalWorkingDays = 0;

  for (
    let d = new Date(firstDay);
    d <= lastDay;
    d.setDate(d.getDate() + 1)
  ) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Not Sunday (0) or Saturday (6)
      totalWorkingDays++;
    }
  }

  // Calculate days worked this month for the manager
  const firstDayOfMonth = new Date(year, month, 1);
  const clocksThisMonth = managerClocks.filter((c) => {
    const clockDate = new Date(c.clock_in);
    return clockDate >= firstDayOfMonth && c.clock_out;
  });

  // Get unique dates worked (in case of multiple clock entries per day)
  const daysWorkedSet = new Set(
    clocksThisMonth.map((c) =>
      new Date(c.clock_in).toDateString(),
    ),
  );
  const daysWorked = daysWorkedSet.size;

  // Calculate Average Work Time per day for the team
  const completedTeamClocks = teamClocks.filter(
    (c) => c.clock_out,
  );
  const avgWorkTime =
    completedTeamClocks.length > 0
      ? completedTeamClocks.reduce((acc, clock) => {
          const diff =
            new Date(clock.clock_out!).getTime() -
            new Date(clock.clock_in).getTime();
          return acc + diff / (1000 * 60 * 60);
        }, 0) / completedTeamClocks.length
      : 0;

  // Calculate Average Late Time (clocking in after 9:00 AM) for the team
  const lateClocks = teamClocks.filter((c) => {
    const clockInTime = new Date(c.clock_in);
    const hours = clockInTime.getHours();
    const minutes = clockInTime.getMinutes();
    return hours > 9 || (hours === 9 && minutes > 0);
  });

  const avgLateTime =
    lateClocks.length > 0
      ? lateClocks.reduce((acc, clock) => {
          const clockInTime = new Date(clock.clock_in);
          const scheduledStart = new Date(clockInTime);
          scheduledStart.setHours(9, 0, 0, 0);
          const lateDiff =
            clockInTime.getTime() - scheduledStart.getTime();
          return acc + lateDiff / (1000 * 60);
        }, 0) / lateClocks.length
      : 0;

  // Calculate Average Overtime Hours (clocking out after 17:00) for the team
  const overtimeClocks = completedTeamClocks.filter((c) => {
    const clockOutTime = new Date(c.clock_out!);
    const hours = clockOutTime.getHours();
    const minutes = clockOutTime.getMinutes();
    return hours > 17 || (hours === 17 && minutes > 0);
  });

  const avgOvertimeHours =
    overtimeClocks.length > 0
      ? overtimeClocks.reduce((acc, clock) => {
          const clockOutTime = new Date(clock.clock_out!);
          const scheduledEnd = new Date(clockOutTime);
          scheduledEnd.setHours(17, 0, 0, 0);
          const overtimeDiff =
            clockOutTime.getTime() - scheduledEnd.getTime();
          return acc + overtimeDiff / (1000 * 60 * 60);
        }, 0) / overtimeClocks.length
      : 0;

  // Calculate individual team member metrics for ranking
  const calculateTeamMemberWorkTime = () => {
    if (!team) return [];
    const memberMetrics = team.members.map((member) => {
      const memberClocks = teamClocks.filter(
        (c) => c.user_id === member.id && c.clock_out,
      );
      const totalWorkTime = memberClocks.reduce(
        (acc, clock) => {
          const diff =
            new Date(clock.clock_out!).getTime() -
            new Date(clock.clock_in).getTime();
          return acc + diff / (1000 * 60 * 60);
        },
        0,
      );
      const avgWorkTime =
        memberClocks.length > 0
          ? totalWorkTime / memberClocks.length
          : 0;
      return {
        user: member,
        value: avgWorkTime,
        displayValue: `${avgWorkTime.toFixed(1)}h`,
      };
    });
    return memberMetrics.sort((a, b) => b.value - a.value);
  };

  const calculateTeamMemberLateTime = () => {
    if (!team) return [];
    const memberMetrics = team.members.map((member) => {
      const memberClocks = teamClocks.filter((c) => {
        if (c.user_id !== member.id) return false;
        const clockInTime = new Date(c.clock_in);
        const hours = clockInTime.getHours();
        const minutes = clockInTime.getMinutes();
        return hours > 9 || (hours === 9 && minutes > 0);
      });
      const totalLateTime = memberClocks.reduce(
        (acc, clock) => {
          const clockInTime = new Date(clock.clock_in);
          const scheduledStart = new Date(clockInTime);
          scheduledStart.setHours(9, 0, 0, 0);
          const lateDiff =
            clockInTime.getTime() - scheduledStart.getTime();
          return acc + lateDiff / (1000 * 60);
        },
        0,
      );
      const avgLateTime =
        memberClocks.length > 0
          ? totalLateTime / memberClocks.length
          : 0;
      return {
        user: member,
        value: avgLateTime,
        displayValue: `${avgLateTime.toFixed(0)} min`,
      };
    });
    return memberMetrics.sort((a, b) => b.value - a.value);
  };

  const calculateTeamMemberOvertime = () => {
    if (!team) return [];
    const memberMetrics = team.members.map((member) => {
      const memberClocks = teamClocks.filter((c) => {
        if (c.user_id !== member.id || !c.clock_out)
          return false;
        const clockOutTime = new Date(c.clock_out);
        const hours = clockOutTime.getHours();
        const minutes = clockOutTime.getMinutes();
        return hours > 17 || (hours === 17 && minutes > 0);
      });
      const totalOvertime = memberClocks.reduce(
        (acc, clock) => {
          const clockOutTime = new Date(clock.clock_out!);
          const scheduledEnd = new Date(clockOutTime);
          scheduledEnd.setHours(17, 0, 0, 0);
          const overtimeDiff =
            clockOutTime.getTime() - scheduledEnd.getTime();
          return acc + overtimeDiff / (1000 * 60 * 60);
        },
        0,
      );
      const avgOvertime =
        memberClocks.length > 0
          ? totalOvertime / memberClocks.length
          : 0;
      return {
        user: member,
        value: avgOvertime,
        displayValue: `${avgOvertime.toFixed(1)}h`,
      };
    });
    return memberMetrics.sort((a, b) => b.value - a.value);
  };

  // Calculate today's work hours for the manager
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const managerTodayClocks = managerClocks.filter((c) => {
    const clockDate = new Date(c.clock_in);
    clockDate.setHours(0, 0, 0, 0);
    return clockDate.getTime() === today.getTime();
  });

  const todayWorkHours = managerTodayClocks.reduce(
    (acc, clock) => {
      if (clock.clock_out) {
        const diff =
          new Date(clock.clock_out).getTime() -
          new Date(clock.clock_in).getTime();
        return acc + diff / (1000 * 60 * 60);
      } else {
        // If still clocked in, calculate time up to now
        const diff =
          new Date().getTime() -
          new Date(clock.clock_in).getTime();
        return acc + diff / (1000 * 60 * 60);
      }
    },
    0,
  );

  // Calculate manager's own hours this week
  const managerCompletedClocks = managerClocks.filter(
    (c) => c.clock_out,
  );
  const managerHoursThisWeek = managerCompletedClocks.reduce(
    (acc, clock) => {
      if (clock.clock_out) {
        const diff =
          new Date(clock.clock_out).getTime() -
          new Date(clock.clock_in).getTime();
        return acc + diff / (1000 * 60 * 60);
      }
      return acc;
    },
    0,
  );

  // Calculate manager's average late time in the past 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const managerRecentClocks = managerClocks.filter(
    (c) => new Date(c.clock_in) >= thirtyDaysAgo,
  );

  const managerLateMinutes = managerRecentClocks.map(
    (clock) => {
      const clockInDate = new Date(clock.clock_in);
      const clockInHour = clockInDate.getHours();
      const clockInMinute = clockInDate.getMinutes();
      const clockInTotalMinutes =
        clockInHour * 60 + clockInMinute;
      const workStartMinutes = 9 * 60; // 9:00 AM in minutes

      return Math.max(
        0,
        clockInTotalMinutes - workStartMinutes,
      );
    },
  );

  const managerAvgLateMinutes =
    managerLateMinutes.length > 0
      ? managerLateMinutes.reduce((sum, min) => sum + min, 0) /
        managerLateMinutes.length
      : 0;

  // Chart data - hours per day for the team
  const chartData =
    team?.members.map((member) => {
      const memberClocks = teamClocks.filter(
        (c) => c.user_id === member.id && c.clock_out,
      );
      const totalHours = memberClocks.reduce((acc, clock) => {
        if (clock.clock_out) {
          const diff =
            new Date(clock.clock_out).getTime() -
            new Date(clock.clock_in).getTime();
          return acc + diff / (1000 * 60 * 60);
        }
        return acc;
      }, 0);

      return {
        name: `${member.first_name} ${member.last_name.charAt(0)}.`,
        hours: parseFloat(totalHours.toFixed(1)),
      };
    }) || [];

  // Clock in/out handlers for the manager
  const handleClockIn = () => {
    const newClock: ClockType = {
      id: Date.now(),
      user_id: user.id,
      clock_in: new Date().toISOString(),
      clock_out: null,
      created_at: new Date().toISOString(),
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    };
    setManagerClocks([newClock, ...managerClocks]);
  };

  const handleClockOut = () => {
    setManagerClocks(
      managerClocks.map((c) =>
        c.id === currentClock?.id && !c.clock_out
          ? { ...c, clock_out: new Date().toISOString() }
          : c,
      ),
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <Tabs defaultValue="employee" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-8">
          <TabsList className="grid grid-cols-2 w-full max-w-md bg-white/5 border border-white/10 text-white/60">
          <TabsTrigger
            value="employee"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white/90 text-white/60"
          >
            Employee
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white/90 text-white/60"
          >
            Team Management
          </TabsTrigger>
        </TabsList>
        </div>

        {/* Employee Tab */}
        <TabsContent value="employee" className="mt-0">
          {/* Employee Info Bar */}
          <div className="mb-8">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="flex flex-col">
                  <span className="text-white/50 text-xs mb-1">
                    Email
                  </span>
                  <span className="text-white/90">
                    {user.email}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/50 text-xs mb-1">
                    Phone
                  </span>
                  <span className="text-white/90">
                    {user.phone_number}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/50 text-xs mb-1">
                    Team
                  </span>
                  <span className="text-white/90">
                    {team?.name || "Not assigned"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/50 text-xs mb-1">
                    Manager
                  </span>
                  <span className="text-white/90">
                    {team?.manager
                      ? `${team.manager.first_name} ${team.manager.last_name}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/50 text-xs mb-1">
                    Member Since
                  </span>
                  <span className="text-white/90">
                    {new Date(
                      user.created_at,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Hours This Week"
              value={`${managerHoursThisWeek.toFixed(1)}h`}
              icon={Clock}
              description="Total working hours"
              progress={{
                current: managerHoursThisWeek,
                total: 35,
                unit: "hours",
              }}
            />
            <StatCard
              title="Average Late Time"
              value={
                managerAvgLateMinutes < 1
                  ? "On Time"
                  : `${Math.round(managerAvgLateMinutes)} min`
              }
              icon={ClockAlert}
              description="Past 30 days"
              trend={
                managerAvgLateMinutes > 0
                  ? {
                      value: `${Math.round(managerAvgLateMinutes)} min late`,
                      positive: false,
                    }
                  : undefined
              }
            />
            <StatCard
              title="Working Days This Month"
              value={`${daysWorked}/${totalWorkingDays}`}
              icon={Calendar}
              description={`${new Date().toLocaleDateString("en-US", { month: "long" })}`}
              progress={{
                current: daysWorked,
                total: totalWorkingDays,
              }}
            />
            <StatCard
              title="Team"
              value={team?.name || "No Team"}
              icon={UserIcon}
              description={
                team?.manager?.first_name
                  ? `Manager: ${team.manager.first_name}`
                  : "Not assigned"
              }
            />
          </div>

          {/* Clock Widget and Clock Records */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <ClockWidget
                userId={user.id}
                currentClock={currentClock}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
              />
            </div>

            <div className="lg:col-span-1">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden h-[420px] flex flex-col">
                <h3 className="text-white/80 text-sm p-4 border-b border-white/10 flex-shrink-0">
                  Your Clock Records
                </h3>
                <div className="overflow-y-auto flex-1 min-h-0">
                  <div className="p-4 space-y-3">
                    {managerClocks.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-8 h-8 text-white/30 mx-auto mb-2" />
                        <p className="text-white/50 text-xs">
                          No records found
                        </p>
                      </div>
                    ) : (
                      managerClocks.slice(0, 5).map((clock) => {
                        const duration = clock.clock_out
                          ? (() => {
                              const diff =
                                new Date(
                                  clock.clock_out,
                                ).getTime() -
                                new Date(
                                  clock.clock_in,
                                ).getTime();
                              const hours = Math.floor(
                                diff / (1000 * 60 * 60),
                              );
                              const minutes = Math.floor(
                                (diff % (1000 * 60 * 60)) /
                                  (1000 * 60),
                              );
                              return `${hours}h ${minutes}m`;
                            })()
                          : "In Progress";

                        return (
                          <div
                            key={clock.id}
                            className="bg-white/5 rounded-lg p-3 border border-white/5 transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-top-2"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-white/60 text-xs">
                                {new Date(
                                  clock.clock_in,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  clock.clock_out
                                    ? "bg-green-500/10 text-green-300 border border-green-500/30"
                                    : "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                                }`}
                              >
                                {clock.clock_out
                                  ? "Completed"
                                  : "Active"}
                              </span>
                            </div>
                            <div className="text-xs text-white/70 space-y-1">
                              <div className="flex justify-between">
                                <span>In:</span>
                                <span>
                                  {new Date(
                                    clock.clock_in,
                                  ).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    },
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Out:</span>
                                <span>
                                  {clock.clock_out
                                    ? new Date(
                                        clock.clock_out,
                                      ).toLocaleTimeString(
                                        "en-US",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: false,
                                        },
                                      )
                                    : "-"}
                                </span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-white/5">
                                <span>Duration:</span>
                                <span className="text-white/90">
                                  {duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team" className="mt-0">
          {/* Team Management Header */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-white/90">{team ? team.name : "No team assigned"}</h3>
            <Button
              onClick={() => setIsExportDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
          </div>

          {/* Team Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Now"
              value={activeClocks}
              icon={TrendingUp}
              description="Currently clocked in"
            />
            <StatCard
              title="Avg Hours Per Shift"
              value={`${avgWorkTime.toFixed(1)}h`}
              icon={Clock}
              description="Average shift duration"
              onClick={() => setMetricDialogOpen("workTime")}
            />
            <StatCard
              title="Avg Late Time"
              value={`${avgLateTime.toFixed(0)} min`}
              icon={Timer}
              description="After 9:00 AM"
              onClick={() => setMetricDialogOpen("lateTime")}
            />
            <StatCard
              title="Avg Overtime"
              value={`${avgOvertimeHours.toFixed(1)}h`}
              icon={Award}
              description="After 17:00"
              onClick={() => setMetricDialogOpen("overtime")}
            />
          </div>

          {/* Team Information and Performance */}
          {team && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              {/* Team Information */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 lg:col-span-2">
                <h3 className="text-white/90 mb-4">
                  Team Information
                </h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-white/60">
                        Team Name
                      </span>
                      <span className="text-white/90">
                        {team.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-white/60">
                        Total Members
                      </span>
                      <span className="text-white/90">
                        {team.members.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-white/60">
                        Description
                      </span>
                      <span className="text-white/90 text-right">
                        {team.description}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-white/60">
                        Created
                      </span>
                      <span className="text-white/90">
                        {new Date(
                          team.created_at,
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Performance Chart */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 h-[420px] flex flex-col lg:col-span-3">
                <h3 className="text-white/90 mb-4">
                  Team Performance
                </h3>
                <div className="flex-1">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="rgba(255,255,255,0.6)"
                        tick={{ fill: "rgba(255,255,255,0.6)" }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.6)"
                        tick={{ fill: "rgba(255,255,255,0.6)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border:
                            "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "rgba(255,255,255,0.6)",
                        }}
                      />
                      <Bar
                        dataKey="hours"
                        fill="url(#colorGradient)"
                        radius={[8, 8, 0, 0]}
                        name="Hours Worked"
                      />
                      <defs>
                        <linearGradient
                          id="colorGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#06b6d4"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Team Members and Clock Records */}
          {team && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              {/* Team Members */}
              <div className="lg:col-span-2 h-full">
                <TeamMembersCard members={team.members} />
              </div>

              {/* Team Clock Records */}
              <div className="lg:col-span-3 h-full">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 h-full flex flex-col">
                  <h3 className="text-white/90 mb-4">
                    Team Clock Records
                  </h3>
                  <div className="flex-1 overflow-auto">
                    <ClockRecordsTable
                      clocks={teamClocks}
                      showUser={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Employee Ranking Dialogs */}
      <EmployeeRankingDialog
        open={metricDialogOpen === "workTime"}
        onOpenChange={(open) =>
          !open && setMetricDialogOpen(null)
        }
        title="Average Work Time per Day"
        description="Team members ranked by their average daily work hours"
        employees={calculateTeamMemberWorkTime()}
        metricLabel="avg per day"
      />

      <EmployeeRankingDialog
        open={metricDialogOpen === "lateTime"}
        onOpenChange={(open) =>
          !open && setMetricDialogOpen(null)
        }
        title="Average Late Time"
        description="Team members ranked by their average late arrival time (after 9:00 AM)"
        employees={calculateTeamMemberLateTime()}
        metricLabel="avg late"
      />

      <EmployeeRankingDialog
        open={metricDialogOpen === "overtime"}
        onOpenChange={(open) =>
          !open && setMetricDialogOpen(null)
        }
        title="Average Overtime"
        description="Team members ranked by their average overtime hours (after 17:00)"
        employees={calculateTeamMemberOvertime()}
        metricLabel="avg overtime"
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        userRole={user.role}
        kpiData={{
          teamName: team?.name,
          totalEmployees: teamMemberIds.length,
          activeClocks: activeClocks,
          avgHoursPerShift: avgWorkTime,
          avgLateTime: avgLateTime,
          avgOvertime: avgOvertimeHours,
        }}
      />
    </div>
  );
}