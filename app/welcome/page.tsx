"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Sparkles, Loader2, Plus, X, Lightbulb } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

interface UserData {
  email: string
  name?: string
  userId?: string
  loginTime: string
  leadershipPurpose?: string
  themeName?: string
  successDescription?: string
}

export default function WelcomePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [mondayNudge, setMondayNudge] = useState(true)
  const [phone, setPhone] = useState('')
  const [hypotheses, setHypotheses] = useState<string[]>([''])
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

  const addHypothesis = () => {
    if (hypotheses.length < 5) {
      setHypotheses([...hypotheses, ''])
    }
  }

  const removeHypothesis = (index: number) => {
    if (hypotheses.length > 1) {
      setHypotheses(hypotheses.filter((_, i) => i !== index))
    }
  }

  const updateHypothesis = (index: number, value: string) => {
    const updated = [...hypotheses]
    updated[index] = value
    setHypotheses(updated)
  }

  const handleEnterApp = async () => {
    if (!user) return

    // Validate phone if provided
    if (phone && !/^\+[1-9]\d{1,14}$/.test(phone)) {
      setError("Phone must be in format +1234567890 (e.g., +14155551234)")
      return
    }

    // Filter out empty hypotheses
    const validHypotheses = hypotheses.filter(h => h.trim())

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

      // Save leadership purpose and phone number
      const userUpdates: { phone?: string; leadership_purpose?: string } = {}
      if (phone) userUpdates.phone = phone
      if (user.leadershipPurpose) userUpdates.leadership_purpose = user.leadershipPurpose

      if (Object.keys(userUpdates).length > 0) {
        const { error: userError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', authUser.id)

        if (userError) {
          console.error('Error updating user:', userError)
        }
      }

      // Save development theme with success description
      let themeId: string | null = null
      if (user.themeName) {
        const { data: themeData, error: themeError } = await supabase
          .from('development_themes')
          .insert({
            user_id: authUser.id,
            theme_text: user.themeName,
            success_description: user.successDescription || null,
            theme_order: 1,
          })
          .select('id')
          .single()

        if (themeError) {
          console.error('Error saving theme:', themeError)
        } else {
          themeId = themeData.id
        }
      }

      // Save hypotheses linked to the theme
      if (themeId && validHypotheses.length > 0) {
        const hypothesisInserts = validHypotheses.map(h => ({
          user_id: authUser.id,
          theme_id: themeId,
          action_text: h.trim(),
          is_completed: false, // Required field, not used in canvas model
        }))

        const { error: hypothesesError } = await supabase
          .from('weekly_actions')
          .insert(hypothesisInserts)

        if (hypothesesError) {
          console.error('Error saving hypotheses:', hypothesesError)
        }
      }

      // Update nudge preference
      const { error: settingsError } = await supabase
        .from('settings')
        .update({ receive_weekly_nudge: mondayNudge })
        .eq('user_id', authUser.id)

      if (settingsError) {
        console.error('Error updating settings:', settingsError)
      }

      // Clear localStorage
      localStorage.removeItem("dummyUser")

      // Navigate to client home
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
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg mx-auto bg-[#f0f3fa] rounded-3xl p-8 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff]"
      >
        <div className="flex flex-col items-center text-center">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-[#f0f3fa] shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]"
          >
            <CheckCircle className="w-8 h-8 text-[#8B1E3F]" />
          </motion.div>

          {/* Welcome text */}
          <h1 className="text-2xl font-bold text-gray-700 mb-2 font-mono">
            Almost there!
          </h1>
          <p className="text-gray-500 font-mono mb-6 text-sm">
            Add a few initial hypotheses for how you'll make progress on <span className="text-[#8B1E3F]">{user.themeName}</span>.
          </p>

          {/* Hypotheses Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[#8B1E3F]" />
              <label className="text-sm font-mono text-gray-600 text-left">
                Success Hypotheses
              </label>
              <span className="text-xs text-gray-400 font-mono">(optional)</span>
            </div>
            <p className="text-xs text-gray-400 font-mono text-left mb-3">
              What experiments or strategies will you try?
            </p>
            <div className="space-y-2">
              {hypotheses.map((hypothesis, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-[#8B1E3F] font-mono">&bull;</span>
                  <input
                    type="text"
                    value={hypothesis}
                    onChange={(e) => updateHypothesis(index, e.target.value)}
                    placeholder={`e.g., ${index === 0 ? 'Let others make decisions' : index === 1 ? 'Ask questions before giving advice' : 'Start with small experiments'}`}
                    className="flex-1 px-3 py-2 bg-[#f0f3fa] rounded-xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono text-sm shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80]"
                  />
                  {hypotheses.length > 1 && (
                    <button
                      onClick={() => removeHypothesis(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {hypotheses.length < 5 && (
              <button
                onClick={addHypothesis}
                className="mt-2 flex items-center gap-1 text-sm text-gray-500 hover:text-[#8B1E3F] font-mono transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add another
              </button>
            )}
          </motion.div>

          {/* Phone Number Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full mb-6"
          >
            <label className="block text-sm font-mono text-gray-600 mb-2 text-left">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-4 py-3 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80]"
            />
            <p className="mt-2 text-xs text-gray-500 font-mono text-left">
              Required to receive SMS nudges from your coach
            </p>
          </motion.div>

          {/* Monday Nudge Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-3 mb-6 px-4 py-3 bg-[#f0f3fa] rounded-xl shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] w-full"
          >
            <Switch
              checked={mondayNudge}
              onCheckedChange={setMondayNudge}
              className="data-[state=checked]:bg-[#8B1E3F]"
            />
            <label className="text-sm font-mono text-gray-600 cursor-pointer" onClick={() => setMondayNudge(!mondayNudge)}>
              Receive leadership nudges
            </label>
          </motion.div>

          {/* Summary tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-2 justify-center mb-6"
          >
            <div className="px-3 py-1.5 bg-[#f0f3fa] rounded-full text-xs font-mono text-gray-600 shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]">
              Theme: {user.themeName}
            </div>
            <div className="px-3 py-1.5 bg-[#f0f3fa] rounded-full text-xs font-mono text-gray-600 shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]">
              {hypotheses.filter(h => h.trim()).length} hypotheses
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
            transition={{ delay: 0.8 }}
            onClick={handleEnterApp}
            disabled={isLoading}
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
    </div>
  )
}
