'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { User, Target, TrendingUp, CheckSquare, MessageSquare, Phone } from 'lucide-react'
import { SendNudgeModal } from './send-nudge-modal'
import type { ClientSummary } from '@/lib/queries/coach'

interface ClientCardProps {
  client: ClientSummary
}

export function ClientCard({ client }: ClientCardProps) {
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false)

  const { user, currentTheme, latestProgress, actionStats } = client
  const completionPercent =
    actionStats.total > 0
      ? Math.round((actionStats.completed / actionStats.total) * 100)
      : 0

  return (
    <>
      <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
              <User className="h-6 w-6 text-[#8B1E3F]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 font-mono">{user.name}</h3>
              <p className="text-sm text-gray-500 font-mono flex items-center gap-1">
                {user.phone ? (
                  <>
                    <Phone className="h-3 w-3" />
                    {user.phone}
                  </>
                ) : (
                  <span className="text-gray-400">No phone</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNudgeModalOpen(true)}
            disabled={!user.phone}
            title={!user.phone ? 'Client has no phone number' : 'Send a nudge'}
            className={`px-4 py-2 bg-[#f0f3fa] rounded-xl text-sm font-mono shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 ${
              !user.phone ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-[#8B1E3F]'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Nudge
          </button>
        </div>

        {/* Current Theme */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 font-mono mb-2">
            <Target className="h-4 w-4" />
            Development Theme
          </div>
          {currentTheme ? (
            <p className="text-sm text-gray-700 font-mono">{currentTheme.theme_text}</p>
          ) : (
            <p className="text-sm text-gray-400 italic font-mono">No theme set</p>
          )}
        </div>

        {/* Latest Progress */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 font-mono mb-2">
            <TrendingUp className="h-4 w-4" />
            Latest Progress
          </div>
          {latestProgress ? (
            <div>
              <p className="text-sm text-gray-700 font-mono line-clamp-2">{latestProgress.text}</p>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                {formatDistanceToNow(new Date(latestProgress.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic font-mono">No progress entries</p>
          )}
        </div>

        {/* Weekly Actions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 font-mono">
              <CheckSquare className="h-4 w-4" />
              Weekly Actions
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] ${
              actionStats.open === 0
                ? 'bg-[#8B1E3F] text-white'
                : 'bg-[#f0f3fa] text-gray-600'
            }`}>
              {actionStats.completed}/{actionStats.total}
            </span>
          </div>
          {actionStats.total > 0 ? (
            <div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-[#f0f3fa] rounded-full shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] overflow-hidden">
                <div
                  className="h-full bg-[#8B1E3F] rounded-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">
                {actionStats.open === 0
                  ? 'All actions completed!'
                  : `${actionStats.open} action${actionStats.open !== 1 ? 's' : ''} remaining`}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic font-mono">No actions set</p>
          )}
        </div>
      </div>

      {/* Send Nudge Modal */}
      <SendNudgeModal
        open={isNudgeModalOpen}
        onOpenChange={setIsNudgeModalOpen}
        clientId={user.id}
        clientName={user.name}
        clientPhone={user.phone}
      />
    </>
  )
}
