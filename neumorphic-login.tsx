"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import Logo from "./app/components/Logo"

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
  onClick: () => void
  isLoading: boolean
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick, isLoading }) => {
  return (
    <motion.button
      type="submit"
      onClick={onClick}
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
      {isLoading ? "Loading..." : "Sign In"}
    </motion.button>
  )
}

const FooterLinks: React.FC = () => {
  return (
    <div className="flex justify-between items-center text-sm">
      <button className="text-gray-500 hover:text-[#8B1E3F] hover:underline transition-all duration-200 font-mono">
        Forgot password?
      </button>
      <button
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
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!email || !password) {
      alert("Please fill in both fields")
      return
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address")
      return
    }

    // Simulate loading
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Store dummy user data
    localStorage.setItem(
      "dummyUser",
      JSON.stringify({
        email,
        loginTime: new Date().toISOString(),
      }),
    )

    // Navigate to onboarding
    router.push("/onboarding")
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-3xl text-center font-mono font-black text-gray-700 mt-20 mb-2">Sign in to The Leadership Development App</h1>
      <p className="text-center font-mono text-gray-500 mb-6 max-w-md">A calm space to reflect, grow, and practice better leadership every week.</p>
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
          <Logo />

          <form onSubmit={handleSubmit} className="w-full">
            <InputField type="email" placeholder="Email" value={email} onChange={setEmail} />

            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              showPasswordToggle={true}
            />

            <LoginButton onClick={handleSubmit} isLoading={isLoading} />
          </form>

          <FooterLinks />
        </div>
      </motion.div>
    </div>
  )
}

export default LoginCard
