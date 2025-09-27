// app/layout.js

import { Inter } from 'next/font/google';
import './main.css';
import { AuthProvider } from '@/context/AuthContext'; // <-- Step 1: Import karein

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SaaS Notes App',
  description: 'A multi-tenant notes application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* <-- Step 2: Wrap karein */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}