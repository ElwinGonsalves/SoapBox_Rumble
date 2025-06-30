import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithUsername: (nickname: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already signed in (stored in localStorage)
    const storedUser = localStorage.getItem('soapbox-user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('soapbox-user')
      }
    }
    setLoading(false)
  }, [])

  const signInWithUsername = async (nickname: string) => {
    // Create a simple user object
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nickname,
      auth_method: 'anonymous',
      created_at: new Date().toISOString(),
    }

    // Store user in localStorage for persistence
    localStorage.setItem('soapbox-user', JSON.stringify(newUser))
    setUser(newUser)
  }

  const signOut = () => {
    localStorage.removeItem('soapbox-user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithUsername,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}