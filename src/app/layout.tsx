import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { type Metadata } from "next";
import { Poppins } from "next/font/google";
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
  icons: [{ rel: "icon", url: "/favicon.png" }],
  openGraph: {
    title: "Teachassist Community",
    description:
      "Track your grades, view class averages, and compare your performance with other students - all in one place.",
    url: env.BETTER_AUTH_URL,
    type: "website",
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
              {children} <Toaster /> <Analytics />
            </Fragment>
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
