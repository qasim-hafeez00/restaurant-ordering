"use client"

import type React from "react"
import { useCart } from "@/lib/cart-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BackButton } from "@/components/back-button"
import { AlertCircle } from "lucide-react"

export default function Checkout() {
  const { cart, clearCart } = useCart()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [persons, setPersons] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <p className="text-lg mb-4">Your cart is empty.</p>
        <Link href="/" className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
          Back to Restaurants
        </Link>
      </div>
    )
  }

  const itemsTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const deliveryFee = persons !== null ? persons * 100 : 0
  const total = itemsTotal + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate email format
      const emailPattern = /^f\d+@cfd\.nu\.edu\.pk$/
      if (!emailPattern.test(email)) {
        setError("Invalid email. Please use your university email in the format f####@cfd.nu.edu.pk.")
        setIsSubmitting(false)
        return
      }

      // Validate other fields
      if (!firstName.trim()) {
        setError("First name is required")
        setIsSubmitting(false)
        return
      }

      if (!lastName.trim()) {
        setError("Last name is required")
        setIsSubmitting(false)
        return
      }

      if (!phoneNumber.trim()) {
        setError("Phone number is required")
        setIsSubmitting(false)
        return
      }

      // Validate persons field
      if (persons === null || persons < 1) {
        setError("Please enter the number of persons")
        setIsSubmitting(false)
        return
      }

      // Generate order ID
      const orderId = Math.floor(10000 + Math.random() * 90000).toString()

      // Process order
      const orderDetails = {
        orderId,
        email,
        firstName,
        lastName,
        phoneNumber,
        persons,
        cart,
        itemsTotal,
        deliveryFee,
        total,
        specialInstructions,
        orderDate: new Date().toISOString(),
      }

      console.log("Submitting order:", orderDetails)

      // Save order to backend
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      })

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`

        try {
          // Try to parse error response as JSON
          const errorData = await response.json()
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          }
        } catch (jsonError) {
          // If JSON parsing fails, use the status text
          console.error("Failed to parse error response:", jsonError)
        }

        throw new Error(errorMessage)
      }

      // Parse successful response
      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        console.error("Error parsing success response:", jsonError)
        throw new Error("Failed to parse server response. Please try again.")
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to save order")
      }

      console.log("Order saved successfully:", result)

      // Clear cart and redirect to confirmation
      clearCart()
      router.push(`/confirmation/${orderId}`)
    } catch (error) {
      console.error("Error processing order:", error)
      setError(
        `An error occurred while processing your order: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto p-4">
      <BackButton label="Back to Cart" />
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Your University Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
            placeholder="f####@cfd.nu.edu.pk"
          />
          <p className="text-xs text-gray-500 mt-1">Must be in the format f####@cfd.nu.edu.pk</p>
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="persons" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Persons <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="persons"
            value={persons === null ? "" : persons}
            onChange={(e) => {
              const value = e.target.value === "" ? null : Number.parseInt(e.target.value)
              setPersons(value)
            }}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
            placeholder="Enter number of persons"
          />
          <p className="text-xs text-gray-500 mt-1">Required field - delivery fee is Rs. 100 per person</p>
        </div>

        <div>
          <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions
          </label>
          <textarea
            id="specialInstructions"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Any special instructions or requests? (Optional)"
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <span>Items Total:</span>
            <span>Rs. {itemsTotal}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Delivery Fee (Rs. 100 per person):</span>
            <span>Rs. {deliveryFee}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>Rs. {total}</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
          <Link href="/cart" className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
            Back to Cart
          </Link>
        </div>
      </form>
    </main>
  )
}
