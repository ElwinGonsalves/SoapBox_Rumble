import React from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  timeLeft: number
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeLeft }) => {
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const progress = (60 - timeLeft) / 60
  const strokeDashoffset = circumference - (progress * circumference)

  const getColor = () => {
    if (timeLeft <= 10) return '#EF4444' // red
    if (timeLeft <= 30) return '#F97316' // orange
    return '#10B981' // green
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        {/* Background Circle */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 144 144">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-700"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke={getColor()}
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Clock className="w-6 h-6 text-gray-400 mb-1" />
          <motion.span 
            className={`text-2xl font-bold ${
              timeLeft <= 10 ? 'text-red-400' : 
              timeLeft <= 30 ? 'text-orange-400' : 'text-green-400'
            }`}
            animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
          >
            {formatTime(timeLeft)}
          </motion.span>
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mt-2">Time remaining</p>
    </div>
  )
}