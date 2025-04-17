import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RestaurantCardProps {
  restaurant: {
    id: string
    name: string
    image: string
    rating: number
    reviewCount: number
    deliveryTime: string
    deliveryFee: string
    tags: string[]
    promoCode?: string
  }
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/restaurant/${restaurant.id}`}>
        <div className="relative h-48 w-full">
          <Image src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} fill className="object-cover" />
          {restaurant.promoCode && <Badge className="absolute top-3 left-3 bg-primary">{restaurant.promoCode}</Badge>}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white text-foreground rounded-full"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/restaurant/${restaurant.id}`}>
          <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
        </Link>

        <div className="flex items-center gap-1 mb-2">
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
            {restaurant.rating} ★
          </span>
          <span className="text-xs text-muted-foreground">({restaurant.reviewCount}+ ratings)</span>
          <span className="text-xs text-muted-foreground mx-1">•</span>
          <span className="text-xs text-muted-foreground">{restaurant.deliveryTime}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {restaurant.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Delivery Fee:</span>
          <span className="font-medium">{restaurant.deliveryFee}</span>
        </div>
      </div>
    </div>
  )
}
