import type { Metadata } from "next";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.css'
import '../style/global.css'

import { ZCOOL_KuaiLe } from 'next/font/google';


const zCool = ZCOOL_KuaiLe({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={zCool.className}>
    <div className={`app-bg text-uppercase ${zCool.className}`}>
          {children}
        </div>
      </body>
    </html>
  );
}
