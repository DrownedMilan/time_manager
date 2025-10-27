import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { LogOut, User, UsersRound, Plus, Building2 } from "lucide-react";
import { UserRole } from "../types";
import PasswordChangeDialog from "./PasswordChangeDialog";
import EmployeeEditDialog from "./EmployeeEditDialog";
import logo from "/primebank_logo.png";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export default function DashboardLayout({ children, userRole, userName, userEmail, onLogout }: DashboardLayoutProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEmployeeEditOpen, setIsEmployeeEditOpen] = useState(false);

  const getRoleDisplay = () => {
    switch (userRole) {
      case UserRole.ORGANIZATION:
        return "Organization Admin";
      case UserRole.MANAGER:
        return "Team Manager";
      default:
        return "Employee";
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case UserRole.ORGANIZATION:
        return <Building2 className="w-5 h-5" />;
      case UserRole.MANAGER:
        return <UsersRound className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center p-2">
                <img src={logo} alt="PrimeBank Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-white/90">PrimeBank</h1>
                <p className="text-xs text-white/60">{getRoleDisplay()}</p>
              </div>
            </div>

            <div className="flex items-stretch gap-3">
              {userRole === UserRole.ORGANIZATION && (
                <Button
                  onClick={() => setIsEmployeeEditOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-auto px-3 py-1 text-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Employee
                </Button>
              )}
              
              <div 
                onClick={() => setIsPasswordDialogOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/20 hover:border-blue-400/50 hover:from-white/10 hover:to-white/15 cursor-pointer transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300 relative z-10">
                  {getRoleIcon()}
                </div>
                <div className="text-right relative z-10">
                  <p className="text-sm text-white group-hover:text-white transition-colors duration-300">{userName}</p>
                  <p className="text-xs text-white/60 group-hover:text-blue-300/80 transition-colors duration-300">{getRoleDisplay()}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={onLogout}
                className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white h-auto px-3 py-1 text-sm"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative">
        {children}
      </main>

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Employee Edit Dialog */}
      {userRole === UserRole.ORGANIZATION && (
        <EmployeeEditDialog
          open={isEmployeeEditOpen}
          onOpenChange={setIsEmployeeEditOpen}
          employee={null}
        />
      )}
    </div>
  );
}
