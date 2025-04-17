import { NextResponse } from "next/server"
import { getRecentOrdersFromKV } from "@/lib/kv-database"
import { google } from "googleapis"

// Google Sheets configuration
const SPREADSHEET_ID = "1MwPq5nQGlxHXoKeXLyYBkHkEXULi2w8L6LYrBRulzz8"

// Initialize Google Sheets API with the provided credentials
async function getGoogleSheetsClient() {
  try {
    // Use the provided credentials directly
    const credentials = {
      type: "service_account",
      project_id: "total-pillar-445808-e5",
      private_key_id: "7cf49fa4545ff9d4706b023477112931f96d6299",
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDBNXtQ/gd8Td9h\nNHkBEWlDog2MGejvt7SF5XhqafPowKfzyzWslWm/aVaHVcDLXlUe2T8nPlIJXX/7\nhuXhEDz6ogJq182HZ+2GY7vQzRND9bgtXD8m2vAfnNZ5ZoHZ+yDmLVfahkcVU2ZD\nowDj6l6p9OVzLdISyBzIfp9qbRPm9yAW3amSSzWtHxrgjeQc7/V1b92qFy9EAXib\nuJiYLPRXDpvRvOff87vYpySK2aqksBoBkVa0it7yElSLqiKrfb8ZkrV47vW9tmVU\nl11Wgc2BTc3BDhtKIfXlF4o3c0qCkZe1xP8bjE66I36osNf/6sjRTDXmMS6AEPEW\no/UkolNRAgMBAAECggEAEdDX2K2RTM3fdxaqwRr1Emv7L3vk0Kn8vEtfHFeTIAIX\n2pwBNzNQh3pz+fxseomYdBpDP7VNmkMkEzJVYzinRCiJQYc5vVkrfAoZSP/dXWsR\n5c43nTfGDvGG42CSQQ1DnjCjL77UXNaOZlaTCpvTc9I7EDEISdFoZLfXBQN0ONv6\nwYVrfBAKytIXGTWyX4kcQEKTO0khr+ooh9ypZ5shlSgody8TLeJlglvjUGI3MQYh\nsQ6ueSwEbjtVDNxlX4Csxpy21mXi2UUrd6PPtVh17jeXc7e8eTMpetaE970+0qjl\nXOK1wHYNILdhfRR5zWdN71C+4BJCGCdVecWB+9VVcwKBgQDoa2llhAcLvScmUuzg\n4o/Is6/yi3hItxMRxvXBic4ws0bcE2B5DllNuybkx6PIQKQUap9q80fqvx8qqoeR\nHeQv0c0Sg3A+B+IPCnWlaV7wEA6vYl2K00QBAIDOve8zMG7QXvLr47WAb8yA3A8S\ncu/9OeiehkRwQNyLnlfh++L5JwKBgQDUz6i5R2Wvbr3UxOREAr24DFlqyHgu1tEj\nlKqcpFDOF0it5t1IStb74fOZqgZr9T4nsnNHWsgM9o8UJ1omzjFRAqUXM8r1ZY2I\ngOhv/wizr+uIDLm/rerpZ+HpZ7qkvjS1/oAB163J5tMEsu1D/CH8pDBVF9jwYsx7\n9aks7APqxwKBgAKDrvc3L3BUEolamk9whAey0fN4yMtYl684jM4UNJPYTKry1rdY\njWTG4ovVEROIh33lDWZ1zVBf0vF+OMs8HIzb4zERFPTG1w48mbs5YZqNQetp0ANB\nd9ne7IXQDjdqjbhZXp1osDz8eKToPI2BitEdgEO+xhzExt4Hz4GVXQY/AoGAT8OV\nxfxQzLSBSmKR/DvayEU4rqF9CnFR6jgqypN8BgMMJsJFZndGpRpHp+zmg0hkh5SH\nSNNp8BHqBu/JBop6SZboMg4joF7z8Zn/hRreNBtX+KJsbL/PMLTTJBzRBDaWozBE\n4mvoo6h0p2o5LCYwxvTzeLF7in49jqjBRCkiPrkCgYAZXheDpsVwZd1NyOiMqQpl\n17IZkBRt0XCt0rMtJxOfbQZCO9v9SxVCawdvYeo+1XUsV60AXKmW6aY5qih5aY7T\nOgOPJILyAGC+JxGwdclACrOpLu+lWrLxPGk0Cq7LYLG55iry+NDnxGfkhquldB45\nB1nFJBeMpsy/rTizEUxpnw==\n-----END PRIVATE KEY-----\n",
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

// Function to get orders from Google Sheets
async function getOrdersFromGoogleSheets(limit = 50) {
  try {
    const sheets = await getGoogleSheetsClient()
    if (!sheets) {
      console.warn("Google Sheets client not available")
      return null
    }

    // Get order headers from Orders sheet
    const orderResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Orders!A:I",
    })

    const orderRows = orderResponse.data.values || []
    if (orderRows.length <= 1) {
      console.log("No orders found in Google Sheets (only headers)")
      return []
    }

    // Skip header row and take up to limit rows
    const orderData = orderRows.slice(1, limit + 1)

    if (orderData.length === 0) {
      console.log("No orders found in Google Sheets")
      return []
    }

    // Get order details from OrderDetails sheet
    const detailsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "OrderDetails!A:G",
    })

    const detailsRows = detailsResponse.data.values || []
    const detailsData = detailsRows.length > 1 ? detailsRows.slice(1) : []

    // Process orders
    const orders = []
    for (const row of orderData) {
      const orderId = row[0]

      // Group items by restaurant
      const orderDetails = detailsData.filter((detail) => detail[0] === orderId)
      const restaurantOrders = {}

      orderDetails.forEach((detail) => {
        const restaurantName = detail[2]
        const item = {
          restaurantName,
          itemName: detail[3],
          price: Number.parseFloat(detail[4]),
          quantity: Number.parseInt(detail[5], 10),
        }

        if (!restaurantOrders[restaurantName]) {
          restaurantOrders[restaurantName] = []
        }
        restaurantOrders[restaurantName].push(item)
      })

      // Construct order object
      const order = {
        orderId,
        orderDate: row[1],
        customer: {
          email: row[2],
          firstName: row[3],
          lastName: row[4],
          phoneNumber: row[5],
        },
        persons: Number.parseInt(row[6], 10) || 1,
        deliveryFee: Number.parseFloat(row[7]) || 0,
        total: Number.parseFloat(row[8]) || 0,
        restaurantOrders,
        itemsTotal: Number.parseFloat(row[8]) - Number.parseFloat(row[7]) || 0,
      }

      orders.push(order)
    }

    return orders
  } catch (error) {
    console.error("Error getting orders from Google Sheets:", error)
    return null
  }
}

export async function GET() {
  try {
    // First try to get orders from Google Sheets
    const sheetsOrders = await getOrdersFromGoogleSheets(50)

    if (sheetsOrders && sheetsOrders.length > 0) {
      console.log(`Retrieved ${sheetsOrders.length} orders from Google Sheets`)
      return NextResponse.json({
        success: true,
        orders: sheetsOrders,
      })
    }

    // Fallback to KV database if Google Sheets fails or returns no orders
    console.log("No orders found in Google Sheets, trying KV database")
    const kvOrders = await getRecentOrdersFromKV(50)
    console.log(`Retrieved ${kvOrders.length} orders from KV database`)

    return NextResponse.json({
      success: true,
      orders: kvOrders.length > 0 ? kvOrders : [],
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
