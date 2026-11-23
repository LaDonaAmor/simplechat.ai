# SimpleChat

A small, focused AI chat app: React + Vite frontend, a single Vercel
serverless function in front of Groq, and conversations stored in the browser.

- **Live demo:** https://simplechat-aichatbot.vercel.app/
- **Logo:** `public/img/SimpleChat.jpg`

## Why

I built this to understand the whole path end to end: UI state → local
persistence → a real LLM → keeping the API key off the client. The interesting
constraints were offline-first conversations, a clean mobile layout, and a
thin serverless boundary.

## How it works

- React 19, Vite, Tailwind v4 (design tokens via `@theme`)
- Conversations persist in `localStorage` (validated on load)
- `POST /api/chat` proxies Groq; `GROQ_API_KEY` never reaches the browser
- `pnpm dev` runs the same handler locally through a dev middleware

## Decisions & tradeoffs

- **Serverless proxy over client key** — the key would otherwise ship in the JS bundle.
- **Non-streaming first** — simpler to reason about; streaming + Stop is next.
- **Ranade for type** — a deliberate choice over the default Inter/serif look.
- **Mock fallback** — if no key is configured, the API returns `not_configured`
  and the client replies from a clearly-labelled local mock.

## Getting started

```bash
pnpm install
pnpm dev
```
