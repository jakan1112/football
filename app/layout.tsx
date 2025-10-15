// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MonetagPopunder from './components/monetagad';


const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111827',
};

export const metadata: Metadata = {
  title: {
    default: "Free Football Live Stream - Watch Live Matches Online",
    template: "%s | Free Football Live Stream"
  },
  description: "Watch free live football streams. Champions League, Premier League, La Liga, Serie A matches with real-time scores and live commentary.",
  keywords: "free football live stream, watch football online, live soccer, premier league live, champions league stream",
  authors: [{ name: "Free Football Live Stream" }],
  creator: "Free Football Live Stream",
  publisher: "Free Football Live Stream",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://.footballstreams.live'), // Replace with your domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Free Football Live Stream',
    title: "Free Football Live Stream - Watch Live Matches Online",
    description: "Watch free live football streams with real-time scores and commentary.",
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Free Football Live Stream'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free Football Live Stream",
    description: "Watch free live football streams online",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification here
    // google: 'your-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png' },
    ],
    shortcut: ['/favicon.ico'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Free Football Live Stream",
              "url": "https://yourdomain.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://yourdomain.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <MonetagPopunder />
      <body className={inter.className}>{children}</body>
    </html>
  );
}