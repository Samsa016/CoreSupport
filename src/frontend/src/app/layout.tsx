'use client';

import { Outfit } from 'next/font/google';
import './globals.scss';
import { AuthProvider, ToastProvider } from '@/shared/providers';

const outfit = Outfit({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <head>
        <title>CoreSupport | Task Management</title>
        <meta name="description" content="CoreSupport — streamline your team workflow with smart task management, real-time collaboration, and AI-powered assistance." />
      </head>
      <body>
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
