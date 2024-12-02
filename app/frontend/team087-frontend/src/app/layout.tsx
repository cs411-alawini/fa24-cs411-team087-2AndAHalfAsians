"use client";

import "@mantine/core/styles.css";

import {
    ColorSchemeScript,
    LoadingOverlay,
    MantineProvider,
} from "@mantine/core";
import { theme } from "@/lib/theme";
import { UserProvider, useUser } from "@/providers/UserProvider";
import UserModal from "@/components/ui/UserModal";

import { useEffect, useState } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
                <MantineProvider theme={theme}>
                    <UserProvider>
                        <LoginCheck>{children}</LoginCheck>
                    </UserProvider>
                </MantineProvider>
            </body>
        </html>
    );
}
