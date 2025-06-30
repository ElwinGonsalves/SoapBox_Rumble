import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reaction } from '../../lib/supabase'

interface ReactionsPanelProps {
  reactions: Reaction[]
  onReaction: (emoji: string) => void
  disabled?: boolean
}

const reactionButtons = [
  { emoji: '🥫', name: 'Tomato', color: 'text-red-400', description: 'Boo!' },
  { emoji: '❓', name: 'Explain?', color: 'text-blue-400', description: 'What?' },
  { emoji: '👍', name: '+1', color: 'text-green-400', description: 'Agree!' },
  { emoji: '😬', name: 'Cringe', color: 'text-yellow-400', description: 'Yikes!' },
]

export const ReactionsPanel: React.FC<ReactionsPanelProps> = ({
  reactions,
  onReaction,
  disabled = false
}) => {
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Quick Reactions</h3>
        {disabled && (
          <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
            Can't react while speaking
          </span>
        )}
      </div>
      
      {/* Reaction Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {reactionButtons.map((button) => {
          const count = reactionCounts[button.emoji] || 0
          return (
            <motion.button
              key={button.emoji}
              onClick={() => onReaction(button.emoji)}
              disabled={disabled}
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              className={`
                relative flex flex-col items-center p-4 rounded-lg border transition-all duration-200
                ${disabled 
                  ? 'bg-gray-700/30 border-gray-600 opacity-50 cursor-not-allowed' 
                  : 'bg-gray-700/50 border-gray-600 hover:border-gray-500 hover:bg-gray-700 hover:shadow-lg'
                }
              `}
            >
              <motion.span 
                className="text-3xl mb-2"
                animate={count > 0 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                {button.emoji}
              </motion.span>
              <span className="text-xs text-gray-400 mb-1">{button.name}</span>
              <span className="text-xs text-gray-500">{button.description}</span>
              
              {count > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute -top-2 -right-2 w-6 h-6 ${button.color.replace('text-', 'bg-').replace('-400', '-500')} rounded-full flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-xs">{count}</span>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Reaction Stats */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total reactions:</span>
          <span className="text-white font-medium">{reactions.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-400">Most popular:</span>
          <span className="text-white font-medium">
            {Object.entries(reactionCounts).length > 0 
              ? Object.entries(reactionCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '—'
              : '—'
            }
          </span>
        </div>
      </div>
    </div>
  )
}