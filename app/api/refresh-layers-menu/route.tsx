import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET() {
  try {
    console.log("Refreshing Layers Bakeshop menu...")

    // Import the data-client module dynamically
    const dataClient = await import("@/lib/data-client")

    // Get the Layers Bakeshop menu
    const layersMenu = dataClient.getLayersBakeshopMenu()
    console.log("Generated Layers Bakeshop menu:", layersMenu)

    // Save to KV
    await kv.set("menu:layers_bakeshop", layersMenu)
    console.log("Layers Bakeshop menu saved to KV")

    return NextResponse.json({
      success: true,
      message: "Layers Bakeshop menu refreshed successfully",
      menu: layersMenu,
    })
  } catch (error) {
    console.error("Error refreshing Layers Bakeshop menu:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to refresh Layers Bakeshop menu",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
