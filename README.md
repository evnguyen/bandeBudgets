# bandeBudgets

A zero-based budgeting app built with Next.js and Firebase.

## Features

- **Budget** — manage monthly income and expense categories with planned vs. spent tracking
- **AI Insights** — analyses your last 6 months of budget data and returns actionable savings advice, powered by OpenRouter
- **Settings** — theme and account preferences

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Firebase](https://firebase.google.com) — Auth and Firestore
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://zustand-demo.pmnd.rs) — client state
- [Recharts](https://recharts.org) — charts
- [OpenRouter](https://openrouter.ai) — AI model routing (free models)
- [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) — form validation

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/evnguyen/bandeBudgets.git
cd bandeBudgets
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `OPEN_ROUTER_API_KEY` | OpenRouter API key for AI Insights |
| `SITE_PASSWORD` | Site-wide access password |
| `SITE_PASSWORD_ENABLED` | Set to `false` to disable the password gate |

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).