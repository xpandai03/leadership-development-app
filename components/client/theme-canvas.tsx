'use client'

import { useState, useTransition } from 'react'
import { Target, Pencil, Check, X, Loader2, Trash2, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { updateThemeName, updateSuccessDescription, deleteTheme } from '@/lib/actions/canvas'
import { HypothesesList } from './hypotheses-list'
import type { DevelopmentTheme, WeeklyAction } from '@/lib/supabase/types'

interface ThemeCanvasProps {
  theme: DevelopmentTheme
  hypotheses: WeeklyAction[]
  onDelete?: () => void
}

export function ThemeCanvas({ theme, hypotheses, onDelete }: ThemeCanvasProps) {
  // Theme name editing state
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(theme.theme_text)
  const [isNamePending, startNameTransition] = useTransition()
  const [nameError, setNameError] = useState<string | null>(null)

  // Description editing state
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState(theme.success_description || '')
  const [isDescPending, startDescTransition] = useTransition()
  const [descError, setDescError] = useState<string | null>(null)

  // Delete state
  const [isDeleting, startDeleteTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSaveName = () => {
    if (!nameValue.trim()) return

    setNameError(null)
    startNameTransition(async () => {
      const result = await updateThemeName(theme.id, nameValue.trim())

      if (!result.success) {
        setNameError(result.error)
        return
      }

      setIsEditingName(false)
    })
  }

  const handleSaveDesc = () => {
    setDescError(null)
    startDescTransition(async () => {
      const result = await updateSuccessDescription(theme.id, descValue)

      if (!result.success) {
        setDescError(result.error)
        return
      }

      setIsEditingDesc(false)
    })
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteTheme(theme.id)

      if (!result.success) {
        console.error('Failed to delete theme:', result.error)
        setShowDeleteConfirm(false)
        return
      }

      onDelete?.()
    })
  }

  return (
    <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
      {/* Theme Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex-shrink-0">
            <Target className="h-6 w-6 text-[#8B1E3F]" />
          </div>
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isNamePending) handleSaveName()
                      if (e.key === 'Escape') {
                        setNameValue(theme.theme_text)
                        setIsEditingName(false)
                        setNameError(null)
                      }
                    }}
                    disabled={isNamePending}
                    autoFocus
                    placeholder="Theme name (1-4 words)"
                    className={`flex-1 px-3 py-2 bg-[#f0f3fa] rounded-lg text-lg font-semibold text-gray-700 font-mono outline-none shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all duration-200 ${
                      isNamePending ? 'opacity-50' : ''
                    }`}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isNamePending || !nameValue.trim()}
                    className="p-2 text-[#8B1E3F] hover:bg-[#8B1E3F10] rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isNamePending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setNameValue(theme.theme_text)
                      setIsEditingName(false)
                      setNameError(null)
                    }}
                    disabled={isNamePending}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {nameError && <p className="text-xs text-red-500 font-mono">{nameError}</p>}
              </div>
            ) : (
              <div className="group flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-700 font-mono truncate">
                  {theme.theme_text}
                </h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-[#8B1E3F] transition-all"
                  title="Edit theme name"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500 font-mono">
              Created {formatDistanceToNow(new Date(theme.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Delete button */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete theme"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
            <span className="text-xs text-red-600 font-mono">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-2 py-1 text-xs font-mono text-white bg-red-500 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-2 py-1 text-xs font-mono text-gray-600 bg-white rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* Success Description */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#8B1E3F]" />
          <h4 className="text-sm font-semibold text-gray-600 font-mono">Envisioned Future</h4>
          <span className="text-xs text-gray-400 font-mono">What will be different?</span>
        </div>

        {isEditingDesc ? (
          <div className="space-y-2">
            <textarea
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isDescPending) {
                  e.preventDefault()
                  handleSaveDesc()
                }
                if (e.key === 'Escape') {
                  setDescValue(theme.success_description || '')
                  setIsEditingDesc(false)
                  setDescError(null)
                }
              }}
              placeholder="Describe how you'll feel, act, and show up differently. What will others notice? What will feel easier?"
              disabled={isDescPending}
              autoFocus
              rows={4}
              className={`w-full px-4 py-3 bg-[#f0f3fa] rounded-xl text-sm text-gray-700 placeholder-gray-400 font-mono outline-none shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all duration-200 resize-none ${
                isDescPending ? 'opacity-50' : ''
              }`}
            />
            {descError && <p className="text-xs text-red-500 font-mono">{descError}</p>}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDesc}
                disabled={isDescPending}
                className="flex items-center gap-2 px-3 py-2 text-sm font-mono text-white bg-[#8B1E3F] rounded-lg shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] transition-all duration-200 disabled:opacity-50"
              >
                {isDescPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save
              </button>
              <button
                onClick={() => {
                  setDescValue(theme.success_description || '')
                  setIsEditingDesc(false)
                  setDescError(null)
                }}
                disabled={isDescPending}
                className="flex items-center gap-2 px-3 py-2 text-sm font-mono text-gray-500 bg-[#f0f3fa] rounded-lg shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] transition-all duration-200 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : theme.success_description ? (
          <div
            onClick={() => setIsEditingDesc(true)}
            className="group cursor-pointer px-4 py-3 bg-[#f0f3fa] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all"
          >
            <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
              {theme.success_description}
            </p>
            <Pencil className="w-3.5 h-3.5 text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ) : (
          <button
            onClick={() => setIsEditingDesc(true)}
            className="w-full px-4 py-3 bg-[#f0f3fa] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] text-left hover:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all"
          >
            <p className="text-sm text-gray-400 font-mono italic">
              Describe your envisioned future...
            </p>
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-5" />

      {/* Hypotheses */}
      <HypothesesList themeId={theme.id} hypotheses={hypotheses} />
    </div>
  )
}
