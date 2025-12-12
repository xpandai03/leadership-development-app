"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Sparkles, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

interface UserData {
  email: string
  name?: string
  userId?: string
  loginTime: string
  leadershipTheme?: string
  progressVision?: string
}

export default function WelcomePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [mondayNudge, setMondayNudge] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is "logged in"
    const dummyUser = localStorage.getItem("dummyUser")
    if (!dummyUser) {
      router.push("/")
      return
    }

    setUser(JSON.parse(dummyUser))
  }, [router])

  const handleEnterApp = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        setError("Session expired. Please sign in again.")
        router.push("/")
        return
      }

      // Save development theme if provided
      if (user.leadershipTheme) {
        const themeText = user.leadershipTheme.replace(/-/g, " ")
        const { error: themeError } = await supabase
          .from('development_themes')
          .insert({
            user_id: authUser.id,
            theme_text: themeText.charAt(0).toUpperCase() + themeText.slice(1),
          })

        if (themeError) {
          console.error('Error saving theme:', themeError)
          // Don't block - continue anyway
        }
      }

      // Save progress vision if provided
      if (user.progressVision) {
        const { error: progressError } = await supabase
          .from('progress_entries')
          .insert({
            user_id: authUser.id,
            text: user.progressVision,
          })

        if (progressError) {
          console.error('Error saving progress:', progressError)
          // Don't block - continue anyway
        }
      }

      // Update nudge preference
      const { error: settingsError } = await supabase
        .from('settings')
        .update({ receive_weekly_nudge: mondayNudge })
        .eq('user_id', authUser.id)

      if (settingsError) {
        console.error('Error updating settings:', settingsError)
        // Don't block - continue anyway
      }

      // Clear localStorage
      localStorage.removeItem("dummyUser")

      // Navigate to client home - use window.location for a full page navigation
      // to ensure the server component reloads with fresh data
      window.location.href = "/client/home"

    } catch (err) {
      console.error('Error during onboarding completion:', err)
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating dots */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-[#8B1E3F] rounded-full opacity-60"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 500),
            y: (typeof window !== 'undefined' ? window.innerHeight : 500) + 50,
            opacity: 0,
          }}
          animate={{
            y: -50,
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 4,
            delay: i * 0.8,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Main welcome card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: [0.9, 1.02, 1],
        }}
        transition={{
          duration: 0.8,
          times: [0, 0.6, 1],
          ease: "easeOut",
        }}
        className="relative"
      >
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="w-full max-w-lg mx-auto bg-[#f0f3fa] rounded-3xl p-12 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff]"
        >
          <div className="flex flex-col items-center text-center">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                type: "spring",
                stiffness: 200,
              }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-8 bg-[#f0f3fa] shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"
            >
              <CheckCircle className="w-10 h-10 text-[#8B1E3F]" />
            </motion.div>

            {/* Welcome text */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-4xl font-bold text-gray-700 mb-4 font-mono"
            >
              You're ready to begin.
            </motion.h1>

            {/* Personalized message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-gray-500 font-mono mb-6 text-lg"
            >
              We'll use your development theme and vision of progress to help you design small weekly actions.
            </motion.p>

            {/* Monday Nudge Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-8 px-6 py-4 bg-[#f0f3fa] rounded-2xl shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]"
            >
              <Switch
                checked={mondayNudge}
                onCheckedChange={setMondayNudge}
                className="data-[state=checked]:bg-[#8B1E3F]"
              />
              <label className="text-sm font-mono text-gray-600 cursor-pointer" onClick={() => setMondayNudge(!mondayNudge)}>
                Receive a short leadership nudge every Monday morning
              </label>
            </motion.div>

            {/* User selections summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="flex flex-wrap gap-2 justify-center mb-8"
            >
              <div className="px-4 py-2 bg-[#f0f3fa] rounded-full text-sm font-mono text-gray-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]">
                Your theme: {user.leadershipTheme ? user.leadershipTheme.replace(/-/g, " ") : "Custom theme"}
              </div>
              <div className="px-4 py-2 bg-[#f0f3fa] rounded-full text-sm font-mono text-gray-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]">
                Next step: Weekly actions
              </div>
              <div className="px-4 py-2 bg-[#f0f3fa] rounded-full text-sm font-mono text-gray-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]">
                Reminder: Monday nudges
              </div>
            </motion.div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-mono w-full"
              >
                {error}
              </motion.div>
            )}

            {/* Enter app button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              onClick={handleEnterApp}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              className={`px-8 py-4 bg-[#f0f3fa] rounded-2xl text-lg font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ color: "#8B1E3F" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Enter the app
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
