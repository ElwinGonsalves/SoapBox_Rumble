import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, Trophy, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export const Navigation: React.FC = () => {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Mic, label: 'Live Stage' },
    { path: '/hall-of-howls', icon: Trophy, label: 'Hall of Howls' },
  ]

  return (
    <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">r/Soapbox</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-orange-400' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-orange-500/10 border border-orange-500/20 rounded-lg"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-300">{user?.nickname}</p>
              <p className="text-xs text-gray-500">
                {user?.auth_method === 'google' ? 'Google' : 'Anonymous'}
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.nickname.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={signOut}
              className="text-gray-400 hover:text-red-400 transition-colors p-2"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}