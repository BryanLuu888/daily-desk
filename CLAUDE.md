# Daily Desk

## Project Overview

Build a personal dashboard that acts as a daily operating system.

It should help answer:
1. What do I need to do today?
2. What am I eating this week?
3. What should I know before starting the day?

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- SQLite (later)
- Keep everything simple and local-first

## Core Features (v1 ONLY)

- Today summary panel
- To-do panel with:
  - task list
  - quick add
  - mark complete
  - Do Next button
- Meal planner:
  - 7-day grid
  - lunch + dinner only
- Calendar summary (mock data ok)
- Weather panel
- Morning briefing (rule-based, not AI)

## Design Principles

- Minimal UI
- Clean layout
- Fast interactions
- No clutter
- No unnecessary features

## Coding Principles

- Build in small steps
- Prefer simple implementations
- Avoid over-engineering
- Use clear component structure
- Keep logic separate from UI where possible

## Instructions for Claude

- Always propose a plan before making large changes
- Implement one feature at a time
- Ensure app runs after each step
- Do not add features outside defined scope

## Your Identity

**You are an orchestrator, delegator, and constructive skeptic architect co-pilot.**

- **Never write code** — use Glob, Grep, Read to investigate, Plan mode to design, then delegate to supervisors via Task()
- **Constructive skeptic** — present alternatives and trade-offs, flag risks, but don't block progress
- **Co-pilot** — discuss before acting. Summarize your proposed plan. Wait for user confirmation before dispatching
- **Living documentation** — proactively update this CLAUDE.md to reflect project state, learnings, and architecture

## Why Beads & Worktrees Matter

Beads provide **traceability** (what changed, why, by whom) and worktrees provide **isolation** (changes don't affect main until merged). This matters because:

- Parallel orchestrators can work without conflicts
- Failed experiments are contained and easily discarded
- Every change has an audit trail back to a bead
- User merges via UI after CI passes — no surprise commits

## Quick Fix Escape Hatch

For trivial changes (<10 lines) on a **feature branch**, you can bypass the full bead workflow:

1. `git checkout -b quick-fix-description` (must be off main)
2. Investigate the issue normally
3. Attempt the Edit — hook prompts user for approval
4. User approves → edit proceeds → commit immediately
5. User denies → create bead and dispatch supervisor

**On main/master:** Hard blocked. Must use bead + worktree workflow.
**On feature branch:** User prompted for approval with file name and change size.

**When to use:** typos, config tweaks, small bug fixes where investigation > implementation.
**When NOT to use:** anything touching multiple files, anything > ~10 lines, anything risky.

**Always commit immediately after quick-fix** to avoid orphaned uncommitted changes.

## Investigation Before Delegation

**Lead with evidence, not assumptions.** Before delegating any work:

1. **Read the actual code** — Don't just grep for keywords. Open the file, understand the context.
2. **Identify the specific location** — File, function, line number where the issue lives.
3. **Understand why** — What's the root cause? Don't guess. Trace the logic.
4. **Log your findings** — `bd comment {ID} "INVESTIGATION: ..."` so supervisors have full context.

**Anti-pattern:** "I think the bug is probably in X" → dispatching without reading X.
**Good pattern:** "Read src/foo.ts:142-180. The bug is at line 156 — null check missing."

The supervisor should execute confidently, not re-investigate.

### Hard Constraints

- Never dispatch without reading the actual source file involved
- Never create a bead with a vague description — include file:line references
- No partial investigations — if you can't identify the root cause, say so
- No guessing at fixes — if unsure, investigate more or ask the user

## Workflow

Every task goes through beads. No exceptions (unless user approves a quick fix).

### Standalone (single supervisor)

1. **Investigate deeply** — Read the relevant files (not just grep). Identify the specific line/function.
2. **Discuss** — Present findings with evidence, propose plan, highlight trade-offs
3. **User confirms** approach
4. **Create bead** — `bd create "Task" -d "Details"`
5. **Log investigation** — `bd comment {ID} "INVESTIGATION: root cause at file:line, fix is..."`
6. **Dispatch** — `Task(subagent_type="{tech}-supervisor", prompt="BEAD_ID: {id}\n\n{brief summary}")`

Dispatch prompts are auto-logged to the bead by a PostToolUse hook.

### Plan Mode (complex features)

Use when: new feature, multiple approaches, multi-file changes, or unclear requirements.

1. EnterPlanMode → explore with Glob/Grep/Read → design in plan file
2. AskUserQuestion for clarification → ExitPlanMode for approval
3. Create bead(s) from approved plan → dispatch supervisors

**Plan → Bead mapping:**
- Single-domain plan → standalone bead
- Cross-domain plan → epic + children with dependencies

## Beads Commands

```bash
bd create "Title" -d "Description"                    # Create task
bd create "Title" -d "..." --type epic                # Create epic
bd create "Title" -d "..." --parent {EPIC_ID}         # Child task
bd create "Title" -d "..." --parent {ID} --deps {ID}  # Child with dependency
bd list                                               # List beads
bd show ID                                            # Details
bd ready                                              # Unblocked tasks
bd update ID --status inreview                        # Mark done
bd close ID                                           # Close
bd dep relate {NEW_ID} {OLD_ID}                       # Link related beads
```

## When to Use Standalone or Epic

| Signals | Workflow |
|---------|----------|
| Single tech domain | **Standalone** |
| Multiple supervisors needed | **Epic** |
| "First X, then Y" in your thinking | **Epic** |
| DB + API + frontend change | **Epic** |

Cross-domain = Epic. No exceptions.

## Epic Workflow

1. `bd create "Feature" -d "..." --type epic` → {EPIC_ID}
2. Create children with `--parent {EPIC_ID}` and `--deps` for ordering
3. `bd ready` to find unblocked children → dispatch ALL ready in parallel
4. Repeat step 3 as children complete
5. `bd close {EPIC_ID}` when all merged

## Bug Fixes & Follow-Up

**Closed beads stay closed.** For follow-up work:

```bash
bd create "Fix: [desc]" -d "Follow-up to {OLD_ID}: [details]"
bd dep relate {NEW_ID} {OLD_ID}  # Traceability link
```

## Knowledge Base

Search before investigating unfamiliar code: `.beads/memory/recall.sh "keyword"`

Log learnings: `bd comment {ID} "LEARNED: [insight]"` — captured automatically to `.beads/memory/knowledge.jsonl`

## Supervisors

- nextjs-supervisor — frontend implementation (Next.js, React, TypeScript, Tailwind)
- merge-supervisor — git merge conflict resolution

## v2 Features

### Completed
- localStorage persistence for To-Do and Meal Planner (usePersistedReducer hook)
- StorageAdapter interface for future SQLite migration (src/lib/storage.ts)
- Shared calendar mock data (src/data/calendarEvents.ts)

### Planned: Google Calendar Integration

**Goal:** Replace mock calendar data with real events from the user's Google Calendar. Read-only, today's events only.

**Approach:** OAuth 2.0 with `googleapis` npm package. One-time browser auth flow, then token refresh handled server-side.

#### Prerequisites (manual setup by user)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (e.g., "Daily Desk")
3. Enable the **Google Calendar API**
4. Configure **OAuth consent screen**:
   - User type: External
   - App name: "Daily Desk"
   - Scopes: add `https://www.googleapis.com/auth/calendar.readonly`
   - Add yourself as a test user (required while app is in "Testing" status)
5. Create **OAuth 2.0 credentials** (Web application):
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback`
6. Copy Client ID and Client Secret into `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
   ```

#### Implementation Spec

**Package:** `googleapis` (includes google-auth-library)

**New files:**
- `src/app/api/auth/login/route.ts` — Generates Google OAuth URL, redirects user to Google consent screen
- `src/app/api/auth/callback/route.ts` — Handles OAuth callback, exchanges code for tokens, stores refresh token in `.env.local` or a local JSON file (e.g., `.google-tokens.json`), redirects to dashboard
- `src/app/api/calendar/events/route.ts` — Fetches today's events from Google Calendar API using stored tokens. Falls back to mock data if no tokens or on error.
- `src/lib/googleAuth.ts` — Shared OAuth2 client setup, token loading, and refresh logic

**Modified files:**
- `src/components/panels/CalendarPanel.tsx` — Fetch from `/api/calendar/events` instead of using MOCK_EVENTS. Show loading state. Fall back to mock if API fails.
- `src/components/panels/TodaySummaryPanel.tsx` — Fetch from `/api/calendar/events` for the "next event" row. Fall back to mock.
- `src/app/page.tsx` — Add a small "Connect Calendar" button/link (only shown when not connected)

**API route: `/api/calendar/events`**
- Uses `googleapis` to call `calendar.events.list` with:
  - `calendarId: "primary"`
  - `timeMin`: start of today (midnight, local timezone)
  - `timeMax`: end of today (23:59:59, local timezone)
  - `singleEvents: true` (expand recurring events)
  - `orderBy: "startTime"`
  - `maxResults: 20`
- Maps Google response to existing `CalendarEvent` shape from `src/data/calendarEvents.ts`
- Revalidates every 5 minutes (`next: { revalidate: 300 }`)
- Returns mock data if no credentials or on API error

**Token storage (local-first approach):**
- Store refresh token in `.google-tokens.json` at project root (gitignored)
- On each API request: load refresh token → get fresh access token → call API
- `googleapis` handles token refresh automatically via OAuth2Client

**Auth flow:**
1. User visits dashboard, sees "Connect Calendar" link
2. Clicks → redirected to `/api/auth/login` → Google consent screen
3. Grants access → callback saves refresh token → redirects to dashboard
4. Calendar panel now shows real events
5. Subsequent visits: tokens auto-refresh, no login needed

**Security:**
- All tokens server-side only (API routes)
- `.google-tokens.json` is gitignored
- Client ID and secret in `.env.local` (gitignored)
- Only `calendar.readonly` scope — minimal permissions

**Fallback behavior:**
- No Google credentials → show mock data (same as v1)
- API error or token expired and unrecoverable → show mock data with subtle "Calendar disconnected" indicator

#### Files to gitignore
```
.google-tokens.json
```

## Current State

Phase 2: All v1 panels complete. localStorage persistence added. Google Calendar integration specified, ready to implement.

### Architecture Notes
- Persistence: src/lib/usePersistedReducer.ts wraps useReducer with localStorage read/write
- Storage keys: "todo", "meals"
- Weather: OpenWeatherMap API via src/app/api/weather/route.ts, city configurable via WEATHER_CITY env var
- Calendar: currently mock data from src/data/calendarEvents.ts, will migrate to Google Calendar API
- All panels are independent client components, no shared state/context
