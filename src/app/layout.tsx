import { Montserrat } from "next/font/google";

import type { Metadata } from "next";
import "./globals.css";

const geistMono = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ['200', '300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Week Project'
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className={geistMono.variable}>
      <body>{children}</body>
    </html>
  );
}
