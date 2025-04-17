import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// POST to add a new restaurant
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, menuFile, logoUrl } = body

    console.log("Adding restaurant:", { name, menuFile, logoUrl })

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant name is required",
        },
        { status: 400 },
      )
    }

    // Generate menu file name if not provided
    const finalMenuFile = menuFile || `${name.toLowerCase().replace(/\s+/g, "_")}_menu.json`

    // Get existing restaurants directly from KV
    let restaurants = await kv.get<Record<string, string>>("restaurants")

    // Log the current state
    console.log("Current restaurants:", restaurants)

    // Initialize if null
    if (!restaurants) {
      restaurants = {}
    }

    // Add the new restaurant
    restaurants[name] = finalMenuFile

    // Save to KV
    console.log("Saving updated restaurants:", restaurants)
    await kv.set("restaurants", restaurants)

    // Create an empty menu for the new restaurant
    const menuKey = `menu:${name.toLowerCase().replace(/\s+/g, "_")}`
    await kv.set(menuKey, {})

    // If logo URL is provided, save it to the logo map
    if (logoUrl) {
      const logoMapKey = "restaurant_logos"
      const logoMap = (await kv.get<Record<string, string>>(logoMapKey)) || {}
      logoMap[name] = logoUrl
      await kv.set(logoMapKey, logoMap)
      console.log(`Saved logo URL for ${name}: ${logoUrl}`)
    }

    return NextResponse.json({
      success: true,
      message: `Restaurant "${name}" has been added successfully`,
      restaurants,
    })
  } catch (error) {
    console.error("Error adding restaurant:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add restaurant",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
