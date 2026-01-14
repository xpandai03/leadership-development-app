'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Target, Lightbulb, MessageSquare, Phone, ExternalLink, Link2 } from 'lucide-react'
import { SendNudgeModal } from './send-nudge-modal'
import type { ClientSummary } from '@/lib/queries/coach'

interface ClientCardProps {
  client: ClientSummary
}

export function ClientCard({ client }: ClientCardProps) {
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false)

  const { user, currentTheme, weeklyActions } = client

  // Count hypotheses (weekly_actions linked to themes)
  const hypothesesCount = weeklyActions.filter(a => a.theme_id).length

  return (
    <>
      <Link
        href={`/coach/client/${user.id}`}
        className="block bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] h-full hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] transition-all duration-200 group"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
              <User className="h-6 w-6 text-[#8B1E3F]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 font-mono group-hover:text-[#8B1E3F] transition-colors flex items-center gap-2">
                {user.name}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
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
          <div className="flex items-center gap-2">
            {/* Padlet Button */}
            {user.padlet_url ? (
              <a
                href={user.padlet_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 bg-[#f0f3fa] rounded-xl text-sm font-mono shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 text-[#8B1E3F]"
              >
                <ExternalLink className="h-4 w-4" />
                Padlet
              </a>
            ) : (
              <Link
                href={`/coach/client/${user.id}`}
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 bg-[#f0f3fa] rounded-xl text-sm font-mono shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 text-gray-400"
              >
                <Link2 className="h-4 w-4" />
                Add Padlet
              </Link>
            )}
            {/* Nudge Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsNudgeModalOpen(true)
              }}
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

        {/* Hypotheses Count */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 font-mono">
              <Lightbulb className="h-4 w-4" />
              Ideas & Experiments
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#f0f3fa] text-gray-600 shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]">
              {hypothesesCount}
            </span>
          </div>
          {hypothesesCount > 0 ? (
            <p className="text-xs text-gray-500 font-mono">
              {hypothesesCount} idea{hypothesesCount !== 1 ? 's' : ''} captured
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic font-mono">No ideas yet</p>
          )}
        </div>

        {/* View Details hint */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 font-mono text-center group-hover:text-[#8B1E3F] transition-colors">
            View full canvas
          </p>
        </div>
      </Link>

      {/* Send Nudge Modal */}
      <SendNudgeModal
        open={isNudgeModalOpen}
        onOpenChange={setIsNudgeModalOpen}
        clientId={user.id}
        clientName={user.name}
        clientPhone={user.phone}
        developmentTheme={currentTheme?.theme_text}
        latestProgress={null}
      />
    </>
  )
}
