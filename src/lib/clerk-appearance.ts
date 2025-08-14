/**
 * Shared Clerk appearance configuration
 * This ensures consistent styling across all Clerk components
 */

export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: 'bottom' as const,
    logoPlacement: 'inside' as const,
  },
  variables: {
    // Brand colors
    colorPrimary: '#2F4BE0', // Indigo primary
    colorSuccess: '#10B981', // Emerald success
    colorDanger: '#DC2626', // Red danger
    colorWarning: '#F59E0B', // Amber warning
    
    // Background colors
    colorBackground: 'hsl(var(--background))',
    colorInputBackground: 'hsl(var(--background))',
    
    // Text colors
    colorText: 'hsl(var(--foreground))',
    colorTextSecondary: 'hsl(var(--muted-foreground))',
    colorInputText: 'hsl(var(--foreground))',
    
    // Border and radius
    borderRadius: '0.75rem',
    
    // Typography
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '0.875rem',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  elements: {
    // Root container
    rootBox: 'w-full',
    
    // Main card
    card: 'bg-transparent shadow-none border-0 p-0 w-full',
    
    // Header
    headerTitle: 'text-2xl font-semibold text-center mb-2 hidden',
    headerSubtitle: 'text-muted-foreground text-center mb-6 hidden',
    
    // Social buttons
  socialButtons: 'flex flex-col gap-3 mb-4',
    socialButtonsBlockButton: [
      'w-full bg-card hover:bg-muted border border-border rounded-xl h-11',
      'font-medium transition-colors focus:outline-none focus:ring-2',
      'focus:ring-primary focus:ring-offset-2'
    ].join(' '),
    socialButtonsBlockButtonText: 'text-foreground',
    socialButtonsProviderIcon: 'w-5 h-5',
    
    // Divider
    dividerLine: 'bg-border',
    dividerText: 'text-muted-foreground text-sm',
    
    // Form fields
    formFieldLabel: 'text-foreground font-medium mb-2 block',
    formFieldInput: [
      'w-full h-11 px-4 border border-border rounded-xl bg-background align-middle',
      'text-foreground placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
      'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
    ].join(' '),
    formFieldHintText: 'text-muted-foreground text-sm mt-1',
    formFieldError: 'text-destructive text-sm mt-1 flex items-center gap-1',
    formFieldErrorText: 'text-destructive',
    formFieldSuccessText: 'text-emerald-600 text-sm mt-1',
    
    // Form buttons
    formButtonPrimary: [
      'w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground',
      'font-medium rounded-xl transition-colors focus:outline-none',
      'focus:ring-2 focus:ring-primary focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ].join(' '),
    formButtonSecondary: [
      'w-full h-11 bg-muted hover:bg-muted/80 text-foreground',
      'font-medium rounded-xl transition-colors focus:outline-none',
      'focus:ring-2 focus:ring-muted-foreground focus:ring-offset-2'
    ].join(' '),
    
    // Footer links
    footerActionLink: 'text-primary hover:underline font-medium transition-colors',
    footerActionText: 'text-muted-foreground text-sm',
    
    // Identity preview
    identityPreviewText: 'text-foreground',
    identityPreviewEditButtonIcon: 'text-muted-foreground hover:text-foreground',
    
    // OTP and verification
    formResendCodeLink: 'text-primary hover:underline transition-colors',
    otpCodeFieldInput: [
      'border border-border rounded-lg bg-background text-foreground text-center',
      'focus:ring-2 focus:ring-primary focus:border-transparent w-12 h-12 text-base font-medium'
    ].join(' '),
    
    // Alerts
    alert: 'border border-border rounded-xl bg-card/50 p-4',
    alertText: 'text-foreground text-sm',
    
    // Loading
    spinner: 'text-primary',
    
    // Breadcrumbs (for multi-step flows)
    breadcrumbsItem: 'text-muted-foreground',
    breadcrumbsItemBox: 'border border-border rounded-lg',
    breadcrumbsItemDivider: 'text-muted-foreground',
    
    // Phone input
    phoneInputBox: 'border border-border rounded-xl bg-background focus-within:ring-2 focus-within:ring-primary',
    
    // Footer
    footer: 'mt-6',
    footerPages: 'flex flex-col gap-2',
  },
} as const

/**
 * Clerk appearance for sign-in specific styling
 */
export const signInAppearance = {
  ...clerkAppearance,
  elements: {
    ...clerkAppearance.elements,
    // Sign-in specific overrides
    socialButtons: 'flex flex-col gap-3 mb-6',
  }
}

/**
 * Clerk appearance for sign-up specific styling  
 */
export const signUpAppearance = {
  ...clerkAppearance,
  layout: {
    ...clerkAppearance.layout,
    socialButtonsPlacement: 'top' as const,
  },
  elements: {
    ...clerkAppearance.elements,
    // Sign-up specific overrides
    socialButtons: 'flex flex-col gap-3 mb-6',
  }
}
