import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BayLeague | Professional Tournament Management",
  description: "Live football tournament tracking and management system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-[#800020] selection:text-white`}>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen bg-[#0B0B0B] text-white">
              <Navbar />
              <main>{children}</main>
            </div>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
