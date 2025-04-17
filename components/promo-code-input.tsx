"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, X } from "lucide-react"

export function PromoCodeInput() {
  const [promoCode, setPromoCode] = useState("")
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState("")

  const handleApply = () => {
    if (!promoCode) {
      setError("Please enter a promo code")
      return
    }

    if (promoCode.toUpperCase() === "WELCOME") {
      setApplied(true)
      setError("")
    } else {
      setError("Invalid promo code")
    }
  }

  const handleRemove = () => {
    setPromoCode("")
    setApplied(false)
    setError("")
  }

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Promo Code</h4>

      {applied ? (
        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">WELCOME</p>
              <p className="text-xs text-muted-foreground">$0 delivery fee applied</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <Input placeholder="Enter promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
            <Button onClick={handleApply}>Apply</Button>
          </div>
          {error && <p className="text-destructive text-sm mt-1">{error}</p>}
          <p className="text-xs text-muted-foreground mt-2">Try code "WELCOME" for free delivery</p>
        </div>
      )}
    </div>
  )
}
