import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IoT Management Console",
  description:
    "Control, monitor, and analyze connected appliances in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-950 text-slate-50 antialiased`}
      >
        {/* Client providers wrap the app for auth, React Query, and sockets while keeping this layout server-side */}
        <AppProviders>
          <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(71,85,105,0.35),_transparent_35%),radial-gradient(circle_at_20%_20%,_rgba(94,234,212,0.12),_transparent_28%),linear-gradient(120deg,_rgba(148,163,184,0.18),_rgba(15,23,42,0.85))]">
            <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen" />
            <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">{children}</div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
