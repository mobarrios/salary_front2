"use client";
import { Inter, Sora } from "next/font/google";
// import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './custom.scss'

import Bootstrap from "@/components/Boostrap"
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });
const sora = Sora({ subsets: ['latin'] })


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
    <html lang="en">
      <Bootstrap />
      <body className={inter.className}>
          {children}
      </body>
    </html>
    </SessionProvider>
  );
}
