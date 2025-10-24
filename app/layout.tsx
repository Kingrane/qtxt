// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Unbounded } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const unbounded = Unbounded({ 
  subsets: ['latin'], 
  variable: '--font-unbounded',
  weight: ['400', '600', '700'] // Подключаем несколько начертаний
});

export const metadata: Metadata = {
  title: 'textex - обменник текстом',
  description: 'Быстрый обмен текстом',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${unbounded.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
