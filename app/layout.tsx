// app/layout.tsx
import type { Metadata } from 'next';
import { Comfortaa, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const comfortaa = Comfortaa({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-comfortaa'
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'qtxt - Обменник текстом',
  description: 'text obmennik',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${comfortaa.className} ${inter.variable}`}>
        {/* Yandex.RTB Loader Code */}
        <Script id="yandex-rtb-loader" strategy="beforeInteractive">
          {`window.yaContextCb=window.yaContextCb||[]`}
        </Script>
        <Script src="https://yandex.ru/ads/system/context.js" async strategy="beforeInteractive" />

        {children}
      </body>
    </html>
  );
}