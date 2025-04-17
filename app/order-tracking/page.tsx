"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, MapPin, Phone } from "lucide-react"

export default function OrderTrackingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(25)
  const [estimatedTime, setEstimatedTime] = useState(25)

  // Simulate order progress
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1)
        setProgress((currentStep + 1) * 25)
        setEstimatedTime(Math.max(0, estimatedTime - 8))
      }
    }, 8000)

    return () => clearTimeout(timer)
  }, [currentStep, estimatedTime])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Order #12345</h1>
            <Button variant="outline" size="sm">
              Help
            </Button>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Estimated Delivery</span>
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {estimatedTime} mins
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div
                className={`rounded-full h-10 w-10 flex items-center justify-center ${
                  currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 className="h-6 w-6" /> : 1}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Order Confirmed</h3>
                <p className="text-sm text-muted-foreground">Your order has been received by Burger Palace</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className={`rounded-full h-10 w-10 flex items-center justify-center ${
                  currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 2 ? <CheckCircle2 className="h-6 w-6" /> : 2}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Preparing Your Food</h3>
                <p className="text-sm text-muted-foreground">The restaurant is preparing your delicious meal</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className={`rounded-full h-10 w-10 flex items-center justify-center ${
                  currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 3 ? <CheckCircle2 className="h-6 w-6" /> : 3}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">On the Way</h3>
                <p className="text-sm text-muted-foreground">Your order is on the way with our delivery partner</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className={`rounded-full h-10 w-10 flex items-center justify-center ${
                  currentStep >= 4 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 4 ? <CheckCircle2 className="h-6 w-6" /> : 4}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Delivered</h3>
                <p className="text-sm text-muted-foreground">Enjoy your meal!</p>
              </div>
            </div>
          </div>
        </div>

        {currentStep >= 3 && (
          <div className="bg-card rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                <Image src="/images/delivery-person.jpg" alt="Delivery Person" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-medium">Michael Rodriguez</h3>
                <p className="text-sm text-muted-foreground">Your Delivery Partner</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">4.9 ★</div>
                  <span className="text-xs text-muted-foreground">1,234 deliveries</span>
                </div>
              </div>
              <Button variant="outline" size="icon" className="ml-auto">
                <Phone className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Current Location</span>
              </div>
              <div className="relative h-40 w-full rounded-md overflow-hidden">
                <Image src="/images/map.jpg" alt="Delivery Map" fill className="object-cover" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Burger Palace</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>1x Classic Cheeseburger</span>
                <span>$8.99</span>
              </div>
              <div className="flex justify-between">
                <span>1x Loaded Fries</span>
                <span>$5.99</span>
              </div>
              <div className="flex justify-between">
                <span>1x Chocolate Milkshake</span>
                <span>$5.99</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6 pt-4 border-t">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>$20.97</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>$1.99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Fee</span>
              <span>$1.49</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>$1.73</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tip</span>
              <span>$2.00</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>$28.18</span>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                Reorder
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
