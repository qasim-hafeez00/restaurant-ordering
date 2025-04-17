"use client"

import type React from "react"
import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { Minus, Plus, ShoppingCart } from "lucide-react"

interface AddToCartFormProps {
  restaurantName: string
  itemName: string
  price: number
}

export default function AddToCartForm({ restaurantName, itemName, price }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addToCart({
      restaurantName,
      itemName,
      price,
      quantity,
    })

    // Show success message
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 relative">
      <div className="flex items-center border rounded-md">
        <button
          type="button"
          onClick={decrementQuantity}
          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
          min="1"
          className="w-12 text-center border-0 focus:ring-0"
          aria-label="Quantity"
        />
        <button
          type="button"
          onClick={incrementQuantity}
          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
      >
        <ShoppingCart className="w-4 h-4" />
        Add
      </button>

      {showSuccess && (
        <div className="absolute transform translate-y-10 bg-green-100 text-green-800 text-sm py-1 px-2 rounded">
          Added to cart!
        </div>
      )}
    </form>
  )
}
