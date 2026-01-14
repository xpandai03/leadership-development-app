import { Clock } from 'lucide-react'
import type { NudgeSent } from '@/lib/supabase/types'

interface NudgeHistoryProps {
  nudges: NudgeSent[]
}

/**
 * Read-only nudge history component.
 * Displays a quiet activity log of nudges sent to a client.
 */
export function NudgeHistory({ nudges }: NudgeHistoryProps) {
  if (nudges.length === 0) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 font-mono mb-3">
          Nudge History
        </h3>
        <p className="text-xs text-gray-400 font-mono italic">
          No nudges sent yet.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-500 font-mono mb-3">
        Nudge History
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {nudges.map((nudge) => (
          <div
            key={nudge.id}
            className="text-xs font-mono"
          >
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Clock className="w-3 h-3" />
              <time dateTime={nudge.sent_at}>
                {formatNudgeDate(nudge.sent_at)}
              </time>
            </div>
            <p className="text-gray-600 pl-4 border-l-2 border-gray-200">
              {nudge.message_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Formats the nudge timestamp for display.
 */
function formatNudgeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Format time
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  // Format date based on recency
  if (diffDays === 0) {
    return `Today at ${timeStr}`
  } else if (diffDays === 1) {
    return `Yesterday at ${timeStr}`
  } else if (diffDays < 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    return `${dayName} at ${timeStr}`
  } else {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
    return `${dateStr} at ${timeStr}`
  }
}
