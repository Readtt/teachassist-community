import "~/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import { Fragment } from "react";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { env } from "~/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.BETTER_AUTH_URL),
  title: "Teachassist Community",
  description:
    "Track your grades, view class averages, and compare your performance with other students - all in one place.",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16" },
    { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32" },

    { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192" },
    { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512" },

    { rel: "icon", url: "/apple-touch-icon.png", sizes: "180x180" },
  ],
  openGraph: {
    title: "Teachassist Community",
    description:
      "Track your grades, view class averages, and compare your performance with other students - all in one place.",
    url: env.BETTER_AUTH_URL,
    type: "website",
    locale: "en_US",
    siteName: "Teachassist Community",
    images: [
      {
        url: "opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Teachassist Community Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teachassist Community",
    description:
      "Track your grades, view class averages, and compare your performance with other students - all in one place.",
    images: ["opengraph-image.png"],
  },
  keywords: [
    "Teachassist",
    "student grade tracker",
    "class averages",
    "school performance",
    "compare grades",
    "high school dashboard",
    "educational analytics",
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
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
        <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Fragment>
              {children} <Toaster />
              {env.NODE_ENV === "production" && (
                <Script
                  async
                  defer
                  src="https://cloud.umami.is/script.js"
                  data-website-id="453c6655-15c5-4fba-b862-3009cc69fd0c"
                />
              )}
            </Fragment>
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
