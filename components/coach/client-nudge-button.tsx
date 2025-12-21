'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { SendNudgeModal } from './send-nudge-modal'

interface ClientNudgeButtonProps {
  clientId: string
  clientName: string
  clientPhone: string | null
  developmentTheme: string | null
}

export function ClientNudgeButton({
  clientId,
  clientName,
  clientPhone,
  developmentTheme,
}: ClientNudgeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={!clientPhone}
        title={!clientPhone ? 'Client has no phone number' : 'Send a nudge'}
        className={`px-4 py-2 bg-[#f0f3fa] rounded-xl text-sm font-mono shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 ${
          !clientPhone ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-[#8B1E3F]'
        }`}
      >
        <MessageSquare className="h-4 w-4" />
        Send Nudge
      </button>

      <SendNudgeModal
        open={isOpen}
        onOpenChange={setIsOpen}
        clientId={clientId}
        clientName={clientName}
        clientPhone={clientPhone}
        developmentTheme={developmentTheme}
        latestProgress={null}
      />
    </>
  )
}
