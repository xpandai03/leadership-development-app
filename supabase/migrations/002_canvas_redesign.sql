-- ============================================================================
-- Leadership Development App - Canvas Redesign Migration
-- ============================================================================
-- This migration transforms the app from a habit-tracker model to a
-- reflection-first Leadership Development Canvas, aligned with Katharina's
-- Excel methodology.
--
-- Changes:
-- 1. Add leadership_purpose to users table
-- 2. Add success_description and theme_order to development_themes table
-- 3. Add theme_id foreign key to weekly_actions (for linking hypotheses to themes)
--
-- IMPORTANT: This is a non-destructive migration. No data is deleted.
-- ============================================================================

-- ============================================================================
-- 1. ADD LEADERSHIP PURPOSE TO USERS
-- ============================================================================

-- Add leadership_purpose column (optional, nullable)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS leadership_purpose TEXT;

COMMENT ON COLUMN public.users.leadership_purpose IS 'Optional leadership purpose statement: "What kind of leader do I want to become?"';

-- ============================================================================
-- 2. EXPAND DEVELOPMENT_THEMES TABLE
-- ============================================================================

-- Add success_description column (envisioned future state)
ALTER TABLE public.development_themes
ADD COLUMN IF NOT EXISTS success_description TEXT;

COMMENT ON COLUMN public.development_themes.success_description IS 'Success description: "How does progress/success look like?" for this theme';

-- Add theme_order for supporting multiple themes (max 3)
ALTER TABLE public.development_themes
ADD COLUMN IF NOT EXISTS theme_order INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.development_themes.theme_order IS 'Order of theme (1-3) for display purposes';

-- Add constraint to limit theme_order to valid range
ALTER TABLE public.development_themes
ADD CONSTRAINT development_themes_order_check
CHECK (theme_order >= 1 AND theme_order <= 3);

-- Create index for efficient theme ordering queries
CREATE INDEX IF NOT EXISTS idx_development_themes_user_order
ON public.development_themes(user_id, theme_order);

-- ============================================================================
-- 3. LINK WEEKLY_ACTIONS TO THEMES (BECOMING HYPOTHESES)
-- ============================================================================

-- Add theme_id to link hypotheses to specific themes
-- Nullable to maintain backward compatibility with existing data
ALTER TABLE public.weekly_actions
ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES public.development_themes(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.weekly_actions.theme_id IS 'Foreign key to development_theme this hypothesis belongs to';

-- Create index for efficient queries by theme
CREATE INDEX IF NOT EXISTS idx_weekly_actions_theme_id
ON public.weekly_actions(theme_id);

-- ============================================================================
-- 4. BACKFILL EXISTING DATA (OPTIONAL MIGRATION HELPER)
-- ============================================================================

-- For existing users with weekly_actions but no theme_id set,
-- we can optionally link them to their most recent theme.
-- This is a helper that can be run manually if needed.

-- UPDATE public.weekly_actions wa
-- SET theme_id = (
--     SELECT dt.id
--     FROM public.development_themes dt
--     WHERE dt.user_id = wa.user_id
--     ORDER BY dt.created_at DESC
--     LIMIT 1
-- )
-- WHERE wa.theme_id IS NULL;

-- ============================================================================
-- 5. UPDATE RLS POLICIES (IF NEEDED)
-- ============================================================================

-- The existing RLS policies on users, development_themes, and weekly_actions
-- already cover the new columns since they're based on user_id ownership.
-- No new policies are required.

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- New columns added:
-- - users.leadership_purpose (TEXT, nullable)
-- - development_themes.success_description (TEXT, nullable)
-- - development_themes.theme_order (INTEGER, default 1, range 1-3)
-- - weekly_actions.theme_id (UUID FK, nullable)
--
-- No data deleted. Existing functionality preserved.
-- ============================================================================
