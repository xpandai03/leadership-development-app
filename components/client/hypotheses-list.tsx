'use client'

import { useState, useTransition } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { HypothesisItem } from './hypothesis-item'
import { addHypothesis } from '@/lib/actions/canvas'
import type { WeeklyAction } from '@/lib/supabase/types'

interface HypothesesListProps {
  themeId: string
  hypotheses: WeeklyAction[]
}

export function HypothesesList({ themeId, hypotheses }: HypothesesListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    if (!newText.trim()) return

    setError(null)
    startTransition(async () => {
      const result = await addHypothesis(themeId, newText.trim())

      if (!result.success) {
        setError(result.error)
        return
      }

      // Success - reset form
      setNewText('')
      setIsAdding(false)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isPending) {
      handleAdd()
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewText('')
      setError(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-600 font-mono">Success Hypotheses</h4>
          <p className="text-xs text-gray-400 font-mono">How will I make progress on this theme?</p>
        </div>
      </div>

      {/* Hypotheses list */}
      {hypotheses.length > 0 && (
        <ul className="space-y-2">
          {hypotheses.map((hypothesis) => (
            <HypothesisItem key={hypothesis.id} hypothesis={hypothesis} />
          ))}
        </ul>
      )}

      {/* Empty state */}
      {hypotheses.length === 0 && !isAdding && (
        <p className="text-sm text-gray-400 font-mono italic py-2">
          No hypotheses yet. Add ideas for how you&apos;ll make progress.
        </p>
      )}

      {/* Add hypothesis section */}
      <div className="pt-1">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-mono text-gray-500 hover:text-[#8B1E3F] bg-[#f0f3fa] rounded-lg shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add hypothesis
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What experiment or strategy will you try?"
                disabled={isPending}
                autoFocus
                className={`flex-1 px-3 py-2 bg-[#f0f3fa] rounded-lg text-sm text-gray-700 placeholder-gray-400 font-mono outline-none shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all duration-200 ${
                  isPending ? 'opacity-50' : ''
                }`}
              />
              <button
                onClick={handleAdd}
                disabled={isPending || !newText.trim()}
                className={`px-3 py-2 bg-[#f0f3fa] rounded-lg text-sm font-mono shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 ${
                  isPending || !newText.trim()
                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                    : 'text-[#8B1E3F]'
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Add'
                )}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 font-mono">{error}</p>
            )}
            <button
              onClick={() => {
                setIsAdding(false)
                setNewText('')
                setError(null)
              }}
              disabled={isPending}
              className="text-xs text-gray-400 hover:text-gray-600 font-mono"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
