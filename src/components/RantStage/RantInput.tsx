import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Type, Send, Volume2, Zap, Play, Pause, MicOff, Shuffle } from 'lucide-react'
import { useTextToSpeech, AI_VOICES } from '../../hooks/useTextToSpeech'
import { useAudioRecorder } from '../../hooks/useAudioRecorder'
import toast from 'react-hot-toast'

interface RantInputProps {
  onSubmitRant: (content: { text?: string; audioUrl?: string; duration: number }) => void
  disabled?: boolean
  autoFocus?: boolean
}

const DEFAULT_RANT_TEXT = "Hey everyone! I've got something to say that's been on my mind lately. You know what really grinds my gears? People who don't use their turn signals! Like, it's literally the easiest thing in the world - just flick your wrist and let everyone know where you're going. But no, apparently that's too much effort for some people. They just swerve into lanes like they own the entire road. And don't even get me started on people who cut in line at coffee shops..."

export const RantInput: React.FC<RantInputProps> = ({ onSubmitRant, disabled, autoFocus }) => {
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text')
  const [rantText, setRantText] = useState(DEFAULT_RANT_TEXT)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('')
  const [currentVoiceName, setCurrentVoiceName] = useState<string>('')
  
  const { generateSpeech, isGenerating, error: ttsError, getRandomVoice } = useTextToSpeech()
  const { isRecording, startRecording, stopRecording, audioUrl, error: recordingError } = useAudioRecorder()

  // Auto-focus text area when component mounts
  useEffect(() => {
    if (autoFocus && inputMode === 'text') {
      const textArea = document.getElementById('rant-textarea') as HTMLTextAreaElement
      if (textArea) {
        textArea.focus()
        textArea.select()
      }
    }
  }, [autoFocus, inputMode])

  // Initialize with a random voice
  useEffect(() => {
    const randomVoiceId = getRandomVoice()
    setSelectedVoiceId(randomVoiceId)
    const voice = AI_VOICES.find(v => v.id === randomVoiceId)
    setCurrentVoiceName(voice?.name || 'AI Voice')
  }, [getRandomVoice])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = ''
      }
    }
  }, [currentAudio])

  const selectRandomVoice = () => {
    const randomVoiceId = getRandomVoice()
    setSelectedVoiceId(randomVoiceId)
    const voice = AI_VOICES.find(v => v.id === randomVoiceId)
    setCurrentVoiceName(voice?.name || 'AI Voice')
    toast.success(`🎲 Switched to ${voice?.name} voice (${voice?.description})`)
  }

  const handleTextSubmit = async () => {
    if (!rantText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Generate TTS with selected voice
      const audioUrl = await generateSpeech(rantText, selectedVoiceId)
      
      if (audioUrl) {
        setGeneratedAudioUrl(audioUrl)
        onSubmitRant({
          text: rantText,
          audioUrl,
          duration: Math.ceil(rantText.length / 12) // Rough estimate: 12 chars per second for speech
        })
        const voice = AI_VOICES.find(v => v.id === selectedVoiceId)
        toast.success(`🎤 Rant generated with ${voice?.name} AI voice!`)
      } else {
        toast.error('Failed to generate speech')
      }
    } catch (error) {
      console.error('Error submitting text rant:', error)
      toast.error('Failed to generate speech')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVoiceSubmit = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording()
      if (audioBlob && audioUrl) {
        onSubmitRant({
          audioUrl,
          duration: 60 // Will be calculated properly in production
        })
        toast.success('🎤 Voice rant recorded!')
      }
    } else {
      await startRecording()
      toast.success('🔴 Recording started!')
    }
  }

  const previewAudio = async () => {
    if (!rantText.trim()) return

    try {
      const audioUrl = await generateSpeech(rantText, selectedVoiceId)
      if (audioUrl) {
        const audio = new Audio(audioUrl)
        audio.volume = 0.8
        setCurrentAudio(audio)
        
        audio.onplay = () => setIsPlaying(true)
        audio.onpause = () => setIsPlaying(false)
        audio.onended = () => setIsPlaying(false)
        
        await audio.play()
        const voice = AI_VOICES.find(v => v.id === selectedVoiceId)
        toast.success(`🔊 Preview playing with ${voice?.name} voice!`)
      }
    } catch (error) {
      toast.error('Failed to generate preview')
    }
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

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Share Your Rant</h3>
        
        {/* Input Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setInputMode('text')}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition-all ${
              inputMode === 'text' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Type className="w-4 h-4" />
            <span className="text-sm">Text</span>
          </button>
          <button
            onClick={() => setInputMode('voice')}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition-all ${
              inputMode === 'voice' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="text-sm">Voice</span>
          </button>
        </div>
      </div>

      {inputMode === 'text' ? (
        <div className="space-y-4">
          <textarea
            id="rant-textarea"
            value={rantText}
            onChange={(e) => setRantText(e.target.value)}
            placeholder="Type your hot take here... (will be converted to AI voice)"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows={6}
            maxLength={1000}
            disabled={disabled}
          />
          
          {/* Voice Selection */}
          <div className="flex items-center justify-between p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-medium">AI Voice:</span>
              <span className="text-white font-medium">{currentVoiceName}</span>
              <span className="text-purple-300 text-sm">
                ({AI_VOICES.find(v => v.id === selectedVoiceId)?.description})
              </span>
            </div>
            <button
              onClick={selectRandomVoice}
              disabled={disabled || isGenerating}
              className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              <span className="text-sm">Random Voice</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">• High-quality ElevenLabs TTS</span>
              <span className="text-gray-400">• {AI_VOICES.length} unique voices</span>
            </div>
            <span className="text-xs text-gray-500">
              {rantText.length}/1000
            </span>
          </div>

          {ttsError && (
            <div className="text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded p-2">
              ⚠️ {ttsError}
            </div>
          )}

          {/* Preview and Submit Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={previewAudio}
              disabled={!rantText.trim() || disabled || isGenerating}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : currentAudio && isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pause Preview</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>Preview {currentVoiceName}</span>
                </>
              )}
            </button>

            <button
              onClick={handleTextSubmit}
              disabled={!rantText.trim() || isSubmitting || disabled || isGenerating}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting || isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Going Live...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Go Live with {currentVoiceName}!</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-8">
            <motion.div
              animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 cursor-pointer ${
                isRecording 
                  ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              onClick={!disabled ? handleVoiceSubmit : undefined}
            >
              {isRecording ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </motion.div>
            
            <p className="text-gray-300 mb-2">
              {isRecording ? 'Recording your rant...' : 'Ready to record'}
            </p>
            <p className="text-sm text-gray-500">
              {isRecording ? 'Click to stop recording' : 'Click to start recording'}
            </p>
            
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center justify-center space-x-2 text-red-400"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">RECORDING</span>
              </motion.div>
            )}
          </div>

          {recordingError && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded p-2">
              ⚠️ {recordingError}
            </div>
          )}

          <button
            onClick={handleVoiceSubmit}
            disabled={disabled}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
            }`}
          >
            {isRecording ? 'Stop Recording & Go Live' : 'Start Recording'}
          </button>
        </div>
      )}
    </div>
  )
}