"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Heart, LogIn, MapPin, Menu, Search, ShoppingBag, User } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-6 mt-6">
                  <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <Image src="/images/logo.png" alt="QuickBite" width={32} height={32} />
                    QuickBite
                  </Link>

                  <div className="space-y-4">
                    <Link href="/" className="block py-2 font-medium">
                      Home
                    </Link>
                    <Link href="/restaurants" className="block py-2 font-medium">
                      Restaurants
                    </Link>
                    <Link href="/favorites" className="block py-2 font-medium">
                      Favorites
                    </Link>
                    <Link href="/orders" className="block py-2 font-medium">
                      My Orders
                    </Link>
                    {isLoggedIn ? (
                      <Link href="/account" className="block py-2 font-medium">
                        My Account
                      </Link>
                    ) : (
                      <Link href="/login" className="block py-2 font-medium">
                        Sign In
                      </Link>
                    )}
                  </div>

                  <div className="mt-auto">
                    <Button className="w-full">{isLoggedIn ? "Sign Out" : "Sign In"}</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="QuickBite" width={32} height={32} />
            <span className="font-bold text-xl hidden sm:inline-block">QuickBite</span>
          </Link>

          {/* Location Selector */}
          <div className="hidden md:flex items-center gap-2 ml-8">
            <MapPin className="h-5 w-5 text-primary" />
            <button className="flex items-center gap-1 text-sm">
              <span>New York, NY</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Search - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search for restaurants or food" className="pl-10 w-full" />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium ${pathname === "/" ? "text-primary" : "text-foreground"}`}>
              Home
            </Link>
            <Link
              href="/restaurants"
              className={`text-sm font-medium ${pathname === "/restaurants" ? "text-primary" : "text-foreground"}`}
            >
              Restaurants
            </Link>
            <Link
              href="/favorites"
              className={`text-sm font-medium ${pathname === "/favorites" ? "text-primary" : "text-foreground"}`}
            >
              Favorites
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Heart className="h-5 w-5" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
            </Link>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/account" className="flex w-full">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/orders" className="flex w-full">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/favorites" className="flex w-full">
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button className="flex w-full" onClick={() => setIsLoggedIn(false)}>
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
