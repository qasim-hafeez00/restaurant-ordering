import { kv } from "@vercel/kv"

// Restaurant data types
export interface MenuItem {
  Category: string
  "Item Name": string
  "Price (Rs.)": number
  Description: string
}

export interface RestaurantMenu {
  [category: string]: MenuItem[]
}

export interface Order {
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
  specialInstructions?: string
}

// KV database operations for restaurants
export async function getRestaurantsFromKV() {
  try {
    // Get restaurants from KV or use default if not found
    const restaurants = await kv.get<Record<string, string>>("restaurants")

    if (!restaurants) {
      // If no restaurants in KV, use the default ones from data-client
      const defaultRestaurants = {
        "Layers Bakeshop": "layers_bakeshop_menu.json",
        KFC: "kfc_menu.json",
        "Tariq Pulao": "tariq_pulao_menu.json",
        "Roll Bar": "rollbar_menu.json",
        "Bannu Pulao": "bannu_pulao_menu.json",
        "Cold Drinks": "coldrinks_menu.json",
        "K2 Ras & Ginger Grill": "k2_menu.json",
        "Balochi Sajji": "balochi_sajji_menu.json",
      }

      // Store default restaurants in KV for future use
      await kv.set("restaurants", defaultRestaurants)
      return defaultRestaurants
    }

    return restaurants
  } catch (error) {
    console.error("Error getting restaurants from KV:", error)
    // Fallback to empty object in case of error
    return {}
  }
}

// KV database operations for restaurant menus
export async function getRestaurantMenuFromKV(restaurantName: string) {
  try {
    // Try to get menu from KV
    const kvKey = `menu:${restaurantName.toLowerCase().replace(/\s+/g, "_")}`
    const menu = await kv.get<RestaurantMenu>(kvKey)

    if (menu) {
      return menu
    }

    // If not found in KV, return null (will be handled by the caller)
    return null
  } catch (error) {
    console.error(`Error getting menu for ${restaurantName} from KV:`, error)
    return null
  }
}

// Save a restaurant menu to KV
export async function saveRestaurantMenuToKV(restaurantName: string, menu: RestaurantMenu) {
  try {
    const kvKey = `menu:${restaurantName.toLowerCase().replace(/\s+/g, "_")}`
    await kv.set(kvKey, menu)
    return true
  } catch (error) {
    console.error(`Error saving menu for ${restaurantName} to KV:`, error)
    return false
  }
}

// KV database operations for orders
export async function saveOrderToKV(order: Order) {
  try {
    console.log(`Saving order ${order.orderId} to KV database`)

    // Save order with TTL of 30 days (in seconds)
    const TTL_30_DAYS = 60 * 60 * 24 * 30
    await kv.set(`order:${order.orderId}`, order, { ex: TTL_30_DAYS })

    // Also add to orders list with a maximum of 100 recent orders
    await kv.lpush("orders", order.orderId)
    await kv.ltrim("orders", 0, 99) // Keep only the 100 most recent orders

    // Increment daily restaurant order counts
    await incrementDailyRestaurantOrderCount(Object.keys(order.restaurantOrders))

    return true
  } catch (error) {
    console.error("Error saving order to KV:", error)
    return false
  }
}

export async function getOrderFromKV(orderId: string) {
  try {
    console.log(`Fetching order ${orderId} from KV database`)
    const order = await kv.get<Order>(`order:${orderId}`)
    return order
  } catch (error) {
    console.error(`Error getting order ${orderId} from KV:`, error)
    return null
  }
}

export async function getRecentOrdersFromKV(limit = 10) {
  try {
    console.log(`Fetching up to ${limit} recent orders from KV database`)

    // Get the most recent order IDs
    const orderIds = await kv.lrange("orders", 0, limit - 1)
    console.log(`Found ${orderIds.length} order IDs in KV database`)

    // Fetch each order
    const orderPromises = orderIds.map((id) => kv.get<Order>(`order:${id}`))
    const orders = await Promise.all(orderPromises)

    // Filter out any null values (in case an order was deleted)
    const validOrders = orders.filter(Boolean) as Order[]
    console.log(`Retrieved ${validOrders.length} valid orders from KV database`)

    return validOrders
  } catch (error) {
    console.error("Error getting recent orders from KV:", error)
    return []
  }
}

// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

// Function to increment daily restaurant order count
async function incrementDailyRestaurantOrderCount(restaurantNames: string[]) {
  try {
    const currentDate = getCurrentDate()

    for (const restaurantName of restaurantNames) {
      const normalizedName = restaurantName.toLowerCase().replace(/\s+/g, "_")
      const key = `daily_orders:${normalizedName}:${currentDate}`

      // Increment the counter
      await kv.incr(key)

      // Set expiry to end of day (midnight)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const secondsUntilMidnight = Math.floor((tomorrow.getTime() - Date.now()) / 1000)
      await kv.expire(key, secondsUntilMidnight)
    }

    return true
  } catch (error) {
    console.error("Error incrementing daily restaurant order count:", error)
    return false
  }
}

// Function to get daily restaurant order count
export async function getDailyRestaurantOrderCount(restaurantName: string): Promise<number> {
  try {
    const currentDate = getCurrentDate()
    const normalizedName = restaurantName.toLowerCase().replace(/\s+/g, "_")
    const key = `daily_orders:${normalizedName}:${currentDate}`

    const count = await kv.get<number>(key)
    return count || 0
  } catch (error) {
    console.error(`Error getting daily order count for ${restaurantName}:`, error)
    return 0
  }
}
