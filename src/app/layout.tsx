import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AnimatedBackground } from '@/components/animated-background';
import { SidebarProvider, SidebarRail } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Moude AI: Rainbow Chat',
  description:
    'A vibrant AI chat experience powered by Geniea and Imagine modules.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AnimatedBackground />
          <div className="relative z-10 min-h-screen">
            <SidebarProvider>
              <div className="md:pl-20 transition-all duration-300 ease-in-out group-data-[sidebar-open=true]:md:pl-[16rem]">
                <main>{children}</main>
              </div>
              <MainSidebar />
              <SidebarRail />
            </SidebarProvider>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
