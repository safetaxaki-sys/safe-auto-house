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

export const metadata: Metadata = {
  metadataBase: new URL("https://safeautohouse.com"),
  title: {
    default: "Safe Auto-House | Οδηγοί ταξί και διαχείριση στόλου",
    template: "%s | Safe Auto-House",
  },
  description:
    "Safe Auto-House για οδηγούς ταξί, ενοικίαση ταξί, βάρδιες, έσοδα, κρατήσεις και καθαρή οικονομική εικόνα.",
  keywords: [
    "ταξί",
    "οδηγός ταξί",
    "ενοικίαση ταξί",
    "θέσεις οδηγών ταξί",
    "συνεργασία οδηγών ταξί",
    "διαχείριση στόλου ταξί",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Safe Auto-House | Οδηγοί ταξί και διαχείριση στόλου",
    description:
      "Οργανωμένη εφαρμογή για οδηγούς ταξί με έσοδα, κρατήσεις, βάρδιες και admin portal.",
    url: "/",
    siteName: "Safe Auto-House",
    locale: "el_GR",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Safe Auto-House" }],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Safe Auto-House",
  },
};

export const viewport: Viewport = {
  themeColor: "#E8B858",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="el"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function () {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
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

export const metadata: Metadata = {
  title: "Safe Auto-House Portal",
  description: "Portal οδηγών και διαχείρισης στόλου Safe Auto-House.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Safe Auto-House",
  },
};

export const viewport: Viewport = {
  themeColor: "#E8B858",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="el"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function () {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
