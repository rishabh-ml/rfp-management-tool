'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { CheckCircle, X, ArrowRight, Crown, Zap, Users } from 'lucide-react'

const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    description: 'Perfect for small teams getting started',
    monthlyPrice: 0,
    annualPrice: 0,
    badge: null,
    features: [
      { name: 'Up to 3 active RFPs', included: true },
      { name: 'Basic answer library (50 entries)', included: true },
      { name: 'Core lifecycle management', included: true },
      { name: '5GB storage', included: true },
      { name: 'Email support', included: true },
      { name: 'Basic compliance tracking', included: true },
      { name: 'Team collaboration (up to 5 users)', included: true },
      { name: 'Advanced analytics', included: false },
      { name: 'SSO integration', included: false },
      { name: 'API access', included: false },
      { name: 'AI features (coming soon)', included: false },
    ],
    cta: 'Start Free',
    popular: false
  },
  {
    id: 'team',
    name: 'Team',
    icon: Users,
    description: 'Ideal for growing proposal teams',
    monthlyPrice: 49,
    annualPrice: 39,
    badge: 'Most Popular',
    features: [
      { name: 'Unlimited RFPs', included: true },
      { name: 'Advanced answer library (unlimited)', included: true },
      { name: 'Full lifecycle management', included: true },
      { name: '100GB storage per user', included: true },
      { name: 'Priority email & chat support', included: true },
      { name: 'Advanced compliance matrix', included: true },
      { name: 'Team collaboration (unlimited)', included: true },
      { name: 'Advanced analytics & reporting', included: true },
      { name: 'Basic integrations', included: true },
      { name: 'API access (limited)', included: true },
      { name: 'AI features (coming soon)', included: true },
    ],
    cta: 'Start Team Trial',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    description: 'For large organizations with advanced needs',
    monthlyPrice: 149,
    annualPrice: 119,
    badge: 'Advanced Security',
    features: [
      { name: 'Everything in Team', included: true },
      { name: 'Unlimited storage', included: true },
      { name: 'Dedicated success manager', included: true },
      { name: 'Phone & video support (SLA)', included: true },
      { name: 'Custom compliance frameworks', included: true },
      { name: 'Advanced workflow automation', included: true },
      { name: 'SSO & SCIM provisioning', included: true },
      { name: 'Full API access', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Data residency options', included: true },
      { name: 'Priority AI features access', included: true },
    ],
    cta: 'Contact Sales',
    popular: false
  }
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('pricing-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const savings = Math.round(((49 - 39) / 49) * 100) // 20% savings

  return (
    <section id="pricing-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Simple,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
              transparent pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start free and scale as you grow. No hidden fees, no per-RFP charges.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-indigo-600"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              Save {savings}%
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const IconComponent = plan.icon
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
            
            return (
              <div
                key={plan.id}
                className={`relative bg-card border rounded-3xl p-8 transition-all duration-1000 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-indigo-200 shadow-lg scale-105 dark:border-indigo-800' 
                    : 'border-border hover:border-indigo-200 dark:hover:border-indigo-800'
                } ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white px-4 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600' 
                      : 'bg-gradient-to-br from-muted to-muted-foreground/20'
                  }`}>
                    <IconComponent className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-foreground'}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  
                  {plan.badge && !plan.popular && (
                    <Badge variant="outline" className="mb-4">
                      {plan.badge}
                    </Badge>
                  )}

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">
                        ${price}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {plan.id === 'free' ? '' : '/user/month'}
                      </span>
                    </div>
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <div className="text-sm text-muted-foreground mt-1">
                        ${plan.monthlyPrice}/month billed monthly
                      </div>
                    )}
                  </div>

                  <Button 
                    size="lg" 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-indigo-600 hover:bg-indigo-700' 
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {plan.cta}
                    {plan.id !== 'enterprise' && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      {feature.included ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        feature.included ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Note */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-muted px-6 py-3 rounded-full">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">
              All plans include 14-day free trial • No credit card required • Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
