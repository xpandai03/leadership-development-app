'use client'

import { useState, useTransition } from 'react'
import { Compass, Pencil, Check, X, Loader2 } from 'lucide-react'
import { updateLeadershipPurpose } from '@/lib/actions/canvas'

interface LeadershipPurposeProps {
  purpose: string | null
}

export function LeadershipPurpose({ purpose }: LeadershipPurposeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(purpose || '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateLeadershipPurpose(editValue)

      if (!result.success) {
        setError(result.error)
        return
      }

      setIsEditing(false)
    })
  }

  const handleCancel = () => {
    setEditValue(purpose || '')
    setIsEditing(false)
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isPending) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
            <Compass className="h-5 w-5 text-[#8B1E3F]" />
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-700 font-mono">Leadership Purpose</h2>
            <p className="text-sm text-gray-400 font-mono">Your north star — optional</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-[#8B1E3F] transition-colors"
            title="Edit purpose"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="The kind of leader you aspire to be..."
            disabled={isPending}
            autoFocus
            rows={3}
            className={`w-full px-4 py-3 bg-[#f0f3fa] rounded-xl text-gray-700 placeholder-gray-400 font-mono text-base outline-none shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all duration-200 resize-none ${
              isPending ? 'opacity-50' : ''
            }`}
          />
          {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-white bg-[#8B1E3F] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#6d1731] transition-all duration-200 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-gray-500 bg-[#f0f3fa] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : purpose ? (
        <div className="px-5 py-4 bg-[#f0f3fa] rounded-xl shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
          <p className="text-base text-gray-700 font-mono">{purpose}</p>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full px-5 py-4 bg-[#f0f3fa] rounded-xl shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] text-left"
        >
          <p className="text-sm text-gray-400 font-mono italic">
            Add a guiding purpose...
          </p>
        </button>
      )}
    </div>
  )
}
