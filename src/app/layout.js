import { Outfit, DM_Sans, Noto_Sans_Devanagari } from "next/font/google";
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

export const metadata = {
  title: "India's Intelligent Health OS | Zivika Labs",
  description:
    "Zivika Labs helps you digitize medical reports, manage medications, track vitals, and get AI-powered health insights — all in one secure place.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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
    <html lang="en" className={`${outfit.variable} ${dmSans.variable} ${notoDevanagari.variable}`}>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#111111" }}>
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
