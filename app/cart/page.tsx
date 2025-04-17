"use client"

import { useCart } from "@/lib/cart-context"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Trash2, Minus, Plus } from "lucide-react"
import { BackButton } from "@/components/back-button"

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  const itemsTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  // Group items by restaurant
  const restaurantItems: Record<string, typeof cart> = {}
  cart.forEach((item) => {
    if (!restaurantItems[item.restaurantName]) {
      restaurantItems[item.restaurantName] = []
    }
    restaurantItems[item.restaurantName].push(item)
  })

  const handleRemoveItem = (restaurantName: string, itemName: string) => {
    if (confirm(`Remove ${itemName} from your cart?`)) {
      removeFromCart(restaurantName, itemName)
    }
  }

  const handleQuantityChange = (restaurantName: string, itemName: string, quantity: number) => {
    updateQuantity(restaurantName, itemName, quantity)
  }

  return (
    <main className="container mx-auto p-4">
      <BackButton label="Back to Shopping" />

      <div className="flex items-center justify-center mb-6">
        <Image
          src="/images/hungry-boys-logo.png"
          alt="HUNGRY BOYS"
          width={80}
          height={80}
          className="rounded-full mr-4"
        />
        <h1 className="text-3xl font-bold">Your Cart</h1>
      </div>

      {cart.length > 0 ? (
        <>
          {Object.entries(restaurantItems).map(([restaurantName, items], index) => {
            const restaurantTotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

            return (
              <div key={index} className="mb-6 border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-4 border-b">
                  <h2 className="text-xl font-semibold">{restaurantName}</h2>
                </div>
                <ul className="divide-y">
                  {items.map((item, itemIndex) => (
                    <li key={itemIndex} className="p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.itemName}</h3>
                        <p className="text-sm text-gray-600">Rs. {item.price}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.restaurantName, item.itemName, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 text-center min-w-[40px]">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.restaurantName, item.itemName, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right font-bold min-w-[80px]">Rs. {item.price * item.quantity}</div>

                        <button
                          onClick={() => handleRemoveItem(item.restaurantName, item.itemName)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="bg-gray-50 p-4 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Restaurant Total:</span>
                    <span>Rs. {restaurantTotal}</span>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="border-t pt-4 mb-6">
            <h3 className="text-xl font-bold mb-2">Order Summary</h3>
            <div className="flex justify-between font-bold text-lg">
              <span>Items Total:</span>
              <span>Rs. {itemsTotal}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Delivery fee will be calculated at checkout based on number of persons.
            </p>
          </div>

          <div className="flex space-x-4">
            <Link
              href="/checkout"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link href="/" className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Image src="/images/empty-cart.svg" alt="Empty Cart" width={150} height={150} />
          </div>
          <p className="text-lg mb-4">Your cart is empty.</p>
          <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Browse Restaurants
          </Link>
        </div>
      )}
    </main>
  )
}
