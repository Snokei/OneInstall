import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-xl border border-white/15 bg-white/5 backdrop-blur-2xl text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/30 hover:shadow-[0_8px_40px_0_rgba(0,0,0,0.45)] transition-all duration-300",
      className
    )}
    {...props}
  >
    {/* Glassy top-right shine */}
    <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none overflow-hidden opacity-60 dark:opacity-30">
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-white/25 via-white/15 to-transparent rounded-full blur-[50px]" />
    </div>
    {/* Glassy bottom-left subtle reflection */}
    <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none overflow-hidden opacity-30 dark:opacity-15">
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-white/10 via-transparent to-transparent rounded-full blur-[40px]" />
    </div>
    {/* Subtle glass edge highlight */}
    <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/5" />
    {children}
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold text-base leading-tight text-white/90",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-white/60 leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 pt-0 border-t border-white/10", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
