import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter, Poppins, Roboto } from 'next/font/google';
import './globals.css';
import { ToastHost } from '@/components/ToastHost';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Timeout — Leave management',
  description: 'Plan and track time off in one place.',
};

const themeInitScript = `(function(){try{var root=document.documentElement;var k='timeout-theme';var v=localStorage.getItem(k);if(v==='dark')root.classList.add('dark');else root.classList.remove('dark');var a=localStorage.getItem('timeout-accent');var map={mint:{primary:'#088395',primaryDark:'#09637e',ring:'#088395',accent:'#7ab2b2'},blue:{primary:'#1d8cf8',primaryDark:'#1769c7',ring:'#1d8cf8',accent:'#a9d4fb'},violet:{primary:'#7c3aed',primaryDark:'#5b21b6',ring:'#8b5cf6',accent:'#c4b5fd'},orange:{primary:'#f59e0b',primaryDark:'#d97706',ring:'#f59e0b',accent:'#fde68a'},red:{primary:'#ef4444',primaryDark:'#dc2626',ring:'#ef4444',accent:'#fecaca'},indigo:{primary:'#2563eb',primaryDark:'#1d4ed8',ring:'#2563eb',accent:'#bfdbfe'}};if(a&&map[a]){root.style.setProperty('--primary',map[a].primary);root.style.setProperty('--primary-dark',map[a].primaryDark);root.style.setProperty('--ring',map[a].ring);root.style.setProperty('--accent',map[a].accent);}var f=localStorage.getItem('timeout-font');var fonts={geist:'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',poppins:'var(--font-poppins), var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',inter:'var(--font-inter), var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',roboto:'var(--font-roboto), var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif'};if(f&&fonts[f]){root.style.setProperty('--app-font-family',fonts[f]);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${roboto.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className='font-sans antialiased'>
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
