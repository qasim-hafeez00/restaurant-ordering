// Import the LAYERS_BAKESHOP_MENU from the layers-bakeshop-data file
import { layersBakeshopData } from "./layers-bakeshop-data"

// Define the restaurant mapping
const RESTAURANTS = {
  "Layers Bakeshop": "Layers Bakeshop",
  KFC: "KFC",
  "Tariq Pulao": "Tariq Pulao",
  "Roll Bar": "Roll Bar",
  "Bannu Pulao": "Bannu Pulao",
  "Cold Drinks": "Cold Drinks",
  "K2 Ras & Ginger Grill": "K2 Ras & Ginger Grill",
  "Ahmed Balochi Sajji": "Ahmed Balochi Sajji",
  Brillo: "Brillo",
  "Dr. Saucy": "Dr. Saucy",
  Ranchers: "Ranchers",
}

// Helper function to get Layers Bakeshop menu
export function getLayersBakeshopMenu() {
  // Group items by category
  const menu: Record<string, any[]> = {}

  // Use the menu from layersBakeshopData
  for (const item of layersBakeshopData.menu) {
    const category = item.Category || "Other"
    if (!menu[category]) {
      menu[category] = []
    }
    menu[category].push(item)
  }

  return menu
}

// Helper function to get KFC menu
export function getKFCMenu() {
  // Placeholder for KFC menu
  return {
    Chicken: [
      {
        "Item Name": "Hot Wings",
        "Price (Rs.)": 500,
        Description: "Spicy chicken wings",
        Category: "Chicken",
      },
    ],
  }
}

// Helper functions for other restaurants
export function getTariqPulaoMenu() {
  // Placeholder implementation
  return { Pulao: [] }
}

export function getRollBarMenu() {
  // Placeholder implementation
  return { Rolls: [] }
}

export function getBannuPulaoMenu() {
  // Placeholder implementation
  return { Pulao: [] }
}

export function getColdDrinksMenu() {
  // Placeholder implementation
  return { Beverages: [] }
}

export function getK2Menu() {
  // Placeholder implementation
  return { Chinese: [] }
}

export function getBalochiSajjiMenu() {
  // Placeholder implementation
  return { Sajji: [] }
}

export function getBrilloMenu() {
  // Placeholder implementation
  return { Burgers: [] }
}

export function getDrSaucyMenu() {
  // Placeholder implementation
  return { Burgers: [] }
}

export function getRanchersMenu() {
  // Placeholder implementation
  return { Steaks: [] }
}

// Get restaurant menu function
export function getRestaurantMenu(restaurantName: string) {
  console.log(`Getting menu for restaurant (client): "${restaurantName}"`)

  // Case-insensitive matching for restaurant names
  const normalizedName = restaurantName.toLowerCase().trim()

  // For Layers Bakeshop, return the hardcoded menu
  if (normalizedName.includes("layers")) {
    console.log("Returning Layers Bakeshop menu")
    return getLayersBakeshopMenu()
  }

  // For other restaurants
  if (normalizedName.includes("kfc")) {
    return getKFCMenu()
  } else if (normalizedName.includes("tariq")) {
    return getTariqPulaoMenu()
  } else if (normalizedName.includes("roll")) {
    return getRollBarMenu()
  } else if (normalizedName.includes("bannu")) {
    return getBannuPulaoMenu()
  } else if (normalizedName.includes("cold") || normalizedName.includes("drink")) {
    return getColdDrinksMenu()
  } else if (normalizedName.includes("k2") || normalizedName.includes("ras") || normalizedName.includes("ginger")) {
    return getK2Menu()
  } else if (
    normalizedName.includes("balochi") ||
    normalizedName.includes("sajji") ||
    normalizedName.includes("ahmed")
  ) {
    return getBalochiSajjiMenu()
  } else if (normalizedName.includes("brillo")) {
    return getBrilloMenu()
  } else if (normalizedName.includes("saucy")) {
    return getDrSaucyMenu()
  } else if (normalizedName.includes("ranchers")) {
    return getRanchersMenu()
  }

  // Default empty menu
  return { Other: [] }
}
