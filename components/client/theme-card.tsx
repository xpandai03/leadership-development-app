import { formatDistanceToNow } from 'date-fns'
import { Target } from 'lucide-react'
import type { DevelopmentTheme } from '@/lib/supabase/types'

interface ThemeCardProps {
  theme: DevelopmentTheme | null
}

export function ThemeCard({ theme }: ThemeCardProps) {
  if (!theme) {
    return (
      <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
            <Target className="h-6 w-6 text-[#8B1E3F]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 font-mono">Development Theme</h2>
            <p className="text-sm text-gray-500 font-mono">Your current focus area</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 font-mono italic">
          No development theme set. Set one to focus your growth journey.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
          <Target className="h-6 w-6 text-[#8B1E3F]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-700 font-mono">Development Theme</h2>
          <p className="text-sm text-gray-500 font-mono">
            Set {formatDistanceToNow(new Date(theme.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
      <div className="px-5 py-4 bg-[#f0f3fa] rounded-xl shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
        <p className="text-lg font-medium text-gray-700 font-mono">{theme.theme_text}</p>
      </div>
    </div>
  )
}
