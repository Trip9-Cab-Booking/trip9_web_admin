import { Outfit } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/context/ThemeContext";
import ThemeWrapper from "./ThemeWrapper";
import { Metadata } from "next";
// import { getMuiTheme } from "@/hooks/muiTheme";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 main layout for Dashboard",
  };


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} dark:bg-gray-900`}>
        <ThemeProvider>
          <ThemeWrapper>{children}</ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
