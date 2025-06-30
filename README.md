# r/Soapbox: Stand Up or Shut Up

A real-time multiplayer rant platform where speakers have 60 seconds to share their hot takes while facing the dreaded **Cringe Meter**.

## 🎮 How It Works

1. **Take the Stage**: Join the speaker queue and wait for your turn
2. **60 Second Timer**: You have exactly one minute to share your rant
3. **Live Audience**: Real people react in real-time with emojis
4. **Cringe Meter**: If 😬 reactions hit 100%, you get auto-ejected!
5. **Hall of Howls**: Survive the full 60 seconds to join the legends

## 🚀 Features

- **Real-time Multiplayer**: Live audience reactions via Supabase Realtime
- **Audio Recording**: Record your rants with the MediaRecorder API
- **Cringe Meter**: Dynamic percentage-based ejection system
- **Hall of Howls**: Archive of legendary rants that survived
- **Authentication**: Google Sign-In or Anonymous mode
- **Mobile Responsive**: Beautiful design across all devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Animations**: Framer Motion for smooth interactions
- **Real-time**: Supabase for database, auth, and real-time subscriptions
- **Audio**: MediaRecorder API for voice recording
- **Icons**: Lucide React for consistent iconography
- **Notifications**: React Hot Toast for user feedback

## 🎨 Design Features

- Dark Reddit-style theme with vibrant accent colors
- Smooth animations and micro-interactions
- Responsive design (mobile, tablet, desktop)
- Dynamic progress indicators and meters
- Modern card-based layouts with subtle effects

## 📦 Setup Instructions

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Supabase Setup**:
   - Create a new Supabase project
   - Update `.env` with your Supabase URL and keys
   - Click "Connect to Supabase" in the top right to set up the database

3. **Database Schema**:
   The app will guide you through creating the necessary tables:
   - `users` - User profiles and authentication
   - `rants` - Stored rants with audio/text content
   - `sessions` - Active rant sessions with speakers
   - `reactions` - Real-time audience reactions

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🎭 Reaction System

- 🥫 **Tomato**: Classic disapproval
- ❓ **Explain?**: Audience wants clarification  
- 👍 **+1**: Support and agreement
- 😬 **Cringe**: The dangerous one that builds the meter

## 🏆 Hall of Howls

Rants that survive the full 60 seconds without hitting 100% cringe are preserved forever in the Hall of Howls, complete with:
- Audio recordings
- Transcriptions (when available)
- Reaction statistics
- Speaker profiles
- Searchable archive

## 🔧 Configuration

Key environment variables in `.env`:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_OPENAI_API_KEY`: (Optional) For transcription features
- `VITE_ELEVENLABS_API_KEY`: (Optional) For text-to-speech

## 🚀 Deployment

The app is ready for deployment on platforms like:
- **Netlify**: Automatic deployment with Supabase integration
- **Vercel**: Seamless React deployment
- **Supabase**: Edge functions for backend logic

---

**Ready to face the cringe meter?** 🎤