import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClipMate - お気に入りを、一緒に。',
  description: 'SNSで見つけた"好き"を、大切な人と集めるアプリ',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${geist.className} bg-gray-50 text-gray-900 h-full antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
