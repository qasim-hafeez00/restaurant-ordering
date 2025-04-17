import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// This endpoint will reset and initialize the restaurants in the KV database
export async function GET() {
  try {
    console.log("Resetting and initializing restaurants in KV database...")

    // Define default restaurants
    const defaultRestaurants = {
      "Layers Bakeshop": "layers_bakeshop_menu.json",
      KFC: "kfc_menu.json",
      "Tariq Pulao": "tariq_pulao_menu.json",
      "Roll Bar": "rollbar_menu.json",
      "Bannu Pulao": "bannu_pulao_menu.json",
      "Cold Drinks": "coldrinks_menu.json",
      "K2 Ras & Ginger Grill": "k2_menu.json",
      "Ahmed Balochi Sajji": "balochi_sajji_menu.json",
    }

    // Clear existing restaurants and set default ones
    await kv.del("restaurants")
    await kv.set("restaurants", defaultRestaurants)

    // Import the data-client module to get default menus
    const dataClient = await import("@/lib/data-client")

    // Initialize menus for each restaurant
    const menuPromises = Object.entries(defaultRestaurants).map(async ([name, _]) => {
      const menuKey = `menu:${name.toLowerCase().replace(/\s+/g, "_")}`
      let menu = null

      // Get the appropriate menu based on restaurant name
      const normalizedName = name.toLowerCase()
      if (normalizedName.includes("layers")) {
        menu = dataClient.getLayersBakeshopMenu()
      } else if (normalizedName.includes("kfc")) {
        menu = dataClient.getKFCMenu()
      } else if (normalizedName.includes("tariq")) {
        menu = dataClient.getTariqPulaoMenu()
      } else if (normalizedName.includes("roll")) {
        menu = dataClient.getRollBarMenu()
      } else if (normalizedName.includes("bannu")) {
        menu = dataClient.getBannuPulaoMenu()
      } else if (normalizedName.includes("cold") || normalizedName.includes("drink")) {
        menu = dataClient.getColdDrinksMenu()
      } else if (normalizedName.includes("k2") || normalizedName.includes("ras") || normalizedName.includes("ginger")) {
        menu = dataClient.getK2Menu()
      } else if (
        normalizedName.includes("balochi") ||
        normalizedName.includes("sajji") ||
        normalizedName.includes("ahmed")
      ) {
        menu = dataClient.getBalochiSajjiMenu()
      } else {
        // Default empty menu
        menu = {}
      }

      // Save menu to KV
      await kv.set(menuKey, menu)
      return { name, menuKey }
    })

    await Promise.all(menuPromises)

    return NextResponse.json({
      success: true,
      message: "Restaurants and menus have been reset and initialized",
      restaurants: defaultRestaurants,
    })
  } catch (error) {
    console.error("Error resetting restaurants:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset restaurants",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
