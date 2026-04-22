"use client";

import { useEffect } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function Providers({ children }) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(console.error);
    }
  }, []);

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/auth"
      signUpUrl="/auth"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/setup"
      appearance={{
        variables: {
          colorPrimary: "#0D6E4F",
          colorBackground: "#ffffff",
          borderRadius: "12px",
        },
      }}
    >
      {convex ? (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ConvexProviderWithClerk>
      ) : (
        <LanguageProvider>
          {children}
        </LanguageProvider>
      )}
    </ClerkProvider>
  );
}

