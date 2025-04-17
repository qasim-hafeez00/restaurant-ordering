import { Clock, MapPin, Phone } from "lucide-react"

interface RestaurantInfoProps {
  restaurant: {
    name: string
    address: string
    hours: string
    phone: string
    deliveryTime: string
    deliveryFee: string
  }
}

export function RestaurantInfo({ restaurant }: RestaurantInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <h4 className="font-medium">Address</h4>
          <p className="text-muted-foreground">{restaurant.address}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <h4 className="font-medium">Hours</h4>
          <p className="text-muted-foreground">{restaurant.hours}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Phone className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <h4 className="font-medium">Phone</h4>
          <p className="text-muted-foreground">{restaurant.phone}</p>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">Delivery Time</span>
          <span>{restaurant.deliveryTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>{restaurant.deliveryFee}</span>
        </div>
      </div>
    </div>
  )
}
