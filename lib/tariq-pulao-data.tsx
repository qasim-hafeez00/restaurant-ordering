// Tariq Pulao menu data with updated prices
export const TARIQ_PULAO_MENU = [
  {
    Category: "Pulao",
    "Item Name": "Pulao With Shami",
    "Price (Rs.)": 400,
    Description: "Delicious pulao served with shami kabab.",
  },
  {
    Category: "Rice",
    "Item Name": "Sada Chawal",
    "Price (Rs.)": 220,
    Description: "Plain steamed rice.",
  },
  {
    Category: "Pulao",
    "Item Name": "Pulao Without Shami",
    "Price (Rs.)": 380,
    Description: "Traditional pulao without shami kabab.",
  },
  {
    Category: "Kabab",
    "Item Name": "Shami Kabab",
    "Price (Rs.)": 50,
    Description: "Traditional shami kabab made with minced meat and spices.",
  },
]

export const tariqPulaoData = {
  id: "tariq_pulao",
  name: "Tariq Pulao",
  description: "Famous for authentic Pakistani pulao and kababs",
  logo: "/images/tariq-pulao-logo.png",
  heroImage: "/placeholder.svg?height=300&width=800",
  rating: 4.6,
  reviews: 320,
  categories: ["Pakistani", "Rice", "Pulao"],
  menu: TARIQ_PULAO_MENU,
}
