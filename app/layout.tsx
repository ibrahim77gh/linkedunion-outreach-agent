import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import the new MainNav client component
import { MainNav } from "@/components/MainNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata can stay here because layout.tsx is a Server Component
export const metadata: Metadata = {
  title: "LinkedUnion - Lead Generation for Unions",
  description: "LinkedUnion - Lead Generation for Unions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <MainNav />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        {/* <Toaster /> */}
      </body>
    </html>
  );
}