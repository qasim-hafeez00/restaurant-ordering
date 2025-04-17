import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { layersBakeshopData } from "@/lib/layers-bakeshop-data"

export async function GET() {
  try {
    console.log("Fixing Layers Bakeshop menu...")

    // Group items by category
    const menu: Record<string, any[]> = {}
    for (const item of layersBakeshopData.menu) {
      const category = item.Category || "Other"
      if (!menu[category]) {
        menu[category] = []
      }
      menu[category].push(item)
    }

    console.log("Generated Layers Bakeshop menu:", menu)

    // Save to KV with different keys to ensure it's refreshed
    await kv.set("menu:layers_bakeshop", menu)
    await kv.set("menu:layers bakeshop", menu)
    await kv.set("menu:layers-bakeshop", menu)

    console.log("Layers Bakeshop menu fixed in KV")

    return NextResponse.json({
      success: true,
      message: "Layers Bakeshop menu fixed successfully",
      menu: menu,
    })
  } catch (error) {
    console.error("Error fixing Layers Bakeshop menu:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fix Layers Bakeshop menu",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
