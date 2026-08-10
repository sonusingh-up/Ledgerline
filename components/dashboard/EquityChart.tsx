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

export function EquityChart({ data }: { data: { x: number, equity: number }[] }) {
  if (!data || data.length === 0) return null
  
  return (
    <div className="flex-[2_1_420px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-[18px_20px]">
      <div className="text-[12px] text-[var(--color-muted)] mb-[10px]">EQUITY CURVE</div>
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border-soft)" vertical={false} />
            <XAxis dataKey="x" hide />
            <YAxis 
              tick={{ fill: "var(--color-muted-dark)", fontSize: 10.5, fontFamily: "var(--font-ibm-plex-mono)" }} 
              axisLine={false} 
              tickLine={false} 
              domain={["auto", "auto"]} 
              tickFormatter={(v) => `${Math.round(v / 1000)}k`} 
            />
            <Tooltip 
              contentStyle={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", borderRadius: 8, fontFamily: "var(--font-ibm-plex-mono)", fontSize: 12 }} 
              labelFormatter={() => ""} 
              formatter={(v: any) => [fmtMoney(Number(v)), "Equity"]} 
            />
            <Area type="monotone" dataKey="equity" stroke="var(--color-accent)" strokeWidth={2} fill="url(#eqFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
