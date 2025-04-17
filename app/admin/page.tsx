"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { BackButton } from "@/components/back-button"
import { Download, RefreshCw, ExternalLink, Search, Trash2, AlertCircle, CheckCircle } from "lucide-react"
import RestaurantManagement from "./restaurant-management"

interface Order {
  orderId: string
  orderDate: string
  customer: {
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
  persons: number
  restaurantOrders: Record<string, any[]>
  itemsTotal: number
  deliveryFee: number
  total: number
}

// Secure password for admin access
const ADMIN_PASSWORD = "X9$g!zQ8@Lm#V2rT6&Wp"

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<"orders" | "restaurants">("orders")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Use the secure password
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      localStorage.setItem("adminAuthenticated", "true")
      fetchOrders()
    } else {
      setError("Invalid password")
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccessMessage("")

      // Fetch orders from the API with a cache-busting parameter
      const response = await fetch(`/api/admin/orders?refresh=${refreshCount}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.orders) {
        console.log(`Loaded ${data.orders.length} orders from API`)
        setOrders(data.orders)
        setFilteredOrders(data.orders)
      } else {
        console.log("No orders found or API returned no success")
        setOrders([])
        setFilteredOrders([])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError(`Failed to load orders: ${error instanceof Error ? error.message : String(error)}`)
      setOrders([])
      setFilteredOrders([])
    } finally {
      setLoading(false)
      // Reset selection when orders are refreshed
      setSelectedOrderIds([])
      setSelectAll(false)
    }
  }

  useEffect(() => {
    // Check if already authenticated
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (isAuthenticated) {
      setAuthenticated(true)
      fetchOrders()
    } else {
      setLoading(false)
    }
  }, [refreshCount])

  // Filter orders when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = orders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(term) ||
        order.customer.firstName.toLowerCase().includes(term) ||
        order.customer.lastName.toLowerCase().includes(term) ||
        order.customer.email.toLowerCase().includes(term) ||
        order.customer.phoneNumber.includes(term) ||
        Object.keys(order.restaurantOrders || {}).some((restaurant) => restaurant.toLowerCase().includes(term)),
    )
    setFilteredOrders(filtered)
  }, [searchTerm, orders])

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedOrderIds(filteredOrders.map((order) => order.orderId))
    } else {
      setSelectedOrderIds([])
    }
  }, [selectAll, filteredOrders])

  // Function to refresh orders
  const handleRefreshOrders = () => {
    setRefreshCount((prev) => prev + 1) // This will trigger the useEffect
  }

  // Function to handle order selection
  const handleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId)
      } else {
        return [...prev, orderId]
      }
    })
  }

  // Function to handle select all toggle
  const handleSelectAllToggle = () => {
    setSelectAll(!selectAll)
  }

  // Function to delete selected orders
  const handleDeleteOrders = async () => {
    if (selectedOrderIds.length === 0) {
      setError("No orders selected for deletion")
      return
    }

    setIsDeleting(true)
    setError("")
    setSuccessMessage("")

    try {
      const response = await fetch("/api/admin/delete-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds: selectedOrderIds }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log("Delete response:", data)
        setSuccessMessage(
          `Successfully deleted ${selectedOrderIds.length} order(s)${!data.sheetsDeleteSuccess ? " (from KV only)" : ""}`,
        )

        // Remove the deleted orders from the local state
        setOrders((prevOrders) => prevOrders.filter((order) => !selectedOrderIds.includes(order.orderId)))
        setFilteredOrders((prevFiltered) => prevFiltered.filter((order) => !selectedOrderIds.includes(order.orderId)))

        // Reset selection
        setSelectedOrderIds([])
        setSelectAll(false)

        // Close confirmation dialog
        setShowDeleteConfirm(false)
      } else {
        throw new Error(data.message || "Failed to delete orders")
      }
    } catch (error) {
      console.error("Error deleting orders:", error)
      setError(`Failed to delete orders: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Improved export function with detailed order information
  const handleExportCSV = () => {
    if (orders.length === 0) {
      setError("No orders to export")
      return
    }

    // Generate CSV content for orders
    const orderHeaders = [
      "Order ID",
      "Date",
      "Customer Name",
      "Email",
      "Phone",
      "Persons",
      "Items Total",
      "Delivery Fee",
      "Total",
    ]

    const orderRows = orders.map((order) => [
      order.orderId,
      new Date(order.orderDate).toLocaleString(),
      `${order.customer.firstName} ${order.customer.lastName}`,
      order.customer.email,
      order.customer.phoneNumber,
      order.persons,
      order.itemsTotal,
      order.deliveryFee,
      order.total,
    ])

    const ordersCsvContent = [orderHeaders.join(","), ...orderRows.map((row) => row.join(","))].join("\n")

    // Generate CSV content for order details
    const detailHeaders = ["Order ID", "Restaurant", "Item Name", "Price", "Quantity", "Subtotal"]

    const detailRows: string[][] = []
    orders.forEach((order) => {
      if (order.restaurantOrders) {
        Object.entries(order.restaurantOrders).forEach(([restaurantName, items]) => {
          items.forEach((item) => {
            detailRows.push([
              order.orderId,
              restaurantName,
              item.itemName,
              item.price.toString(),
              item.quantity.toString(),
              (item.price * item.quantity).toString(),
            ])
          })
        })
      }
    })

    const detailsCsvContent = [detailHeaders.join(","), ...detailRows.map((row) => row.join(","))].join("\n")

    // Create download links
    const createDownloadLink = (content: string, filename: string) => {
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Download both files
    createDownloadLink(ordersCsvContent, `orders_${new Date().toISOString().split("T")[0]}.csv`)
    setTimeout(() => {
      createDownloadLink(detailsCsvContent, `order_details_${new Date().toISOString().split("T")[0]}.csv`)
    }, 100)
  }

  // Function to open Google Sheets in a new tab
  const openGoogleSheets = () => {
    window.open("https://docs.google.com/spreadsheets/d/1MwPq5nQGlxHXoKeXLyYBkHkEXULi2w8L6LYrBRulzz8/edit", "_blank")
  }

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Function to handle logout
  const handleLogout = () => {
    setAuthenticated(false)
    localStorage.removeItem("adminAuthenticated")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <div className="text-center mb-6">
          <Image
            src="/images/hungry-boys-logo.png"
            alt="HUNGRY BOYS"
            width={120}
            height={120}
            className="rounded-full mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">HUNGRY BOYS</h1>
          <h2 className="text-xl font-semibold">Admin Login</h2>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <BackButton label="Back to Home" />
        <button onClick={handleLogout} className="text-red-600 hover:text-red-800 transition-colors">
          Logout
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Image
            src="/images/hungry-boys-logo.png"
            alt="HUNGRY BOYS"
            width={60}
            height={60}
            className="rounded-full mr-3"
          />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{successMessage}</div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-2 px-1 -mb-px font-medium text-sm ${
              activeTab === "orders"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Order Management
          </button>
          <button
            onClick={() => setActiveTab("restaurants")}
            className={`py-2 px-1 -mb-px font-medium text-sm ${
              activeTab === "restaurants"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Restaurant Management
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" ? (
        <>
          <div className="flex gap-2 mb-6">
            <button
              onClick={handleExportCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              disabled={orders.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={openGoogleSheets}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Google Sheets
            </button>
            <button
              onClick={handleRefreshOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link href="/" className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
              Back to Home
            </Link>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders by ID, name, email, or restaurant..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedOrderIds.length} of {filteredOrders.length} selected
              </span>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={selectedOrderIds.length === 0}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAllToggle}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Restaurants
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.includes(order.orderId)}
                              onChange={() => handleOrderSelection(order.orderId)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer.firstName} {order.customer.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{order.customer.email}</div>
                          <div>{order.customer.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.restaurantOrders ? (
                            <ul className="list-disc pl-4">
                              {Object.keys(order.restaurantOrders).map((restaurant, idx) => (
                                <li key={idx}>{restaurant}</li>
                              ))}
                            </ul>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Rs. {order.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Link href={`/confirmation/${order.orderId}`} className="text-blue-600 hover:text-blue-900">
                              View
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedOrderIds([order.orderId])
                                setShowDeleteConfirm(true)
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchTerm
                          ? "No orders found matching your search."
                          : "No orders found. Place an order to see it here."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                <p className="mb-4">
                  Are you sure you want to delete {selectedOrderIds.length} selected order(s)? This action cannot be
                  undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteOrders}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Google Sheets Integration</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="mb-4">Your orders are being saved to Google Sheets. The integration is set up with:</p>

              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Spreadsheet ID: 1MwPq5nQGlxHXoKeXLyYBkHkEXULi2w8L6LYrBRulzz8</li>
                <li>Service Account: hungryboys@total-pillar-445808-e5.iam.gserviceaccount.com</li>
                <li>
                  Two sheets:
                  <ul className="list-disc pl-5 mt-1">
                    <li>
                      <strong>Orders</strong> - Contains order header information
                    </li>
                    <li>
                      <strong>OrderDetails</strong> - Contains individual line items for each order
                    </li>
                  </ul>
                </li>
              </ul>

              <div className="flex justify-center mt-4">
                <button
                  onClick={openGoogleSheets}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Google Sheets
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <RestaurantManagement />
      )}
    </main>
  )
}
