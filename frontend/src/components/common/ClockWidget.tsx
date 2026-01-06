import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Clock as ClockIcon, Play, Square } from 'lucide-react'
import { type Clock } from '@/types/clock'

interface ClockWidgetProps {
  userId: number
  currentClock: Clock | null
  onClockIn: () => void
  onClockOut: () => void
}

export default function ClockWidget({ currentClock, onClockIn, onClockOut }: ClockWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [workDuration, setWorkDuration] = useState('00:00:00')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (currentClock && !currentClock.clock_out) {
      const clockInTime = new Date(currentClock.clock_in)
      const diff = currentTime.getTime() - clockInTime.getTime()

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setWorkDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      )
    } else {
      setWorkDuration('00:00:00')
    }
  }, [currentTime, currentClock])

  const isClockedIn = currentClock && !currentClock.clock_out

  // Calculate analog clock angles
  const hours = currentTime.getHours() % 12
  const minutes = currentTime.getMinutes()
  const seconds = currentTime.getSeconds()

  const secondAngle = seconds * 6 - 90 // 6 degrees per second
  const minuteAngle = minutes * 6 + seconds * 0.1 - 90 // 6 degrees per minute
  const hourAngle = hours * 30 + minutes * 0.5 - 90 // 30 degrees per hour

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/20 rounded-xl p-6 h-[420px]">
      {/* Header with Clock Status */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
          <ClockIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white/90">Clock Status</h3>
          <p className="text-xs text-white/60">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Clock Display and Controls */}
      <div
        className={`flex items-center gap-6 mb-6 transition-all duration-500 ease-in-out ${
          isClockedIn ? 'justify-center' : 'justify-center'
        }`}
      >
        {/* Working Time Display - Fixed width container to prevent layout shift */}
        <div
          className={`flex items-center justify-center transition-all duration-500 ease-in-out ${
            isClockedIn ? 'w-44 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <div
            className={`text-center py-4 px-4 bg-green-500/10 rounded-lg border border-green-500/20 transition-all duration-500 ease-in-out whitespace-nowrap ${
              isClockedIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <p className="text-xs text-green-300 mb-1">Working Time</p>
            <p className="text-green-200">{workDuration}</p>
            <p className="text-xs text-green-300/60 mt-1">
              Since{' '}
              {currentClock &&
                new Date(currentClock.clock_in).toLocaleTimeString('en-US', { hour12: false })}
            </p>
          </div>
        </div>

        {/* Analog Clock */}
        <div className="w-64 h-64">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            <defs>
              {/* Gradient for clock face */}
              <radialGradient id="clockFaceGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
                <stop offset="70%" stopColor="rgba(34, 211, 238, 0.1)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
              </radialGradient>

              {/* Gradient for outer ring */}
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(96, 165, 250, 0.6)" />
                <stop offset="50%" stopColor="rgba(34, 211, 238, 0.6)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.6)" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Shadow filter */}
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Outer decorative ring */}
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Clock face background with gradient */}
            <circle cx="100" cy="100" r="92" fill="url(#clockFaceGradient)" filter="url(#shadow)" />

            {/* Inner decorative circle */}
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="0.5"
            />

            {/* Hour markers with enhanced styling */}
            {[...Array(12)].map((_, i) => {
              const angle = i * 30 * (Math.PI / 180)
              const isQuarterHour = i % 3 === 0

              if (isQuarterHour) {
                // Quarter hour markers (12, 3, 6, 9) - larger and with dots
                const x1 = 100 + Math.cos(angle) * 75
                const y1 = 100 + Math.sin(angle) * 75
                const x2 = 100 + Math.cos(angle) * 88
                const y2 = 100 + Math.sin(angle) * 88
                const dotX = 100 + Math.cos(angle) * 68
                const dotY = 100 + Math.sin(angle) * 68

                return (
                  <g key={i}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="rgba(96, 165, 250, 0.8)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      filter="url(#glow)"
                    />
                    <circle cx={dotX} cy={dotY} r="2.5" fill="rgba(34, 211, 238, 0.6)" />
                  </g>
                )
              } else {
                // Regular hour markers
                const x1 = 100 + Math.cos(angle) * 80
                const y1 = 100 + Math.sin(angle) * 80
                const x2 = 100 + Math.cos(angle) * 88
                const y2 = 100 + Math.sin(angle) * 88

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )
              }
            })}

            {/* Minute markers (small dots) */}
            {[...Array(60)].map((_, i) => {
              if (i % 5 === 0) return null // Skip hour positions
              const angle = i * 6 * (Math.PI / 180)
              const x = 100 + Math.cos(angle) * 84
              const y = 100 + Math.sin(angle) * 84

              return (
                <circle key={`min-${i}`} cx={x} cy={y} r="0.8" fill="rgba(255, 255, 255, 0.2)" />
              )
            })}

            {/* Hour hand with shadow */}
            <line
              x1="100"
              y1="100"
              x2={100 + Math.cos((hourAngle * Math.PI) / 180) * 50}
              y2={100 + Math.sin((hourAngle * Math.PI) / 180) * 50}
              stroke="rgba(96, 165, 250, 1)"
              strokeWidth="7"
              strokeLinecap="round"
              filter="url(#shadow)"
            />

            {/* Minute hand with shadow */}
            <line
              x1="100"
              y1="100"
              x2={100 + Math.cos((minuteAngle * Math.PI) / 180) * 70}
              y2={100 + Math.sin((minuteAngle * Math.PI) / 180) * 70}
              stroke="rgba(34, 211, 238, 1)"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#shadow)"
            />

            {/* Second hand with glow */}
            <line
              x1="100"
              y1="100"
              x2={100 + Math.cos((secondAngle * Math.PI) / 180) * 80}
              y2={100 + Math.sin((secondAngle * Math.PI) / 180) * 80}
              stroke="rgba(249, 115, 22, 0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* Center mechanism */}
            <circle cx="100" cy="100" r="8" fill="rgba(30, 41, 59, 0.4)" filter="url(#shadow)" />
            <circle cx="100" cy="100" r="6" fill="url(#ringGradient)" />
            <circle cx="100" cy="100" r="3" fill="rgba(255, 255, 255, 0.9)" />
          </svg>
        </div>

        {/* Digital time display and Action Button */}
        <div className="space-y-4">
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-6 py-4 rounded-xl border border-white/30 shadow-lg">
            <p className="text-xs text-white/60 mb-1">Current Time</p>
            <p className="text-white/95 tracking-wider text-xl">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </p>
          </div>

          <Button
            onClick={isClockedIn ? onClockOut : onClockIn}
            className={`w-full transition-all duration-300 ease-in-out ${
              isClockedIn
                ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            } text-white border-0`}
          >
            {isClockedIn ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Clock Out
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Clock In
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
