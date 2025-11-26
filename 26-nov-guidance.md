# Kat Onboarding Customization – Implementation Guide

Goal:  
Keep **all existing animations, transitions, and layout structure**, but customize the onboarding flow for **The Leadership Development App** using Kat’s branding, language, and logo.

We’ll work **screen by screen**, in phases, so changes stay controlled and easy to test.

Logo file: `kat-logo.png` (in project folder – spelled with a “k”).  
Primary accent color: **burgundy / dark red** (use a single token, e.g. `#8B1E3F`).  
Background: keep soft white / light neutral as in template.

---

## Phase 0 – Prep

1. **Add design tokens / variables**
   - Create or update a theme file / Tailwind config with:
     - `--accent: #8B1E3F;` (or Tailwind color `accent` mapped to this hex)
     - Keep existing neutrals and background colors as-is.
   - Replace usages of the current pink accent with the new `accent` color.
   - Do **not** change spacing, border-radius, shadows, or animation timings.

2. **Add logo asset**
   - Ensure `kat-logo.png` is imported once in a shared component (e.g. `Logo.tsx`) so we can reuse it across screens.
   - Logo should render at a modest size (not huge), probably 64–96px width, centered.

3. **Preserve animations**
   - Do **not** remove or modify:
     - Page transition components (e.g. Framer Motion wrappers).
     - Button hover / tap animations.
     - Progress / step indicator animations.
   - Only adjust text, labels, icons, and accent colors.

Once Phase 0 is done, the app should **look the same**, just with burgundy accents and a reusable Kat logo component.

---

## Phase 1 – Login Screen (`/` or `/sign-in`)

**Goal:**  
Make this feel like the entry point to *The Leadership Development App* while keeping the existing card layout and animations.

### 1. Content changes

Current: “Sign In”, generic icon.

Update to:

- **Title text**:  
  `Sign in to The Leadership Development App`
- Optionally add a short subheading under the title:
  - `A calm space to reflect, grow, and practice better leadership every week.`

- Keep the **Email** and **Password** inputs as-is.
- Button label:
  - `Sign In` (instead of “Login”, if you prefer; either is fine, just be consistent.)

- Footer text:
  - `New here? Create an account`  
    (replaces “Forgot password? or Sign up” if that’s currently there; we can still keep “Forgot password?” as a separate link if it already exists.)

### 2. Logo placement

- Replace the generic user icon at the top of the card with `kat-logo.png`.
- Center the logo above the title.
- Keep existing animation (fade-in / float) on this icon if present.

### 3. Styling tweaks

- Change any pink accents (button text, focus rings, dots) to the new burgundy accent token.
- Keep background, card shadow, typography scale, and layout unchanged.

**Implementation notes:**

- Only touch the **text content**, the **icon component**, and **accent color classes**.
- Do not change the underlying form behavior or routing.

---

## Phase 2 – Onboarding Stepper Screen (`/onboarding`)

**Goal:**  
Frame the onboarding steps in Kat’s language: Development Theme → Envision Progress → Translate to Actions.

Current: “Account created”, “Profile setup ready”, etc.

### 1. Text content

- **Title:**  
  `Welcome, [First name]!`
  - If first name isn’t available yet, use: `Welcome!`

- **Subtitle:**  
  `Let’s set up your leadership development journey.`

- Checklist items (keep same visual style):

  1. `Choose your development theme`
  2. `Envision what progress looks like`
  3. `Translate your theme into weekly actions`

- Button label:
  - `Begin →` instead of “Continue →” (optional, but feels more intentional).

### 2. Styling

- Keep all animations (check icons lighting up, etc.).
- Change any pink dots / icons to the burgundy accent.
- If there’s an icon at the top (e.g., a checkmark), you can:
  - Keep it, but recolor to burgundy, **or**
  - Swap it for the logo (optional; login already uses logo, so this is not mandatory).

**Implementation notes:**

- This screen remains purely informational; we don’t add new logic.
- Only text + colors change.

---

## Phase 3 – Development Theme Selection (formerly `/job-role`)

**Goal:**  
Turn the “What is your job role?” grid into **“What leadership theme are you focusing on?”** using Kat’s examples.

### 1. Title + subtitle

- **Title:**  
  `What leadership theme are you focusing on?`

- **Subtitle:**  
  `Choose one or write your own — this is your next edge as a leader.`

### 2. Card options

Replace existing job-role cards with leadership themes. Keep the same card layout and hover animations.

Suggested options:

1. `Delegating more effectively`
2. `Listening with presence`
3. `Staying calm under pressure`
4. `Balancing work and family`
5. `Acting more strategically`
6. `Building trust with my team`
7. `Managing overwhelm`
8. `Clarifying priorities`
9. `Setting healthy boundaries`
10. `Other (write my own)`

Implementation details:

- “Other” should either:
  - Open a small modal / inline textarea, **or**
  - Navigate to the next step where they can type their custom theme.

We don’t have to wire a full form; for the demo, it’s enough that clicking “Other” visually selects it.

### 3. Buttons & navigation

- Keep the same “Continue” button at the bottom.
- Ensure the selected card still shows an active state (border or background) using the burgundy accent.

**Implementation notes:**

- No changes to grid structure, card components, or animations.  
- Only text labels + accent colors + optional behavior for “Other”.

---

## Phase 4 – Envision Progress Screen (formerly `/company-info`)

**Goal:**  
Replace the company-type/size UI with a single reflective question: **What does progress look like?**

### 1. Title + subtitle

- **Title:**  
  `What does progress look like for you?`

- **Subtitle:**  
  `Describe what success feels like when you imagine future progress.`

(This mirrors her neuroscience language.)

### 2. Main input

Replace the multi-button + slider UI with a **single large text area**:

- Placeholder example:
  - `For example: “I communicate clearly in meetings, my team knows what to focus on, and I feel less rushed.”`

If the template structure makes it easier, you can keep one or two “pill” elements above the textarea (purely decorative), but they should not represent company types anymore.

### 3. Controls

- Keep / reuse the “Go back” button in the bottom-left if present.
- Keep the “Continue →” button in the bottom-right.
- Both buttons should use the new accent color where applicable.

**Implementation notes:**

- Remove or neutralize previous company-type buttons and slider.
- Keep overall card layout, shadows, and animations intact.

---

## Phase 5 – Final Onboarding Screen (`/welcome`)

**Goal:**  
Confirm that the theme + progress reflection are set, and point toward the next step: translating into actions.

### 1. Title + subtitle

- **Title:**  
  `You’re ready to begin.`

- **Subtitle:**  
  `We’ll use your development theme and vision of progress to help you design small weekly actions.`

Alternatively, you can personalize:

- `Great work, [First name]. Your development theme is set.`

### 2. Tag summary (optional)

If the template currently shows selected tags like “Consultant / Tech Startup / 11–50 people”, repurpose them:

- Replace tags with:
  - `Your theme: [selected theme or “Custom theme”]`
  - `Next step: Weekly actions`
  - `Reminder: Monday nudges (optional)`

For the demo, these can be static placeholder chips; no need to fetch real values.

### 3. Button

- Button label:  
  `Enter the app` **or** `Proceed to your dashboard`

You don’t need to show the actual dashboard in the demo; clicking this can either:
- Navigate to an empty `/dashboard` route, or  
- Stay on this screen; for Loom you’ll just narrate what would happen next.

**Implementation notes:**

- Keep the existing animation on this final step (fade-in, floating card, etc.).
- Make sure accent color is burgundy.

---

## Phase 6 – Optional: Reminder Toggle (if time allows)

If there’s an easy place (either on the progress screen or final screen) to add a simple toggle, do it:

- Label:  
  `Receive a short leadership nudge every Monday morning`
- Control:  
  A simple on/off switch defaulted to “On”.

This does **not** need to be wired to any backend for the demo; it’s purely visual to show we’ve thought about her nudge concept.

---

## Phase 7 – Sanity Check

Before finishing:

1. **Run through the full flow:**
   - Sign In (visual only) → Onboarding checklist → Leadership Theme → Progress Reflection → Final screen.
2. Verify:
   - No leftover copy about “job role”, “company size”, “startup”, “agency”, etc.
   - All pink accents are now burgundy.
   - Logo appears cleanly on the login screen.
   - Animations and transitions feel as snappy as the original template.
3. Keep code changes localized:
   - Avoid refactoring components during this pass.
   - Focus only on copy, accent colors, and minor structural swaps (e.g., buttons → textarea).

---

## Summary for Claude

1. **Do not alter the core animations, transitions, or layout components.**
2. **Change accent color** from pink to burgundy using a single theme variable.
3. **Replace all copy** with the leadership-development language described above.
4. **Replace role / company selection screens** with:
   - Development theme selection (card grid).
   - Progress reflection (textarea).
5. **Add the logo** on the login screen and recolor icons.
6. Keep everything simple, calm, and aligned with a leadership coaching experience for execs 40+.

Work screen-by-screen, commit after each phase, and verify visually before moving on.