"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import Logo from "./app/components/Logo"
import { createClient } from "@/lib/supabase/client"
import { isCoachEmail } from "@/lib/constants"

interface InputFieldProps {
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  showPasswordToggle?: boolean
}

const InputField: React.FC<InputFieldProps> = ({ type, placeholder, value, onChange, showPasswordToggle = false }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type
  return (
    <div className="relative mb-6">
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full px-6 py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono ${isFocused ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-2 ring-[#8B1E3F80]" : "shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"}`}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  )
}

interface LoginButtonProps {
  isLoading: boolean
}

const LoginButton: React.FC<LoginButtonProps> = ({ isLoading }) => {
  return (
    <motion.button
      type="submit"
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      className={`w-full py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 text-lg mb-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono font-normal ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{
        color: "#8B1E3F",
      }}
      disabled={isLoading}
    >
      {isLoading ? "Signing in..." : "Sign In"}
    </motion.button>
  )
}

interface FooterLinksProps {
  onCreateAccount: () => void
}

const FooterLinks: React.FC<FooterLinksProps> = ({ onCreateAccount }) => {
  return (
    <div className="flex justify-between items-center text-sm">
      <button className="text-gray-500 hover:text-[#8B1E3F] hover:underline transition-all duration-200 font-mono">
        Forgot password?
      </button>
      <button
        onClick={onCreateAccount}
        className="text-gray-500 hover:text-[#8B1E3F] hover:underline transition-all duration-200 font-mono"
        style={{
          marginLeft: "5px",
        }}
      >
        New here? Create an account
      </button>
    </div>
  )
}

const LoginCard: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all required fields")
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    if (isSignUp && !name) {
      setError("Please enter your name")
      return
    }

    if (isSignUp && password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      if (isSignUp) {
        // Sign up new user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: 'client',
            },
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setIsLoading(false)
          return
        }

        if (data.user) {
          // Store user info for onboarding flow
          localStorage.setItem(
            "dummyUser",
            JSON.stringify({
              email,
              name,
              userId: data.user.id,
              loginTime: new Date().toISOString(),
            }),
          )
          // Navigate to onboarding for new users
          router.push("/onboarding")
        }
      } else {
        // Sign in existing user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          setIsLoading(false)
          return
        }

        if (data.user) {
          // Check if user is a coach by email (hardcoded list)
          if (isCoachEmail(email)) {
            // Coach goes directly to dashboard - no onboarding
            // Use window.location for full page navigation to ensure server component loads
            window.location.href = '/coach/dashboard'
            return
          }

          // For clients, check if they have completed onboarding (has a theme)
          const { data: themes } = await supabase
            .from('development_themes')
            .select('id')
            .eq('user_id', data.user.id)
            .limit(1)

          // Get user profile for name
          const { data: profile } = await supabase
            .from('users')
            .select('name')
            .eq('id', data.user.id)
            .single()

          if (themes && themes.length > 0) {
            // Client with completed onboarding goes to home
            // Use window.location for full page navigation to ensure server component loads
            window.location.href = '/client/home'
          } else {
            // Client without onboarding - store info and go to onboarding
            localStorage.setItem(
              "dummyUser",
              JSON.stringify({
                email,
                name: profile?.name || email.split('@')[0],
                userId: data.user.id,
                loginTime: new Date().toISOString(),
              }),
            )
            router.push("/onboarding")
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mt-20 mb-4">
        <Logo />
      </div>
      <h1 className="text-3xl text-center font-mono font-black text-gray-700 mb-2">
        {isSignUp ? "Create your account" : "Sign in to The Leadership Development App"}
      </h1>
      <p className="text-center font-mono text-gray-500 mb-6 max-w-md">
        {isSignUp
          ? "Start your leadership development journey today."
          : "A calm space to reflect, grow, and practice better leadership every week."}
      </p>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="w-full max-w-md mx-auto bg-[#f0f3fa] rounded-3xl p-8 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff] mt-4"
      >
        <div className="flex flex-col items-center">
          <form onSubmit={handleSubmit} className="w-full">
            {isSignUp && (
              <InputField type="text" placeholder="Your Name" value={name} onChange={setName} />
            )}

            <InputField type="email" placeholder="Email" value={email} onChange={setEmail} />

            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              showPasswordToggle={true}
            />

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-mono">
                {error}
              </div>
            )}

            <LoginButton isLoading={isLoading} />
          </form>

          <FooterLinks onCreateAccount={() => setIsSignUp(!isSignUp)} />

          {isSignUp && (
            <p className="text-center text-sm text-gray-500 mt-4 font-mono">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-[#8B1E3F] hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default LoginCard
