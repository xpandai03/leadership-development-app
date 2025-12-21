'use client'

import { useState, useTransition } from 'react'
import { Plus, Loader2, Check, X } from 'lucide-react'
import { createTheme } from '@/lib/actions/canvas'

interface AddThemeButtonProps {
  currentThemeCount: number
}

export function AddThemeButton({ currentThemeCount }: AddThemeButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [themeName, setThemeName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const canAddMore = currentThemeCount < 3

  const handleAdd = () => {
    if (!themeName.trim()) return

    setError(null)
    startTransition(async () => {
      const result = await createTheme(themeName.trim())

      if (!result.success) {
        setError(result.error)
        return
      }

      // Success - reset form
      setThemeName('')
      setIsAdding(false)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isPending) {
      handleAdd()
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
      setThemeName('')
      setError(null)
    }
  }

  if (!canAddMore) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-400 font-mono">
          Maximum of 3 themes reached
        </p>
      </div>
    )
  }

  if (isAdding) {
    return (
      <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] border-2 border-dashed border-[#8B1E3F40]">
        <h3 className="text-lg font-semibold text-gray-700 font-mono mb-4">
          Add New Theme
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-500 font-mono mb-2">
              Theme name (1-4 words)
            </label>
            <input
              type="text"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Delegation, Presence, Clarity"
              disabled={isPending}
              autoFocus
              className={`w-full px-4 py-3 bg-[#f0f3fa] rounded-xl text-gray-700 placeholder-gray-400 font-mono outline-none shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all duration-200 ${
                isPending ? 'opacity-50' : ''
              }`}
            />
          </div>
          {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              disabled={isPending || !themeName.trim()}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] transition-all duration-200 ${
                isPending || !themeName.trim()
                  ? 'opacity-50 cursor-not-allowed text-gray-400 bg-[#f0f3fa]'
                  : 'text-white bg-[#8B1E3F]'
              }`}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Create Theme
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setThemeName('')
                setError(null)
              }}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-gray-500 bg-[#f0f3fa] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="w-full py-6 bg-[#f0f3fa] rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#8B1E3F] hover:text-[#8B1E3F] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] transition-all duration-200"
    >
      <div className="flex items-center justify-center gap-2 font-mono">
        <Plus className="w-5 h-5" />
        <span>Add Development Theme</span>
        <span className="text-sm opacity-60">({currentThemeCount}/3)</span>
      </div>
    </button>
  )
}
