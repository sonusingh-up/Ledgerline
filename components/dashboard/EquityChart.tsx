'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { fmtMoney } from '@/lib/calculations'

import { useMemo } from 'react'

export function EquityChart({ data }: { data: { x: number, equity: number }[] }) {
  if (!data || data.length === 0) return null
  
  const startEq = data[0]?.equity || 0
  const endEq = data[data.length - 1]?.equity || 0
  const pctChange = startEq > 0 ? ((endEq - startEq) / startEq) * 100 : 0
  const isProfit = endEq >= startEq

  // Calculate dynamic min/max for YAxis to look like the reference chart
  const minEq = Math.min(...data.map(d => d.equity))
  const maxEq = Math.max(...data.map(d => d.equity))
  const domainPadding = (maxEq - minEq) * 0.1

  return (
    <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[14px] p-[24px] flex flex-col shadow-sm">
      <div className="flex items-center gap-[12px] mb-[12px]">
        <span className="text-[13px] font-medium text-[var(--color-text)]">P&L</span>
        <span className="text-[13px] text-[var(--color-muted)]">Balance</span>
      </div>
      
      <div className="flex items-end gap-[12px] mb-[40px]">
        <span className="font-display text-[32px] font-bold text-[var(--color-text)] leading-none">{fmtMoney(endEq)}</span>
        <span className={`text-[14px] font-mono leading-none mb-[4px] ${isProfit ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
          {isProfit ? '+' : ''}{pctChange.toFixed(2)}%
        </span>
      </div>

      <div className="w-full flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isProfit ? 'rgba(79,168,138,0.3)' : 'rgba(196,97,74,0.3)'} />
                <stop offset="100%" stopColor={isProfit ? 'rgba(79,168,138,0)' : 'rgba(196,97,74,0)'} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border-soft)" vertical={false} opacity={0.5} />
            <XAxis dataKey="x" hide />
            <YAxis 
              orientation="right"
              tick={{ fill: "var(--color-muted-dark)", fontSize: 10, fontFamily: "var(--font-ibm-plex-mono)" }} 
              axisLine={false} 
              tickLine={false} 
              domain={[Math.floor(minEq - domainPadding), Math.ceil(maxEq + domainPadding)]} 
              tickCount={6}
              tickFormatter={(v) => {
                if (Math.abs(v) >= 1000) {
                  const k = v / 1000
                  return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`
                }
                return String(Math.round(v))
              }}
            />
            <Tooltip 
              contentStyle={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", borderRadius: 8, fontFamily: "var(--font-ibm-plex-mono)", fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} 
              labelFormatter={() => ""} 
              formatter={(v: any) => [fmtMoney(Number(v)), "Equity"]} 
            />
            <Area 
              type="linear" 
              dataKey="equity" 
              stroke={isProfit ? "var(--color-profit)" : "var(--color-loss)"} 
              strokeWidth={2} 
              fill="url(#eqFill)" 
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
