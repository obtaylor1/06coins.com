import type { Metadata } from 'next';
import { Playfair_Display, Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CartProvider } from '@/contexts/cart-context';
import { AnalyticsProvider } from '@/contexts/analytics-context';
import { SEO_CONFIG } from '@/../shared/seo-config';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: `%s | ${SEO_CONFIG.siteName}`,
  },
  description: SEO_CONFIG.defaultDescription,
  keywords: [
    'Alpha Phi Alpha',
    'commemorative coin',
    '120th anniversary',
    '1906',
    'limited edition',
    'fraternity collectibles',
    'APA memorabilia',
  ],
  authors: [{ name: 'Alpha Phi Alpha Fraternity, Incorporated' }],
  creator: 'Alpha Phi Alpha Fraternity, Incorporated',
  publisher: 'Alpha Phi Alpha Fraternity, Incorporated',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: SEO_CONFIG.locale,
    url: SEO_CONFIG.siteUrl,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    siteName: SEO_CONFIG.siteName,
    images: [
      {
        url: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`,
        width: 1200,
        height: 630,
        alt: 'Alpha Phi Alpha 120th Anniversary Commemorative Coin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [`${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`],
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
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${playfair.variable} ${roboto.variable} antialiased`}>
        <AnalyticsProvider>
          <TooltipProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </TooltipProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
