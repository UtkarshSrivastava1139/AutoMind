import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link" | "glass"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Using mapping for variants instead of cva for simple direct injection
    const variants = {
      default: "bg-primary text-white hover:bg-primary-hover shadow-glow-primary hover:-translate-y-0.5",
      secondary: "bg-bg-workspace text-text-primary hover:bg-bg-card-hover border border-border",
      outline: "border border-border bg-transparent hover:bg-bg-card hover:text-text-primary text-text-secondary",
      ghost: "hover:bg-bg-card hover:text-text-primary text-text-secondary",
      destructive: "bg-error/10 text-error hover:bg-error/20 border border-error/20",
      link: "text-primary hover:underline underline-offset-4",
      glass: "glass-card text-text-secondary hover:text-text-primary hover:border-primary/30"
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3 text-xs",
      lg: "h-11 rounded-xl px-8 text-base",
      icon: "h-10 w-10 text-lg",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-bg-app transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
