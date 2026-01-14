'use client'

import { useState, useTransition } from 'react'
import { Send, Loader2, X, CheckCircle } from 'lucide-react'

interface SendNudgeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
  clientPhone: string | null
  developmentTheme?: string | null
  latestProgress?: string | null
}

export function SendNudgeModal({
  open,
  onOpenChange,
  clientId,
  clientName,
  clientPhone,
  developmentTheme,
  latestProgress,
}: SendNudgeModalProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isFocused, setIsFocused] = useState(false)

  const characterCount = message.length
  const maxCharacters = 320
  const isOverLimit = characterCount > maxCharacters

  const handleSubmit = () => {
    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    if (isOverLimit) {
      setError('Message is too long')
      return
    }

    setError(null)

    startTransition(async () => {
      try {
        const response = await fetch('/api/send-nudge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId,
            messageText: message.trim(),
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to send nudge')
          return
        }

        setSuccess(true)
        setMessage('')

        // Close modal after showing success briefly
        setTimeout(() => {
          setSuccess(false)
          onOpenChange(false)
        }, 1500)
      } catch (err) {
        setError('Failed to send nudge. Please try again.')
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setMessage('')
      setError(null)
      setSuccess(false)
    }
    onOpenChange(newOpen)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => handleOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#f0f3fa] rounded-3xl p-8 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff]">
        {/* Close button */}
        <button
          onClick={() => handleOpenChange(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f0f3fa] flex items-center justify-center mx-auto mb-4 shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]">
              <CheckCircle className="h-8 w-8 text-[#8B1E3F]" />
            </div>
            <p className="text-lg font-semibold text-gray-700 font-mono">Nudge sent!</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700 font-mono">
                Send Nudge to {clientName}
              </h2>
              <p className="text-sm text-gray-500 font-mono mt-1">
                Send a reflective prompt to {clientName}.
              </p>
            </div>

            {/* Message input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 font-mono mb-2">
                Message
              </label>
              <textarea
                placeholder="Write a short nudge (1–2 sentences)…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isPending}
                className={`w-full px-4 py-3 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono resize-none min-h-[120px] ${
                  isFocused
                    ? 'shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-2 ring-[#8B1E3F80]'
                    : 'shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]'
                } ${isPending ? 'opacity-50' : ''}`}
              />
              <div className="flex items-center justify-between mt-2 text-xs font-mono">
                <span className={isOverLimit ? 'text-red-500' : 'text-gray-500'}>
                  {characterCount}/{maxCharacters} characters
                </span>
                {isOverLimit && (
                  <span className="text-red-500">Message too long</span>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-mono">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="px-6 py-3 bg-[#f0f3fa] rounded-2xl text-sm font-mono text-gray-600 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !message.trim() || isOverLimit}
                className={`px-6 py-3 bg-[#f0f3fa] rounded-2xl text-sm font-mono shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 ${
                  isPending || !message.trim() || isOverLimit
                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                    : 'text-[#8B1E3F]'
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Nudge
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
