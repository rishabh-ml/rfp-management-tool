"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, open, onOpenChange, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(open ?? false)
    
    const isOpen = open ?? internalOpen
    
    const handleToggle = () => {
      const newOpen = !isOpen
      if (onOpenChange) {
        onOpenChange(newOpen)
      } else {
        setInternalOpen(newOpen)
      }
    }

    return (
      <div
        ref={ref}
        className={cn("", className)}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === CollapsibleTrigger) {
            return React.cloneElement(child as any, { onClick: handleToggle })
          }
          if (React.isValidElement(child) && child.type === CollapsibleContent) {
            return React.cloneElement(child as any, { open: isOpen })
          }
          return child
        })}
      </div>
    )
  }
)
Collapsible.displayName = "Collapsible"

type CollapsibleTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn("", className)}
      {...props}
    >
      {children}
    </button>
  )
)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, open, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        open ? "animate-in slide-in-from-top-1" : "animate-out slide-out-to-top-1 hidden",
        className
      )}
      data-state={open ? "open" : "closed"}
      {...props}
    >
      {open && children}
    </div>
  )
)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
