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

import Sidebar from "@/components/Sidebar";
import { WorkspaceProvider } from "@/components/WorkspaceContext";

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
        <WorkspaceProvider>
          <Sidebar />
          <main className="ml-64 flex-1 min-h-screen relative overflow-x-hidden">
            {/* Global page transition wrapper */}
            <div className="animate-fade-in-up w-full h-full">
              {children}
            </div>
          </main>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
