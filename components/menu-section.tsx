import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  popular?: boolean
}

interface MenuSectionProps {
  section: {
    id: string
    name: string
    items: MenuItem[]
  }
}

export function MenuSection({ section }: MenuSectionProps) {
  return (
    <div id={section.id}>
      <h3 className="text-xl font-bold mb-4">{section.name}</h3>
      <div className="space-y-4">
        {section.items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              {item.popular && (
                <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs px-2 py-0.5">
                  Popular
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium">{item.name}</h4>
                <span className="font-medium">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              <Button variant="ghost" size="sm" className="text-primary">
                <PlusCircle className="h-4 w-4 mr-1" />
                Add to Order
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
