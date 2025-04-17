import { getRestaurants, getRestaurantMenu } from "@/lib/data"
import RestaurantMenuClient from "./RestaurantMenuClient"

export async function generateStaticParams() {
  const restaurants = await getRestaurants()
  return Object.keys(restaurants).map((name) => ({
    name: encodeURIComponent(name),
  }))
}

export default async function RestaurantMenu({ params }: { params: { name: string } }) {
  const restaurantName = decodeURIComponent(params.name)

  // Pre-fetch the menu on the server
  await getRestaurantMenu(restaurantName)

  return <RestaurantMenuClient restaurantName={restaurantName} />
}
