# Barra — Calisthenics Skill-Tree App

A gamified iOS calisthenics app that guides you from your current pull-up level to a muscle-up through a 7-node skill tree. Built with Expo (React Native). No backend — all data lives on-device.

---

## Prerequisites

- **Node.js** v18 or later
- **pnpm** — `npm install -g pnpm`
- **Expo Go** on your iPhone — [download from the App Store](https://apps.apple.com/app/expo-go/id982107779)

---

## Running locally

### 1. Install dependencies

From the repo root:

```bash
pnpm install
```

### 2. Start the dev server

```bash
cd artifacts/mobile
pnpm dev
```

This starts the Metro bundler and opens an ngrok tunnel so your phone can reach it. A QR code will appear in the terminal.

### 3. Connect your phone

Open the **Camera app** on your iPhone and scan the QR code. It will prompt you to open Expo Go. Your app will load in a few seconds.

---

## Stable URL (recommended — prevents progress loss)

By default, ngrok assigns a random URL each time the dev server starts. When the URL changes, Expo Go treats it as a new app and **your progress resets**.

To fix this, copy `.env.example` to `.env` and fill in your ngrok credentials:

```bash
cp .env.example .env
```

```ini
# .env
NGROK_AUTHTOKEN=your_authtoken_here
NGROK_STATIC_DOMAIN=your-domain.ngrok-free.app
```

How to get these values:

1. Create a free account at [ngrok.com](https://ngrok.com)
2. Copy your **Authtoken** from the [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Claim your free **Static Domain** at [ngrok dashboard → Domains](https://dashboard.ngrok.com/cloud-edge/domains)

The dev server loads `.env` automatically — no extra steps needed. With a static domain the QR code URL never changes between restarts and your progress persists.

---

## Project structure

```
artifacts/mobile/
├── app/                  # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx     # Path / skill-tree screen
│   │   └── progress.tsx  # Progress & history screen
│   ├── workout/
│   │   ├── [id].tsx      # Active workout screen
│   │   └── complete.tsx  # Workout complete screen
│   └── onboarding.tsx    # First-launch onboarding
├── constants/
│   ├── track.ts          # All skill-tree nodes, lessons & exercises
│   └── demos.ts          # YouTube demo links per exercise
├── context/
│   └── AppContext.tsx    # Global state + AsyncStorage persistence
└── components/           # Shared UI components
```

---

## Making changes

- **Edit the workout plan** — `constants/track.ts` contains every node, lesson, and exercise. The progression is fully defined there.
- **Typecheck** — `pnpm typecheck` from the `artifacts/mobile` directory.
- After saving a file, Expo Go reloads the app automatically (Fast Refresh).
