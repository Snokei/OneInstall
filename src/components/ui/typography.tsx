import * as React from "react"
import { cn } from "@/lib/utils"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function H1({ className, children, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
}

export function H2({ className, children, ...props }: TypographyProps) {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

export function H3({ className, children, ...props }: TypographyProps) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function H4({ className, children, ...props }: TypographyProps) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-lg font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  )
}

export function P({ className, children, ...props }: TypographyProps) {
  return (
    <p
      className={cn("leading-relaxed text-sm text-muted-foreground [&:not(:first-child)]:mt-4", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function Lead({ className, children, ...props }: TypographyProps) {
  return (
    <p
      className={cn("text-base text-muted-foreground leading-relaxed font-medium", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function Large({ className, children, ...props }: TypographyProps) {
  return (
    <div className={cn("text-base font-semibold text-foreground", className)} {...props}>
      {children}
    </div>
  )
}

export function Small({ className, children, ...props }: TypographyProps) {
  return (
    <small
      className={cn("text-sm font-medium leading-none text-muted-foreground", className)}
      {...props}
    >
      {children}
    </small>
  )
}

export function Muted({ className, children, ...props }: TypographyProps) {
  return (
    <p className={cn("text-sm text-muted-foreground/80 font-medium leading-normal", className)} {...props}>
      {children}
    </p>
  )
}

export function InlineCode({ className, children, ...props }: TypographyProps) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground bg-neutral-100 dark:bg-neutral-800/50 border border-border/40",
        className
      )}
      {...props}
    >
      {children}
    </code>
  )
}
