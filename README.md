# SimpleChat — AI Chatbot

A simple AI chatbot built with React, TypeScript, Tailwind CSS and Vite.

## Features

- Default welcome conversation
- Send messages and get AI replies (mock responses by default)
- Create conversations; the title becomes your first question
- Rename and delete conversations
- Conversations persist in localStorage
- Responsive layout with a mobile sidebar

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS v4

## Getting Started

pnpm install
pnpm dev # start dev server
pnpm build # production build -> dist/
pnpm preview # preview build
pnpm lint

## AI API

The app talks to `/api/chat`, a Vercel serverless function (`api/chat.ts`)
that calls OpenAI. The API key lives only on the server.

- No `OPENAI_API_KEY` set → the app uses built-in mock replies.
- Local `pnpm dev` → mock (Vite doesn't run the function).
- Local full-stack → `pnpm dlx vercel dev` (runs `api/` functions).
- Deployed on Vercel → real API when `OPENAI_API_KEY` is configured.

### Configure the real API

1. Vercel → Project → Settings → Environment Variables
2. Add `OPENAI_API_KEY` (Production, Preview, Development)
3. Redeploy (env changes need a new deployment)

Never prefix the key with `VITE_` — that exposes it to the browser.

## License

TechNurse
MIT
