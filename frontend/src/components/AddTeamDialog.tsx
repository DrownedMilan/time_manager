import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { mockUsers } from "../lib/mockData";
import { UserRole } from "../types";
import { toast } from "sonner";

interface AddTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTeamDialog({ open, onOpenChange }: AddTeamDialogProps) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);

  // Get available managers (managers without a team)
  const availableManagers = mockUsers.filter(
    user => user.role === UserRole.MANAGER && !user.managed_team
  );

  // Get unassigned employees (employees without a team)
  const unassignedEmployees = mockUsers.filter(
    user => user.role === UserRole.EMPLOYEE && !user.team
  );

  const handleEmployeeToggle = (employeeId: number) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    if (!selectedManagerId) {
      toast.error("Please select a manager");
      return;
    }

    // In a real app, this would make an API call
    toast.success(`Team "${teamName}" created successfully!`);
    
    // Reset form and close dialog
    setTeamName("");
    setDescription("");
    setSelectedManagerId("");
    setSelectedEmployeeIds([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTeamName("");
    setDescription("");
    setSelectedManagerId("");
    setSelectedEmployeeIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Team</DialogTitle>
          <DialogDescription className="text-white/60">
            Add a new team to your organization with a manager and team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="team-name" className="text-white/90">
              Team Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Investment Banking"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/90">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the team's role and responsibilities..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
            />
          </div>

          {/* Manager Selection */}
          <div className="space-y-2">
            <Label htmlFor="manager" className="text-white/90">
              Manager <span className="text-red-400">*</span>
            </Label>
            {availableManagers.length > 0 ? (
              <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  {availableManagers.map((manager) => (
                    <SelectItem 
                      key={manager.id} 
                      value={manager.id.toString()}
                      className="text-white"
                    >
                      {manager.first_name} {manager.last_name} ({manager.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-white/60 bg-white/5 p-3 rounded-lg border border-white/10">
                No available managers. All managers are already assigned to teams.
              </p>
            )}
          </div>

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label className="text-white/90">
              Team Members
            </Label>
            {unassignedEmployees.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto bg-white/5 rounded-lg border border-white/10 p-4">
                {unassignedEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`employee-${employee.id}`}
                      checked={selectedEmployeeIds.includes(employee.id)}
                      onCheckedChange={() => handleEmployeeToggle(employee.id)}
                      className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label
                      htmlFor={`employee-${employee.id}`}
                      className="text-white/90 cursor-pointer flex-1"
                    >
                      {employee.first_name} {employee.last_name}
                      <span className="text-white/60 text-sm ml-2">({employee.email})</span>
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/60 bg-white/5 p-3 rounded-lg border border-white/10">
                No unassigned employees available.
              </p>
            )}
            {selectedEmployeeIds.length > 0 && (
              <p className="text-sm text-white/60">
                {selectedEmployeeIds.length} employee{selectedEmployeeIds.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              Create Team
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
