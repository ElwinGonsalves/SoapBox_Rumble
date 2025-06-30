import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  nickname: string
  avatar?: string
  auth_method: 'google' | 'anonymous'
  created_at: string
}

export type Rant = {
  id: string
  user_id: string
  nickname: string
  text?: string
  audio_url?: string
  transcript?: string
  reactions: ReactionStats
  created_at: string
  duration: number
  survived: boolean
}

export type ReactionStats = {
  tomato: number
  explain: number
  plus_one: number
  cringe: number
}

export type Session = {
  id: string
  current_speaker?: string
  speaker_queue: string[]
  start_time?: string
  cringe_level: number
  active: boolean
}

export type Reaction = {
  id: string
  user_id: string
  session_id: string
  emoji: string
  timestamp: string
}