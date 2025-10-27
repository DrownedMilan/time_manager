import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Lock, Mail } from "lucide-react";
import { UserRole } from "../types";
import logo from "/primebank_logo.png";

interface LoginProps {
  onLogin: (email: string, role: UserRole) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login logic
    let role = UserRole.EMPLOYEE;
    if (email.includes("sophie")) {
      role = UserRole.ORGANIZATION;
    } else if (email.includes("thomas") || email.includes("emma")) {
      role = UserRole.MANAGER;
    }
    
    onLogin(email, role);
  };

  const quickLogin = (role: UserRole) => {
    const emails = {
      [UserRole.EMPLOYEE]: "marie.bernard@bank.fr",
      [UserRole.MANAGER]: "thomas.dubois@bank.fr",
      [UserRole.ORGANIZATION]: "sophie.martin@bank.fr"
    };
    onLogin(emails[role], role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md relative">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Logo/Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg p-3">
              <img src={logo} alt="PrimeBank Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-white/90">PrimeBank</h1>
            <p className="text-white/60 text-sm mt-2">Time Management Dashboard</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@bank.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-400/50 focus:bg-white/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-400/50 focus:bg-white/10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
            >
              Sign In
            </Button>
          </form>

          {/* Quick login demo buttons */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-white/60 mb-3 text-center">Demo Quick Login</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin(UserRole.EMPLOYEE)}
                className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white text-xs"
              >
                Employee
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin(UserRole.MANAGER)}
                className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white text-xs"
              >
                Manager
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin(UserRole.ORGANIZATION)}
                className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white text-xs"
              >
                Org Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
