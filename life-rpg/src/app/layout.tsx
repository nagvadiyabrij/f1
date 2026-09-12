import type { Metadata } from 'next';
import { Cinzel, Rajdhani } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Life RPG — Turn Your Life Into an Adventure',
  description:
    'A gamified productivity app where real-world tasks become epic quests, XP powers your character, and Gold funds a reward shop. Level up your life today.',
  keywords: 'productivity, RPG, gamification, habits, quests, experience points, leveling',
  openGraph: {
    title: 'Life RPG — Turn Your Life Into an Adventure',
    description: 'Gamify your life. Complete quests. Level up.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Life RPG',
    description: 'Gamify your life. Complete quests. Level up.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${rajdhani.variable}`}>
      <body className="bg-parchment font-rajdhani antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
