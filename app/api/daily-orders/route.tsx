import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { getDailyRestaurantOrderCount } from "@/lib/kv-database"

// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

// Function to get daily restaurant order count directly from KV
async function getDailyOrderCountDirectly(restaurantName: string): Promise<number> {
  try {
    const currentDate = getCurrentDate()
    const normalizedName = restaurantName.toLowerCase().replace(/\s+/g, "_")
    const key = `daily_orders:${normalizedName}:${currentDate}`

    console.log(`Fetching daily order count for key: ${key}`)
    const count = await kv.get<number>(key)
    console.log(`Count from KV for ${key}: ${count !== null ? count : "null"}`)

    // If count is null, try to check if there are any orders for this restaurant today
    if (count === null) {
      try {
        // Get all orders from today
        const allOrders = await kv.lrange("orders", 0, -1)
        let todayOrderCount = 0

        // For each order, check if it's from today and contains this restaurant
        for (const orderId of allOrders) {
          const order = await kv.get(`order:${orderId}`)
          if (order && typeof order === "object") {
            // Check if order is from today
            const orderDate = new Date(order.orderDate)
            const today = new Date()
            if (
              orderDate.getDate() === today.getDate() &&
              orderDate.getMonth() === today.getMonth() &&
              orderDate.getFullYear() === today.getFullYear()
            ) {
              // Check if order contains this restaurant
              if (
                order.restaurantOrders &&
                Object.keys(order.restaurantOrders).some((name) => name.toLowerCase() === restaurantName.toLowerCase())
              ) {
                todayOrderCount++
              }
            }
          }
        }

        console.log(`Calculated ${todayOrderCount} orders for ${restaurantName} today from order history`)

        // Set the count in KV for future use
        if (todayOrderCount > 0) {
          await kv.set(key, todayOrderCount)

          // Set expiry to end of day
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          tomorrow.setHours(0, 0, 0, 0)
          const secondsUntilMidnight = Math.floor((tomorrow.getTime() - Date.now()) / 1000)
          await kv.expire(key, secondsUntilMidnight)

          return todayOrderCount
        }
      } catch (error) {
        console.error("Error calculating order count from history:", error)
      }
    }

    return count || 0
  } catch (error) {
    console.error(`Error getting daily order count directly for ${restaurantName}:`, error)
    return 0
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantName = searchParams.get("restaurant")

    if (!restaurantName) {
      return NextResponse.json({ success: false, message: "Restaurant name is required" }, { status: 400 })
    }

    console.log(`Getting daily order count for restaurant: ${restaurantName}`)

    // Try to get count using the imported function
    let count = 0
    try {
      count = await getDailyRestaurantOrderCount(restaurantName)
      console.log(`Count from imported function for ${restaurantName}: ${count}`)
    } catch (error) {
      console.error("Error using imported function:", error)
    }

    // If the imported function returns 0 or fails, try direct KV access
    if (count === 0) {
      try {
        count = await getDailyOrderCountDirectly(restaurantName)
        console.log(`Count from direct KV access for ${restaurantName}: ${count}`)
      } catch (error) {
        console.error("Error using direct KV access:", error)
      }
    }

    // For testing purposes, if the count is still 0, set a random count between 1-10
    // Remove this in production
    if (count === 0 && process.env.NODE_ENV !== "production") {
      count = Math.floor(Math.random() * 10) + 1
      console.log(`Using random count for testing: ${count}`)
    }

    return NextResponse.json({
      success: true,
      count,
    })
  } catch (error) {
    console.error("Error getting daily order count:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get daily order count",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
