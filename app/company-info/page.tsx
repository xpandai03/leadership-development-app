"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface DummyUser {
  email: string
  loginTime: string
  leadershipTheme?: string
  progressVision?: string
}

export default function CompanyInfoPage() {
  const [user, setUser] = useState<DummyUser | null>(null)
  const [progressVision, setProgressVision] = useState<string>("")
  const [isFocused, setIsFocused] = useState(false)
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

  const handleContinue = () => {
    if (!progressVision.trim() || !user) return

    // Update user data with progress vision
    const updatedUser = {
      ...user,
      progressVision: progressVision.trim(),
    }
    localStorage.setItem("dummyUser", JSON.stringify(updatedUser))

    // Navigate to welcome page
    router.push("/welcome")
  }

  const handleGoBack = () => {
    router.push("/job-role")
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
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-700 mb-2 font-mono">What does progress look like for you?</h1>
          <p className="text-gray-500 font-mono">Describe what success feels like when you imagine future progress.</p>
        </div>

        {/* Progress Vision Textarea */}
        <div className="mb-8">
          <textarea
            value={progressVision}
            onChange={(e) => setProgressVision(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder='For example: "I communicate clearly in meetings, my team knows what to focus on, and I feel less rushed."'
            rows={5}
            className={`w-full px-6 py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono resize-none ${
              isFocused
                ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-2 ring-[#8B1E3F80]"
                : "shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"
            }`}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleGoBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            onClick={handleContinue}
            disabled={!progressVision.trim()}
            whileHover={progressVision.trim() ? { scale: 1.02 } : {}}
            whileTap={progressVision.trim() ? { scale: 0.98 } : {}}
            className={`px-6 py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono ${
              progressVision.trim() ? "text-[#8B1E3F]" : "text-gray-400 opacity-50 cursor-not-allowed"
            }`}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
