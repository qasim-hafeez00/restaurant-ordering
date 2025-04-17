import Image from "next/image"
import { Button } from "@/components/ui/button"

interface PromotionBannerProps {
  title: string
  description: string
  buttonText: string
  imageUrl: string
}

export function PromotionBanner({ title, description, buttonText, imageUrl }: PromotionBannerProps) {
  return (
    <div className="relative h-64 w-full rounded-xl overflow-hidden my-12">
      <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
        <div className="p-8 text-white max-w-md">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="mb-4">{description}</p>
          <Button>{buttonText}</Button>
        </div>
      </div>
    </div>
  )
}
