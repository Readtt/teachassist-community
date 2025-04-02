import "~/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";
import { Fragment } from "react";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "Teachassist Community",
  description:
    "Track your grades, view class averages, and compare your performance with other students - all in one place.",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.className}`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Fragment>
            {children} <Toaster />
          </Fragment>
        </ThemeProvider>
      </body>
    </html>
  );
}
