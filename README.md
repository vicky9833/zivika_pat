# Zivika Labs — India's Intelligent Health OS

A mobile-first Progressive Web App for personal health management. Scan reports, track vitals, manage medications, and get intelligent health guidance.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS v4, Framer Motion
- **Database**: Convex (real-time, serverless)
- **Auth**: Clerk (Google + Email OTP)
- **AI**: Groq (Llama 3.1, 10-model fallback)
- **Hosting**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Convex account (convex.dev)
- Clerk account (clerk.com)
- Groq API key (console.groq.com)

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

3. Create `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   GROQ_API_KEY=your_groq_key
   ```

4. Start Convex (keep running in separate terminal):
   ```
   npx convex dev
   ```

5. Run the app:
   ```
   npm run dev
   ```

6. Open http://localhost:3000

### Deployment

Push to GitHub, connect to Vercel, add environment variables in Vercel dashboard.

Set Convex deployment URL to production:
```
npx convex deploy
```

## Project Structure

```
src/app/          — Next.js App Router pages (20 routes)
src/components/   — Reusable UI components
src/lib/          — Stores, hooks, utilities
convex/           — Backend functions and schema
```

## Features

- Scan any medical report — AI extracts and structures data
- Health Locker — secure storage for all records
- Health Copilot — intelligent health assistant
- Digital Twin — health score and predictions
- Medication tracker with adherence calendar
- Vitals monitoring with trend charts
- Family health management
- Multilingual responses (7 Indian languages)

## License

Private — Zivika Labs Pvt Ltd

# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
