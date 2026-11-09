import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0B0C10",
};

export const metadata: Metadata = {
  title: "SIEP E-Bike | Riders Bay",
  description: "Smart Scrambler E-Bike by SNJB's KBJ College of Engineering. Engineering the next ride.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIEP Riders Bay",
  },
};

import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/context/AuthContext";
import { PwaInstallProvider } from "@/components/PwaInstallProvider";
import { BackgroundSyncProvider } from "@/components/BackgroundSyncProvider";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-alice-blue text-jet-black">
        <AuthProvider>
          <BackgroundSyncProvider>
            <PwaInstallProvider>
              <Navigation />
              {children}
            </PwaInstallProvider>
          </BackgroundSyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
