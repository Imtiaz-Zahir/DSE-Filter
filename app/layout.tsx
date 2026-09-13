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
    "Dhaka Stock Exchange (DSE) stock screener, fundamental analysis and valuation platform. Filter 395+ listed Bangladesh stocks by P/E ratio, Dividend Yield, NAV, EPS, DSES Sharia index compliance, audited financials, and shareholding.",
  keywords: [
    "DSE",
    "Dhaka Stock Exchange",
    "DSEBD",
    "DSE Stock Screener",
    "DSE Share Price Today",
    "Bangladesh Stock Market",
    "DSES Sharia Stocks",
    "DSE P/E Ratio",
    "High Dividend Stocks Bangladesh",
    "Fundamental Analysis DSE",
    "DSE Category A Stocks",
    "DSE Market Cap",
    "Dhaka Share Market Analysis",
    "DSE Stock Comparison",
    "EPS and NAV Bangladesh Stocks",
  ],
  authors: [{ name: "DSE Filter", url: "https://dse-filter.1mt2.workers.dev" }],
  creator: "DSE Filter",
  publisher: "DSE Filter",
  category: "finance",
  applicationName: "DSE Filter",
  alternates: {
    canonical: "https://dse-filter.1mt2.workers.dev",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dse-filter.1mt2.workers.dev",
    title: "DSE Filter — Dhaka Stock Exchange Screener & Stock Analytics",
    description:
      "Advanced Dhaka Stock Exchange screener with DSES Sharia filters, fundamental valuation metrics, multi-year audited financials, and shareholding breakdowns.",
    siteName: "DSE Filter",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSE Filter — Dhaka Stock Exchange Screener & Stock Analytics",
    description:
      "Advanced Dhaka Stock Exchange screener with DSES Sharia filters, fundamental valuation metrics, and shareholding breakdowns.",
    creator: "@dsefilter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
