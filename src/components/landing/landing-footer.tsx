'use client'

import { Globe, Mail, Twitter, Linkedin, Github } from 'lucide-react'

export function LandingFooter() {
  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Security', href: '#security' },
      { label: 'API', href: '#api' },
      { label: 'Integrations', href: '#integrations' },
      { label: 'Changelog', href: '#changelog' },
    ],
    company: [
      { label: 'About Us', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: '#contact' },
      { label: 'Blog', href: '#blog' },
      { label: 'Press Kit', href: '#press' },
      { label: 'Partners', href: '#partners' },
    ],
    resources: [
      { label: 'Help Center', href: '#help' },
      { label: 'Documentation', href: '#docs' },
      { label: 'Best Practices', href: '#guides' },
      { label: 'Templates', href: '#templates' },
      { label: 'Webinars', href: '#webinars' },
      { label: 'Community', href: '#community' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
      { label: 'GDPR', href: '#gdpr' },
      { label: 'Security Whitepaper', href: '#security-whitepaper' },
    ]
  }

  const socialLinks = [
    { icon: Twitter, href: '#twitter', label: 'Twitter' },
    { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
    { icon: Github, href: '#github', label: 'GitHub' },
    { icon: Mail, href: 'mailto:hello@rfp-platform.com', label: 'Email' },
  ]

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-xl">RFP Platform</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The modern RFP management platform that helps teams win more proposals, faster and with greater confidence.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => {
                const IconComponent = link.icon
                return (
                  <a
                    key={index}
                    href={link.href}
                    className="w-10 h-10 bg-muted hover:bg-muted-foreground/20 rounded-lg flex items-center justify-center transition-colors"
                    aria-label={link.label}
                  >
                    <IconComponent className="w-5 h-5 text-muted-foreground" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal & Security</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2024 RFP Platform. All rights reserved.</span>
              <a href="#status" className="hover:text-foreground transition-colors">
                System Status
              </a>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Language Selector */}
              <div className="flex items-center space-x-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <select className="bg-transparent text-muted-foreground hover:text-foreground border-0 focus:ring-0 text-sm">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {/* Security Badge */}
              <div className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
