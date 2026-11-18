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

Without `VITE_OPENAI_API_KEY` the app uses built-in mock replies.
WARNING: `VITE_*` variables are public in the browser bundle. Use a
server-side proxy for real API keys.

## License

TechNurse
MIT
