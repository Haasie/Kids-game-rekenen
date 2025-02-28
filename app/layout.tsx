import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ruimte Rekenen',
  description: 'Een leuke rekenapp voor kinderen met een ruimte-thema',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
