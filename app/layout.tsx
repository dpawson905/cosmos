import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/SidebarContext";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import ThemeFAB from "@/components/ThemeFAB";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COSMOS — Explore Space with NASA",
  description:
    "A space-themed website featuring NASA imagery, Mars Rover photos, Earth views, and asteroid tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-base-100 text-base-content">
        <SidebarProvider>
          <Sidebar />
          <MainContent>{children}</MainContent>
          <ThemeFAB />
        </SidebarProvider>
      </body>
    </html>
  );
}
