import { useState, useCallback } from 'react'

export interface TextToSpeechHook {
  isGenerating: boolean
  generateSpeech: (text: string, voiceId?: string) => Promise<string | null>
  error: string | null
  getRandomVoice: () => string
  isApiKeyConfigured: boolean
}

// Multiple AI voices for variety
const AI_VOICES = [
  {
    id: 'pNInz6obpgDQGcFmaJgB', // Adam - confident, clear
    name: 'Adam',
    description: 'Confident and clear'
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm, engaging
    name: 'Bella',
    description: 'Warm and engaging'
  },
  {
    id: 'VR6AewLTigWG4xSOukaG', // Josh - energetic, youthful
    name: 'Josh',
    description: 'Energetic and youthful'
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld', // Domi - dramatic, expressive
    name: 'Domi',
    description: 'Dramatic and expressive'
  },
  {
    id: 'CYw3kZ02Hs0563khs1Fj', // Dave - casual, friendly
    name: 'Dave',
    description: 'Casual and friendly'
  },
  {
    id: 'N2lVS1w4EtoT3dr4eOWO', // Callum - authoritative, serious
    name: 'Callum',
    description: 'Authoritative and serious'
  }
]

// Check if API key is properly configured
const isValidApiKey = (apiKey: string | undefined): boolean => {
  return !!(apiKey && 
    apiKey.trim() !== '' && 
    !apiKey.includes('your_') && 
    !apiKey.includes('_here') &&
    apiKey.length > 10)
}

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
  const isApiKeyConfigured = isValidApiKey(apiKey)

  const getRandomVoice = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * AI_VOICES.length)
    return AI_VOICES[randomIndex].id
  }, [])

  const generateSpeech = useCallback(async (text: string, voiceId?: string): Promise<string | null> => {
    if (!text.trim()) return null

    // Check if API key is properly configured
    if (!isApiKeyConfigured) {
      setError('ElevenLabs API key not configured. Add your API key to enable AI voice generation.')
      console.warn('ElevenLabs API key not configured. Skipping TTS generation.')
      return null
    }

    setIsGenerating(true)
    setError(null)

    // Use provided voice or get a random one
    const selectedVoiceId = voiceId || getRandomVoice()
    const selectedVoice = AI_VOICES.find(v => v.id === selectedVoiceId) || AI_VOICES[0]

    try {
      console.log(`Generating speech with ${selectedVoice.name} (${selectedVoice.description})`)

      // Use ElevenLabs API for high-quality TTS
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey!
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5 + Math.random() * 0.3, // 0.5-0.8 for variety
            similarity_boost: 0.7 + Math.random() * 0.2, // 0.7-0.9 for variety
            style: 0.2 + Math.random() * 0.3, // 0.2-0.5 for variety
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid ElevenLabs API key. Please check your API key configuration.')
        }
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      // Convert response to blob and create URL
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      setIsGenerating(false)
      return audioUrl

    } catch (err) {
      setIsGenerating(false)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI voice. Please try again.'
      setError(errorMessage)
      console.error('TTS generation failed:', err)
      return null
    }
  }, [getRandomVoice, apiKey, isApiKeyConfigured])

  return {
    isGenerating,
    generateSpeech,
    error,
    getRandomVoice,
    isApiKeyConfigured
  }
}

// Export voice information for UI display
export { AI_VOICES }