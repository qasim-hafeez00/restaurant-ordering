import { type NextRequest, NextResponse } from "next/server"
import { getRestaurants, getRestaurantMenu } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")

    // If a restaurant name is provided, return that specific menu
    if (name) {
      const menu = await getRestaurantMenu(decodeURIComponent(name))

      if (!menu) {
        return NextResponse.json({ success: false, message: "Restaurant not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        name: decodeURIComponent(name),
        menu,
      })
    }

    // Otherwise return the list of all restaurants
    const restaurants = await getRestaurants()
    return NextResponse.json({
      success: true,
      restaurants: Object.keys(restaurants).map((name) => ({
        name,
        slug: encodeURIComponent(name),
      })),
    })
  } catch (error) {
    console.error("Error in restaurants API:", error)
    return NextResponse.json({ success: false, message: "Failed to retrieve restaurant data" }, { status: 500 })
  }
}
