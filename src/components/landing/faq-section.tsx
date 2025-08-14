'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: 'How secure is our sensitive proposal data?',
    answer: 'We take security seriously with enterprise-grade measures including AES-256 encryption at rest, TLS 1.3 for data in transit, SOC 2 Type II compliance (in progress), and role-based access controls. Your data is isolated in secure environments with regular security audits and penetration testing.'
  },
  {
    question: 'Who owns the data we upload to the platform?',
    answer: 'You maintain complete ownership of all your data. We never claim ownership of your proposals, client information, or intellectual property. Our terms clearly state that customer data remains customer property, and we provide data export tools to ensure you can access your information at any time.'
  },
  {
    question: 'How easy is it to migrate from our current system?',
    answer: 'Our migration process is designed to be seamless. We provide data import tools for common formats (Excel, Word, PDF) and can work with you to migrate existing answer libraries and project data. Most teams are up and running within a week, with full migration typically completed in 2-3 weeks.'
  },
  {
    question: 'How will AI features protect our confidential information?',
    answer: 'Our AI features (coming soon) will be trained exclusively on your approved data within your secure environment. We never use your data to train models for other customers, and all AI processing happens within your isolated workspace. You maintain complete control over what information is accessible to AI features.'
  },
  {
    question: 'What are the limits during the trial period?',
    answer: 'The 14-day free trial includes full access to Team plan features with no functional limitations. You can manage unlimited RFPs, invite your entire team, and use all collaboration features. The only restriction is time - after 14 days, you\'ll need to choose a plan to continue using the platform.'
  },
  {
    question: 'What kind of support SLAs do you offer?',
    answer: 'Support varies by plan: Free includes email support with 48-hour response time, Team includes priority email and chat support with 24-hour response time, and Enterprise includes dedicated success manager with phone/video support and 4-hour response SLA during business hours.'
  },
  {
    question: 'Can we customize workflows for our specific process?',
    answer: 'Yes! Team plans include configurable workflows, and Enterprise plans offer custom workflow automation. You can define approval stages, set up automated notifications, create custom fields, and integrate with your existing tools via our API to match your exact process requirements.'
  },
  {
    question: 'How does pricing work for seasonal teams?',
    answer: 'We understand proposal teams often scale up and down. You can add or remove users monthly without penalties. For significant seasonal variations, Enterprise customers can work with their success manager to create flexible arrangements that match their usage patterns.'
  }
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])
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

    const element = document.getElementById('faq-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section id="faq-section" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Frequently{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
              asked questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about RFP Platform, security, and getting started.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openItems.includes(index)
            return (
              <div
                key={index}
                className={`bg-card border border-border rounded-2xl transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors rounded-2xl"
                >
                  <span className="font-semibold text-lg pr-8">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="px-8 pb-6">
                    <div className="pt-4 border-t border-border">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-800 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our team is here to help. Get in touch and we&apos;ll get back to you within a few hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@rfp-platform.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                Email Support
              </a>
              <a 
                href="#demo"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors font-medium"
              >
                Schedule a Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
