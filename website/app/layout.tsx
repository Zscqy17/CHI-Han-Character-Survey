import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'CJK Input Atlas',
  description: 'Explore 241 studies of Chinese, Japanese and Korean text input through original sources and visual evidence.',
  robots: { index: false, follow: false, nocache: true },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
