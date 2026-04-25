import { Outfit, DM_Sans, Noto_Sans_Devanagari, Noto_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/shared/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

// Generic Noto Sans — covers Latin + Devanagari; CSS @import covers other Indian scripts
const notoSans = Noto_Sans({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://care.zivikalabs.com"),

  title: {
    default: "Zivika Labs — India's Intelligent Health OS",
    template: "%s | Zivika Labs",
  },

  description: "Zivika Labs is India's AI-powered personal health companion. Scan medical reports, track vitals, manage medications, and get personalized health guidance in Hindi, Kannada, Tamil, Telugu, Bengali and Marathi. DPDP Act 2023 compliant.",

  keywords: [
    "health app India",
    "AI health assistant India",
    "medical report scanner",
    "health records India",
    "medication tracker India",
    "vitals tracker",
    "AI doctor India",
    "health companion India",
    "digital health India",
    "ABHA health ID",
    "telemedicine India",
    "health OS India",
    "Zivika Labs",
    "स्वास्थ्य ऐप",
    "ಆರೋಗ್ಯ ಅಪ್ಲಿಕೇಶನ್",
    "health tracking app",
    "BMI calculator India",
    "blood pressure tracker",
    "diabetes management app India",
  ],

  authors: [
    { name: "Zivika Labs", url: "https://care.zivikalabs.com" },
  ],

  creator: "Zivika Labs Pvt Ltd",
  publisher: "Zivika Labs Pvt Ltd",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN", "kn_IN", "ta_IN", "te_IN"],
    url: "https://care.zivikalabs.com",
    siteName: "Zivika Labs",
    title: "Zivika Labs — India's Intelligent Health OS",
    description: "AI-powered personal health companion for India. Scan reports, track vitals, manage medications in your language.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zivika Labs — India's Intelligent Health OS",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Zivika Labs — India's Intelligent Health OS",
    description: "AI health companion for India. Scan reports, track vitals, get guidance in Hindi, Kannada, Tamil and more.",
    images: ["/og-image.png"],
    creator: "@zivikalabs",
    site: "@zivikalabs",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180" },
    ],
  },

  alternates: {
    canonical: "https://care.zivikalabs.com",
    languages: {
      "en-IN": "https://care.zivikalabs.com",
      "hi-IN": "https://care.zivikalabs.com",
    },
  },

  verification: {
    google: "add-your-google-search-console-verification-here",
  },

  category: "health",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D6E4F",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable} ${notoDevanagari.variable} ${notoSans.variable}`}>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#111111" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebApplication",
                  "@id": "https://care.zivikalabs.com/#app",
                  "name": "Zivika Labs",
                  "alternateName": "Zivika Health",
                  "url": "https://care.zivikalabs.com",
                  "description": "India's AI-powered personal health OS for managing medical reports, vitals, medications and getting health guidance in Indian languages.",
                  "applicationCategory": "HealthApplication",
                  "operatingSystem": "iOS, Android, Web",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "INR",
                  },
                  "featureList": [
                    "AI Medical Report Scanner",
                    "Personal Health Copilot",
                    "Medication Tracker",
                    "Vitals Monitor",
                    "Health Records Locker",
                    "Digital Health Twin",
                    "Multi-language Support",
                    "Voice Health Assistant",
                  ],
                  "inLanguage": [
                    "en-IN", "hi-IN", "kn-IN",
                    "ta-IN", "te-IN", "bn-IN", "mr-IN",
                  ],
                  "availableLanguage": [
                    "English", "Hindi", "Kannada",
                    "Tamil", "Telugu", "Bengali", "Marathi",
                  ],
                },
                {
                  "@type": "Organization",
                  "@id": "https://care.zivikalabs.com/#org",
                  "name": "Zivika Labs Pvt Ltd",
                  "url": "https://care.zivikalabs.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://care.zivikalabs.com/logo.png",
                  },
                  "foundingDate": "2026",
                  "foundingLocation": {
                    "@type": "Place",
                    "name": "Bengaluru, Karnataka, India",
                  },
                  "areaServed": "India",
                  "sameAs": [
                    "https://www.linkedin.com/company/zivikalabs",
                    "https://twitter.com/zivikalabs",
                  ],
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "What is Zivika Labs?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Zivika Labs is India's intelligent health OS — an AI-powered app that helps you scan medical reports, track vitals, manage medications, and get personalized health guidance in Hindi, Kannada, Tamil, Telugu, Bengali and Marathi.",
                      },
                    },
                    {
                      "@type": "Question",
                      "name": "Is Zivika Labs free to use?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, Zivika Labs is free to use. You can scan reports, track vitals, manage medications and chat with the AI health copilot at no cost.",
                      },
                    },
                    {
                      "@type": "Question",
                      "name": "Is my health data safe on Zivika Labs?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes. Zivika Labs is fully compliant with India's Digital Personal Data Protection Act 2023 (DPDP Act). Your health data is encrypted, never sold to third parties, and you can request deletion at any time.",
                      },
                    },
                    {
                      "@type": "Question",
                      "name": "Can Zivika Labs replace my doctor?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "No. Zivika Labs is a health companion, not a medical device or replacement for professional medical advice. Always consult a qualified doctor for diagnosis and treatment. For emergencies, call 108.",
                      },
                    },
                    {
                      "@type": "Question",
                      "name": "Which languages does Zivika Labs support?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Zivika Labs supports English, Hindi, Kannada, Tamil, Telugu, Bengali, and Marathi. You can chat with the AI health copilot in your preferred language.",
                      },
                    },
                    {
                      "@type": "Question",
                      "name": "How does the medical report scanner work?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Simply take a photo of any medical report — lab test, prescription, or discharge summary. Zivika's AI extracts all test values, explains what they mean in simple language, and saves the report to your secure health locker.",
                      },
                    },
                  ],
                },
                {
                  "@type": "MedicalWebPage",
                  "name": "Zivika Labs Health Platform",
                  "url": "https://care.zivikalabs.com",
                  "medicalAudience": {
                    "@type": "MedicalAudience",
                    "audienceType": "Patient",
                  },
                  "about": {
                    "@type": "MedicalCondition",
                    "name": "General Health Management",
                  },
                  "countryOfOrigin": {
                    "@type": "Country",
                    "name": "India",
                  },
                },
              ],
            }),
          }}
        />
        {/* 390px phone-frame container — dark body visible on desktop */}
        <Providers>
          <div className="app-container">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
