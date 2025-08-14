import { Metadata } from 'next'
import { HeroSection } from '@/components/landing/hero-section'
import { NavigationHeader } from '@/components/landing/navigation-header'
import { PainPointsSection } from '@/components/landing/pain-points-section'
import { SolutionOverview } from '@/components/landing/solution-overview'
import { InteractiveFeatures } from '@/components/landing/interactive-features'
import { CollaborationSection } from '@/components/landing/collaboration-section'
import { MetricsSection } from '@/components/landing/metrics-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { IntegrationsStrip } from '@/components/landing/integrations-strip'
import { TestimonialCarousel } from '@/components/landing/testimonial-carousel'
import { AnalyticsSection } from '@/components/landing/analytics-section'
import { DeveloperSection } from '@/components/landing/developer-section'
import { FAQSection } from '@/components/landing/faq-section'
import { FinalCTABanner } from '@/components/landing/final-cta-banner'
import { LandingFooter } from '@/components/landing/landing-footer'

export const metadata: Metadata = {
  title: 'RFP Platform – Modern RFP Management & Proposal Collaboration Platform',
  description: 'Manage the complete RFP lifecycle—qualification to submission—with automation, compliance tracking, and AI-assisted answer reuse.',
  keywords: ['RFP management', 'proposal management', 'collaboration', 'compliance', 'automation'],
  openGraph: {
    title: 'RFP Platform – Win more RFPs, Cut response time',
    description: 'Unified lifecycle: intake, qualification, drafting, compliance, reviews, submission, analytics—in one secure workspace.',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationHeader />
      <main>
        <HeroSection />
        <PainPointsSection />
        <SolutionOverview />
        <InteractiveFeatures />
        <CollaborationSection />
        <PricingSection />
        <MetricsSection />
        <AnalyticsSection />
        <FinalCTABanner />
      </main>
      <LandingFooter />
    </div>
  )
}
