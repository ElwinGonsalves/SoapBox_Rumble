import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Users, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export const AuthScreen: React.FC = () => {
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithUsername } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      toast.error('Please enter a username')
      return
    }

    setIsLoading(true)
    try {
      await signInWithUsername(nickname.trim())
      toast.success('Welcome to r/Soapbox!')
    } catch (error) {
      toast.error('Failed to join. Please try again.')
      console.error('Username sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4"
          >
            <Mic className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">r/Soapbox</h1>
          <p className="text-gray-400 text-lg">Stand Up or Shut Up</p>
        </div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
            <Mic className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-xs text-gray-300">60s Rants</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
            <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-gray-300">Live Audience</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
            <Zap className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-xs text-gray-300">Cringe Meter</p>
          </div>
        </motion.div>

        {/* Username Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
              Choose your username
            </label>
            <input
              id="nickname"
              type="text"
              placeholder="Enter your username"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !nickname.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:from-orange-600 hover:to-red-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Joining...</span>
              </div>
            ) : (
              'Join the Soapbox'
            )}
          </button>
        </motion.form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          Ready to share your hot takes?
        </motion.p>
      </motion.div>
    </div>
  )
}