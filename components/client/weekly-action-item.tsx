'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { toggleActionComplete } from '@/lib/actions/weekly-actions'
import type { WeeklyAction } from '@/lib/supabase/types'

interface WeeklyActionItemProps {
  action: WeeklyAction
}

export function WeeklyActionItem({ action }: WeeklyActionItemProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCompleted, setOptimisticCompleted] = useState(action.is_completed)

  const handleToggle = () => {
    const newValue = !optimisticCompleted
    setOptimisticCompleted(newValue)

    startTransition(async () => {
      const result = await toggleActionComplete({
        actionId: action.id,
        isCompleted: newValue,
      })

      if (!result.success) {
        // Revert on error
        setOptimisticCompleted(!newValue)
        console.error('Failed to toggle action:', result.error)
      }
    })
  }

  return (
    <div
      onClick={handleToggle}
      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        optimisticCompleted
          ? 'bg-[#f0f3fa] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]'
          : 'bg-[#f0f3fa] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]'
      } ${isPending ? 'opacity-70' : ''}`}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          optimisticCompleted
            ? 'bg-[#8B1E3F] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]'
            : 'bg-[#f0f3fa] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]'
        }`}
      >
        {optimisticCompleted && <Check className="w-3 h-3 text-white" />}
      </div>

      {/* Label */}
      <span
        className={`flex-1 text-sm font-mono select-none ${
          optimisticCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
        }`}
      >
        {action.action_text}
      </span>
    </div>
  )
}
