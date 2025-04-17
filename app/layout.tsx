import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import Link from "next/link"
import FloatingCart from "@/components/floating-cart"
import Image from "next/image"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HUNGRY BOYS",
  description: "Order food from multiple restaurants",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <header className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/images/hungry-boys-logo.png"
                  alt="HUNGRY BOYS"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <h1 className="text-2xl font-bold">HUNGRY BOYS</h1>
              </Link>
              <nav className="flex gap-4">
                <Link href="/" className="hover:underline">
                  Home
                </Link>
                <Link href="/cart" className="hover:underline">
                  Cart
                </Link>
                <Link href="/admin" className="hover:underline">
                  Admin
                </Link>
              </nav>
            </div>
          </header>
          {children}
          <FloatingCart />
        </CartProvider>
      </body>
    </html>
  )
}


import './globals.css'