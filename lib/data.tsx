import { KFC_MENU } from "./kfc-data"
import { TARIQ_PULAO_MENU } from "./tariq-pulao-data"
import { ROLLBAR_MENU } from "./rollbar-data"
import { BANNU_PULAO_MENU } from "./bannu-pulao-data"
import { COLDRINKS_MENU } from "./coldrinks-data"
import { K2_MENU } from "./k2-data"
import { BALOCHI_SAJJI_MENU } from "./balochi-sajji-data"
import { BRILLO_MENU } from "./brillo-data"
import { DR_SAUCY_MENU } from "./dr-saucy-data"
import { RANCHERS_MENU } from "./ranchers-data"
import { getRestaurantMenuFromKV, saveRestaurantMenuToKV, type RestaurantMenu } from "./kv-database"
import { kfcData } from "./kfc-data"
import { tariqPulaoData } from "./tariq-pulao-data"
import { rollbarData } from "./rollbar-data"
import { bannuPulaoData } from "./bannu-pulao-data"
import { coldrinksData } from "./coldrinks-data"
import { k2Data } from "./k2-data"
import { balochiSajjiData } from "./balochi-sajji-data"
import { layersBakeshopData } from "./layers-bakeshop-data"
import { brilloData } from "./brillo-data"
import { drSaucyData } from "./dr-saucy-data"
import { ranchersData } from "./ranchers-data"

export const restaurants = [
  kfcData,
  tariqPulaoData,
  rollbarData,
  bannuPulaoData,
  coldrinksData,
  k2Data,
  balochiSajjiData,
  layersBakeshopData,
  brilloData,
  drSaucyData,
  ranchersData,
]

// This file is only used on the server side
// For client-side data access, use data-client.tsx

// Helper function to get Layers Bakeshop menu
function getLayersBakeshopMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of layersBakeshopData.menu) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

// Helper function to get KFC  || []
// Helper function to get KFC menu
function getKFCMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of KFC_MENU) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

// Helper function to get Tariq Pulao menu
function getTariqPulaoMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of TARIQ_PULAO_MENU) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

// Helper function to get Roll Bar menu
function getRollBarMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of ROLLBAR_MENU) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

// Helper function to get Bannu Pulao menu
function getBannuPulaoMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of BANNU_PULAO_MENU) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

// Helper function to get Cold Drinks menu
function getColdDrinksMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of COLDRINKS_MENU) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

// Helper function to get K2 menu
function getK2Menu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of K2_MENU) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

// Helper function to get Balochi Sajji menu
function getBalochiSajjiMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of BALOCHI_SAJJI_MENU) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

// Helper function to get Brillo menu
function getBrilloMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of BRILLO_MENU) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

// Helper function to get Dr. Saucy menu
function getDrSaucyMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of DR_SAUCY_MENU) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

// Helper function to get Ranchers menu
function getRanchersMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}
  for (const item of RANCHERS_MENU) {
    const category = item.Category || "Other"
    menu[category] = menu[category] || []
    menu[category].push(item)
  }
  return menu
}

export async function getRestaurants() {
  return restaurants
}

// Get a specific restaurant menu
export async function getRestaurantMenu(restaurantName: string) {
  console.log(`Getting menu for restaurant (server): "${restaurantName}"`)

  // Case-insensitive matching for restaurant names
  const normalizedName = restaurantName.toLowerCase().trim()

  // First, try to get the menu from KV
  const kvMenu = await getRestaurantMenuFromKV(restaurantName)
  if (kvMenu) {
    return kvMenu
  }

  // If not in KV, generate from hardcoded data and save to KV for future use
  let menu: RestaurantMenu | null = null

  if (normalizedName.includes("layers")) {
    menu = getLayersBakeshopMenu()
  } else if (normalizedName.includes("kfc")) {
    menu = getKFCMenu()
  } else if (normalizedName.includes("tariq")) {
    menu = getTariqPulaoMenu()
  } else if (normalizedName.includes("roll")) {
    menu = getRollBarMenu()
  } else if (normalizedName.includes("bannu")) {
    menu = getBannuPulaoMenu()
  } else if (normalizedName.includes("cold") || normalizedName.includes("drink")) {
    menu = getColdDrinksMenu()
  } else if (normalizedName.includes("k2") || normalizedName.includes("ras") || normalizedName.includes("ginger")) {
    menu = getK2Menu()
  } else if (
    normalizedName.includes("balochi") ||
    normalizedName.includes("sajji") ||
    normalizedName.includes("ahmed")
  ) {
    menu = getBalochiSajjiMenu()
  } else if (normalizedName.includes("brillo")) {
    menu = getBrilloMenu()
  } else if (normalizedName.includes("saucy")) {
    menu = getDrSaucyMenu()
  } else if (normalizedName.includes("ranchers")) {
    menu = getRanchersMenu()
  }

  if (menu) {
    // Save to KV for future use
    await saveRestaurantMenuToKV(restaurantName, menu)
    return menu
  }

  // Return a default menu structure if no match
  const defaultMenu = {
    "Sample Category": [
      {
        Category: "Sample Category",
        "Item Name": "Sample Item",
        "Price (Rs.)": 100,
        Description: "This is a sample item.",
      },
    ],
  }

  await saveRestaurantMenuToKV(restaurantName, defaultMenu)
  return defaultMenu
}

export async function getRestaurant(name: string) {
  return restaurants.find((restaurant) => restaurant.id === name)
}
