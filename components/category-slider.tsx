"use client"

import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function CategorySlider() {
  const sliderRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { current } = sliderRef
      const scrollAmount = direction === "left" ? -current.offsetWidth / 2 : current.offsetWidth / 2
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="relative mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Categories</h2>
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
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category) => (
          <div key={category.id} className="flex-shrink-0 w-24 text-center">
            <div className="relative h-24 w-24 rounded-full overflow-hidden mb-2 mx-auto">
              <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
            </div>
            <span className="text-sm font-medium">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const categories = [
  { id: "1", name: "Pizza", image: "/images/categories/pizza.jpg" },
  { id: "2", name: "Burgers", image: "/images/categories/burger.jpg" },
  { id: "3", name: "Sushi", image: "/images/categories/sushi.jpg" },
  { id: "4", name: "Tacos", image: "/images/categories/tacos.jpg" },
  { id: "5", name: "Salads", image: "/images/categories/salad.jpg" },
  { id: "6", name: "Desserts", image: "/images/categories/dessert.jpg" },
  { id: "7", name: "Indian", image: "/images/categories/indian.jpg" },
  { id: "8", name: "Chinese", image: "/images/categories/chinese.jpg" },
  { id: "9", name: "Italian", image: "/images/categories/italian.jpg" },
  { id: "10", name: "Thai", image: "/images/categories/thai.jpg" },
]
