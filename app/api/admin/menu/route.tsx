import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// GET a restaurant menu
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantName = searchParams.get("restaurant")

    if (!restaurantName) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant name is required",
        },
        { status: 400 },
      )
    }

    // Get the menu from KV
    const menuKey = `menu:${restaurantName.toLowerCase().replace(/\s+/g, "_")}`
    console.log(`Fetching menu with key: ${menuKey}`)
    const menu = await kv.get(menuKey)

    if (menu) {
      console.log(`Menu found for ${restaurantName}:`, menu)
      return NextResponse.json({
        success: true,
        menu,
      })
    }

    // If not in KV, try to get from hardcoded data
    // Normalize restaurant name for case-insensitive matching
    const normalizedName = restaurantName.toLowerCase().trim()
    let hardcodedMenu = null

    try {
      // Import the data-client module dynamically
      const dataClient = await import("@/lib/data-client")

      if (normalizedName.includes("layers")) {
        hardcodedMenu = dataClient.getLayersBakeshopMenu()
      } else if (normalizedName.includes("kfc")) {
        hardcodedMenu = dataClient.getKFCMenu()
      } else if (normalizedName.includes("tariq")) {
        hardcodedMenu = dataClient.getTariqPulaoMenu()
      } else if (normalizedName.includes("roll")) {
        hardcodedMenu = dataClient.getRollBarMenu()
      } else if (normalizedName.includes("bannu")) {
        hardcodedMenu = dataClient.getBannuPulaoMenu()
      } else if (normalizedName.includes("cold") || normalizedName.includes("drink")) {
        hardcodedMenu = dataClient.getColdDrinksMenu()
      } else if (normalizedName.includes("k2") || normalizedName.includes("ras") || normalizedName.includes("ginger")) {
        hardcodedMenu = dataClient.getK2Menu()
      } else if (
        normalizedName.includes("balochi") ||
        normalizedName.includes("sajji") ||
        normalizedName.includes("ahmed")
      ) {
        hardcodedMenu = dataClient.getBalochiSajjiMenu()
      } else if (normalizedName.includes("brillo")) {
        hardcodedMenu = dataClient.getBrilloMenu()
      } else if (normalizedName.includes("saucy")) {
        hardcodedMenu = dataClient.getDrSaucyMenu()
      } else if (normalizedName.includes("ranchers")) {
        hardcodedMenu = dataClient.getRanchersMenu()
      }

      if (hardcodedMenu) {
        console.log(`Hardcoded menu found for ${restaurantName}`)
        // Save to KV for future use
        await kv.set(menuKey, hardcodedMenu)

        return NextResponse.json({
          success: true,
          menu: hardcodedMenu,
        })
      }
    } catch (error) {
      console.error("Error loading hardcoded menu:", error)
    }

    // Create a sample menu if nothing is found
    console.log(`No menu found for ${restaurantName}, creating sample menu`)
    const sampleMenu = {
      "Popular Items": [
        {
          "Item Name": "Sample Item 1",
          "Price (Rs.)": 250,
          Description: "This is a sample item description",
          Category: "Popular Items",
        },
        {
          "Item Name": "Sample Item 2",
          "Price (Rs.)": 350,
          Description: "Another sample item description",
          Category: "Popular Items",
        },
      ],
      Beverages: [
        {
          "Item Name": "Sample Drink",
          "Price (Rs.)": 120,
          Description: "A refreshing sample drink",
          Category: "Beverages",
        },
      ],
    }

    // Save the sample menu to KV
    await kv.set(menuKey, sampleMenu)

    return NextResponse.json({
      success: true,
      menu: sampleMenu,
    })
  } catch (error) {
    console.error("Error fetching menu:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch menu",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// POST to update a restaurant menu
export async function POST(request: Request) {
  try {
    const { restaurantName, menu } = await request.json()

    if (!restaurantName) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant name is required",
        },
        { status: 400 },
      )
    }

    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu is required",
        },
        { status: 400 },
      )
    }

    // Save the menu
    const menuKey = `menu:${restaurantName.toLowerCase().replace(/\s+/g, "_")}`
    console.log(`Saving menu for ${restaurantName} with key: ${menuKey}`)
    await kv.set(menuKey, menu)

    return NextResponse.json({
      success: true,
      message: `Menu for restaurant "${restaurantName}" has been updated`,
    })
  } catch (error) {
    console.error("Error updating menu:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update menu",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// DELETE a menu item
export async function DELETE(request: Request) {
  try {
    const { restaurantName, category, itemName } = await request.json()

    if (!restaurantName || !category || !itemName) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant name, category, and item name are required",
        },
        { status: 400 },
      )
    }

    // Get the menu
    const menuKey = `menu:${restaurantName.toLowerCase().replace(/\s+/g, "_")}`
    const menu = await kv.get<Record<string, any[]>>(menuKey)

    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          message: `Menu for restaurant "${restaurantName}" not found`,
        },
        { status: 404 },
      )
    }

    // Check if category exists
    if (!menu[category]) {
      return NextResponse.json(
        {
          success: false,
          message: `Category "${category}" not found in menu for restaurant "${restaurantName}"`,
        },
        { status: 404 },
      )
    }

    // Find and remove the item
    const itemIndex = menu[category].findIndex((item) => item["Item Name"] === itemName)
    if (itemIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: `Item "${itemName}" not found in category "${category}" for restaurant "${restaurantName}"`,
        },
        { status: 404 },
      )
    }

    menu[category].splice(itemIndex, 1)

    // If category is now empty, remove it
    if (menu[category].length === 0) {
      delete menu[category]
    }

    // Save the updated menu
    await kv.set(menuKey, menu)

    return NextResponse.json({
      success: true,
      message: `Item "${itemName}" has been deleted from category "${category}" for restaurant "${restaurantName}"`,
      menu,
    })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete menu item",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
