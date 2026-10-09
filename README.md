# GetCracked AI Scheduler

A Next.js scheduling workspace that turns a goal, a weekly time budget, fixed commitments, and a preferred focus time into a Gemini-generated plan.

## Run locally

```sh
npm ci
```

Create `.env.local` in this directory with your own key:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
```

```sh
npm run dev
```

Open http://localhost:3000. The interface works without a key using a clearly labeled example schedule; generating a personal plan requires the key. Environment files are ignored by Git.

## Interface

- Dark three-column workspace with a mini calendar and activity filters.
- Day, week, and month views with date navigation and a Today shortcut.
- Click any session for its full title, day, time, and activity category.
- The Tasks view lists every returned session, including any with times that cannot be placed on the calendar.
- Open the weekly planner with a + button; all four planning inputs still feed the Gemini endpoint.
- The chat-style assistant summarizes the selected day and finds free blocks of a requested duration. These helpers run locally; Gemini is used for generating weekly plans.
- Reminders support titles, optional due dates, editing, completion, deletion, and undo. They persist in browser local storage; due dates do not trigger system notifications.
- Home summarizes today’s sessions; Tasks lists scheduled sessions. Notes and Projects are omitted.
- Keyboard shortcuts: Ctrl/Cmd+B toggles the sidebar; Ctrl/Cmd+Shift+P opens the planner.
- Mobile navigation and assistant drawers keep the calendar usable on small screens.
- Request failures preserve the current plan and show an inline retry message.

Schedules are held in page state, not persisted. Refreshing restores the example schedule. Generated weekday names are anchored to the Monday–Sunday week in which generation completes, using the browser's local time zone. The initial example contains sessions for today only.

## Structure

- `app/page.tsx`: workspace state, navigation, generation request, and assistant panel.
- `components/Calendar.tsx`: day/week timeline, month grid, and event blocks.
- `components/GoalForm.tsx`: accessible, validated planning form.
- `components/Assistant.tsx`: schedule summaries, available-time queries, and planner entry points.
- `components/Reminders.tsx`: reminder CRUD, filtering, due dates, and browser persistence.
- `lib/reminders.ts`: reminder validation and sorting.
- `components/Icon.tsx`: shared SVG icons.
- `lib/calendar.ts`: date/time helpers, response validation, categories, and example data.
- `lib/ai.ts`: server-side Gemini call and structured response schema.
- `app/api/generate-schedule/route.ts`: existing POST endpoint.
- `types/schedule.ts`: shared schedule model.
- `app/globals.css`: theme, layouts, responsive styles, and interaction states.

## Checks

```sh
npm run lint
npm run build
```

Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, and `@google/genai`. The model is `gemini-2.5-flash`. No database or authentication service is required.
