'use client'

import { useState, useTransition } from 'react'
import { Trash2, Pencil, Check, X, Loader2 } from 'lucide-react'
import { updateHypothesis, deleteHypothesis } from '@/lib/actions/canvas'
import type { WeeklyAction } from '@/lib/supabase/types'

interface HypothesisItemProps {
  hypothesis: WeeklyAction
}

export function HypothesisItem({ hypothesis }: HypothesisItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(hypothesis.action_text)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isDeleted, setIsDeleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    if (!editText.trim()) return

    setError(null)
    startTransition(async () => {
      const result = await updateHypothesis(hypothesis.id, editText.trim())

      if (!result.success) {
        setError(result.error)
        return
      }

      setIsEditing(false)
    })
  }

  const handleCancel = () => {
    setEditText(hypothesis.action_text)
    setIsEditing(false)
    setError(null)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPending) return

    setIsDeleted(true)

    startDeleteTransition(async () => {
      const result = await deleteHypothesis(hypothesis.id)

      if (!result.success) {
        setIsDeleted(false)
        console.error('Failed to delete hypothesis:', result.error)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isPending) {
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isDeleted) return null

  if (isEditing) {
    return (
      <li className="flex items-start gap-2">
        <span className="text-[#8B1E3F] mt-2 select-none font-mono">&bull;</span>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isPending}
              autoFocus
              className={`flex-1 px-3 py-2 bg-[#f0f3fa] rounded-lg text-sm text-gray-700 font-mono outline-none shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all duration-200 ${
                isPending ? 'opacity-50' : ''
              }`}
            />
            <button
              onClick={handleSave}
              disabled={isPending || !editText.trim()}
              className="p-2 text-[#8B1E3F] hover:bg-[#8B1E3F10] rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
        </div>
      </li>
    )
  }

  return (
    <li
      className={`group flex items-start gap-2 py-1 ${
        isPending || isDeleting ? 'opacity-50' : ''
      }`}
    >
      <span className="text-[#8B1E3F] mt-0.5 select-none font-mono">&bull;</span>
      <span className="flex-1 text-sm text-gray-700 font-mono">
        {hypothesis.action_text}
      </span>
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          disabled={isPending || isDeleting}
          className="p-1 text-gray-400 hover:text-[#8B1E3F] rounded-md transition-colors disabled:opacity-50"
          title="Edit hypothesis"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending || isDeleting}
          className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors disabled:opacity-50"
          title="Delete hypothesis"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  )
}
