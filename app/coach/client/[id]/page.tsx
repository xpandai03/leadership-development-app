import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Compass, Target, Sparkles, MessageCircle, Phone } from 'lucide-react'
import { getUser } from '@/lib/supabase/server'
import { getClientCanvasData, getNudgesSentToClient } from '@/lib/queries/coach'
import { AppHeader } from '@/components/app-header'
import { ClientNudgeButton } from '@/components/coach/client-nudge-button'
import { PadletLinkEditor } from '@/components/coach/padlet-link-editor'
import { NudgeHistory } from '@/components/coach/nudge-history'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CoachClientDetailPage({ params }: PageProps) {
  const { id: clientId } = await params

  // Get authenticated user
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Get client canvas data and nudge history in parallel
  const [clientData, nudgeHistory] = await Promise.all([
    getClientCanvasData(clientId),
    getNudgesSentToClient(clientId, 20),
  ])

  if (!clientData) {
    notFound()
  }

  const { user: client, themes } = clientData

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader userName={client.name} userRole="coach" />

      <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
        {/* Back navigation */}
        <Link
          href="/coach/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#8B1E3F] font-mono text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Client Header */}
        <div className="bg-[#f0f3fa] rounded-2xl p-4 sm:p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-700 font-mono">
                {client.name}
              </h1>
              <p className="text-gray-500 font-mono text-sm mt-1">
                {client.email}
              </p>
              {client.phone && (
                <p className="text-gray-500 font-mono text-sm flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5" />
                  {client.phone}
                </p>
              )}
            </div>
            <ClientNudgeButton
              clientId={client.id}
              clientName={client.name}
              clientPhone={client.phone}
              developmentTheme={themes[0]?.theme.theme_text || null}
            />
          </div>

          {/* Padlet Link */}
          <PadletLinkEditor
            clientId={client.id}
            currentUrl={client.padlet_url}
          />

          {/* Nudge History */}
          <NudgeHistory nudges={nudgeHistory} />
        </div>

        {/* Leadership Purpose */}
        <div className="bg-[#f0f3fa] rounded-2xl p-4 sm:p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
              <Compass className="h-5 w-5 text-[#8B1E3F]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 font-mono">Leadership Purpose</h2>
              <p className="text-xs text-gray-400 font-mono">What kind of leader do they want to become?</p>
            </div>
          </div>
          {client.leadership_purpose ? (
            <div className="px-4 py-3 bg-[#f0f3fa] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
              <p className="text-gray-700 font-mono">{client.leadership_purpose}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-mono italic">
              No leadership purpose set yet.
            </p>
          )}
        </div>

        {/* Development Themes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700 font-mono">
              Development Themes
            </h2>
            <span className="text-sm text-gray-400 font-mono">
              {themes.length} theme{themes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {themes.length > 0 ? (
            <div className="space-y-6">
              {themes.map(({ theme, hypotheses }) => (
                <div
                  key={theme.id}
                  className="bg-[#f0f3fa] rounded-2xl p-4 sm:p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]"
                >
                  {/* Theme Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
                      <Target className="h-5 w-5 text-[#8B1E3F]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 font-mono">
                      {theme.theme_text}
                    </h3>
                  </div>

                  {/* Success Description */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#8B1E3F]" />
                      <h4 className="text-sm font-semibold text-gray-600 font-mono">Envisioned Future</h4>
                    </div>
                    {theme.success_description ? (
                      <div className="px-4 py-3 bg-[#f0f3fa] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
                        <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                          {theme.success_description}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 font-mono italic">
                        No vision described yet.
                      </p>
                    )}
                  </div>

                  {/* Hypotheses */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-[#8B1E3F]" />
                      <h4 className="text-sm font-semibold text-gray-600 font-mono">
                        Ideas & Experiments ({hypotheses.length})
                      </h4>
                    </div>
                    {hypotheses.length > 0 ? (
                      <ul className="space-y-1 px-4 py-3 bg-[#f0f3fa] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
                        {hypotheses.map((hypothesis) => (
                          <li
                            key={hypothesis.id}
                            className="flex items-start gap-2 text-sm text-gray-700 font-mono"
                          >
                            <span className="text-[#8B1E3F] mt-0.5">&bull;</span>
                            <span>{hypothesis.action_text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400 font-mono italic">
                        No ideas captured yet.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#f0f3fa] rounded-2xl p-6 sm:p-8 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] text-center">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-mono">
                No development themes set yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
