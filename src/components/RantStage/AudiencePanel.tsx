import React from 'react'
import { motion } from 'framer-motion'
import { Users, Eye, Wifi } from 'lucide-react'
import { User } from '../../lib/supabase'

interface AudiencePanelProps {
  connectedUsers: User[]
  currentUserId: string
}

export const AudiencePanel: React.FC<AudiencePanelProps> = ({ 
  connectedUsers, 
  currentUserId 
}) => {
  const audienceCount = connectedUsers.length + 1 // +1 for current user

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Live Audience</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">{audienceCount}</span>
          </div>
        </div>
      </div>

      {/* Audience avatars */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {/* Current user */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative group"
          title="You"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center border-2 border-orange-400">
            <span className="text-white font-bold text-xs">
              {currentUserId.slice(-2).toUpperCase()}
            </span>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-800"></div>
        </motion.div>

        {/* Other users */}
        {connectedUsers.slice(0, 11).map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative group"
            title={user.nickname}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {user.nickname.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-800"></div>
          </motion.div>
        ))}

        {/* Show more indicator if there are more users */}
        {connectedUsers.length > 11 && (
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              +{connectedUsers.length - 11}
            </span>
          </div>
        )}
      </div>

      {/* Recent joiners */}
      {connectedUsers.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <p className="text-xs text-gray-400 mb-2">Recently joined:</p>
          <div className="space-y-1">
            {connectedUsers.slice(-3).map((user) => (
              <div key={user.id} className="flex items-center space-x-2 text-xs">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {user.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-300">{user.nickname}</span>
                <span className="text-gray-500">joined</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity indicator */}
      <div className="text-xs text-gray-400 text-center mt-3">
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎭 Everyone's watching and reacting live
        </motion.span>
      </div>
    </div>
  )
}