"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { BackButton } from "@/components/back-button"
import { AlertCircle } from "lucide-react"

interface OrderItem {
  restaurantName: string
  itemName: string
  price: number
  quantity: number
}

interface RestaurantOrder {
  restaurantName: string
  items: OrderItem[]
  subtotal: number
}

interface OrderDetails {
  orderId: string
  orderDate: string
  customer: {
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
  persons: number
  restaurantOrders: Record<string, OrderItem[]>
  itemsTotal: number
  deliveryFee: number
  total: number
  specialInstructions?: string
}

export default function Confirmation({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [restaurantBreakdown, setRestaurantBreakdown] = useState<RestaurantOrder[]>([])

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log(`Fetching order details for order ID: ${params.orderId}`)
        const response = await fetch(`/api/orders?orderId=${params.orderId}`)

        if (!response.ok) {
          // Try to parse error response
          try {
            const errorData = await response.json()
            throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
          } catch (jsonError) {
            throw new Error(`Error: ${response.status} ${response.statusText}`)
          }
        }

        // Parse the response
        let data
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError)
          throw new Error("Failed to parse server response")
        }

        if (!data.success) {
          throw new Error(data.message || "Failed to retrieve order")
        }

        console.log("Order data received:", data.order)
        setOrder(data.order)

        // Process restaurant breakdown
        const breakdown: RestaurantOrder[] = []
        if (data.order.restaurantOrders) {
          Object.entries(data.order.restaurantOrders).forEach(([restaurantName, items]) => {
            const restaurantItems = items as OrderItem[]
            const subtotal = restaurantItems.reduce((total, item) => total + item.price * item.quantity, 0)

            breakdown.push({
              restaurantName,
              items: restaurantItems,
              subtotal,
            })
          })
        } else {
          console.warn("No restaurant orders found in order data")
        }

        console.log("Restaurant breakdown:", breakdown)
        setRestaurantBreakdown(breakdown)
      } catch (error) {
        console.error("Error fetching order:", error)
        setError(`${error instanceof Error ? error.message : String(error)}`)

        // Create a basic order object with the order ID
        setOrder({
          orderId: params.orderId,
          orderDate: new Date().toISOString(),
          customer: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
          },
          persons: 0,
          restaurantOrders: {},
          itemsTotal: 0,
          deliveryFee: 0,
          total: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.orderId])

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Order Not Found</p>
            <p className="text-sm">{error || `We couldn't find order #${params.orderId}`}</p>
          </div>
        </div>
        <p className="mb-6 text-gray-600">
          This order may have been deleted or may not exist. Please check the order number and try again.
        </p>
        <div className="flex flex-col space-y-3">
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
          >
            Return to Home
          </Link>
          <Link
            href="/cart"
            className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-center"
          >
            View Cart
          </Link>
        </div>
      </div>
    )
  }

  // Format the date to match the required format
  const formattedDate = new Date(order.orderDate).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  return (
    <main className="container mx-auto p-4">
      <BackButton label="Back to Home" />
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/hungry-boys-logo.png"
              alt="HUNGRY BOYS"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-600">Order Placed Successfully!</h1>
          <p className="text-gray-600 mt-2">Order #{order.orderId}</p>
          <p className="text-gray-500 text-sm">{formattedDate}</p>
        </div>

        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
          <p>
            <span className="font-medium">Name:</span> {order.customer.firstName} {order.customer.lastName}
          </p>
          <p>
            <span className="font-medium">Email:</span> {order.customer.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {order.customer.phoneNumber}
          </p>
          <p>
            <span className="font-medium">Number of Persons:</span> {order.persons}
          </p>
        </div>

        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold mb-3">Order Details</h2>

          {restaurantBreakdown.length > 0 ? (
            restaurantBreakdown.map((restaurant, index) => (
              <div key={index} className="mb-6 border p-4 rounded-md">
                <h3 className="text-lg font-medium mb-3">{restaurant.restaurantName}</h3>
                <table className="w-full mb-3">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurant.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-b">
                        <td className="py-2">{item.itemName}</td>
                        <td className="text-right py-2">Rs. {item.price}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">Rs. {item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right font-medium py-2">
                        Restaurant Total:
                      </td>
                      <td className="text-right font-bold py-2">Rs. {restaurant.subtotal}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))
          ) : (
            <div className="bg-yellow-50 p-4 rounded-md mb-4">
              <p className="text-yellow-700">No restaurant orders found for this order.</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between mb-2">
              <span>Items Total:</span>
              <span>Rs. {order.itemsTotal}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Delivery Fee (Rs. 100 × {order.persons} persons):</span>
              <span>Rs. {order.deliveryFee}</span>
            </div>
            {order.specialInstructions && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Special Instructions:</h3>
                <p className="whitespace-pre-wrap">{order.specialInstructions}</p>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total Bill:</span>
              <span>Rs. {order.total}</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
