import { SessionProvider } from "next-auth/react";
import { JSX } from "react/jsx-runtime";

export function Provider({ children }: { children: JSX.Element }) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}