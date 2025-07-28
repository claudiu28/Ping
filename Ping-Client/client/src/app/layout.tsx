import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { WebSocketProvider } from "./context/WebSocketContext";

export const metadata: Metadata = {
  title: "Ping",
  description: "Ping is a social media app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Ping</title>
        </head>
        <body>
          <WebSocketProvider>
            <ThemeProvider attribute="class" defaultTheme="dark">
              {children}
            </ThemeProvider>
          </WebSocketProvider>
        </body>
      </html>
    </>
  );
}
