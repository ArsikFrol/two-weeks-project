import { Roboto } from "next/font/google";

import type { Metadata } from "next";
import "./globals.css";

const robotoFont = Roboto({
    variable: "--font-roboto",
    subsets: ["latin"],
    weight: ['200', '300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
    title: 'Week Project'
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html className={robotoFont.variable}>
            <body>{children}</body>
        </html>
    );
}
