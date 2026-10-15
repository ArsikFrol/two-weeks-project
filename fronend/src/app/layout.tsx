import { Roboto } from "next/font/google";

import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header/Header";
import { Provider } from "@/components/Provider";

const robotoFont = Roboto({
    variable: "--font-roboto",
    subsets: ["latin"],
    weight: ['200', '300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
    title: 'TET-A-TET'
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html className={robotoFont.variable}>
            <body>
                <Provider>
                    <>
                        <Header />
                        {children}
                    </>
                </Provider>
            </body>
        </html>
    );
}
