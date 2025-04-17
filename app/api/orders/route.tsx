import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { google } from "googleapis"
import { saveOrderToKV, getOrderFromKV } from "@/lib/kv-database"

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || "1MwPq5nQGlxHXoKeXLyYBkHkEXULi2w8L6LYrBRulzz8"

// Initialize Google Sheets API with the provided credentials
async function getGoogleSheetsClient() {
  try {
    // Use the provided credentials directly
    const credentials = {
      type: "service_account",
      project_id: "total-pillar-445808-e5",
      private_key_id: "7cf49fa4545ff9d4706b023477112931f96d6299",
      private_key: process.env.GOOGLE_CREDENTIALS
        ? JSON.parse(process.env.GOOGLE_CREDENTIALS).private_key
        : "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDBNXtQ/gd8Td9h\nNHkBEWlDog2MGejvt7SF5XhqafPowKfzyzWslWm/aVaHVcDLXlUe2T8nPlIJXX/7\nhuXhEDz6ogJq182HZ+2GY7vQzRND9bgtXD8m2vAfnNZ5ZoHZ+yDmLVfahkcVU2ZD\nowDj6l6p9OVzLdISyBzIfp9qbRPm9yAW3amSSzWtHxrgjeQc7/V1b92qFy9EAXib\nuJiYLPRXDpvRvOff87vYpySK2aqksBoBkVa0it7yElSLqiKrfb8ZkrV47vW9tmVU\nl11Wgc2BTc3BDhtKIfXlF4o3c0qCkZe1xP8bjE66I36osNf/6sjRTDXmMS6AEPEW\no/UkolNRAgMBAAECggEAEdDX2K2RTM3fdxaqwRr1Emv7L3vk0Kn8vEtfHFeTIAIX\n2pwBNzNQh3pz+fxseomYdBpDP7VNmkMkEzJVYzinRCiJQYc5vVkrfAoZSP/dXWsR\n5c43nTfGDvGG42CSQQ1DnjCjL77UXNaOZlaTCpvTc9I7EDEISdFoZLfXBQN0ONv6\nwYVrfBAKytIXGTWyX4kcQEKTO0khr+ooh9ypZ5shlSgody8TLeJlglvjUGI3MQYh\nsQ6ueSwEbjtVDNxlX4Csxpy21mXi2UUrd6PPtVh17jeXc7e8eTMpetaE970+0qjl\nXOK1wHYNILdhfRR5zWdN71C+4BJCGCdVecWB+9VVcwKBgQDoa2llhAcLvScmUuzg\n4o/Is6/yi3hItxMRxvXBic4ws0bcE2B5DllNuybkx6PIQKQUap9q80fqvx8qqoeR\nHeQv0c0Sg3A+B+IPCnWlaV7wEA6vYl2K00QBAIDOve8zMG7QXvLr47WAb8yA3A8S\ncu/9OeiehkRwQNyLnlfh++L5JwKBgQDUz6i5R2Wvbr3UxOREAr24DFlqyHgu1tEj\nlKqcpFDOF0it5t1IStb74fOZqgZr9T4nsnNHWsgM9o8UJ1omzjFRAqUXM8r1ZY2I\ngOhv/wizr+uIDLm/rerpZ+HpZ7qkvjS1/oAB163J5tMEsu1D/CH8pDBVF9jwYsx7\n9aks7APqxwKBgAKDrvc3L3BUEolamk9whAey0fN4yMtYl684jM4UNJPYTKry1rdY\njWTG4ovVEROIh33lDWZ1zVBf0vF+OMs8HIzb4zERFPTG1w48mbs5YZqNQetp0ANB\nd9ne7IXQDjdqjbhZXp1osDz8eKToPI2BitEdgEO+xhzExt4Hz4GVXQY/AoGAT8OV\nxfxQzLSBSmKR/DvayEU4rqF9CnFR6jgqypN8BgMMJsJFZndGpRpHp+zmg0hkh5SH\nSNNp8BHqBu/JBop6SZboMg4joF7z8Zn/hRreNBtX+KJsbL/PMLTTJBzRBDaWozBE\n4mvoo6h0p2o5LCYwxvTzeLF7in49jqjBRCkiPrkCgYAZXheDpsVwZd1NyOiMqQpl\n17IZkBRt0XCt0rMtJxOfbQZCO9v9SxVCawdvYeo+1XUsV60AXKmW6aY5qih5aY7T\nOgOPJILyAGC+JxGwdclACrOpLu+lWrLxPGk0Cq7LYLG55iry+NDnxGfkhquldB45\nB1nFJBeMpsy/rTizEUxpnw==\n-----END PRIVATE KEY-----\n",
      client_email: "hungryboys@total-pillar-445808-e5.iam.gserviceaccount.com",
      client_id: "115085988263832766006",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/hungryboys%40total-pillar-445808-e5.iam.gserviceaccount.com",
      universe_domain: "googleapis.com",
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    return sheets
  } catch (error) {
    console.error("Error initializing Google Sheets client:", error)
    return null
  }
}

// Function to save order directly to KV if the imported function fails
async function saveOrderToKVDirectly(order: any) {
  try {
    console.log(`Directly saving order ${order.orderId} to KV database`)

    // Save order with TTL of 30 days (in seconds)
    const TTL_30_DAYS = 60 * 60 * 24 * 30
    await kv.set(`order:${order.orderId}`, order, { ex: TTL_30_DAYS })

    // Also add to orders list with a maximum of 100 recent orders
    await kv.lpush("orders", order.orderId)
    await kv.ltrim("orders", 0, 99) // Keep only the 100 most recent orders

    // Increment daily restaurant order counts
    if (order.restaurantOrders) {
      await incrementDailyOrderCountDirectly(Object.keys(order.restaurantOrders))
    }

    return true
  } catch (error) {
    console.error("Error directly saving order to KV:", error)
    return false
  }
}

// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

// Function to increment daily restaurant order count directly
async function incrementDailyOrderCountDirectly(restaurantNames: string[]) {
  try {
    const currentDate = getCurrentDate()
    console.log(`Incrementing daily order count for restaurants: ${restaurantNames.join(", ")}`)

    for (const restaurantName of restaurantNames) {
      const normalizedName = restaurantName.toLowerCase().replace(/\s+/g, "_")
      const key = `daily_orders:${normalizedName}:${currentDate}`

      console.log(`Incrementing count for key: ${key}`)

      // Increment the counter
      const newCount = await kv.incr(key)
      console.log(`New count for ${key}: ${newCount}`)

      // Set expiry to end of day (midnight)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const secondsUntilMidnight = Math.floor((tomorrow.getTime() - Date.now()) / 1000)
      await kv.expire(key, secondsUntilMidnight)
    }

    return true
  } catch (error) {
    console.error("Error incrementing daily restaurant order count directly:", error)
    return false
  }
}

// Function to get order from KV directly if the imported function fails
async function getOrderFromKVDirectly(orderId: string) {
  try {
    console.log(`Directly fetching order ${orderId} from KV database`)
    const order = await kv.get(`order:${orderId}`)
    return order
  } catch (error) {
    console.error(`Error directly getting order ${orderId} from KV:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 })
    }

    console.log(`Fetching order ${orderId}`)

    // Try to get order from KV using the imported function
    let order = null
    try {
      order = await getOrderFromKV(orderId)
      console.log(`Order ${orderId} fetched from KV using imported function: ${order ? "success" : "not found"}`)
    } catch (error) {
      console.error("Error fetching from KV using imported function:", error)
    }

    // If the imported function fails, try direct KV fetching
    if (!order) {
      try {
        order = await getOrderFromKVDirectly(orderId)
        console.log(`Order ${orderId} fetched directly from KV: ${order ? "success" : "not found"}`)
      } catch (error) {
        console.error("Error fetching directly from KV:", error)
      }
    }

    // If still no order, try to get from Google Sheets
    if (!order) {
      try {
        console.log("Attempting to fetch order from Google Sheets")
        const sheets = await getGoogleSheetsClient()

        if (sheets) {
          // Get order header from Orders sheet
          const orderResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Orders!A:J",
          })

          const orderRows = orderResponse.data.values || []
          const orderRow = orderRows.find((row) => row[0] === orderId)

          if (orderRow) {
            console.log(`Found order ${orderId} in Google Sheets`)

            // Get order details from OrderDetails sheet
            const detailsResponse = await sheets.spreadsheets.values.get({
              spreadsheetId: SPREADSHEET_ID,
              range: "OrderDetails!A:G",
            })

            const detailsRows = detailsResponse.data.values || []
            const orderDetails = detailsRows.filter((row) => row[0] === orderId)

            if (orderDetails.length > 0) {
              // Construct restaurantOrders object
              const restaurantOrders: Record<string, any[]> = {}

              orderDetails.forEach((detail) => {
                const restaurantName = detail[2]
                const item = {
                  restaurantName,
                  itemName: detail[3],
                  price: Number(detail[4]),
                  quantity: Number(detail[5]),
                }

                if (!restaurantOrders[restaurantName]) {
                  restaurantOrders[restaurantName] = []
                }

                restaurantOrders[restaurantName].push(item)
              })

              // Create order object
              order = {
                orderId,
                orderDate: orderRow[1],
                customer: {
                  email: orderRow[2],
                  firstName: orderRow[3],
                  lastName: orderRow[4],
                  phoneNumber: orderRow[5],
                },
                persons: Number(orderRow[6]),
                restaurantOrders,
                itemsTotal: Number(orderRow[8]) - Number(orderRow[7]),
                deliveryFee: Number(orderRow[7]),
                total: Number(orderRow[8]),
                specialInstructions: orderRow[9] || "",
              }

              // Save to KV for future use
              await saveOrderToKVDirectly(order)
              console.log(`Order ${orderId} reconstructed from Google Sheets and saved to KV`)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching from Google Sheets:", error)
      }
    }

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch order: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("Received order data:", JSON.stringify(data, null, 2))

    const {
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
      orderDate,
    } = data

    // Group cart items by restaurant
    const restaurantOrders: Record<string, any[]> = {}
    cart.forEach((item: any) => {
      if (!restaurantOrders[item.restaurantName]) {
        restaurantOrders[item.restaurantName] = []
      }
      restaurantOrders[item.restaurantName].push(item)
    })

    // Create order object
    const order = {
      orderId,
      orderDate,
      customer: {
        email,
        firstName,
        lastName,
        phoneNumber,
      },
      persons,
      restaurantOrders,
      itemsTotal,
      deliveryFee,
      total,
      specialInstructions,
    }

    // Save to Google Sheets (primary storage)
    let googleSheetsSaved = false
    try {
      // Get Google Sheets client
      const sheets = await getGoogleSheetsClient()

      // Only proceed with Google Sheets if client is available
      if (sheets) {
        // Append to master orders sheet
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: "Orders!A:J",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [
              [
                orderId,
                new Date(orderDate).toISOString(),
                email,
                firstName,
                lastName,
                phoneNumber,
                persons,
                deliveryFee,
                total,
                specialInstructions || "",
              ],
            ],
          },
        })

        // Append order items to order details sheet
        const orderItems = cart.map((item: any) => [
          orderId,
          new Date(orderDate).toISOString(),
          item.restaurantName,
          item.itemName,
          item.price,
          item.quantity,
          item.price * item.quantity,
        ])

        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: "OrderDetails!A:G",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: orderItems,
          },
        })

        console.log(`Order ${orderId} saved to Google Sheets`)
        googleSheetsSaved = true
      } else {
        console.log("Google Sheets client not available, skipping sheet operations")
      }
    } catch (error) {
      console.error("Error saving to Google Sheets:", error)
    }

    // Try to save order to KV database using the imported function
    let kvSaved = false
    try {
      kvSaved = await saveOrderToKV(order)
      console.log(`Order ${orderId} saved to KV database using imported function: ${kvSaved ? "success" : "failed"}`)
    } catch (error) {
      console.error("Error saving to KV using imported function:", error)
    }

    // If the imported function fails, try direct KV saving
    if (!kvSaved) {
      try {
        kvSaved = await saveOrderToKVDirectly(order)
        console.log(`Order ${orderId} saved directly to KV database: ${kvSaved ? "success" : "failed"}`)
      } catch (error) {
        console.error("Error saving directly to KV:", error)
      }
    }

    // Check if order was saved to any storage system
    if (!googleSheetsSaved && !kvSaved) {
      console.error("Failed to save order to any storage system")
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save order to any storage system",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order saved successfully",
    })
  } catch (error) {
    console.error("Error saving order:", error)
    // Ensure we return a properly formatted JSON response even on error
    return NextResponse.json(
      {
        success: false,
        message: `Failed to save order: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
