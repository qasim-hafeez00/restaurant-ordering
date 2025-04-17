"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Clock, MapPin } from "lucide-react"

export function DeliveryOptions() {
  const [deliveryOption, setDeliveryOption] = useState("delivery")

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Delivery Options</h2>

      <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption} className="space-y-4">
        <div className="flex items-center space-x-2 border rounded-lg p-4">
          <RadioGroupItem value="delivery" id="delivery" />
          <Label htmlFor="delivery" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Delivery</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Delivered to your address in 25-40 min</p>
          </Label>
        </div>

        <div className="flex items-center space-x-2 border rounded-lg p-4">
          <RadioGroupItem value="pickup" id="pickup" />
          <Label htmlFor="pickup" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Pickup</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Ready for pickup in 15-20 min</p>
          </Label>
        </div>
      </RadioGroup>

      {deliveryOption === "delivery" && (
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="address">Delivery Address</Label>
            <Input id="address" placeholder="123 Main St" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Apartment number, gate code, or other special instructions"
              className="mt-1"
            />
          </div>
        </div>
      )}

      {deliveryOption === "pickup" && (
        <div className="mt-6">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Pickup Location</h3>
            <p className="text-sm text-muted-foreground">
              Burger Palace
              <br />
              123 Main St, Anytown, USA
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
