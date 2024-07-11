"use client";
import { Inter, Sora, Roboto , Titillium_Web } from "next/font/google";
// import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './custom.scss'

import Bootstrap from "@/components/Boostrap"
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });
const sora = Sora({ subsets: ['latin'] })
const roboto = Roboto({subsets:['latin'],weight:['400']})
const titillium_web = Titillium_Web({subsets:['latin'],weight:['400']})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
    <html lang="en">
      <Bootstrap />
      <body className={titillium_web.className}>
          {children}
      </body>
    </html>
    </SessionProvider>
  );
}
