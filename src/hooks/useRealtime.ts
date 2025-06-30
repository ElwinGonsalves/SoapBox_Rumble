import { useEffect, useState, useCallback } from 'react'
import { Session, Reaction, User } from '../lib/supabase'

const EXAMPLE_RANT_TEXT = "Okay, here's something that's been driving me absolutely INSANE lately - people who don't return their shopping carts! Like, seriously? You just walked around a massive store for an hour, but suddenly those extra 20 steps to the cart return are too much effort? And don't give me that 'it's someone's job' excuse - that's like throwing trash on the ground because janitors exist! It's basic human decency, people! The shopping cart test is the ultimate measure of whether you're a good person or not. There's no law forcing you to return it, no punishment if you don't, and no reward if you do. It's purely about doing the right thing because it's the right thing to do!"

// Multiple AI voices for the example rant
const EXAMPLE_VOICES = [
  'pNInz6obpgDQGcFmaJgB', // Adam - confident
  'EXAVITQu4vr4xnSDxMaL', // Bella - warm
  'VR6AewLTigWG4xSOukaG', // Josh - energetic
  'AZnzlk1XvdvUeBnXmlld', // Domi - dramatic
]

// Check if API key is properly configured
const isValidApiKey = (apiKey: string | undefined): boolean => {
  return !!(apiKey && 
    apiKey.trim() !== '' && 
    !apiKey.includes('your_') && 
    !apiKey.includes('_here') &&
    apiKey.length > 10)
}

// Enhanced mock system that simulates real-time behavior
export const useRealtimeSession = (sessionId: string, user: User | null) => {
  const [session, setSession] = useState<Session | null>(null)
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [connectedUsers, setConnectedUsers] = useState<User[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [exampleRantActive, setExampleRantActive] = useState(false)
  const [exampleAudioUrl, setExampleAudioUrl] = useState<string | null>(null)
  const [exampleAudio, setExampleAudio] = useState<HTMLAudioElement | null>(null)
  const [hasPlayedExampleRant, setHasPlayedExampleRant] = useState(false)
  const [currentVoiceName, setCurrentVoiceName] = useState<string>('')

  // Check if user has already seen the example rant
  useEffect(() => {
    const hasSeenExample = localStorage.getItem('soapbox-seen-example')
    if (hasSeenExample) {
      setHasPlayedExampleRant(true)
    }
  }, [])

  // Generate example rant audio with random voice
  const generateExampleRantAudio = useCallback(async () => {
    // Check if API key is properly configured
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    if (!isValidApiKey(apiKey)) {
      console.warn('ElevenLabs API key not configured. Skipping example rant audio generation.')
      return null
    }

    try {
      // Pick a random voice for the example rant
      const randomVoiceId = EXAMPLE_VOICES[Math.floor(Math.random() * EXAMPLE_VOICES.length)]
      
      // Voice names for display
      const voiceNames = {
        'pNInz6obpgDQGcFmaJgB': 'Adam',
        'EXAVITQu4vr4xnSDxMaL': 'Bella', 
        'VR6AewLTigWG4xSOukaG': 'Josh',
        'AZnzlk1XvdvUeBnXmlld': 'Domi'
      }
      
      setCurrentVoiceName(voiceNames[randomVoiceId as keyof typeof voiceNames] || 'AI Voice')
      
      console.log(`Generating example rant with voice: ${currentVoiceName}`)

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${randomVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey!
        },
        body: JSON.stringify({
          text: EXAMPLE_RANT_TEXT,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.6 + Math.random() * 0.2, // 0.6-0.8 for variety
            similarity_boost: 0.8 + Math.random() * 0.1, // 0.8-0.9 for quality
            style: 0.3 + Math.random() * 0.2, // 0.3-0.5 for expressiveness
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Invalid ElevenLabs API key. Please check your VITE_ELEVENLABS_API_KEY environment variable.')
        } else {
          console.warn(`ElevenLabs API error: ${response.status}`)
        }
        return null
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      setExampleAudioUrl(audioUrl)

      // Create audio element but DON'T auto-play
      const audio = new Audio(audioUrl)
      audio.volume = 0.7
      setExampleAudio(audio)

      console.log(`Example rant audio generated successfully with ${currentVoiceName}`)
      return audioUrl
    } catch (error) {
      console.warn('Failed to generate example rant audio:', error)
      return null
    }
  }, [currentVoiceName])

  // Initialize session with example rant (only if user hasn't seen it)
  useEffect(() => {
    const initialSession: Session = {
      id: sessionId,
      current_speaker: hasPlayedExampleRant ? undefined : 'example_speaker',
      speaker_queue: [],
      start_time: hasPlayedExampleRant ? undefined : new Date().toISOString(),
      cringe_level: 0,
      active: true,
    }
    setSession(initialSession)
    
    // Only show example rant if user hasn't seen it
    if (!hasPlayedExampleRant) {
      setExampleRantActive(true)
      // Generate example rant audio with random voice (only if API key is configured)
      generateExampleRantAudio()
      
      // Mark as seen in localStorage
      localStorage.setItem('soapbox-seen-example', 'true')
    }

    // Simulate other users joining
    const simulateUsers = () => {
      const userCount = Math.floor(Math.random() * 8) + 5 // 5-12 users
      const nicknames = [
        'RantMaster', 'CringeKing', 'SoapboxSally', 'VentViper', 'RageRabbit',
        'FuryFox', 'MadMike', 'AngryAnna', 'IrateIan', 'LivelyLisa',
        'BoldBob', 'FieryFred', 'PassionatePam', 'IntenseIvy', 'WildWill',
        'HotTakeHunter', 'ReactionKing', 'TomatoThrower', 'BasedViewer'
      ]
      
      const users: User[] = Array.from({ length: userCount }, (_, i) => ({
        id: `user_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
        nickname: nicknames[Math.floor(Math.random() * nicknames.length)] + Math.floor(Math.random() * 1000),
        avatar: null,
        auth_method: 'anonymous',
        created_at: new Date().toISOString(),
      }))
      
      // Add the example speaker only if example rant is active
      if (!hasPlayedExampleRant) {
        users.push({
          id: 'example_speaker',
          nickname: 'ExampleRanter',
          avatar: null,
          auth_method: 'anonymous',
          created_at: new Date().toISOString(),
        })
      }
      
      setConnectedUsers(users)
    }

    simulateUsers()
    const userInterval = setInterval(simulateUsers, 45000) // Update every 45s

    // Auto-end example rant after 45 seconds (only if it's active)
    let exampleRantTimer: NodeJS.Timeout | null = null
    if (!hasPlayedExampleRant) {
      exampleRantTimer = setTimeout(() => {
        setExampleRantActive(false)
        setSession(prev => prev ? {
          ...prev,
          current_speaker: undefined,
          start_time: undefined,
          cringe_level: 0
        } : null)
        
        // Stop example audio
        if (exampleAudio) {
          exampleAudio.pause()
          exampleAudio.currentTime = 0
        }
      }, 45000)
    }

    return () => {
      clearInterval(userInterval)
      if (exampleRantTimer) {
        clearTimeout(exampleRantTimer)
      }
      
      // Cleanup audio
      if (exampleAudio) {
        exampleAudio.pause()
        exampleAudio.src = ''
      }
    }
  }, [sessionId, generateExampleRantAudio, hasPlayedExampleRant])

  // Simulate random reactions from other users (more active during example rant)
  useEffect(() => {
    if (connectedUsers.length === 0) return

    const emojis = ['🥫', '❓', '👍', '😬']
    
    const generateRandomReaction = () => {
      // Higher chance of reactions during example rant
      const reactionChance = exampleRantActive ? 0.7 : 0.2
      
      if (Math.random() < reactionChance) {
        const randomUser = connectedUsers.find(u => u.id !== 'example_speaker')
        if (!randomUser) return
        
        // Bias towards certain reactions during example rant
        let randomEmoji
        if (exampleRantActive) {
          const biasedEmojis = ['👍', '👍', '😬', '😬', '🥫', '❓'] // More thumbs up and cringe
          randomEmoji = biasedEmojis[Math.floor(Math.random() * biasedEmojis.length)]
        } else {
          randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
        }
        
        const reaction: Reaction = {
          id: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: randomUser.id,
          session_id: sessionId,
          emoji: randomEmoji,
          timestamp: new Date().toISOString(),
        }

        setReactions(prev => [...prev.slice(-50), reaction]) // Keep last 50 reactions
      }
    }

    // More frequent reactions during example rant
    const interval = exampleRantActive ? 1200 : 3000
    const reactionInterval = setInterval(generateRandomReaction, interval)
    return () => clearInterval(reactionInterval)
  }, [connectedUsers, sessionId, exampleRantActive])

  const sendReaction = useCallback(async (emoji: string) => {
    if (!user?.id) return

    const newReaction: Reaction = {
      id: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      session_id: sessionId,
      emoji,
      timestamp: new Date().toISOString(),
    }

    setReactions(prev => [...prev.slice(-50), newReaction])
  }, [sessionId, user?.id])

  const updateCringeLevel = useCallback(async (level: number) => {
    setSession(prev => prev ? { ...prev, cringe_level: level } : null)
  }, [])

  const joinSpeakerQueue = useCallback(async () => {
    if (!user?.id) return

    setSession(prev => {
      if (!prev) return null
      
      const currentQueue = prev.speaker_queue || []
      if (currentQueue.includes(user.id)) return prev
      
      return {
        ...prev,
        speaker_queue: [...currentQueue, user.id]
      }
    })
  }, [user?.id])

  const startSpeaking = useCallback(async () => {
    if (!user?.id) return

    // End example rant if it's still active
    setExampleRantActive(false)
    
    // Stop example audio
    if (exampleAudio) {
      exampleAudio.pause()
      exampleAudio.currentTime = 0
    }

    setSession(prev => {
      if (!prev) return null
      
      return {
        ...prev,
        current_speaker: user.id,
        start_time: new Date().toISOString(),
        speaker_queue: prev.speaker_queue.filter(id => id !== user.id),
        cringe_level: 0
      }
    })
  }, [user?.id, exampleAudio])

  const stopSpeaking = useCallback(async () => {
    setSession(prev => {
      if (!prev) return null
      
      return {
        ...prev,
        current_speaker: undefined,
        start_time: undefined,
        cringe_level: 0
      }
    })
  }, [])

  return {
    session,
    reactions,
    connectedUsers,
    isConnected,
    exampleRantActive,
    exampleAudioUrl,
    exampleAudio,
    currentVoiceName,
    sendReaction,
    updateCringeLevel,
    joinSpeakerQueue,
    startSpeaking,
    stopSpeaking,
  }
}