import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { ScrollArea } from '../../components/ui/scroll-area'
import type { UserMinimal } from '@/types'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'

interface EmployeeMetric {
  user: UserMinimal
  value: number
  displayValue: string
}

interface EmployeeRankingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  employees: EmployeeMetric[]
  metricLabel: string
}

export default function EmployeeRankingDialog({
  open,
  onOpenChange,
  title,
  description,
  employees,
  metricLabel,
}: EmployeeRankingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] backdrop-blur-xl bg-slate-900/95 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white/90">{title}</DialogTitle>
          <DialogDescription className="text-white/60">{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {employees.map((employee, index) => (
              <div
                key={employee.user.id}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-white/10 flex items-center justify-center">
                        <span className="text-sm text-white/70">#{index + 1}</span>
                      </div>
                      <Avatar className="h-10 w-10 border-2 border-white/10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                          {`${employee.user.first_name?.[0] || ''}${employee.user.last_name?.[0] || ''}`.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="text-white/90">
                        {employee.user.first_name} {employee.user.last_name}
                      </p>
                      <p className="text-xs text-white/60">{employee.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/90">{employee.displayValue}</p>
                    <p className="text-xs text-white/60">{metricLabel}</p>
                  </div>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <div className="text-center py-8 text-white/60">No data available</div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
