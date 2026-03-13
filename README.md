This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# GetCracked AI Scheduler

AI-powered productivity planner that converts goals into realistic weekly schedules.

Stack:
- Next.js
- TypeScript
- Tailwind
- API routes

Future:
- OpenAI schedule generation
- Supabase persistence
- Timeline UI

# GetCracked AI Scheduler

A startup-style AI scheduling app that turns user goals into structured weekly schedules.

## Current Stack
- Next.js
- TypeScript
- Tailwind CSS

## Current Features
- Goal input form
- Hours-per-week input
- Mock backend API route
- Schedule cards UI
- Shared schedule types
- Loading state

## Current Architecture
- `app/page.tsx` = main page
- `components/` = reusable UI pieces
- `app/api/generate-schedule/route.ts` = backend route
- `types/schedule.ts` = shared schedule shape
- `lib/ai.ts` = future AI prompt logic

## Next Steps
- Add fixed commitments input
- Add energy pattern input
- Integrate OpenAI
- Save schedules to database
- Build Today / Week views