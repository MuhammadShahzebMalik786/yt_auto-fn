import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Atlas | Automated Channel Manager",
  description: "Intelligent YouTube channel automation and management platform",
};

import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex text-gray-200" suppressHydrationWarning>
        {/* AuthGuard installs the fetch interceptor and blocks rendering until a
            session token exists, so no page can fire an unauthenticated request. */}
        <AuthGuard>
          <AppShell>{children}</AppShell>
        </AuthGuard>
      </body>
    </html>
  );
}
