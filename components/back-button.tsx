"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface BackButtonProps {
  label?: string
}

export function BackButton({ label = "Back" }: BackButtonProps) {
  const router = useRouter()

  return (
    <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-1 mb-4">
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
