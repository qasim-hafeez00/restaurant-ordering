"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { RestaurantCard } from "@/components/restaurant-card"

export function FeaturedRestaurants() {
  const sliderRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { current } = sliderRef
      const scrollAmount = direction === "left" ? -current.offsetWidth / 2 : current.offsetWidth / 2
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Featured Restaurants</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll("left")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll("right")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {featuredRestaurants.map((restaurant) => (
          <div key={restaurant.id} className="flex-shrink-0 w-80">
            <RestaurantCard restaurant={restaurant} />
          </div>
        ))}
      </div>
    </div>
  )
}

const featuredRestaurants = [
  {
    id: "1",
    name: "Burger Palace",
    image: "/images/restaurants/burger-palace.jpg",
    rating: 4.8,
    reviewCount: 243,
    deliveryTime: "15-25 min",
    deliveryFee: "$1.99",
    tags: ["Burgers", "American", "Fast Food"],
    promoCode: "20% OFF",
  },
  {
    id: "2",
    name: "Sushi Heaven",
    image: "/images/restaurants/sushi-heaven.jpg",
    rating: 4.9,
    reviewCount: 189,
    deliveryTime: "25-40 min",
    deliveryFee: "$2.99",
    tags: ["Japanese", "Sushi", "Healthy"],
    promoCode: "FREE DELIVERY",
  },
  {
    id: "3",
    name: "Pizza Express",
    image: "/images/restaurants/pizza-express.jpg",
    rating: 4.5,
    reviewCount: 352,
    deliveryTime: "20-30 min",
    deliveryFee: "$0.99",
    tags: ["Pizza", "Italian", "Fast Food"],
  },
  {
    id: "4",
    name: "Taco Fiesta",
    image: "/images/restaurants/taco-fiesta.jpg",
    rating: 4.6,
    reviewCount: 178,
    deliveryTime: "15-25 min",
    deliveryFee: "$1.49",
    tags: ["Mexican", "Tacos", "Burritos"],
    promoCode: "BUY 1 GET 1 FREE",
  },
  {
    id: "5",
    name: "Green Bowl",
    image: "/images/restaurants/green-bowl.jpg",
    rating: 4.7,
    reviewCount: 132,
    deliveryTime: "15-25 min",
    deliveryFee: "$1.99",
    tags: ["Salads", "Healthy", "Bowls"],
  },
]
