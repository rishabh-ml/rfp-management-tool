'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "RFP Platform transformed our proposal process. We've cut response time by 40% and our win rate has improved significantly. The answer library alone saves us hours on every proposal.",
    author: "Sarah Chen",
    role: "VP of Sales Operations",
    company: "TechFlow Solutions",
    companySize: "150+ employees",
    avatar: "SC"
  },
  {
    quote: "The compliance matrix feature is a game-changer. We can finally track requirements automatically and ensure nothing falls through the cracks. Our legal team loves the audit trails.",
    author: "Michael Rodriguez",
    role: "Proposal Manager",
    company: "SecureBase Corp",
    companySize: "500+ employees", 
    avatar: "MR"
  },
  {
    quote: "What impressed me most was how quickly we got up and running. The team was collaborating effectively within days, not weeks. The real-time features keep everyone aligned.",
    author: "Jennifer Kim",
    role: "Director of Business Development",
    company: "InnovateLabs",
    companySize: "75+ employees",
    avatar: "JK"
  },
  {
    quote: "We've submitted every RFP on time since adopting the platform. The workflow automation and notifications ensure we never miss a deadline. Our clients notice the quality improvement too.",
    author: "David Thompson",
    role: "Chief Revenue Officer", 
    company: "DataFlow Systems",
    companySize: "300+ employees",
    avatar: "DT"
  },
  {
    quote: "The analytics give us insights we never had before. We can now predict capacity needs and identify what makes proposals successful. It's like having a data scientist for RFPs.",
    author: "Lisa Park",
    role: "Sales Operations Manager",
    company: "CloudVision",
    companySize: "200+ employees",
    avatar: "LP"
  }
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('testimonials-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section id="testimonials-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Loved by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
              proposal teams
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            See what industry leaders are saying about transforming their RFP processes.
          </p>
        </div>

        {/* Carousel */}
        <div className={`relative max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div 
            className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl min-h-[400px] flex flex-col justify-center"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Quote Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl leading-relaxed text-center mb-8 font-medium">
              &quot;{currentTestimonial.quote}&quot;
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentTestimonial.avatar}
                </span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">{currentTestimonial.author}</div>
                <div className="text-muted-foreground">{currentTestimonial.role}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-medium text-sm">{currentTestimonial.company}</span>
                  <Badge variant="secondary" className="text-xs">
                    {currentTestimonial.companySize}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Dots */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex 
                        ? 'bg-indigo-600' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto transition-all duration-1000 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">4.9/5</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">500+</div>
            <div className="text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">99%</div>
            <div className="text-muted-foreground">Would Recommend</div>
          </div>
        </div>
      </div>
    </section>
  )
}
