import { redirect } from 'next/navigation'
import { CheckSquare, TrendingUp } from 'lucide-react'
import { getUser } from '@/lib/supabase/server'
import { getClientHomeSummary } from '@/lib/queries/client'
import { ThemeCard } from '@/components/client/theme-card'
import { WeeklyActionsList } from '@/components/client/weekly-actions-list'
import { ProgressTimeline } from '@/components/client/progress-timeline'
import { AppHeader } from '@/components/app-header'

export default async function ClientHomePage() {
  // Get authenticated user
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all client data
  const { user: profile, currentTheme, progressEntries, weeklyActions } =
    await getClientHomeSummary(user.id)

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader userName={profile?.name} userRole="client" />

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-700 font-mono">
            Welcome back{profile?.name ? `, ${profile.name}` : ''}
          </h1>
          <p className="text-gray-500 mt-1 font-mono">
            Track your leadership development journey
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Development Theme */}
          <div className="md:col-span-2">
            <ThemeCard theme={currentTheme} />
          </div>

          {/* Weekly Actions */}
          <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
                <CheckSquare className="h-5 w-5 text-[#8B1E3F]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 font-mono">Weekly Actions</h2>
                <p className="text-sm text-gray-500 font-mono">Your commitments for this week</p>
              </div>
            </div>
            <WeeklyActionsList actions={weeklyActions} />
          </div>

          {/* Progress Entries */}
          <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
                <TrendingUp className="h-5 w-5 text-[#8B1E3F]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 font-mono">Progress Journal</h2>
                <p className="text-sm text-gray-500 font-mono">Your recent reflections and updates</p>
              </div>
            </div>
            <ProgressTimeline entries={progressEntries} />
          </div>
        </div>
      </div>
    </div>
  )
}
