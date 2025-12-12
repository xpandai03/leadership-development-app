import { formatDistanceToNow } from 'date-fns'
import type { ProgressEntry } from '@/lib/supabase/types'

interface ProgressTimelineProps {
  entries: ProgressEntry[]
}

export function ProgressTimeline({ entries }: ProgressTimelineProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4 font-mono italic">
        No progress entries yet. Start documenting your journey!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div key={entry.id} className="relative pl-8">
          {/* Timeline line */}
          {index !== entries.length - 1 && (
            <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-gradient-to-b from-[#8B1E3F] to-[#d1d9e6]" />
          )}
          {/* Timeline dot */}
          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]">
            <div className="w-3 h-3 rounded-full bg-[#8B1E3F]" />
          </div>
          {/* Content */}
          <div className="space-y-1">
            <p className="text-sm text-gray-700 font-mono">{entry.text}</p>
            <p className="text-xs text-gray-400 font-mono">
              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
