import Link from "next/link"
import Image from "next/image"
import { kv } from "@vercel/kv"

// Update the DEFAULT_RESTAURANTS object to have three separate restaurants
const DEFAULT_RESTAURANTS = {
  "Layers Bakeshop": "layers_bakeshop_menu.json",
  KFC: "kfc_menu.json",
  "Tariq Pulao": "tariq_pulao_menu.json",
  "Roll Bar": "rollbar_menu.json",
  "Bannu Pulao": "bannu_pulao_menu.json",
  "Cold Drinks": "coldrinks_menu.json",
  "K2 Ras & Ginger Grill": "k2_menu.json",
  "Ahmed Balochi Sajji": "balochi_sajji_menu.json",
  Brillo: "brillo_menu.json",
  "Dr. Saucy": "dr_saucy_menu.json",
  Ranchers: "ranchers_menu.json",
}

// Update the logoMap to include the correct paths for the three restaurants
const logoMap: Record<string, string> = {
  "Layers Bakeshop": "/images/layers-bakeshop-logo.png",
  KFC: "/images/kfc-logo.png",
  "Tariq Pulao": "/images/tariq-pulao-logo.png",
  "Roll Bar": "/images/rollbar-logo.png",
  "Bannu Pulao": "/images/bannu-pulao-logo.png",
  "Cold Drinks": "/images/coldrinks-logo.png",
  "K2 Ras & Ginger Grill": "/images/k2-logo.png",
  "Ahmed Balochi Sajji": "/images/balochi-sajji-logo.png",
  Brillo: "/images/brillo-logo.png",
  "Dr. Saucy": "/images/dr-saucy-logo.png",
  Ranchers: "/images/ranchers-logo.png",
}

// Update the descriptionMap to include the three restaurants
const descriptionMap: Record<string, string> = {
  "Layers Bakeshop": "Delicious cakes, brownies, cookies and more!",
  KFC: "Finger Lickin' Good chicken, burgers, and sides!",
  "Tariq Pulao": "Authentic Pakistani pulao and kababs.",
  "Roll Bar": "Delicious rolls, shawarmas, and BBQ items.",
  "Bannu Pulao": "Traditional Bannu style pulao and chapli kabab.",
  "Cold Drinks": "Refreshing beverages in various sizes.",
  "K2 Ras & Ginger Grill": "Chinese cuisine, momos, and special deals.",
  "Ahmed Balochi Sajji": "Traditional Balochi sajji and kabuli pulao.",
  Brillo: "Delicious burgers and sides.",
  "Dr. Saucy": "Specializing in ranch-flavored burgers and sandwiches.",
  Ranchers: "Premium steaks and ranch-style dishes.",
}

// Function to get restaurant logo
const getRestaurantLogo = (name: string) => {
  // Use a static placeholder if logo not found
  return logoMap[name] || "/placeholder.svg"
}

// Function to get restaurant description
const getRestaurantDescription = (name: string) => {
  return descriptionMap[name] || "Click to view menu"
}

export default async function Home() {
  // Try to get restaurants from KV
  let restaurants: Record<string, string> = {}

  try {
    const kvRestaurants = await kv.get<Record<string, string>>("restaurants")

    // If KV has restaurants, use them
    if (kvRestaurants && Object.keys(kvRestaurants).length > 0) {
      restaurants = kvRestaurants
      console.log("Using restaurants from KV:", restaurants)
    } else {
      // If KV is empty, use default restaurants and save to KV
      restaurants = DEFAULT_RESTAURANTS
      console.log("KV empty, using default restaurants:", restaurants)

      // Save default restaurants to KV for future use
      await kv.set("restaurants", DEFAULT_RESTAURANTS)
    }
  } catch (error) {
    // If there's an error with KV, fall back to default restaurants
    console.error("Error accessing KV:", error)
    restaurants = DEFAULT_RESTAURANTS
  }

  return (
    <main className="container mx-auto p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/hungry-boys-logo.png"
            alt="HUNGRY BOYS"
            width={150}
            height={150}
            className="rounded-full"
          />
        </div>
        <h1 className="text-4xl font-bold mb-2">HUNGRY BOYS</h1>
        <p className="text-gray-600">Order delicious food from your favorite restaurants</p>
      </div>

      <h2 className="text-3xl font-bold mb-6">Our Restaurants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(restaurants).map(([name, filename]) => (
          <div key={name} className="border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 mb-4 relative">
                <Image
                  src={getRestaurantLogo(name) || "/placeholder.svg"}
                  alt={`${name} logo`}
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">{name}</h2>
              <p className="text-gray-600 mb-4 text-sm">{getRestaurantDescription(name)}</p>
              <Link
                href={`/restaurant/${encodeURIComponent(name)}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
              >
                View Menu
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/cart" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          View Cart
        </Link>
      </div>
    </main>
  )
}
