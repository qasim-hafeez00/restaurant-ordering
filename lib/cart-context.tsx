"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CartItem {
  restaurantName: string
  itemName: string
  price: number
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (restaurantName: string, itemName: string) => void
  updateQuantity: (restaurantName: string, itemName: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
}

// Create context with a default value
const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotalItems: () => 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on initial render
  useEffect(() => {
    setMounted(true)
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("cart", JSON.stringify(cart))
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error)
      }
    }
  }, [cart, mounted])

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(
        (item) => item.restaurantName === newItem.restaurantName && item.itemName === newItem.itemName,
      )

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex].quantity += newItem.quantity
        return updatedCart
      } else {
        // Add new item to cart
        return [...prevCart, newItem]
      }
    })
  }

  const removeFromCart = (restaurantName: string, itemName: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.restaurantName === restaurantName && item.itemName === itemName)),
    )
  }

  const updateQuantity = (restaurantName: string, itemName: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(restaurantName, itemName)
      return
    }

    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.restaurantName === restaurantName && item.itemName === itemName) {
          return { ...item, quantity }
        }
        return item
      })
    })
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
