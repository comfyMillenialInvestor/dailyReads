import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/CookieBanner';
import { Analytics } from '@vercel/analytics/react';


export const metadata: Metadata = {
  title: 'Daily Reads - Story, Poem, Essay',
  description: 'Your daily dose of literature. Three short texts every day: a short story, a poem, and an essay.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen flex flex-col font-sans"
      >
        <Providers>
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <Analytics />
        </Providers>

      </body>
    </html>
  );
}
