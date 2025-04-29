import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CNP Trading Card Game",
  description: "CNP Trading Card Gameのデッキビルダー",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <nav className="bg-black dark:bg-black text-white p-4 border-b-2 border-yellow-400">
            <div className="container mx-auto flex justify-between items-center">
              <div className="text-xl font-bold flex items-center">
                <span className="bg-yellow-400 text-black px-2 py-1 mr-2 transform -skew-x-12">CNP</span>
                <span className="text-blue-400">Trading Card Game</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/deck-builder" className="hover:text-yellow-400 transition-colors">
                  デッキビルダー
                </Link>
                <ModeToggle />
              </div>
            </div>
          </nav>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
