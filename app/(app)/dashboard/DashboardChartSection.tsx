'use client'

import React, { useState } from 'react'
import { EquityChart } from '@/components/dashboard/EquityChart'
import PnLChart from '@/components/ui/PnLChart'
import { TrendingUp, LineChart, Layers } from 'lucide-react'

export interface DashboardChartSectionProps {
  chartData: { x: number; equity: number }[]
  equityCurve: { date: string; equity: number }[]
  startBalance: number
}

export function DashboardChartSection({
  chartData,
  equityCurve,
  startBalance,
}: DashboardChartSectionProps) {
  const [activeTab, setActiveTab] = useState<'pnl' | 'equity'>('pnl')

  // Transform equity curve into PnL chart format (date string + cumulative PnL)
  const pnlData = equityCurve.map((point) => ({
    time: point.date,
    value: point.equity - startBalance,
  }))

  return (
    <div className="bg-[var(--color-surface-alt)]/70 backdrop-blur-md border border-[var(--color-border-soft)] rounded-2xl p-5 shadow-md flex flex-col gap-4 hover:shadow-lg transition-shadow">
      {/* Tab Switcher & Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
            <TrendingUp size={16} className="text-[var(--color-accent)]" />
          </div>
          <h3 className="text-sm font-semibold text-white font-display tracking-tight">
            Performance Overview
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-0.5 bg-[var(--color-surface)]/80 p-1 rounded-lg border border-[var(--color-border-soft)]">
          <button
            onClick={() => setActiveTab('pnl')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'pnl'
                ? 'bg-[#6E8CFA] text-white shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <LineChart size={13} />
            <span>Cumulative P&L</span>
          </button>

          <button
            onClick={() => setActiveTab('equity')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'equity'
                ? 'bg-[#6E8CFA] text-white shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <Layers size={13} />
            <span>Equity Curve</span>
          </button>
        </div>
      </div>

      {/* Chart Render */}
      <div className="w-full">
        {activeTab === 'pnl' ? (
          <PnLChart data={pnlData} height={300} />
        ) : (
          <EquityChart data={chartData} />
        )}
      </div>
    </div>
  )
}
