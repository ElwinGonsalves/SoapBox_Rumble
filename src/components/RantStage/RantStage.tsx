import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Users, Volume2, AlertTriangle, Play, Pause } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useRealtimeSession } from '../../hooks/useRealtime'
import { ReactionsPanel } from './ReactionsPanel'
import { CringeMeter } from './CringeMeter'
import { CountdownTimer } from './CountdownTimer'
import { LiveReactionsStream } from './LiveReactionsStream'
import { SpeakerQueue } from './SpeakerQueue'
import { RantInput } from './RantInput'
import { AudiencePanel } from './AudiencePanel'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'
import toast from 'react-hot-toast'

interface RantStageProps {
  sessionId: string
}

const EXAMPLE_RANT_TEXT = "Okay, here's something that's been driving me absolutely INSANE lately - people who don't return their shopping carts! Like, seriously? You just walked around a massive store for an hour, but suddenly those extra 20 steps to the cart return are too much effort? And don't give me that 'it's someone's job' excuse - that's like throwing trash on the ground because janitors exist! It's basic human decency, people! The shopping cart test is the ultimate measure of whether you're a good person or not. There's no law forcing you to return it, no punishment if you don't, and no reward if you do. It's purely about doing the right thing because it's the right thing to do!"

export const RantStage: React.FC<RantStageProps> = ({ sessionId }) => {
  const { user } = useAuth()
  const { 
    session, 
    reactions, 
    connectedUsers,
    isConnected,
    exampleRantActive,
    exampleAudioUrl,
    exampleAudio,
    currentVoiceName,
    sendReaction, 
    joinSpeakerQueue,
    startSpeaking,
    stopSpeaking,
    updateCringeLevel
  } = useRealtimeSession(sessionId, user)
  
  const { generateSpeech, isGenerating } = useTextToSpeech()
  
  const [timeLeft, setTimeLeft] = useState(60)
  const [rantStarted, setRantStarted] = useState(false)
  const [ejected, setEjected] = useState(false)
  const [currentRant, setCurrentRant] = useState<{text?: string; audioUrl?: string} | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showRantInput, setShowRantInput] = useState(false)
  const [exampleRantTimeLeft, setExampleRantTimeLeft] = useState(45)
  const [exampleAudioPlaying, setExampleAudioPlaying] = useState(false)
  
  // Example rant audio for "Stage is open" section
  const [stageExampleAudio, setStageExampleAudio] = useState<HTMLAudioElement | null>(null)
  const [stageExamplePlaying, setStageExamplePlaying] = useState(false)
  const [stageExampleGenerated, setStageExampleGenerated] = useState(false)

  const isCurrentSpeaker = session?.current_speaker === user?.id
  const isUserInQueue = session?.speaker_queue?.includes(user?.id || '') || false
  const currentSpeakerUser = connectedUsers.find(u => u.id === session?.current_speaker)
  const isExampleSpeaker = session?.current_speaker === 'example_speaker'
  const isStageOpen = !session?.current_speaker && !exampleRantActive
  
  // Calculate cringe percentage from recent reactions
  const recentReactions = reactions.slice(-20)
  const cringeReactions = recentReactions.filter(r => r.emoji === '😬').length
  const cringePercentage = recentReactions.length > 0 
    ? Math.min(Math.round((cringeReactions / recentReactions.length) * 100), 100)
    : session?.cringe_level || 0

  // Generate example rant audio for stage open section
  const generateStageExampleAudio = useCallback(async () => {
    if (stageExampleGenerated) return
    
    try {
      const audioUrl = await generateSpeech(EXAMPLE_RANT_TEXT)
      if (audioUrl) {
        const audio = new Audio(audioUrl)
        audio.volume = 0.8
        setStageExampleAudio(audio)
        setStageExampleGenerated(true)
        
        audio.onplay = () => setStageExamplePlaying(true)
        audio.onpause = () => setStageExamplePlaying(false)
        audio.onended = () => setStageExamplePlaying(false)
      }
    } catch (error) {
      console.error('Failed to generate stage example audio:', error)
    }
  }, [generateSpeech, stageExampleGenerated])

  // Generate stage example audio when component mounts
  useEffect(() => {
    if (isStageOpen && !stageExampleGenerated) {
      generateStageExampleAudio()
    }
  }, [isStageOpen, generateStageExampleAudio, stageExampleGenerated])

  // Monitor example audio playback state
  useEffect(() => {
    if (exampleAudio) {
      const handlePlay = () => setExampleAudioPlaying(true)
      const handlePause = () => setExampleAudioPlaying(false)
      const handleEnded = () => setExampleAudioPlaying(false)

      exampleAudio.addEventListener('play', handlePlay)
      exampleAudio.addEventListener('pause', handlePause)
      exampleAudio.addEventListener('ended', handleEnded)

      return () => {
        exampleAudio.removeEventListener('play', handlePlay)
        exampleAudio.removeEventListener('pause', handlePause)
        exampleAudio.removeEventListener('ended', handleEnded)
      }
    }
  }, [exampleAudio])

  // Example rant countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (exampleRantActive && exampleRantTimeLeft > 0) {
      interval = setInterval(() => {
        setExampleRantTimeLeft(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [exampleRantActive, exampleRantTimeLeft])

  // Update cringe level in real-time
  useEffect(() => {
    if (cringePercentage !== (session?.cringe_level || 0)) {
      updateCringeLevel(cringePercentage)
    }
  }, [cringePercentage, session?.cringe_level, updateCringeLevel])

  // Auto-eject if cringe hits 100%
  useEffect(() => {
    if (cringePercentage >= 100 && rantStarted && !ejected && isCurrentSpeaker) {
      handleEjection()
    }
  }, [cringePercentage, rantStarted, ejected, isCurrentSpeaker])

  // Countdown timer for user rants
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (rantStarted && timeLeft > 0 && !ejected && isCurrentSpeaker) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleRantComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [rantStarted, timeLeft, ejected, isCurrentSpeaker])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = ''
      }
      if (stageExampleAudio) {
        stageExampleAudio.pause()
        stageExampleAudio.src = ''
      }
    }
  }, [currentAudio, stageExampleAudio])

  // Show welcome message when example rant starts
  useEffect(() => {
    if (exampleRantActive && user) {
      toast.success(`🎭 Welcome! An AI example rant is ready with ${currentVoiceName} voice - click "Hear Him Out" to listen and try reacting!`, {
        duration: 6000,
      })
    }
  }, [exampleRantActive, user, currentVoiceName])

  const handleSubmitRant = useCallback(async (content: {text?: string; audioUrl?: string; duration: number}) => {
    setCurrentRant(content)
    setRantStarted(true)
    setTimeLeft(60)
    setShowRantInput(false)
    
    // If there's an audio URL, play it for everyone
    if (content.audioUrl) {
      const audio = new Audio(content.audioUrl)
      audio.volume = 0.8
      setCurrentAudio(audio)
      
      audio.onplay = () => setIsPlaying(true)
      audio.onpause = () => setIsPlaying(false)
      audio.onended = () => setIsPlaying(false)
      
      try {
        await audio.play()
        toast.success('🎤 You\'re live! Audio playing for everyone!')
      } catch (error) {
        toast.error('Failed to play audio - user interaction required')
      }
    } else {
      toast.success('🎤 You\'re live! 60 seconds on the clock!')
    }
  }, [])

  const handleStopRant = async () => {
    setRantStarted(false)
    setCurrentRant(null)
    setShowRantInput(false)
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
    }
    await stopSpeaking()
    toast.success('Rant ended!')
  }

  const handleEjection = () => {
    setEjected(true)
    setRantStarted(false)
    setCurrentRant(null)
    setShowRantInput(false)
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
    }
    stopSpeaking()
    toast.error('💥 EJECTED! The cringe meter hit 100%!')
  }

  const handleRantComplete = () => {
    setRantStarted(false)
    setCurrentRant(null)
    setShowRantInput(false)
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
    }
    stopSpeaking()
    toast.success('🎉 Rant complete! You survived the full 60 seconds!')
  }

  const toggleAudioPlayback = () => {
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause()
      } else {
        currentAudio.play()
      }
    }
  }

  const toggleExampleAudio = () => {
    if (exampleAudio) {
      if (exampleAudioPlaying) {
        exampleAudio.pause()
      } else {
        exampleAudio.play().catch(error => {
          console.warn('Failed to play example audio:', error)
          toast.error('Click to enable audio playback')
        })
      }
    }
  }

  const toggleStageExampleAudio = () => {
    if (stageExampleAudio) {
      if (stageExamplePlaying) {
        stageExampleAudio.pause()
      } else {
        stageExampleAudio.play().catch(error => {
          console.warn('Failed to play stage example audio:', error)
          toast.error('Click to enable audio playback')
        })
      }
    } else if (!stageExampleGenerated && !isGenerating) {
      generateStageExampleAudio()
    }
  }

  const handleReaction = useCallback((emoji: string) => {
    sendReaction(emoji)
    
    // Show feedback for first-time users
    if (exampleRantActive) {
      const messages = {
        '🥫': 'Nice tomato throw! 🍅',
        '❓': 'Good question! The speaker sees this.',
        '👍': 'You\'re supporting the speaker! 👏',
        '😬': 'Ouch! That adds to the cringe meter! 📈'
      }
      toast.success(messages[emoji as keyof typeof messages] || 'Reaction sent!')
    }
  }, [sendReaction, exampleRantActive])

  const handleJoinQueue = useCallback(() => {
    joinSpeakerQueue()
    toast.success('Added to speaker queue!')
  }, [joinSpeakerQueue])

  const handleStartSpeaking = useCallback(() => {
    startSpeaking()
    setShowRantInput(true) // Show rant input immediately when becoming speaker
    toast.success('You\'re now the speaker! Choose your rant style below.')
  }, [startSpeaking])

  if (ejected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-gray-800 flex items-center justify-center"
      >
        <div className="text-center max-w-md">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 0.9, 1.1, 0.9, 1]
            }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="text-8xl mb-6"
          >
            💥
          </motion.div>
          <h1 className="text-4xl font-bold text-red-400 mb-4">EJECTED!</h1>
          <p className="text-xl text-gray-300 mb-2">The audience couldn't handle the cringe!</p>
          <p className="text-gray-400 mb-8">Cringe meter hit {cringePercentage}%</p>
          <button
            onClick={() => {
              setEjected(false)
              setTimeLeft(60)
            }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
            Back to Audience
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Mic className="w-6 h-6 text-orange-400" />
              <h1 className="text-2xl font-bold text-white">r/Soapbox</h1>
              {!isConnected && (
                <span className="text-sm text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                  Connecting...
                </span>
              )}
            </div>
            
            {/* Live Indicator */}
            {(session?.current_speaker || exampleRantActive) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-white rounded-full"
                />
                <span className="font-medium">LIVE</span>
                {isExampleSpeaker && <span>• AI Example ({currentVoiceName} voice)</span>}
                {currentSpeakerUser && !isExampleSpeaker && <span>• {currentSpeakerUser.nickname}</span>}
                <span>• {connectedUsers.length + 1} watching</span>
              </motion.div>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{connectedUsers.length + 1} online</span>
              </div>
              <div className="flex items-center space-x-1">
                <Volume2 className="w-4 h-4" />
                <span>{reactions.length} reactions</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-400">Signed in as</p>
            <p className="text-white font-medium">{user?.nickname}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Stage */}
          <div className="xl:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-8 mb-6">
              {/* Speaker Area */}
              <div className="text-center mb-8">
                {isCurrentSpeaker ? (
                  <div>
                    <motion.div
                      animate={rantStarted ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6 mx-auto relative"
                    >
                      {rantStarted ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Mic className="w-16 h-16 text-white" />
                        </motion.div>
                      ) : (
                        <MicOff className="w-16 h-16 text-white" />
                      )}
                      {rantStarted && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {rantStarted ? '🔴 LIVE' : 'You\'re on stage!'}
                    </h2>
                    <p className="text-gray-400 mb-6">
                      {rantStarted ? 'Broadcasting to the world...' : 'Ready to share your hot take?'}
                    </p>
                  </div>
                ) : isExampleSpeaker ? (
                  <div>
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 mx-auto relative">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Mic className="w-16 h-16 text-white" />
                      </motion.div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">🔴 LIVE AI EXAMPLE</h2>
                    <p className="text-gray-400 mb-6">ExampleRanter is demonstrating the platform</p>
                    
                    {/* Example Rant Timer */}
                    <div className="mb-6">
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 mb-4">
                          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="transparent"
                              className="text-gray-700"
                            />
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#10B981"
                              strokeWidth="6"
                              fill="transparent"
                              strokeLinecap="round"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 * (exampleRantTimeLeft / 45)}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-green-400">
                              {exampleRantTimeLeft}s
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">Example rant time remaining</p>
                      </div>
                    </div>
                  </div>
                ) : session?.current_speaker ? (
                  <div>
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 mx-auto relative">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Mic className="w-16 h-16 text-white" />
                      </motion.div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">🔴 LIVE</h2>
                    <p className="text-gray-400 mb-6">
                      {currentSpeakerUser?.nickname || 'Someone'} is speaking
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-6 mx-auto">
                      <Users className="w-16 h-16 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Stage is open</h2>
                    <p className="text-gray-400 mb-6">Join the queue to share your rant</p>
                    
                    {/* Example Rant for Stage Open */}
                    <div className="mb-6 p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">AI</span>
                        </div>
                        <span className="text-blue-300 font-medium">Example Rant</span>
                        <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">Demo</span>
                      </div>
                      
                      <p className="text-blue-200 italic text-sm leading-relaxed mb-4">
                        "{EXAMPLE_RANT_TEXT.substring(0, 200)}..."
                      </p>
                      
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={toggleStageExampleAudio}
                          disabled={isGenerating}
                          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30 disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                              <span>Generating...</span>
                            </>
                          ) : stageExamplePlaying ? (
                            <>
                              <Pause className="w-5 h-5" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5" />
                              <span>Hear Him Out</span>
                            </>
                          )}
                        </button>
                        <div className="flex items-center space-x-1 text-blue-400">
                          <Volume2 className="w-4 h-4" />
                          <span className="text-xs">ElevenLabs AI Voice • Try it yourself!</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-blue-300 text-center mt-3 opacity-75">
                        This is how rants work on r/Soapbox - join the queue to share your own!
                      </p>
                    </div>
                  </div>
                )}

                {/* Timer for user rants */}
                {rantStarted && isCurrentSpeaker && (
                  <div className="mb-6">
                    <CountdownTimer timeLeft={timeLeft} />
                  </div>
                )}

                {/* Example Rant Content */}
                {isExampleSpeaker && exampleRantActive && (
                  <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-200 italic text-sm leading-relaxed mb-4">
                      "{EXAMPLE_RANT_TEXT}"
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      {exampleAudioUrl && (
                        <button
                          onClick={toggleExampleAudio}
                          className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30"
                        >
                          {exampleAudioPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                          <span>{exampleAudioPlaying ? 'Pause' : 'Hear Him Out'}</span>
                        </button>
                      )}
                      <div className="flex items-center space-x-1 text-purple-400">
                        <Volume2 className="w-4 h-4" />
                        <span className="text-xs">{currentVoiceName} AI Voice • Try reacting!</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Rant Display */}
                {currentRant && rantStarted && (
                  <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                    {currentRant.text && (
                      <p className="text-gray-300 italic mb-3">"{currentRant.text}"</p>
                    )}
                    {currentRant.audioUrl && (
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={toggleAudioPlayback}
                          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                          <span>{isPlaying ? 'Pause' : 'Play'} Audio</span>
                        </button>
                        <div className="flex items-center space-x-1 text-purple-400">
                          <Volume2 className="w-4 h-4" />
                          <span className="text-sm">ElevenLabs AI Voice</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Controls */}
                {isCurrentSpeaker && rantStarted && (
                  <button
                    onClick={handleStopRant}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-all duration-200"
                  >
                    Stop Early
                  </button>
                )}
              </div>
            </div>

            {/* Rant Input (only for current speaker when not live) */}
            <AnimatePresence>
              {isCurrentSpeaker && showRantInput && !rantStarted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <RantInput 
                    onSubmitRant={handleSubmitRant}
                    disabled={rantStarted}
                    autoFocus={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Reactions Stream */}
            <LiveReactionsStream reactions={reactions} />
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-2 space-y-6">
            {/* Connection Status */}
            {!isConnected && (
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-300">Connecting to real-time session...</span>
              </div>
            )}

            {/* Example Rant Notice */}
            {exampleRantActive && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-300 font-medium">AI Example Rant Ready!</span>
                </div>
                <p className="text-purple-200 text-sm mb-2">
                  This is an AI-generated demo rant with {currentVoiceName} voice from ElevenLabs to show you how the platform works.
                </p>
                <p className="text-purple-300 text-xs">
                  🎧 Click "Hear Him Out" above to listen and try reacting with the buttons below!
                </p>
              </motion.div>
            )}

            {/* Stage Open Notice */}
            {isStageOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-300 font-medium">Stage is Open!</span>
                </div>
                <p className="text-blue-200 text-sm mb-2">
                  No one is currently speaking. Try the example rant above to see how it works, then join the queue to share your own hot take!
                </p>
                <p className="text-blue-300 text-xs">
                  🎤 Click "Hear Him Out" to listen to an AI-generated example rant
                </p>
              </motion.div>
            )}

            {/* Audience Panel */}
            <AudiencePanel 
              connectedUsers={connectedUsers}
              currentUserId={user?.id || ''}
            />

            {/* Cringe Meter */}
            <CringeMeter percentage={cringePercentage} />

            {/* Reactions Panel */}
            <ReactionsPanel 
              reactions={reactions}
              onReaction={handleReaction}
              disabled={isCurrentSpeaker && rantStarted}
            />

            {/* Speaker Queue */}
            <SpeakerQueue
              currentSpeaker={session?.current_speaker}
              speakerQueue={session?.speaker_queue || []}
              currentUserId={user?.id || ''}
              onJoinQueue={handleJoinQueue}
              onStartSpeaking={handleStartSpeaking}
              isUserInQueue={isUserInQueue}
              isUserSpeaking={isCurrentSpeaker}
            />
          </div>
        </div>
      </div>
    </div>
  )
}