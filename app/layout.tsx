import './globals.css';
import type { Metadata, Viewport } from 'next';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4C1D95',
};

export const metadata: Metadata = {
  title: 'Ruimte Rekenen',
  description: 'Een leuke rekenapp voor kinderen met een ruimte-thema',
  metadataBase: new URL('https://your-domain.com'),
  applicationName: 'Ruimte Rekenen',
  authors: [{ name: 'Your Name' }],
  keywords: ['rekenen', 'kinderen', 'educatie', 'ruimte', 'spel'],
  robots: 'index, follow',
  manifest: '/manifest.json',
};

const CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  media-src 'self';
  font-src 'self';
  connect-src 'self';
  worker-src 'self';
  manifest-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="Een leuk ruimte rekenen spel voor kinderen" />
        <meta httpEquiv="Content-Security-Policy" content={CSP} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <title>Ruimte Rekenen</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4C1D95" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <main className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-900 text-white p-4">
          {children}
          <ServiceWorkerRegistration />
        </main>
      </body>
    </html>
  );
}
