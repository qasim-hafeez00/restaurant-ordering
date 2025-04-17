import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")

    if (!name) {
      return NextResponse.json({ success: false, message: "Restaurant name is required" }, { status: 400 })
    }

    // Get logo map from KV
    const logoMap = (await kv.get<Record<string, string>>("restaurant_logos")) || {}

    // Check if we have a logo for this restaurant
    const logoUrl = logoMap[name]

    if (logoUrl) {
      return NextResponse.json({
        success: true,
        logoUrl,
      })
    }

    // If no custom logo, return default mapping
    const defaultLogoMap: Record<string, string> = {
      "Layers Bakeshop": "/images/layers-bakeshop-logo.png",
      KFC: "/images/kfc-logo.png",
      "Tariq Pulao": "/images/tariq-pulao-logo.png",
      "Roll Bar": "/images/rollbar-logo.png",
      "Bannu Pulao": "/images/bannu-pulao-logo.png",
      "Cold Drinks": "/images/coldrinks-logo.png",
      "K2 Ras & Ginger Grill": "/images/k2-logo.png",
      "Ahmed Balochi Sajji": "/images/balochi-sajji-logo.png",
      "Balochi Sajji": "/images/balochi-sajji-logo.png",
      Brillo: "/images/brillo-logo.png",
      "Dr. Saucy": "/images/dr-saucy-logo.png",
      Ranchers: "/images/ranchers-logo.png",
    }

    const defaultLogo = defaultLogoMap[name] || "/placeholder.svg?height=128&width=128"

    return NextResponse.json({
      success: true,
      logoUrl: defaultLogo,
    })
  } catch (error) {
    console.error("Error fetching restaurant logo:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch restaurant logo",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
