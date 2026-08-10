'use client'

import dynamic from 'next/dynamic'
import type { PnLChartProps } from '../dashboard/PnLChart'

export const PnLChart = dynamic<PnLChartProps>(
  () => import('../dashboard/PnLChart').then((mod) => mod.PnLChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[280px] bg-[var(--color-surface-alt)]/50 rounded-lg animate-pulse flex items-center justify-center text-xs text-[var(--color-muted-dark)] font-mono">
        Loading chart engine...
      </div>
    ),
  }
)

export default PnLChart
