"use client"

import { useCart } from "@/lib/cart-context"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function FloatingCart() {
  const { cart } = useCart()
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevCount, setPrevCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  // Handle animation when cart items change
  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setPrevCount(totalItems)
      return
    }

    if (totalItems > prevCount) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 800)
      return () => clearTimeout(timer)
    }

    setPrevCount(totalItems)
  }, [totalItems, prevCount, mounted])

  if (!mounted) return null

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Link href="/cart">
        <div
          className={`relative flex items-center justify-center bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ${
            isAnimating ? "scale-110 bg-green-600" : ""
          }`}
        >
          <ShoppingCart className="w-6 h-6" />

          {totalItems > 0 && (
            <div
              className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                isAnimating ? "animate-bounce" : ""
              }`}
            >
              {totalItems}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
