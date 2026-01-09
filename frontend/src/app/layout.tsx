import type { Metadata } from "next";
import "./globals.css";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";
import { Space_Grotesk, Roboto, Merriweather } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300","400", "500", "700"],
  variable: "--font-heading",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-accent",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Todo App | Organize Your Life",
  description: "The most intuitive task management application for high-performance teams and individuals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${roboto.variable} ${merriweather.variable}`}>
      <body className="font-body antialiased">
        <ThemeProvider>
          <ConditionalNavbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
