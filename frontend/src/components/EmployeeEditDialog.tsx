import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { User, UserRole } from "../types";
import { Save, XCircle, Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";

interface EmployeeEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmployeeEditDialog({ user, open, onOpenChange }: EmployeeEditDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [tempPassword, setTempPassword] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Generate a secure temporary password
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const special = '@#$%&';
    let password = 'Bank';
    password += new Date().getFullYear();
    password += special.charAt(Math.floor(Math.random() * special.length));
    for (let i = 0; i < 5; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
      setPhoneNumber(user.phone_number);
      setRole(user.role);
      setTempPassword(""); // No password for editing
      setPasswordCopied(false);
    } else {
      // Reset form for new employee
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setRole(UserRole.EMPLOYEE);
      setTempPassword(generateTempPassword()); // Generate password for new employee
      setPasswordCopied(false);
    }
  }, [user, open]);

  const handleSave = () => {
    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // In a real app, this would make an API call
    const action = user ? 'updated' : 'added';
    toast.success(`Employee ${firstName} ${lastName} ${action} successfully!`);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setPasswordCopied(true);
      toast.success("Password copied to clipboard!");
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy password");
    }
  };

  const roleChanged = user && role !== user.role;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white/90">
            {user ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {user ? 'Update employee information and manage their role' : 'Enter new employee details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white/80">
              First Name
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white/80">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              placeholder="Enter last name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              placeholder="Enter email"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-white/80">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              placeholder="Enter phone number"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-white/80">
              Role
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                <SelectItem value={UserRole.EMPLOYEE} className="text-white">
                  {UserRole.EMPLOYEE}
                </SelectItem>
                <SelectItem value={UserRole.MANAGER} className="text-white">
                  {UserRole.MANAGER}
                </SelectItem>
                <SelectItem value={UserRole.ORGANIZATION} className="text-white">
                  {UserRole.ORGANIZATION}
                </SelectItem>
              </SelectContent>
            </Select>
            {roleChanged && (
              <p className="text-xs text-amber-400 mt-1">
                ⚠️ Changing role will affect permissions and team assignments
              </p>
            )}
          </div>

          {/* Temporary Password (only for new employees) */}
          {!user && tempPassword && (
            <div className="space-y-2">
              <Label htmlFor="tempPassword" className="text-white/80">
                Temporary Password
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tempPassword"
                  value={tempPassword}
                  readOnly
                  className="bg-white/10 border-white/20 text-white font-mono"
                />
                <Button
                  type="button"
                  onClick={copyPassword}
                  size="sm"
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 shrink-0"
                >
                  {passwordCopied ? (
                    <CheckCheck className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-blue-400">
                💡 This password will be required for the employee's first login
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={handleCancel}
              size="sm"
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
