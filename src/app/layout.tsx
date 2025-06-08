import type { Metadata } from "next";
import { Geist, Geist_Mono, Autour_One } from "next/font/google"; // Import Autour_One
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const autourOne = Autour_One({ // Initialize Autour_One
  variable: "--font-autour-one",
  weight: "400", // Autour One typically has a regular 400 weight
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Cormac's Star Chart",
  description: "A fun star chart to track daily tasks and earn rewards!",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${autourOne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
