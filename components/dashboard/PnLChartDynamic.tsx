'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import type { PnLChartProps } from './PnLChart'

// Dynamic import with ssr: false to prevent window object hydration mismatches in Next.js App Router
export const PnLChartDynamic = dynamic<PnLChartProps>(
  () => import('./PnLChart').then((mod) => mod.PnLChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[280px] bg-[var(--color-surface-alt)]/50 rounded-lg animate-pulse flex items-center justify-center text-xs text-[var(--color-muted-dark)] font-mono">
        Loading chart engine...
      </div>
    ),
  }
)

export default PnLChartDynamic
