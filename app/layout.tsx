'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from './components/header/header';
import Footer from './components/footer/footer';
import { usePathname } from 'next/navigation';
import AuthInitializer from './components/auth/AuthInitializer';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // 💡 마운트 상태 체크
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* 💡 마운트된 후에만 클라이언트 전용 컴포넌트들을 렌더링 */}
        {isMounted && (
          <>
            <AuthInitializer />
            <Toaster
              position="top-center"
              containerStyle={{
                zIndex: 10001, 
              }}
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  zIndex: 10001,
                },
                success: {
                  iconTheme: {
                    primary: '#83c2e4',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </>
        )}

        {!isAuthPage && <Header />}
        <main className="flex-grow">{children}</main>
        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}