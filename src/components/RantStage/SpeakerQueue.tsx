import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Clock, Users } from 'lucide-react'

interface SpeakerQueueProps {
  currentSpeaker?: string
  speakerQueue: string[]
  currentUserId: string
  onJoinQueue: () => void
  onStartSpeaking: () => void
  isUserInQueue: boolean
  isUserSpeaking: boolean
}

export const SpeakerQueue: React.FC<SpeakerQueueProps> = ({
  currentSpeaker,
  speakerQueue,
  currentUserId,
  onJoinQueue,
  onStartSpeaking,
  isUserInQueue,
  isUserSpeaking
}) => {
  const userQueuePosition = speakerQueue.indexOf(currentUserId) + 1

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Mic className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-medium text-white">Speaker Queue</h3>
      </div>

      {/* Current Speaker */}
      {currentSpeaker && (
        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-orange-400 font-medium">Now Speaking</span>
          </div>
          <p className="text-white mt-1">
            {currentSpeaker === currentUserId ? 'You' : `User ${currentSpeaker.slice(-6)}`}
          </p>
        </div>
      )}

      {/* Queue List */}
      <div className="space-y-2 mb-4">
        <AnimatePresence>
          {speakerQueue.length > 0 ? (
            speakerQueue.slice(0, 5).map((speakerId, index) => (
              <motion.div
                key={speakerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-2 rounded-lg ${
                  speakerId === currentUserId 
                    ? 'bg-blue-500/10 border border-blue-500/20' 
                    : 'bg-gray-700/30'
                }`}
              >
                <span className="text-gray-400 font-mono text-sm">#{index + 1}</span>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${
                    speakerId === currentUserId ? 'text-blue-400' : 'text-white'
                  }`}>
                    {speakerId === currentUserId ? 'You' : `User ${speakerId.slice(-6)}`}
                  </span>
                </div>
                {speakerId === currentUserId && (
                  <Clock className="w-4 h-4 text-blue-400" />
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Queue is empty</p>
            </div>
          )}
        </AnimatePresence>

        {speakerQueue.length > 5 && (
          <p className="text-xs text-gray-500 text-center">
            +{speakerQueue.length - 5} more in queue
          </p>
        )}
      </div>

      {/* User Status & Actions */}
      <div className="space-y-3">
        {isUserSpeaking ? (
          <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 font-medium">🎤 You're live!</p>
            <p className="text-xs text-gray-400 mt-1">Share your hot take</p>
          </div>
        ) : isUserInQueue ? (
          <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 font-medium">
              Position #{userQueuePosition} in queue
            </p>
            <p className="text-xs text-gray-400 mt-1">Get ready to speak!</p>
          </div>
        ) : (
          <button
            onClick={onJoinQueue}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 hover:scale-105"
          >
            Join Speaker Queue
          </button>
        )}

        {/* Quick speak button for demo */}
        {!currentSpeaker && !isUserSpeaking && (
          <button
            onClick={onStartSpeaking}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-sm"
          >
            🚀 Quick Speak (Skip Queue)
          </button>
        )}
      </div>
    </div>
  )
}