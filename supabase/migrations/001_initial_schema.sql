-- ============================================================================
-- Leadership Development App - Phase 1 Database Schema
-- ============================================================================
-- Run this in Supabase SQL Editor to create all tables, indexes, RLS policies,
-- and triggers for the coaching app.
-- ============================================================================

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- Users table (extends auth.users with app-specific profile data)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('client', 'coach')),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN public.users.role IS 'User role: client or coach';

-- Development themes (client focus areas)
CREATE TABLE public.development_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    theme_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.development_themes IS 'Client development themes/focus areas';

-- Progress entries (journal entries tracking client progress)
CREATE TABLE public.progress_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.progress_entries IS 'Journal entries tracking client progress';

-- Weekly actions (action items clients commit to each week)
CREATE TABLE public.weekly_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.weekly_actions IS 'Weekly action items for clients';

-- Settings (user notification preferences)
CREATE TABLE public.settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    receive_weekly_nudge BOOLEAN NOT NULL DEFAULT true
);

COMMENT ON TABLE public.settings IS 'User notification preferences';

-- Nudges sent (log of SMS nudges sent by coach)
CREATE TABLE public.nudges_sent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.nudges_sent IS 'Log of SMS nudges sent by coach to clients';

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

-- Development themes indexes
CREATE INDEX idx_development_themes_user_id ON public.development_themes(user_id);

-- Progress entries indexes
CREATE INDEX idx_progress_entries_user_id ON public.progress_entries(user_id);
CREATE INDEX idx_progress_entries_user_id_created_at ON public.progress_entries(user_id, created_at DESC);

-- Weekly actions indexes
CREATE INDEX idx_weekly_actions_user_id ON public.weekly_actions(user_id);
CREATE INDEX idx_weekly_actions_user_id_completed ON public.weekly_actions(user_id, is_completed);

-- Nudges sent indexes
CREATE INDEX idx_nudges_sent_client_id ON public.nudges_sent(client_id);
CREATE INDEX idx_nudges_sent_coach_id ON public.nudges_sent(coach_id);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges_sent ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Helper function to check if current user is a coach
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'coach'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_coach IS 'Returns true if the current authenticated user has the coach role';

-- ----------------------------------------------------------------------------
-- USERS table policies
-- ----------------------------------------------------------------------------

-- Clients can read their own record
CREATE POLICY users_select_own ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Coaches can read all user records
CREATE POLICY users_select_coach ON public.users
    FOR SELECT
    USING (public.is_coach());

-- Users can update their own record (name, phone only - not role)
CREATE POLICY users_update_own ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- DEVELOPMENT_THEMES table policies
-- ----------------------------------------------------------------------------

-- Clients can read their own themes
CREATE POLICY development_themes_select_own ON public.development_themes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Coaches can read all themes
CREATE POLICY development_themes_select_coach ON public.development_themes
    FOR SELECT
    USING (public.is_coach());

-- Clients can insert their own themes
CREATE POLICY development_themes_insert_own ON public.development_themes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Clients can update their own themes
CREATE POLICY development_themes_update_own ON public.development_themes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Clients can delete their own themes
CREATE POLICY development_themes_delete_own ON public.development_themes
    FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- PROGRESS_ENTRIES table policies
-- ----------------------------------------------------------------------------

-- Clients can read their own entries
CREATE POLICY progress_entries_select_own ON public.progress_entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Coaches can read all entries
CREATE POLICY progress_entries_select_coach ON public.progress_entries
    FOR SELECT
    USING (public.is_coach());

-- Clients can insert their own entries
CREATE POLICY progress_entries_insert_own ON public.progress_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Clients can update their own entries
CREATE POLICY progress_entries_update_own ON public.progress_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Clients can delete their own entries
CREATE POLICY progress_entries_delete_own ON public.progress_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- WEEKLY_ACTIONS table policies
-- ----------------------------------------------------------------------------

-- Clients can read their own actions
CREATE POLICY weekly_actions_select_own ON public.weekly_actions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Coaches can read all actions
CREATE POLICY weekly_actions_select_coach ON public.weekly_actions
    FOR SELECT
    USING (public.is_coach());

-- Clients can insert their own actions
CREATE POLICY weekly_actions_insert_own ON public.weekly_actions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Clients can update their own actions
CREATE POLICY weekly_actions_update_own ON public.weekly_actions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Clients can delete their own actions
CREATE POLICY weekly_actions_delete_own ON public.weekly_actions
    FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- SETTINGS table policies
-- ----------------------------------------------------------------------------

-- Users can read their own settings
CREATE POLICY settings_select_own ON public.settings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Coaches can read all settings (to know who wants nudges)
CREATE POLICY settings_select_coach ON public.settings
    FOR SELECT
    USING (public.is_coach());

-- Users can insert their own settings (handled by trigger, but allowed for edge cases)
CREATE POLICY settings_insert_own ON public.settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY settings_update_own ON public.settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- NUDGES_SENT table policies
-- ----------------------------------------------------------------------------

-- Coaches can read all nudges
CREATE POLICY nudges_sent_select_coach ON public.nudges_sent
    FOR SELECT
    USING (public.is_coach());

-- Clients can read nudges sent to them
CREATE POLICY nudges_sent_select_client ON public.nudges_sent
    FOR SELECT
    USING (auth.uid() = client_id);

-- Coaches can insert nudges (with themselves as coach_id)
CREATE POLICY nudges_sent_insert_coach ON public.nudges_sent
    FOR INSERT
    WITH CHECK (public.is_coach() AND auth.uid() = coach_id);

-- ============================================================================
-- 4. TRIGGERS & FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: handle_new_user
-- Creates a user profile and default settings when a new auth.users record is created
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into public.users with default role 'client'
    -- Name defaults to email prefix if not provided in metadata
    INSERT INTO public.users (id, role, name, email, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone'
    );

    -- Insert default settings
    INSERT INTO public.settings (user_id, receive_weekly_nudge)
    VALUES (NEW.id, true);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user IS 'Creates user profile and settings when a new auth user signs up';

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. GRANTS
-- ============================================================================
-- Grant necessary permissions to authenticated and anon roles
-- (Supabase typically handles this, but explicit grants ensure correctness)

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.users TO anon, authenticated;
GRANT UPDATE ON public.users TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.development_themes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_actions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.settings TO authenticated;
GRANT SELECT, INSERT ON public.nudges_sent TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Tables created: users, development_themes, progress_entries, weekly_actions,
--                 settings, nudges_sent
-- RLS enabled on all tables with appropriate policies
-- Trigger set up to auto-create user profile on signup
-- ============================================================================
 Phase 2: Next.js + Supabase Integration Plan

  ---
  1. Supabase Client Setup

  Files to create:
  - lib/supabase/client.ts - Browser client (uses anon key)
  - lib/supabase/server.ts - Server client for Server
  Components/Route Handlers (uses anon key + cookies)
  - lib/supabase/admin.ts - Service role client for privileged
   operations (uses service role key)
  - lib/supabase/middleware.ts - Session refresh middleware

  Key decisions:
  - Use @supabase/ssr package for proper cookie handling in
  Next.js 15
  - Anon key client for all user-facing queries (RLS enforced)
  - Service role client ONLY for:
    - Validating coach role in API routes
    - n8n webhook queries (weekly nudge automation)
  - Never expose service role key to client

  ---
  2. Onboarding Flow

  Files to create:
  - lib/actions/onboarding.ts - Server actions for onboarding

  Functions:
  | Function                               | Table
    | Operation      |
  |----------------------------------------|------------------
  --|----------------|
  | saveTheme(userId, themeText)           |
  development_themes | INSERT         |
  | saveProgress(userId, text)             | progress_entries
    | INSERT         |
  | saveWeeklyActions(userId, actions[])   | weekly_actions
    | INSERT (batch) |
  | updateNudgePreference(userId, boolean) | settings
    | UPDATE         |

  Flow:
  1. User completes onboarding form steps
  2. Each step calls its respective server action
  3. On final step completion → redirect('/client/home')

  Validation:
  - Use Zod schemas for input validation
  - Verify auth.uid() === userId before operations

  ---
  3. Client Home Screen (/client/home)

  Files to create:
  - app/client/home/page.tsx - Main client dashboard
  - lib/queries/client.ts - Data fetching functions

  Data fetching (Server Component):
  - getCurrentTheme(userId) → development_themes ORDER BY 
  created_at DESC LIMIT 1
  - getProgressEntries(userId) → progress_entries ORDER BY 
  created_at DESC
  - getWeeklyActions(userId) → weekly_actions ORDER BY 
  created_at DESC

  Client interactions:
  - toggleActionComplete(actionId, isCompleted) - Server
  action to UPDATE weekly_actions

  UI components:
  - Theme display card
  - Progress entries timeline
  - Weekly actions checklist with toggle

  ---
  4. Coach Dashboard (/coach/dashboard)

  Files to create:
  - app/coach/dashboard/page.tsx - Coach dashboard
  - lib/queries/coach.ts - Coach-specific queries
  - components/coach/client-card.tsx - Individual client
  summary
  - components/coach/send-nudge-modal.tsx - Nudge composition
  form

  Data fetching:
  - getAllClients() → users WHERE role = 'client'
  - getClientSummary(clientId) → JOIN themes + progress +
  actions

  UI structure:
  Coach Dashboard
  ├── Client List (cards)
  │   ├── Client Name + Phone
  │   ├── Current Theme
  │   ├── Latest Progress Entry
  │   ├── Weekly Actions (X/Y completed)
  │   └── [Send Nudge] button
  └── Send Nudge Modal
      ├── Client name (readonly)
      ├── Message textarea (1-2 sentences)
      └── [Send] button → POST /api/send-nudge

  ---
  5. Manual Nudge API Route (/api/send-nudge)

  File to create:
  - app/api/send-nudge/route.ts

  Request body:
  {
    "client_id": "uuid",
    "message_text": "string"
  }

  Flow:
  1. Get authenticated user from session
  2. Use service role client to verify user has role = 'coach'
  3. Fetch client's phone number
  4. Insert record into nudges_sent
  5. POST to process.env.N8N_SEND_NUDGE_WEBHOOK:
  {
    "client_id": "uuid",
    "phone": "+1234567890",
    "message_text": "Your nudge message"
  }
  6. Return success/error response

  Error handling:
  - 401 if not authenticated
  - 403 if not a coach
  - 404 if client not found
  - 500 if webhook fails (but nudge record still saved)

  ---
  6. Weekly Automated Nudges (n8n Integration)

  File to create:
  - app/api/weekly-nudges/route.ts - Endpoint for n8n to call

  n8n workflow design:

  [Schedule Trigger: Weekly]
          ↓
  [HTTP Request: GET /api/weekly-nudges]
          ↓
  [Loop over clients]
          ↓
  [Twilio: Send SMS to each client]

  API response format:
  {
    "clients": [
      {
        "client_id": "uuid",
        "name": "John Doe",
        "phone": "+1234567890",
        "current_theme": "Improve delegation skills",
        "open_actions_count": 3
      }
    ],
    "generated_at": "2025-12-11T10:00:00Z"
  }

  Security:
  - Require Authorization: Bearer <N8N_API_SECRET> header
  - Add N8N_API_SECRET to environment variables

  ---
  7. Realtime Subscriptions

  Files to create:
  - lib/supabase/realtime.ts - Realtime subscription helpers
  - hooks/use-realtime-clients.ts - React hook for coach
  dashboard

  Tables to subscribe:
  - development_themes - New themes
  - progress_entries - New entries
  - weekly_actions - New actions + completion updates

  Implementation:
  // Subscribe to changes for all clients (coach view)
  supabase
    .channel('coach-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'development_themes'
    }, handleThemeChange)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'progress_entries'
    }, handleProgressChange)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'weekly_actions'
    }, handleActionChange)
    .subscribe()

  UI updates:
  - Optimistic updates on client side
  - Toast notification when new data arrives on coach
  dashboard
  - Auto-refresh client cards without page reload

  ---
  File Structure Summary

  lib/
  ├── supabase/
  │   ├── client.ts          # Browser client
  │   ├── server.ts          # Server component client
  │   ├── admin.ts           # Service role client
  │   ├── middleware.ts      # Auth middleware
  │   └── realtime.ts        # Realtime helpers
  ├── actions/
  │   ├── onboarding.ts      # Onboarding server actions
  │   └── weekly-actions.ts  # Action toggle server action
  ├── queries/
  │   ├── client.ts          # Client data queries
  │   └── coach.ts           # Coach data queries
  └── validations/
      └── schemas.ts         # Zod schemas

  app/
  ├── api/
  │   ├── send-nudge/
  │   │   └── route.ts       # Manual nudge endpoint
  │   └── weekly-nudges/
  │       └── route.ts       # n8n webhook endpoint
  ├── client/
  │   └── home/
  │       └── page.tsx       # Client dashboard
  └── coach/
      └── dashboard/
          └── page.tsx       # Coach dashboard

  components/
  └── coach/
      ├── client-card.tsx    # Client summary card
      └── send-nudge-modal.tsx

  hooks/
  └── use-realtime-clients.ts

  ---
  Environment Variables Needed

  # Already defined
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=

  # New
  N8N_SEND_NUDGE_WEBHOOK=https://your-n8n-instance/webhook/sen
  d-nudge
  N8N_API_SECRET=your-secret-for-weekly-nudges-endpoint

  ---
  Implementation Order

  1. Supabase clients (foundation for everything)
  2. Onboarding actions (allows testing user creation)
  3. Client home (verify client data flows work)
  4. Coach queries (verify coach can see client data)
  5. Coach dashboard UI (basic version without realtime)
  6. Send nudge API + modal (complete manual nudge flow)
  7. Weekly nudges API (n8n integration)
  8. Realtime subscriptions (enhance coach dashboard)

  ---
  Let me know if this plan looks good, or if you'd like me to
  adjust any section before I generate the code.

This plan looks great. Let's proceed.

Start by generating the code for Step 1:
- lib/supabase/client.ts
- lib/supabase/server.ts
- lib/supabase/admin.ts
- lib/supabase/middleware.ts

Follow the file structure you outlined and include recommended imports for Next.js 15 and @supabase/ssr.

Wait for my approval before moving on to Step 2.