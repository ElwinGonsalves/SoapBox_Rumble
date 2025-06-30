import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reaction } from '../../lib/supabase'

interface LiveReactionsStreamProps {
  reactions: Reaction[]
}

export const LiveReactionsStream: React.FC<LiveReactionsStreamProps> = ({ reactions }) => {
  // Show only the last 20 reactions for performance
  // Ensure reactions is always an array to prevent undefined errors
  const recentReactions = (reactions || []).slice(-20)

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 h-64 overflow-hidden relative">
      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
        Live Reactions
      </h4>
      
      <div className="space-y-1 h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
        <AnimatePresence mode="popLayout">
          {recentReactions.map((reaction, index) => (
            <motion.div
              key={`${reaction.id}-${index}`}
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center space-x-2 text-sm bg-gray-700/30 rounded px-2 py-1"
            >
              <motion.span 
                className="text-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.2 }}
              >
                {reaction.emoji}
              </motion.span>
              <span className="text-gray-300 font-medium">
                {reaction.user_id.slice(-6)}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(reaction.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating reactions overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {recentReactions.slice(-5).map((reaction, index) => (
            <motion.div
              key={`floating-${reaction.id}`}
              initial={{ 
                opacity: 0, 
                y: 50, 
                x: Math.random() * 200,
                scale: 0.5 
              }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: -100, 
                scale: [0.5, 1.2, 1, 0.8] 
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 3,
                ease: "easeOut",
                delay: index * 0.1
              }}
              className="absolute text-2xl"
              style={{
                left: `${20 + (index * 15)}%`,
                bottom: '20px'
              }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}