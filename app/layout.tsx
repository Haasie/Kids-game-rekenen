import './globals.css';
import type { Metadata, Viewport } from 'next';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#4C1D95',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Ruimte Rekenen',
  description: 'Een leuk rekenspel voor kinderen',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#4C1D95' },
    ],
  },
  manifest: '/manifest.json',
  applicationName: 'Ruimte Rekenen',
  authors: [{ name: 'Your Name' }],
  keywords: ['rekenen', 'kinderen', 'educatie', 'ruimte', 'spel'],
  robots: 'index, follow',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ruimte Rekenen',
  },
  formatDetection: {
    telephone: false,
  },
};

const CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  media-src 'self';
  font-src 'self' data:;
  connect-src 'self';
  worker-src 'self';
  manifest-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`.replace(/\s{2,}/g, ' ').trim();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="Een leuk ruimte rekenen spel voor kinderen" />
        <meta httpEquiv="Content-Security-Policy" content={CSP} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="msapplication-TileColor" content="#4C1D95" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="preload" href="/correct.mp3" as="audio" />
        <link rel="preload" href="/incorrect.mp3" as="audio" />
      </head>
      <body className="antialiased">
        <main className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-900 text-white p-4">
          {children}
          <ServiceWorkerRegistration />
        </main>
      </body>
    </html>
  );
}
