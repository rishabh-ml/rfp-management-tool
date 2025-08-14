'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function NavigationHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Product', href: '#product' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Security', href: '#security' },
    { label: 'AI', href: '#ai', badge: 'Coming Soon' },
    { label: 'Resources', href: '#resources' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border/50' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-xl text-foreground">RFP Platform</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {item.label}
              {item.badge && (
                <span className="absolute -top-1 -right-12 bg-amber-500 text-amber-950 text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              Start Free Trial
            </Button>
          </Link>
          <Link href="#demo">
            <Button variant="outline" size="sm">Book Demo</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-2 bg-amber-500 text-amber-950 text-xs px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              <Link href="/sign-in" className="block">
                <Button variant="ghost" size="sm" className="w-full">Login</Button>
              </Link>
              <Link href="/sign-up" className="block">
                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#demo" className="block">
                <Button variant="outline" size="sm" className="w-full">Book Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
