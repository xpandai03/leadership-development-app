# Setting Up Test Users in Supabase

## Quick Setup (Recommended)

The easiest way to create test users is through the **Supabase Dashboard**.

### Step 1: Create Users in Authentication

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Create each user:

| Email | Password |
|-------|----------|
| `raunek@xpandai.com` | `Test1234!` |
| `raunek@cloudsteer.com` | `Test1234!` |
| `katharina@inspirationanddiscipline.com` | `Test1234!` |

**Important:** Check "Auto Confirm User" so you don't need email verification.

### Step 2: Update User Roles in Database

After creating the users in Auth, run this SQL in the **SQL Editor** to set the correct roles:

```sql
-- Update Raunek (CloudSteer) to be a COACH
UPDATE public.users
SET role = 'coach', name = 'Raunek (Coach)'
WHERE email = 'raunek@cloudsteer.com';

-- Verify the users were created correctly
SELECT id, email, name, role FROM public.users;
```

### Step 3: Add Sample Data (Optional)

Run this SQL to add sample themes and actions for testing:

```sql
-- Get user IDs
DO $$
DECLARE
    raunek_xpandai_id UUID;
    katharina_id UUID;
BEGIN
    SELECT id INTO raunek_xpandai_id FROM public.users WHERE email = 'raunek@xpandai.com';
    SELECT id INTO katharina_id FROM public.users WHERE email = 'katharina@inspirationanddiscipline.com';

    -- Add data for raunek@xpandai.com
    IF raunek_xpandai_id IS NOT NULL THEN
        INSERT INTO public.development_themes (user_id, theme_text)
        VALUES (raunek_xpandai_id, 'Improve delegation skills and trust team members more');

        INSERT INTO public.progress_entries (user_id, text)
        VALUES (raunek_xpandai_id, 'Had a breakthrough today - delegated the quarterly report to my team lead!');

        INSERT INTO public.weekly_actions (user_id, action_text, is_completed)
        VALUES
            (raunek_xpandai_id, 'Delegate at least 2 tasks this week', true),
            (raunek_xpandai_id, 'Have 1:1 with each direct report', false),
            (raunek_xpandai_id, 'Practice active listening in meetings', false);
    END IF;

    -- Add data for katharina
    IF katharina_id IS NOT NULL THEN
        INSERT INTO public.development_themes (user_id, theme_text)
        VALUES (katharina_id, 'Build executive presence and confidence');

        INSERT INTO public.progress_entries (user_id, text)
        VALUES (katharina_id, 'Spoke up in the board meeting today - received positive feedback!');

        INSERT INTO public.weekly_actions (user_id, action_text, is_completed)
        VALUES
            (katharina_id, 'Contribute one idea in every meeting', true),
            (katharina_id, 'Schedule coffee with a C-level executive', false);
    END IF;
END $$;
```

---

## Test Accounts Summary

| Email | Password | Role | Dashboard |
|-------|----------|------|-----------|
| `raunek@xpandai.com` | `Test1234!` | Client | `/client/home` |
| `raunek@cloudsteer.com` | `Test1234!` | Coach | `/coach/dashboard` |
| `katharina@inspirationanddiscipline.com` | `Test1234!` | Coach | `/coach/dashboard` |

**Note:** Coach emails are hardcoded in `lib/constants.ts`. Only these two coach emails will have direct dashboard access after login.

---

## Flow After Login

### New User (no data)
1. Login at `/`
2. → Redirected to `/onboarding`
3. → Select leadership theme at `/job-role`
4. → Describe progress vision at `/company-info`
5. → Confirm settings at `/welcome`
6. → "Enter the app" → `/client/home`

### Existing Client (has theme)
1. Login at `/`
2. → Redirected directly to `/client/home`

### Coach
1. Login at `/`
2. → Redirected directly to `/coach/dashboard`

---

## Troubleshooting

### "Invalid login credentials"
- Make sure you created the user in Supabase Auth dashboard
- Check that "Auto Confirm User" was enabled
- Verify the password is exactly `Test1234!`

### User profile not created
The `handle_new_user()` trigger should auto-create profiles. If not:
1. Check if the trigger exists in SQL Editor
2. Manually run the schema migration again

### Role not updating
Run the UPDATE SQL in Step 2 to fix roles.
