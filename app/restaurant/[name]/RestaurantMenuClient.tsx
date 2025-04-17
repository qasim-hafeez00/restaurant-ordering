"use client"

import type React from "react"

import { getRestaurantMenu } from "@/lib/data-client"
import AddToCartForm from "@/components/add-to-cart-form"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Search, X, RefreshCw } from "lucide-react"
import { BackButton } from "@/components/back-button"
import DailyOrderIndicator from "@/components/daily-order-indicator"

export default function RestaurantMenuClient({ restaurantName }: { restaurantName: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [menu, setMenu] = useState<Record<string, any[]> | null>(null)
  const [filteredMenu, setFilteredMenu] = useState<Record<string, any[]> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)

  // Get restaurant logo
  const getRestaurantLogo = async (name: string) => {
    // First check if we have a custom logo in KV
    try {
      const response = await fetch(`/api/restaurant-logo?name=${encodeURIComponent(name)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.logoUrl) {
          console.log(`Found custom logo for ${name}: ${data.logoUrl}`)
          return data.logoUrl
        }
      }
    } catch (error) {
      console.error("Error fetching custom logo:", error)
    }

    // Fallback to default logos
    const logoMap: Record<string, string> = {
      "Layers Bakeshop": "/images/layers-bakeshop-logo.png",
      KFC: "/images/kfc-logo.png",
      "Tariq Pulao": "/images/tariq-pulao-logo.png",
      "Roll Bar": "/images/rollbar-logo.png",
      "Bannu Pulao": "/images/bannu-pulao-logo.png",
      "Cold Drinks": "/images/coldrinks-logo.png",
      "K2 Ras & Ginger Grill": "/images/k2-logo.png",
      "Ahmed Balochi Sajji": "/images/balochi-sajji-logo.png",
      "Balochi Sajji": "/images/balochi-sajji-logo.png",
      Brillo: "/images/brillo-logo.png",
      "Dr. Saucy": "/images/dr-saucy-logo.png",
      Ranchers: "/images/ranchers-logo.png",
    }

    return logoMap[name] || "/placeholder.svg?height=128&width=128"
  }

  // Get restaurant description
  const getRestaurantDescription = (name: string) => {
    const descriptionMap: Record<string, string> = {
      "Layers Bakeshop": "Delicious cakes, brownies, cookies and more!",
      KFC: "Finger Lickin' Good chicken, burgers, and sides!",
      "Tariq Pulao": "Authentic Pakistani pulao and kababs.",
      "Roll Bar": "Delicious rolls, shawarmas, and BBQ items.",
      "Bannu Pulao": "Traditional Bannu style pulao and chapli kabab.",
      "Cold Drinks": "Refreshing beverages in various sizes.",
      "K2 Ras & Ginger Grill": "Chinese cuisine, momos, and special deals.",
      "Balochi Sajji": "Traditional Balochi sajji and kabuli pulao.",
      "Ahmed Balochi Sajji": "Traditional Balochi sajji and kabuli pulao.",
      Brillo: "Delicious burgers and sides.",
      "Dr. Saucy": "Specializing in ranch-flavored burgers and sandwiches.",
      Ranchers: "Premium steaks and ranch-style dishes.",
    }

    return descriptionMap[name] || "Explore our delicious menu."
  }

  // Function to refresh the menu data
  const refreshMenu = async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      // For Layers Bakeshop, call the special fix endpoint
      if (displayName.toLowerCase().includes("layers")) {
        const response = await fetch("/api/fix-layers-menu")
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.menu) {
            setMenu(data.menu)
            setFilteredMenu(data.menu)
            console.log("Menu refreshed successfully:", data.menu)
          } else {
            throw new Error(data.message || "Failed to refresh menu")
          }
        } else {
          throw new Error(`Server responded with status: ${response.status}`)
        }
      } else {
        // For other restaurants, just re-fetch from API
        await fetchMenu()
      }
    } catch (error) {
      console.error("Error refreshing menu:", error)
      setError(`Failed to refresh menu: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Get display name for the restaurant
  let displayName = restaurantName
  const normalizedName = restaurantName.toLowerCase().trim()

  if (normalizedName.includes("layers")) {
    displayName = "Layers Bakeshop"
  } else if (normalizedName.includes("kfc")) {
    displayName = "KFC"
  } else if (normalizedName.includes("tariq")) {
    displayName = "Tariq Pulao"
  } else if (normalizedName.includes("roll")) {
    displayName = "Roll Bar"
  } else if (normalizedName.includes("bannu")) {
    displayName = "Bannu Pulao"
  } else if (normalizedName.includes("cold") || normalizedName.includes("drink")) {
    displayName = "Cold Drinks"
  } else if (normalizedName.includes("k2") || normalizedName.includes("ras") || normalizedName.includes("ginger")) {
    displayName = "K2 Ras & Ginger Grill"
  } else if (
    normalizedName.includes("balochi") ||
    normalizedName.includes("sajji") ||
    normalizedName.includes("ahmed")
  ) {
    displayName = "Ahmed Balochi Sajji"
  } else if (normalizedName.includes("brllo") || normalizedName.includes("brillo")) {
    displayName = "Brillo"
  } else if (normalizedName.includes("saucy")) {
    displayName = "Dr. Saucy"
  } else if (normalizedName.includes("ranchers")) {
    displayName = "Ranchers"
  }

  // Function to fetch menu data
  const fetchMenu = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`Fetching menu for ${displayName}...`)

      // Special handling for Layers Bakeshop
      if (displayName.toLowerCase().includes("layers")) {
        // Try to get from API first
        const response = await fetch(`/api/restaurants?name=${encodeURIComponent(displayName)}`)

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.menu) {
            console.log("Layers Bakeshop menu from API:", data.menu)

            // Check if the menu has proper categories (not just "Other")
            const hasProperCategories = Object.keys(data.menu).some((category) => category !== "Other")

            if (hasProperCategories) {
              setMenu(data.menu)
              setFilteredMenu(data.menu)
              return
            } else {
              console.log("Menu has only 'Other' category, trying to fix...")
              // Try to fix the menu
              await refreshMenu()
              return
            }
          }
        }

        // If API fails or returns improper data, use client-side data
        console.log("Using client-side data for Layers Bakeshop")
        const clientMenu = getRestaurantMenu(displayName)
        console.log("Client-side Layers Bakeshop menu:", clientMenu)
        setMenu(clientMenu)
        setFilteredMenu(clientMenu)
        return
      }

      // For other restaurants
      const response = await fetch(`/api/restaurants?name=${encodeURIComponent(displayName)}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.menu) {
          console.log("Menu data received from API:", data.menu)
          setMenu(data.menu)
          setFilteredMenu(data.menu)
          return
        }
      }

      // Fallback to client-side data if API fails
      console.log("API failed, falling back to client-side data")
      const clientMenu = getRestaurantMenu(displayName)
      console.log("Client-side menu data:", clientMenu)
      setMenu(clientMenu)
      setFilteredMenu(clientMenu)
    } catch (error) {
      console.error("Error fetching menu:", error)
      setError(`Failed to load menu: ${error instanceof Error ? error.message : String(error)}`)

      // Fallback to client-side data
      const clientMenu = getRestaurantMenu(displayName)
      setMenu(clientMenu)
      setFilteredMenu(clientMenu)
    } finally {
      setIsLoading(false)
    }
  }

  // Load restaurant logo
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const logo = await getRestaurantLogo(displayName)
        setLogoUrl(logo)
        setLogoError(false)
      } catch (error) {
        console.error("Error loading logo:", error)
        setLogoError(true)
        setLogoUrl("/placeholder.svg?height=128&width=128")
      }
    }

    loadLogo()
  }, [displayName])

  useEffect(() => {
    fetchMenu()
  }, [restaurantName])

  useEffect(() => {
    if (!menu) return

    if (!searchQuery.trim()) {
      setFilteredMenu(menu)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered: Record<string, any[]> = {}

    // Filter menu items based on search query
    Object.entries(menu).forEach(([category, items]) => {
      const matchingItems = items.filter((item) => {
        const itemName = item["Item Name"]?.toLowerCase() || ""
        const description = item["Description"]?.toLowerCase() || ""
        const categoryLower = category.toLowerCase()

        return itemName.includes(query) || description.includes(query) || categoryLower.includes(query)
      })

      if (matchingItems.length > 0) {
        filtered[category] = matchingItems
      }
    })

    setFilteredMenu(filtered)
  }, [searchQuery, menu])

  // Highlight matching text in search results
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim() || !text) return text || ""

    const regex = new RegExp(`(${query.trim()})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const handleImageError = () => {
    console.log("Image failed to load, using placeholder")
    setLogoError(true)
    setLogoUrl("/placeholder.svg?height=128&width=128")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (!menu) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Restaurant not found: "{restaurantName}"
        </div>
        <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Back to Restaurants
        </Link>
      </div>
    )
  }

  const hasResults = filteredMenu && Object.keys(filteredMenu).length > 0
  const totalItems = Object.values(menu).reduce((acc, items) => acc + items.length, 0)
  const filteredItems = filteredMenu ? Object.values(filteredMenu).reduce((acc, items) => acc + items.length, 0) : 0

  return (
    <main className="container mx-auto p-4">
      <BackButton label="Back to Restaurants" />
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
        {logoUrl && (
          <div className="w-32 h-32 relative flex-shrink-0">
            <Image
              src={logoUrl || "/placeholder.svg"}
              alt={`${displayName} logo`}
              width={128}
              height={128}
              className="object-contain"
              onError={handleImageError}
              priority
            />
          </div>
        )}
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{displayName} Menu</h1>
            <button
              onClick={refreshMenu}
              className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
              disabled={isRefreshing}
              title="Refresh menu"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
          <p className="text-gray-600 mt-2 mb-4">{getRestaurantDescription(displayName)}</p>

          {/* Daily Order Indicator */}
          <div className="mb-4">
            <DailyOrderIndicator restaurantName={displayName} />
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {/* Search input */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search menu"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredItems} of {totalItems} items
            </div>
          )}
        </div>
      </div>

      {hasResults ? (
        Object.entries(filteredMenu).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">{highlightMatch(category, searchQuery)}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item: any, index: number) => (
                <li key={index} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
                      <h3 className="text-xl font-medium">{highlightMatch(item["Item Name"], searchQuery)}</h3>
                      <p className="text-gray-600 mt-1 text-sm">{highlightMatch(item["Description"], searchQuery)}</p>
                      <p className="font-bold mt-2 text-blue-600">Rs. {item["Price (Rs.)"] || "N/A"}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t">
                      <AddToCartForm
                        restaurantName={displayName}
                        itemName={item["Item Name"]}
                        price={item["Price (Rs.)"] || 0}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-lg text-gray-600 mb-4">No menu items found matching "{searchQuery}"</p>
          <button
            onClick={clearSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      <div className="mt-8 flex space-x-4">
        <Link href="/cart" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          View Cart
        </Link>
        <Link href="/" className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
          Back to Restaurants
        </Link>
      </div>
    </main>
  )
}
