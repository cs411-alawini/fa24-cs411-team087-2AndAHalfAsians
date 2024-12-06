"use client";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { QueryClientProvider } from "@tanstack/react-query";
import {
    ColorSchemeScript,
    // LoadingOverlay,
    MantineProvider,
} from "@mantine/core";
import { theme } from "@/lib/theme";
import { UserProvider, useUser } from "@/providers/UserProvider";
import UserModal from "@/components/common/UserModal";

// import { useEffect, useState } from "react";
// import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import CurrentUser from "@/components/common/CurrentUser";
import { queryClient } from "@/lib/query";
import { Notifications } from "@mantine/notifications";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

const LoginCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userId } = useUser();

    if (!userId) {
        return <UserModal />;
    }

    return <>{children}</>;
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ColorSchemeScript />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <QueryClientProvider client={queryClient}>
                    <MantineProvider theme={theme}>
                        <UserProvider>
                            <LoginCheck>
                                <Notifications />
                                {children}
                                <CurrentUser />
                            </LoginCheck>
                        </UserProvider>
                    </MantineProvider>
                </QueryClientProvider>
            </body>
        </html>
    );
}
