import '../globals.scss';

import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { DM_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Providers, ViewportHeightSetter } from '@web/components/layouts';
import { Loading } from '@web/components/ui/loading';
import { routing } from '@web/i18n/routing';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'LUNAsis',
  description:
    "LUNAsis PWA Your personal guide to women's health. Compare prices on feminine products, find trusted clinics, track your cycle, and get instant answers from our AI companion, Luna.",
  keywords: [
    'Lunasis',
    'PWA',
    'Feminine Health',
    'AI Companion',
    'Cycle Tracking',
    'Price Comparison',
    'Clinic Finder',
    'Luna',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'LUNAsis',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6f6f6',
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={dmSans.variable}
        style={{ backgroundColor: '#f6f6f6' }}
        suppressHydrationWarning
      >
        <ViewportHeightSetter />
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
