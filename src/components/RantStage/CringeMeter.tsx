import React from 'react'
import { motion } from 'framer-motion'
import { Zap, AlertTriangle } from 'lucide-react'

interface CringeMeterProps {
  percentage: number
}

export const CringeMeter: React.FC<CringeMeterProps> = ({ percentage }) => {
  const getColor = () => {
    if (percentage >= 80) return 'from-red-500 to-red-600'
    if (percentage >= 60) return 'from-orange-500 to-red-500'
    if (percentage >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-green-500 to-yellow-500'
  }

  const getWarningLevel = () => {
    if (percentage >= 90) return 'DANGER ZONE!'
    if (percentage >= 70) return 'High Cringe'
    if (percentage >= 50) return 'Moderate Cringe'
    return 'Safe Zone'
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-medium text-white">Cringe Meter</h3>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${getColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Percentage Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Warning Indicator */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${
          percentage >= 80 ? 'text-red-400' : 
          percentage >= 60 ? 'text-orange-400' : 
          percentage >= 40 ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {getWarningLevel()}
        </span>
        
        {percentage >= 80 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </motion.div>
        )}
      </div>

      {/* Eject Warning */}
      {percentage >= 90 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg"
        >
          <p className="text-red-300 text-sm font-medium text-center">
            ⚠️ Auto-eject at 100%!
          </p>
        </motion.div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 mt-4">
        Based on 😬 reactions from the audience
      </p>
    </div>
  )
}