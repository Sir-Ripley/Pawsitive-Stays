import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
 title: 'Pawsitive Stays | Pet Parent QR Hotel Verification & AKC Deposit Network',
 description:
 'Printable & mobile QR code feedback system for responsible pet parents and AKC dog show exhibitors to verify spotless hotel stays and lower pet deposits.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en">
 <body className="antialiased selection:bg-amber-400 selection:text-slate-950">
 {children}
 </body>
 </html>
 );
}
