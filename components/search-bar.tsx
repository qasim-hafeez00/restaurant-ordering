import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  placeholder?: string
}

export function SearchBar({ placeholder = "Search for restaurants or cuisines" }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder={placeholder} className="pl-10 w-full" />
    </div>
  )
}
