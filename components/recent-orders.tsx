"use client"

import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function RecentOrders() {
  const sliderRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { current } = sliderRef
      const scrollAmount = direction === "left" ? -current.offsetWidth / 2 : current.offsetWidth / 2
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="relative mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Your Recent Orders</h2>
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
        {recentOrders.map((order) => (
          <div key={order.id} className="flex-shrink-0 w-72 bg-card rounded-xl overflow-hidden shadow-sm">
            <div className="relative h-32 w-full">
              <Image
                src={order.restaurantImage || "/placeholder.svg"}
                alt={order.restaurantName}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-1">{order.restaurantName}</h3>
              <p className="text-sm text-muted-foreground mb-3">{order.date}</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 text-sm">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-xs">
                  View Details
                </Button>
                <Button className="flex-1 text-xs">Reorder</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const recentOrders = [
  {
    id: "1",
    restaurantName: "Burger Palace",
    restaurantImage: "/images/restaurants/burger-palace.jpg",
    date: "Yesterday, 7:30 PM",
    items: [
      { name: "Classic Cheeseburger", quantity: 1 },
      { name: "Loaded Fries", quantity: 1 },
      { name: "Chocolate Milkshake", quantity: 1 },
    ],
    total: 20.97,
  },
  {
    id: "2",
    restaurantName: "Sushi Heaven",
    restaurantImage: "/images/restaurants/sushi-heaven.jpg",
    date: "May 15, 8:15 PM",
    items: [
      { name: "California Roll", quantity: 2 },
      { name: "Spicy Tuna Roll", quantity: 1 },
      { name: "Miso Soup", quantity: 1 },
    ],
    total: 32.5,
  },
  {
    id: "3",
    restaurantName: "Pizza Express",
    restaurantImage: "/images/restaurants/pizza-express.jpg",
    date: "May 10, 6:45 PM",
    items: [
      { name: "Pepperoni Pizza", quantity: 1 },
      { name: "Garlic Bread", quantity: 1 },
      { name: "Coke", quantity: 2 },
    ],
    total: 25.99,
  },
]
