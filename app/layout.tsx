import type { Metadata } from "next";
import "./globals.css";
import { Inter, Roboto } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const robotoHeading = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dse-filter.1mt2.workers.dev"),
  title: {
    default: "DSE Filter — Dhaka Stock Exchange Screener & Stock Analytics",
    template: "%s | DSE Filter",
  },
  description:
    "Mobile-first Dhaka Stock Exchange (DSE) stock screener and fundamental research tool. Filter 395+ listed stocks by P/E, Dividend Yield, P/B, NAV, EPS, DSES Sharia compliance, and multi-year audited financials.",
  keywords: [
    "DSE",
    "Dhaka Stock Exchange",
    "DSE Stock Screener",
    "Bangladesh Stock Market",
    "DSES Sharia Stocks",
    "DSE Share Price",
    "P/E Ratio DSE",
    "High Dividend Stocks Bangladesh",
    "Fundamental Analysis DSE",
  ],
  authors: [{ name: "DSE Filter" }],
  creator: "DSE Filter",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dse-filter.1mt2.workers.dev",
    title: "DSE Filter — Dhaka Stock Exchange Screener & Stock Analytics",
    description:
      "Advanced, mobile-first Dhaka Stock Exchange screener with DSES Sharia filters, fundamental valuation metrics, multi-year audited financials, and shareholding breakdowns.",
    siteName: "DSE Filter",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSE Filter — Dhaka Stock Exchange Screener & Stock Analytics",
    description:
      "Advanced, mobile-first Dhaka Stock Exchange screener with DSES Sharia filters, fundamental valuation metrics, and shareholding breakdowns.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", inter.variable, robotoHeading.variable)}
    >
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7QDDZTRM4F"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-7QDDZTRM4F');
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Navbar />
            <div className="flex-1 w-full">{children}</div>
            <Footer />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
