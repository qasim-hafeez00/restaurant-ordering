import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="relative h-[500px] w-full">
      <Image src="/images/hero-bg.jpg" alt="Delicious food" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-lg text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Food delivery made <span className="text-primary">simple</span>
            </h1>
            <p className="text-lg mb-6">
              Order from your favorite restaurants and get food delivered to your doorstep in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="sm:w-auto w-full">
                Order Now
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 sm:w-auto w-full">
                View Restaurants
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
