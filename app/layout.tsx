import type { Metadata } from "next";
import { Suspense } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sileo";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PageLoader } from "@/components/site/PageLoader";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YRRG CMS",
  description: "Custom CMS built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans flex flex-col antialiased overflow-x-hidden overflow-y-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-center" theme="dark" options={{ fill: "#313131" }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
