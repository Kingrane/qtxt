// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
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
