import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from 'next/font/google'
import type { Metadata } from "next";
import { dark } from "@clerk/themes";


import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Auth',
    description: 'Developed By @MohamedBoukthir'
}

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider
            appearance={{
            baseTheme: dark,
          }}
        >
            <html lang="en" >
                <body className={`${inter.className} bg-dark-1`}>
                    <div className="w-full flex justify-center items-center min-h-screen">
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    )
}