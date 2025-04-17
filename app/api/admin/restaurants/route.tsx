import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// GET all restaurants
export async function GET() {
  try {
    // Get restaurants from KV
    const restaurants = await kv.get<Record<string, string>>("restaurants")

    // If no restaurants in KV, initialize with default restaurants
    if (!restaurants || Object.keys(restaurants).length === 0) {
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

      // Store default restaurants in KV
      await kv.set("restaurants", defaultRestaurants)

      return NextResponse.json({
        success: true,
        restaurants: defaultRestaurants,
      })
    }

    return NextResponse.json({
      success: true,
      restaurants: restaurants,
    })
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch restaurants",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// POST to add or update a restaurant
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, menuFile } = body

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant name is required",
        },
        { status: 400 },
      )
    }

    // Get existing restaurants
    let restaurants = await kv.get<Record<string, string>>("restaurants")

    // If restaurants is null, initialize it as an empty object
    if (!restaurants) {
      restaurants = {}
    }

    // Add or update the restaurant
    restaurants[name] = menuFile || `${name.toLowerCase().replace(/\s+/g, "_")}_menu.json`

    // Save updated restaurants
    await kv.set("restaurants", restaurants)

    return NextResponse.json({
      success: true,
      message: `Restaurant "${name}" has been ${restaurants[name] ? "updated" : "added"}`,
      restaurants,
    })
  } catch (error) {
    console.error("Error adding/updating restaurant:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add/update restaurant",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// DELETE a restaurant
export async function DELETE(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant name is required",
        },
        { status: 400 },
      )
    }

    // Get existing restaurants
    const restaurants = (await kv.get<Record<string, string>>("restaurants")) || {}

    // Check if restaurant exists
    if (!restaurants[name]) {
      return NextResponse.json(
        {
          success: false,
          message: `Restaurant "${name}" not found`,
        },
        { status: 404 },
      )
    }

    // Delete the restaurant
    delete restaurants[name]

    // Save updated restaurants
    await kv.set("restaurants", restaurants)

    // Also delete the menu
    const menuKey = `menu:${name.toLowerCase().replace(/\s+/g, "_")}`
    await kv.del(menuKey)

    return NextResponse.json({
      success: true,
      message: `Restaurant "${name}" has been deleted`,
      restaurants,
    })
  } catch (error) {
    console.error("Error deleting restaurant:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete restaurant",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
