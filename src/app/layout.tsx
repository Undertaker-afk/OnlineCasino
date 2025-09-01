import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Royal Casino - Das ultimative Online Casino Erlebnis',
  description: 'Spielen Sie Blackjack, Roulette und Spielautomaten in unserem luxuriösen Online Casino. Registrieren Sie sich oder spielen Sie anonym.',
  keywords: 'Casino, Blackjack, Roulette, Spielautomaten, Online Gaming',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-casino-darker border-t border-casino-gold p-4 text-center text-casino-gold">
              <p>&copy; 2025 Royal Casino. Spielen Sie verantwortungsvoll.</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
