import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
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

// Get sheet IDs from the spreadsheet
async function getSheetIds(sheets: any) {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const sheetsInfo = response.data.sheets
    const ordersSheet = sheetsInfo.find((sheet: any) => sheet.properties.title === "Orders")
    const orderDetailsSheet = sheetsInfo.find((sheet: any) => sheet.properties.title === "OrderDetails")

    return {
      ordersSheetId: ordersSheet ? ordersSheet.properties.sheetId : 0,
      orderDetailsSheetId: orderDetailsSheet ? orderDetailsSheet.properties.sheetId : 1,
    }
  } catch (error) {
    console.error("Error getting sheet IDs:", error)
    return { ordersSheetId: 0, orderDetailsSheetId: 1 }
  }
}

export async function POST(request: Request) {
  try {
    const { orderIds } = await request.json()

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ success: false, message: "No order IDs provided" }, { status: 400 })
    }

    console.log(`Attempting to delete ${orderIds.length} orders: ${orderIds.join(", ")}`)

    // Delete from KV database
    let kvDeleteSuccess = true
    for (const orderId of orderIds) {
      try {
        // Delete the order data
        await kv.del(`order:${orderId}`)

        // Remove from orders list
        await kv.lrem("orders", 0, orderId)

        console.log(`Successfully deleted order ${orderId} from KV database`)
      } catch (error) {
        console.error(`Error deleting order ${orderId} from KV:`, error)
        kvDeleteSuccess = false
      }
    }

    // Delete from Google Sheets
    let sheetsDeleteSuccess = false
    try {
      const sheets = await getGoogleSheetsClient()

      if (sheets) {
        // Get sheet IDs
        const { ordersSheetId, orderDetailsSheetId } = await getSheetIds(sheets)

        // Get all orders from the Orders sheet
        const ordersResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: "Orders!A:I",
        })

        const ordersRows = ordersResponse.data.values || []
        if (ordersRows.length <= 1) {
          console.log("No orders found in Google Sheets (only headers)")
        } else {
          // Find the rows to delete in Orders sheet
          const ordersRowsToDelete = []
          for (let i = 1; i < ordersRows.length; i++) {
            if (orderIds.includes(ordersRows[i][0])) {
              ordersRowsToDelete.push(i + 1) // +1 because sheets are 1-indexed
            }
          }

          // Get all order details from the OrderDetails sheet
          const detailsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "OrderDetails!A:G",
          })

          const detailsRows = detailsResponse.data.values || []

          // Find the rows to delete in OrderDetails sheet
          const detailsRowsToDelete = []
          if (detailsRows.length > 1) {
            for (let i = 1; i < detailsRows.length; i++) {
              if (orderIds.includes(detailsRows[i][0])) {
                detailsRowsToDelete.push(i + 1) // +1 because sheets are 1-indexed
              }
            }
          }

          // Create batch update requests
          const requests = []

          // Add requests to delete rows from Orders sheet (in reverse order)
          if (ordersRowsToDelete.length > 0) {
            for (const rowIndex of ordersRowsToDelete.sort((a, b) => b - a)) {
              requests.push({
                deleteDimension: {
                  range: {
                    sheetId: ordersSheetId,
                    dimension: "ROWS",
                    startIndex: rowIndex - 1, // 0-indexed in API
                    endIndex: rowIndex, // exclusive end index
                  },
                },
              })
            }
          }

          // Add requests to delete rows from OrderDetails sheet (in reverse order)
          if (detailsRowsToDelete.length > 0) {
            for (const rowIndex of detailsRowsToDelete.sort((a, b) => b - a)) {
              requests.push({
                deleteDimension: {
                  range: {
                    sheetId: orderDetailsSheetId,
                    dimension: "ROWS",
                    startIndex: rowIndex - 1, // 0-indexed in API
                    endIndex: rowIndex, // exclusive end index
                  },
                },
              })
            }
          }

          // Execute batch update if there are requests
          if (requests.length > 0) {
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId: SPREADSHEET_ID,
              requestBody: {
                requests: requests,
              },
            })

            sheetsDeleteSuccess = true
            console.log(
              `Successfully deleted ${ordersRowsToDelete.length} orders and ${detailsRowsToDelete.length} order details from Google Sheets`,
            )
          } else {
            console.log("No matching rows found to delete in Google Sheets")
          }
        }
      } else {
        console.log("Google Sheets client not available, skipping sheet operations")
      }
    } catch (error) {
      console.error("Error deleting from Google Sheets:", error)
    }

    return NextResponse.json({
      success: true,
      message: `Orders deleted successfully${!sheetsDeleteSuccess ? " (from KV only)" : ""}`,
      deletedOrderIds: orderIds,
      kvDeleteSuccess,
      sheetsDeleteSuccess,
    })
  } catch (error) {
    console.error("Error in delete-orders API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete orders",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
