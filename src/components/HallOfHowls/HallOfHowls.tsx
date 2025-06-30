import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Clock, Users, Play, Search, Filter, Star, TrendingUp, Calendar } from 'lucide-react'
import { Rant } from '../../lib/supabase'

// Example rants data to populate the Hall of Howls
const EXAMPLE_RANTS: Rant[] = [
  {
    id: 'example_1',
    user_id: 'user_example_1',
    nickname: 'ShoppingCartCrusader',
    text: "Okay, here's something that's been driving me absolutely INSANE lately - people who don't return their shopping carts! Like, seriously? You just walked around a massive store for an hour, but suddenly those extra 20 steps to the cart return are too much effort?",
    audio_url: null,
    transcript: "The shopping cart test is the ultimate measure of whether you're a good person or not. There's no law forcing you to return it, no punishment if you don't, and no reward if you do. It's purely about doing the right thing!",
    reactions: { tomato: 12, explain: 3, plus_one: 47, cringe: 8 },
    duration: 58,
    survived: true,
    created_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'example_2',
    user_id: 'user_example_2',
    nickname: 'PineapplePizzaDefender',
    text: "I'm TIRED of people hating on pineapple pizza! It's a perfect combination of sweet and savory, and if you can't appreciate that complexity, maybe your taste buds just aren't sophisticated enough!",
    audio_url: null,
    transcript: "Hawaiian pizza was invented in Canada by a Greek chef, so it's already multicultural fusion cuisine at its finest. The acidity of the pineapple cuts through the richness of the cheese perfectly!",
    reactions: { tomato: 89, explain: 15, plus_one: 23, cringe: 34 },
    duration: 60,
    survived: true,
    created_at: '2024-01-14T16:45:00Z'
  },
  {
    id: 'example_3',
    user_id: 'user_example_3',
    nickname: 'CerealScientist',
    text: "Cereal is soup! I said what I said! It's a liquid with solid ingredients served in a bowl with a spoon. If that's not soup, then what is it? The breakfast industrial complex has been lying to us!",
    audio_url: null,
    transcript: "Think about it - gazpacho is a cold soup, right? So temperature doesn't matter. Cereal has milk (liquid) and cereal pieces (solids). It's literally breakfast soup and I will die on this hill!",
    reactions: { tomato: 45, explain: 67, plus_one: 12, cringe: 78 },
    duration: 55,
    survived: true,
    created_at: '2024-01-13T09:20:00Z'
  },
  {
    id: 'example_4',
    user_id: 'user_example_4',
    nickname: 'SockSandalsSupporter',
    text: "Socks with sandals is PEAK comfort and functionality! Your feet stay warm, you get ventilation, and you're protected from sunburn. Fashion police can arrest me - I'm living my best life!",
    audio_url: null,
    transcript: "Germans have been doing this for decades and they're some of the most practical people on Earth. Maybe we should listen to them instead of following arbitrary fashion rules made by people who prioritize looks over comfort.",
    reactions: { tomato: 156, explain: 8, plus_one: 34, cringe: 203 },
    duration: 52,
    survived: true,
    created_at: '2024-01-12T11:15:00Z'
  },
  {
    id: 'example_5',
    user_id: 'user_example_5',
    nickname: 'HotDogPhilosopher',
    text: "A hot dog is NOT a sandwich! It's a taco! The bread wraps around three sides, just like a taco shell. Sandwich requires two separate pieces of bread. This is basic food geometry, people!",
    audio_url: null,
    transcript: "If we're going by the sandwich definition, then a sub is also not a sandwich because it's one piece of bread folded. But nobody calls a subway sandwich a 'subway taco' so clearly we need better food categories!",
    reactions: { tomato: 67, explain: 89, plus_one: 45, cringe: 23 },
    duration: 59,
    survived: true,
    created_at: '2024-01-11T13:40:00Z'
  },
  {
    id: 'example_6',
    user_id: 'user_example_6',
    nickname: 'MilkFirstRebel',
    text: "I put milk in the bowl BEFORE the cereal and I'm not ashamed! It prevents splashing, you can control the milk-to-cereal ratio better, and the cereal doesn't get soggy as fast. Fight me!",
    audio_url: null,
    transcript: "Tea people understand this - you put milk in first to prevent the hot tea from scalding it. Same principle applies to cereal. It's about temperature control and optimal texture preservation!",
    reactions: { tomato: 234, explain: 12, plus_one: 18, cringe: 167 },
    duration: 48,
    survived: true,
    created_at: '2024-01-10T08:25:00Z'
  },
  {
    id: 'example_7',
    user_id: 'user_example_7',
    nickname: 'ToiletPaperTactician',
    text: "Toilet paper should hang UNDER, not over! It looks cleaner, it's easier to tear with one hand, and if you have cats or kids, they can't unroll the entire thing. Under-hangers are just more practical!",
    audio_url: null,
    transcript: "The original 1891 patent shows it hanging over, but that was before we had pets and toddlers! Evolution means adapting to new circumstances. Under-hanging is the evolved choice!",
    reactions: { tomato: 178, explain: 34, plus_one: 67, cringe: 145 },
    duration: 57,
    survived: true,
    created_at: '2024-01-09T19:50:00Z'
  },
  {
    id: 'example_8',
    user_id: 'user_example_8',
    nickname: 'StandingDeskSkeptic',
    text: "Standing desks are just a fad designed to make office workers feel productive while actually being less comfortable! Humans evolved to alternate between sitting, standing, and walking - not to stand in one place for 8 hours!",
    audio_url: null,
    transcript: "The real solution is taking breaks and moving around, not torturing yourself by standing still all day. Your back hurts because you're not moving, not because you're sitting. Movement is the answer, not standing!",
    reactions: { tomato: 89, explain: 45, plus_one: 123, cringe: 34 },
    duration: 60,
    survived: true,
    created_at: '2024-01-08T14:10:00Z'
  },
  {
    id: 'example_9',
    user_id: 'user_example_9',
    nickname: 'GIFPronunciationGuru',
    text: "It's pronounced 'JIF' not 'GIF'! The creator literally said it's JIF! You don't say 'jraphics' for graphics, but you also don't say 'scuba' as 'scuh-ba' even though it stands for 'underwater breathing apparatus'!",
    audio_url: null,
    transcript: "Language evolves based on usage, not etymology. The creator can suggest a pronunciation, but if 90% of people say it differently, then that becomes the correct pronunciation. Democracy wins over dictatorship!",
    reactions: { tomato: 145, explain: 78, plus_one: 56, cringe: 234 },
    duration: 53,
    survived: true,
    created_at: '2024-01-07T16:35:00Z'
  },
  {
    id: 'example_10',
    user_id: 'user_example_10',
    nickname: 'ColdPizzaConnoisseur',
    text: "Cold pizza for breakfast is superior to hot pizza! The flavors have time to meld together overnight, the cheese gets the perfect texture, and you don't burn your mouth. It's like pizza aged to perfection!",
    audio_url: null,
    transcript: "Hot pizza is just immediate gratification. Cold pizza is delayed gratification that actually pays off. It's the difference between chugging wine and letting it breathe. Cold pizza is sophisticated!",
    reactions: { tomato: 67, explain: 23, plus_one: 189, cringe: 45 },
    duration: 56,
    survived: true,
    created_at: '2024-01-06T07:45:00Z'
  },
  {
    id: 'example_11',
    user_id: 'user_example_11',
    nickname: 'AntiSmallTalkActivist',
    text: "Small talk is emotional labor that we shouldn't be forced to perform! 'How's the weather?' - Look outside! 'How was your weekend?' - Why do you need to know? Let's either have real conversations or comfortable silence!",
    audio_url: null,
    transcript: "Small talk is just social anxiety disguised as politeness. We're all pretending to care about things we don't actually care about. It's performative niceness that exhausts everyone involved!",
    reactions: { tomato: 234, explain: 67, plus_one: 345, cringe: 123 },
    duration: 60,
    survived: true,
    created_at: '2024-01-05T12:20:00Z'
  },
  {
    id: 'example_12',
    user_id: 'user_example_12',
    nickname: 'FontFanatic',
    text: "Comic Sans is actually a perfectly good font! It's readable, friendly, and accessible for people with dyslexia. The hate is just design snobbery. Sometimes function matters more than form!",
    audio_url: null,
    transcript: "Comic Sans was designed to be casual and approachable, and it succeeds at that. Not everything needs to be Times New Roman or Helvetica. Different fonts serve different purposes, and Comic Sans serves its purpose well!",
    reactions: { tomato: 456, explain: 34, plus_one: 78, cringe: 567 },
    duration: 49,
    survived: true,
    created_at: '2024-01-04T15:55:00Z'
  }
]

// Search suggestions that appear when the search box is focused
const SEARCH_SUGGESTIONS = [
  'shopping cart',
  'pineapple pizza', 
  'cereal soup',
  'socks sandals',
  'hot dog taco',
  'milk first',
  'toilet paper',
  'standing desk',
  'gif pronunciation',
  'cold pizza',
  'small talk',
  'comic sans'
]

export const HallOfHowls: React.FC = () => {
  const [rants, setRants] = useState<Rant[]>(EXAMPLE_RANTS)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'longest' | 'controversial'>('recent')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)

  // Filter and sort rants
  const filteredAndSortedRants = React.useMemo(() => {
    let filtered = rants.filter(rant =>
      rant.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rant.text && rant.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rant.transcript && rant.transcript.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'popular':
        return filtered.sort((a, b) => b.reactions.plus_one - a.reactions.plus_one)
      case 'longest':
        return filtered.sort((a, b) => b.duration - a.duration)
      case 'controversial':
        return filtered.sort((a, b) => {
          const aCringe = a.reactions.cringe + a.reactions.tomato
          const bCringe = b.reactions.cringe + b.reactions.tomato
          return bCringe - aCringe
        })
      default:
        return filtered
    }
  }, [rants, searchTerm, sortBy])

  const handleSearchSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setShowSearchSuggestions(false)
  }

  const playRant = (rant: Rant) => {
    if (rant.audio_url) {
      const audio = new Audio(rant.audio_url)
      audio.play()
    }
  }

  const getSortIcon = () => {
    switch (sortBy) {
      case 'recent': return <Calendar className="w-4 h-4" />
      case 'popular': return <Star className="w-4 h-4" />
      case 'longest': return <Clock className="w-4 h-4" />
      case 'controversial': return <TrendingUp className="w-4 h-4" />
      default: return <Filter className="w-4 h-4" />
    }
  }

  const getTotalReactions = (reactions: any) => {
    return reactions.tomato + reactions.explain + reactions.plus_one + reactions.cringe
  }

  const getControversyScore = (reactions: any) => {
    return reactions.cringe + reactions.tomato
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Hall of Howls</h1>
              <p className="text-gray-400">Legendary rants that survived the full 60 seconds</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rants, speakers, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              
              {/* Search Suggestions */}
              {showSearchSuggestions && searchTerm.length === 0 && (
                <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 z-10 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-xs text-gray-400 mb-2 px-2">Popular searches:</p>
                    {SEARCH_SUGGESTIONS.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded transition-colors"
                      >
                        <Search className="w-3 h-3 inline mr-2 text-gray-500" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {getSortIcon()}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="longest">Longest Duration</option>
                <option value="controversial">Most Controversial</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{rants.length}</p>
            <p className="text-gray-400">Surviving Rants</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{new Set(rants.map(r => r.user_id)).size}</p>
            <p className="text-gray-400">Unique Speakers</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
            <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {Math.round(rants.reduce((sum, r) => sum + r.duration, 0) / 60)}m
            </p>
            <p className="text-gray-400">Total Content</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {rants.reduce((sum, r) => sum + getTotalReactions(r.reactions), 0).toLocaleString()}
            </p>
            <p className="text-gray-400">Total Reactions</p>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            {searchTerm ? (
              <>Showing {filteredAndSortedRants.length} results for "<span className="text-white">{searchTerm}</span>"</>
            ) : (
              <>Showing all {filteredAndSortedRants.length} legendary rants</>
            )}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Rants Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading legendary rants...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedRants.map((rant, index) => (
              <motion.div
                key={rant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
              >
                {/* Rant Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {rant.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white font-medium">{rant.nickname}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{rant.duration}s</span>
                  </div>
                </div>

                {/* Rant Content */}
                <div className="mb-4">
                  {rant.text ? (
                    <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">{rant.text}</p>
                  ) : rant.transcript ? (
                    <p className="text-gray-300 text-sm line-clamp-3 italic leading-relaxed">
                      "{rant.transcript}"
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Audio rant (no transcript)</p>
                  )}
                </div>

                {/* Reactions */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 flex items-center space-x-1">
                      <span>👍</span>
                      <span>{rant.reactions.plus_one}</span>
                    </span>
                    <span className="text-red-400 flex items-center space-x-1">
                      <span>🥫</span>
                      <span>{rant.reactions.tomato}</span>
                    </span>
                    <span className="text-yellow-400 flex items-center space-x-1">
                      <span>😬</span>
                      <span>{rant.reactions.cringe}</span>
                    </span>
                    <span className="text-blue-400 flex items-center space-x-1">
                      <span>❓</span>
                      <span>{rant.reactions.explain}</span>
                    </span>
                  </div>
                  {rant.audio_url && (
                    <button
                      onClick={() => playRant(rant)}
                      className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Play</span>
                    </button>
                  )}
                </div>

                {/* Controversy Badge */}
                {getControversyScore(rant.reactions) > 100 && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-700/50">
                      🔥 Controversial
                    </span>
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-gray-500">
                  {new Date(rant.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {filteredAndSortedRants.length === 0 && !loading && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No rants found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'No rants match your current filters'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                Clear search and show all rants
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}