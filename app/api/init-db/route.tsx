import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { layersBakeshopData } from "@/lib/layers-bakeshop-data"

export async function GET() {
  try {
    console.log("Starting database initialization...")

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

    // Always store default restaurants in KV, overwriting any existing data
    await kv.set("restaurants", defaultRestaurants)
    console.log("Default restaurants stored in KV")

    // Prepare Layers Bakeshop menu
    const layersMenu: Record<string, any[]> = {}
    for (const item of layersBakeshopData.menu) {
      const category = item.Category || "Other"
      if (!layersMenu[category]) {
        layersMenu[category] = []
      }
      layersMenu[category].push(item)
    }
    console.log("Prepared Layers Bakeshop menu:", layersMenu)

    // Store Layers Bakeshop menu in KV with multiple keys for better matching
    await kv.set("menu:layers_bakeshop", layersMenu)
    await kv.set("menu:layers bakeshop", layersMenu)
    await kv.set("menu:layers-bakeshop", layersMenu)
    console.log("Layers Bakeshop menu stored in KV")

    // Import the data-client module dynamically for other menus
    const dataClient = await import("@/lib/data-client")

    // Initialize other restaurant menus
    await kv.set("menu:kfc", dataClient.getKFCMenu())
    await kv.set("menu:tariq_pulao", dataClient.getTariqPulaoMenu())
    await kv.set("menu:roll_bar", dataClient.getRollBarMenu())
    await kv.set("menu:bannu_pulao", dataClient.getBannuPulaoMenu())
    await kv.set("menu:cold_drinks", dataClient.getColdDrinksMenu())
    await kv.set("menu:k2_ras_&_ginger_grill", dataClient.getK2Menu())
    await kv.set("menu:balochi_sajji", dataClient.getBalochiSajjiMenu())
    await kv.set("menu:ahmed_balochi_sajji", dataClient.getBalochiSajjiMenu())
    await kv.set("menu:brillo", dataClient.getBrilloMenu())
    await kv.set("menu:dr_saucy", dataClient.getDrSaucyMenu())
    await kv.set("menu:ranchers", dataClient.getRanchersMenu())

    console.log("All restaurant menus initialized in KV")

    return NextResponse.json({
      success: true,
      message: "Database initialized with default restaurants and menus",
      restaurants: defaultRestaurants,
    })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize database",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
