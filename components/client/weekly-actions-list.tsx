'use client'

import { WeeklyActionItem } from './weekly-action-item'
import type { WeeklyAction } from '@/lib/supabase/types'

interface WeeklyActionsListProps {
  actions: WeeklyAction[]
}

export function WeeklyActionsList({ actions }: WeeklyActionsListProps) {
  if (actions.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4 font-mono italic">
        No weekly actions yet. Add some to track your progress!
      </p>
    )
  }

  const completedCount = actions.filter((a) => a.is_completed).length
  const totalCount = actions.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-mono">
        <span className="text-gray-500">
          {completedCount} of {totalCount} completed
        </span>
        {completedCount === totalCount && totalCount > 0 && (
          <span className="px-3 py-1 rounded-full bg-[#8B1E3F] text-white text-xs shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]">
            All done!
          </span>
        )}
      </div>
      <div className="space-y-2">
        {actions.map((action) => (
          <WeeklyActionItem key={action.id} action={action} />
        ))}
      </div>
    </div>
  )
}
