import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { globalConfig } from '@/config/globals';
import lpData from '../../lp.json';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: lpData.metadata.title,
  description: lpData.metadata.description,
  icons: {
    icon: lpData.metadata.favicon || '/favicon.ico',
  },
  other: {
    charset: globalConfig.charset,
  },
};

// Viewport separado (Next.js 14 requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={globalConfig.lang} className={inter.variable}>
      <body className="font-inter antialiased">{children}</body>
    </html>
  );
}
