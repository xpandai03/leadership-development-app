"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Compass, Target, ArrowLeft, ArrowRight } from "lucide-react"

interface DummyUser {
  email: string
  loginTime: string
  leadershipPurpose?: string
  themeName?: string
}

export default function JobRolePage() {
  const [user, setUser] = useState<DummyUser | null>(null)
  const [leadershipPurpose, setLeadershipPurpose] = useState("")
  const [themeName, setThemeName] = useState("")
  const [purposeFocused, setPurposeFocused] = useState(false)
  const [themeFocused, setThemeFocused] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is "logged in"
    const dummyUser = localStorage.getItem("dummyUser")
    if (!dummyUser) {
      router.push("/")
      return
    }

    const userData = JSON.parse(dummyUser)
    setUser(userData)
    if (userData.leadershipPurpose) setLeadershipPurpose(userData.leadershipPurpose)
    if (userData.themeName) setThemeName(userData.themeName)
  }, [router])

  const handleContinue = () => {
    if (!themeName.trim() || !user) return

    // Update user data with purpose and theme
    const updatedUser = {
      ...user,
      leadershipPurpose: leadershipPurpose.trim() || undefined,
      themeName: themeName.trim(),
    }
    localStorage.setItem("dummyUser", JSON.stringify(updatedUser))

    // Navigate to company info page
    router.push("/company-info")
  }

  const handleGoBack = () => {
    router.push("/onboarding")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto bg-[#f0f3fa] rounded-3xl p-8 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff]"
      >
        {/* Leadership Purpose Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
              <Compass className="w-5 h-5 text-[#8B1E3F]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 font-mono">Leadership Purpose</h2>
              <p className="text-sm text-gray-500 font-mono">Optional - What kind of leader do you want to become?</p>
            </div>
          </div>
          <textarea
            value={leadershipPurpose}
            onChange={(e) => setLeadershipPurpose(e.target.value)}
            onFocus={() => setPurposeFocused(true)}
            onBlur={() => setPurposeFocused(false)}
            placeholder="e.g., A leader who empowers others to make decisions and grow..."
            rows={3}
            className={`w-full px-5 py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono resize-none ${
              purposeFocused
                ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-2 ring-[#8B1E3F80]"
                : "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]"
            }`}
          />
        </motion.div>

        {/* Theme Name Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
              <Target className="w-5 h-5 text-[#8B1E3F]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 font-mono">First Development Theme</h2>
              <p className="text-sm text-gray-500 font-mono">Required - What do you want to work on as a leader? (1-4 words)</p>
            </div>
          </div>
          <input
            type="text"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            onFocus={() => setThemeFocused(true)}
            onBlur={() => setThemeFocused(false)}
            placeholder="e.g., Delegation, Presence, Clarity"
            className={`w-full px-5 py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono ${
              themeFocused
                ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-2 ring-[#8B1E3F80]"
                : "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]"
            }`}
          />

          {/* Suggested themes */}
          <div className="mt-4">
            <p className="text-xs text-gray-400 font-mono mb-2">Or choose from suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {["Delegation", "Presence", "Clarity", "Trust", "Boundaries", "Strategy", "Balance"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setThemeName(suggestion)}
                  className={`px-3 py-1.5 text-sm font-mono rounded-xl transition-all duration-200 ${
                    themeName === suggestion
                      ? "bg-[#8B1E3F] text-white shadow-[2px_2px_4px_#d1d9e6]"
                      : "bg-[#f0f3fa] text-gray-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex justify-between items-center"
        >
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>

          <button
            onClick={handleContinue}
            disabled={!themeName.trim()}
            className={`px-6 py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono ${
              themeName.trim() ? "text-[#8B1E3F]" : "text-gray-400 opacity-50 cursor-not-allowed"
            }`}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
