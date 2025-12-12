-- ============================================================================
-- Test User Seed Script for Leadership Development App
-- ============================================================================
-- Run this in the Supabase SQL Editor AFTER running the schema migration.
--
-- This script creates test users in auth.users which will trigger the
-- handle_new_user() function to automatically create profiles in public.users
-- and default settings.
--
-- TEST ACCOUNTS:
-- +------------------------------------------+-------------+------------------+
-- | Email                                    | Password    | Role             |
-- +------------------------------------------+-------------+------------------+
-- | raunek@xpandai.com                       | Test1234!   | client           |
-- | raunek@cloudsteer.com                    | Test1234!   | coach            |
-- | katharina@inspirationanddiscipline.com   | Test1234!   | client           |
-- +------------------------------------------+-------------+------------------+
--
-- NOTE: In production, NEVER use weak passwords or store them in scripts!
-- ============================================================================

-- First, let's create the users using Supabase's auth.users table
-- The passwords will be hashed by Supabase

-- User 1: raunek@xpandai.com (Client)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'raunek@xpandai.com',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Raunek (XpandAI)", "role": "client", "phone": "+1234567890"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- User 2: raunek@cloudsteer.com (Coach)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'raunek@cloudsteer.com',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Raunek (Coach)", "role": "coach", "phone": "+1234567891"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- User 3: katharina@inspirationanddiscipline.com (Client)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'katharina@inspirationanddiscipline.com',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Katharina", "role": "client", "phone": "+1234567892"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these after inserting to verify the users were created correctly
-- ============================================================================

-- Check auth.users
-- SELECT id, email, created_at FROM auth.users WHERE email IN (
--     'raunek@xpandai.com',
--     'raunek@cloudsteer.com',
--     'katharina@inspirationanddiscipline.com'
-- );

-- Check public.users (should be auto-created by trigger)
-- SELECT id, email, name, role, phone FROM public.users;

-- Check settings (should be auto-created by trigger)
-- SELECT * FROM public.settings;

-- ============================================================================
-- SAMPLE DATA (Optional)
-- Add some sample themes, progress, and actions for testing
-- ============================================================================

-- Wait a moment for triggers to complete, then add sample data
-- You can run this separately after confirming users exist in public.users

-- Get user IDs for sample data
DO $$
DECLARE
    raunek_xpandai_id UUID;
    katharina_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO raunek_xpandai_id FROM public.users WHERE email = 'raunek@xpandai.com';
    SELECT id INTO katharina_id FROM public.users WHERE email = 'katharina@inspirationanddiscipline.com';

    -- Only proceed if users exist
    IF raunek_xpandai_id IS NOT NULL THEN
        -- Add development theme for Raunek
        INSERT INTO public.development_themes (user_id, theme_text)
        VALUES (raunek_xpandai_id, 'Improve delegation skills and trust team members more');

        -- Add progress entries for Raunek
        INSERT INTO public.progress_entries (user_id, text, created_at)
        VALUES
            (raunek_xpandai_id, 'Had a breakthrough today - delegated the quarterly report to my team lead and it went great!', now() - interval '2 days'),
            (raunek_xpandai_id, 'Struggling with letting go of small details. Need to focus on bigger picture.', now() - interval '5 days');

        -- Add weekly actions for Raunek
        INSERT INTO public.weekly_actions (user_id, action_text, is_completed)
        VALUES
            (raunek_xpandai_id, 'Delegate at least 2 tasks this week', true),
            (raunek_xpandai_id, 'Have 1:1 with each direct report', false),
            (raunek_xpandai_id, 'Practice saying "How would you handle this?" instead of giving answers', false);
    END IF;

    IF katharina_id IS NOT NULL THEN
        -- Add development theme for Katharina
        INSERT INTO public.development_themes (user_id, theme_text)
        VALUES (katharina_id, 'Build executive presence and confidence in senior leadership meetings');

        -- Add progress entries for Katharina
        INSERT INTO public.progress_entries (user_id, text, created_at)
        VALUES
            (katharina_id, 'Spoke up in the board meeting today. Felt nervous but received positive feedback.', now() - interval '1 day'),
            (katharina_id, 'Practicing power poses before meetings - seems to help with confidence.', now() - interval '4 days');

        -- Add weekly actions for Katharina
        INSERT INTO public.weekly_actions (user_id, action_text, is_completed)
        VALUES
            (katharina_id, 'Contribute at least one idea in every meeting', true),
            (katharina_id, 'Schedule coffee with a C-level executive', false),
            (katharina_id, 'Practice presentation for next week', false);
    END IF;
END $$;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Test accounts are ready. Login with:
--
-- CLIENT: raunek@xpandai.com / Test1234!
-- COACH:  raunek@cloudsteer.com / Test1234!
-- CLIENT: katharina@inspirationanddiscipline.com / Test1234!
-- ============================================================================
