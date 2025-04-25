import { Outfit } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/context/ThemeContext";
import ThemeWrapper from "./ThemeWrapper";
// import { getMuiTheme } from "@/hooks/muiTheme";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});


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
