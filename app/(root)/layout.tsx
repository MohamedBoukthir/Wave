import React from "react";
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

import Topbar from "@/components/shared/Topbar"
import LeftSidebar from "@/components/shared/LeftSidebar"
import RightSidebar from "@/components/shared/RightSidebar"
import Bottombar from "@/components/shared/Bottombar"

import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Wave',
    description: 'A Next.js 13 Application Developed By @MohamedBoukthir'
};


export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="en" >
                <body className={inter.className}>
                    <Topbar/>
                    <main className="flex flex-row">
                        <LeftSidebar/>
                            <section className="main-container">
                                <div className="w-full max-w-4xl">
                                    {children}
                                </div>
                            </section>
                        <RightSidebar/>
                    </main>
                    <Bottombar/>
                </body>
            </html>
        </ClerkProvider>
    )
}