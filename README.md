# Base Sign In Demo

A Next.js application demonstrating Base authentication with:
- Sign in with Base button using the prebuilt UI component from the SDK
- Custom sign in with Base button using manual implementation
- Next.js Edge function to verify signatures on the backend

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Prebuilt UI Component**: Uses `SignInWithBaseButton` from `@base-org/account-ui/react`
- **Custom Implementation**: Manual sign-in button with custom styling
- **Backend Verification**: Edge function at `/api/verify` that verifies signatures using Viem

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Base Account SDK (`@base-org/account`)
- Base Account UI (`@base-org/account-ui`)
- Viem for signature verification
