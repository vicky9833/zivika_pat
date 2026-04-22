# Deployment Checklist

## Before First Deployment

- [ ] Run `npx convex dev` to generate _generated/ folder
- [ ] Set all env vars in .env.local
- [ ] Test Google Sign In locally
- [ ] Test Email OTP locally
- [ ] Test scan flow end to end
- [ ] Add Clerk webhook in Clerk dashboard
- [ ] Set CLERK_WEBHOOK_SECRET in .env.local

## Vercel Deployment

- [ ] Push code to GitHub
- [ ] Connect GitHub repo to Vercel
- [ ] Add all env vars in Vercel dashboard
- [ ] Run `npx convex deploy` for production Convex
- [ ] Update Clerk allowed URLs with Vercel domain
- [ ] Update Clerk webhook URL with Vercel domain
- [ ] Test production deployment end to end

## Play Store (PWA)

- [ ] Verify manifest.json is accessible at /manifest.json
- [ ] Verify service worker registers in production
- [ ] Test offline functionality
- [ ] Use PWABuilder (pwabuilder.com) to generate APK
- [ ] Submit to Play Store

## Production Checklist

- [ ] Rotate Groq API key (new key from console.groq.com)
- [ ] Rotate Clerk keys (production keys from Clerk dashboard)
- [ ] Enable Convex production environment
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Test on real Android devices (Samsung, Redmi)
- [ ] Test on real iPhone (Safari PWA)
