import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: {
    default: "MemFlip — Learn with clarity",
    template: "%s · MemFlip",
  },
  description:
    "Create focused flashcards with AI, organise your decks, and study with confidence.",
  applicationName: "MemFlip",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#6d4aff",
          borderRadius: "0.75rem",
          colorText: "#211a33",
          colorBackground: "#ffffff",
        },
        elements: {
          card: "shadow-card border border-brand-100",
          formButtonPrimary:
            "bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-500",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/icons/favicon.ico" />

          {/* Apple Touch Icon */}
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/icons/apple-touch-icon.png"
          />
        </head>

        <body className="flex min-h-svh flex-col bg-surface-subtle text-ink-900 antialiased">
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Header />
          <main id="main-content" className="flex grow flex-col">
            {children}
          </main>
          <Footer />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
