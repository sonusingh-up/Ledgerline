'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { fmtMoney } from '@/lib/calculations'

export interface EquityChartProps {
  data: { x: number; equity: number; date?: string }[]
}

export function EquityChart({ data }: EquityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[280px] bg-[var(--color-surface-alt)]/50 rounded-xl border border-[var(--color-border-soft)] flex items-center justify-center text-xs text-[var(--color-muted)] font-mono">
        No equity curve data available.
      </div>
    )
  }

  const startEq = data[0]?.equity || 100000
  const endEq = data[data.length - 1]?.equity || startEq
  const pctChange = startEq > 0 ? ((endEq - startEq) / startEq) * 100 : 0
  const isProfit = endEq >= startEq

  // Calculate dynamic min/max for Y-Axis domain with safe padding
  const equities = data.map((d) => d.equity)
  const minEq = Math.min(...equities)
  const maxEq = Math.max(...equities)
  const diff = maxEq - minEq
  const domainPadding = diff > 0 ? diff * 0.15 : startEq * 0.05

  const yMin = Math.floor(minEq - domainPadding)
  const yMax = Math.ceil(maxEq + domainPadding)

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header Info */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-white tracking-tight leading-none">
            {fmtMoney(endEq)}
          </span>
          <span
            className={`text-xs font-mono font-bold leading-none ${
              isProfit ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'
            }`}
          >
            {isProfit ? '+' : ''}
            {pctChange.toFixed(2)}%
          </span>
        </div>

        <span className="text-xs text-[var(--color-muted-dark)] font-mono">
          {data.length} Data Points
        </span>
      </div>

      {/* SVG Equity Area Chart */}
      <div className="w-full h-[260px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="eqFillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isProfit ? '#4FA88A' : '#C4614A'}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={isProfit ? '#4FA88A' : '#C4614A'}
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="var(--color-border-soft)"
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.5}
            />

            <XAxis dataKey="x" hide />

            <YAxis
              orientation="right"
              tick={{ fill: '#8B96A6', fontSize: 10, fontFamily: 'var(--font-ibm-plex-mono)' }}
              axisLine={false}
              tickLine={false}
              domain={[yMin, yMax]}
              tickCount={5}
              tickFormatter={(v) => {
                if (Math.abs(v) >= 1000) {
                  const k = v / 1000
                  return `$${k.toFixed(1)}k`
                }
                return `$${Math.round(v)}`
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface-alt)',
                borderColor: 'var(--color-border)',
                borderRadius: '8px',
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                color: '#E7EAEE',
              }}
              labelFormatter={(x) => `Trade #${x}`}
              formatter={(val: any) => [fmtMoney(Number(val)), 'Account Equity']}
            />

            <Area
              type="monotone"
              dataKey="equity"
              stroke={isProfit ? '#4FA88A' : '#C4614A'}
              strokeWidth={2.5}
              fill="url(#eqFillGradient)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default EquityChart
