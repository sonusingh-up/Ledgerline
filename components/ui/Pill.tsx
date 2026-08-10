import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function Pill({ children, tone = "muted", className }: { children: React.ReactNode, tone?: "profit" | "loss" | "accent" | "muted", className?: string }) {
  const map = {
    profit: "bg-[var(--color-profit-dim)] text-[var(--color-profit)]",
    loss: "bg-[var(--color-loss-dim)] text-[var(--color-loss)]",
    accent: "bg-[var(--color-accent-dim)] text-[var(--color-accent)]",
    muted: "bg-[var(--color-surface-alt)] text-[var(--color-muted)]",
  }
  
  return (
    <span
      className={cn(
        "font-mono text-[11px] font-semibold px-2 py-[3px] rounded-[5px] tracking-[0.3px] whitespace-nowrap",
        map[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
