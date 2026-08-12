'use client'

import React from 'react'
import { LineChart, Line, AreaChart, Area, ResponsiveContainer } from 'recharts'
import { fmtMoney } from '@/lib/calculations'
import { TrendingUp, Activity, BarChart2 } from 'lucide-react'
import * as motion from 'motion/react-client'

interface DashboardChartsRowProps {
  chartData: { x: number; equity: number }[]
  equityCurve: { date: string; equity: number }[]
  startBalance: number
  winRate: number
  profitFactor: number
  drawdownInfo?: {
    currentDrawdown: number
  }
  tradesCount: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 250, damping: 20 } }
}

export function DashboardChartsRow({
  chartData,
  equityCurve,
  startBalance,
  winRate,
  profitFactor,
  drawdownInfo,
  tradesCount
}: DashboardChartsRowProps) {
  // Transform equity curve into PnL chart format (cumulative PnL)
  const pnlData = equityCurve.map((point, index) => ({
    x: index,
    value: point.equity - startBalance,
  }))

  const latestPnL = pnlData.length > 0 ? pnlData[pnlData.length - 1].value : 0;
  
  // Fake score logic based on winrate & pf with sample size dampening
  // Dampens the score if there are fewer than 20 trades (linearly scales up to 1.0)
  const dampening = Math.min(1, tradesCount / 20);
  const rawScore = (winRate * 0.5) + (profitFactor === Infinity ? 20 : profitFactor * 10);
  const score = Math.min(100, Math.max(0, Math.round(rawScore * dampening)));
  const currentDrawdown = drawdownInfo?.currentDrawdown || 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      
      {/* Ledgerline Score */}
      <motion.div variants={itemVariants} className="bg-[var(--color-surface)] border border-[var(--color-border-soft)] hover:border-[var(--color-border)] transition-colors rounded-xl p-4 flex flex-col justify-between group shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase group-hover:text-[var(--color-muted)] transition-colors">Ledgerline Score</div>
          <div className="text-xs font-mono text-[var(--color-muted)]">{score}/100</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
           <div className="relative flex items-center justify-center w-24 h-24">
             <svg className="w-full h-full" viewBox="0 0 100 100">
                <path d="M 10 90 A 40 40 0 0 1 90 90" fill="none" stroke="var(--color-surface-alt)" strokeWidth="6" strokeLinecap="round" />
                <motion.path 
                  d="M 10 90 A 40 40 0 0 1 90 90" 
                  fill="none" 
                  stroke="var(--color-accent)" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeDasharray="125" 
                  initial={{ strokeDashoffset: 125 }}
                  animate={{ strokeDashoffset: 125 - (125 * score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
             </svg>
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-2xl font-display font-bold text-white">
                {score}
             </div>
           </div>
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono text-[var(--color-muted-dark)]">
          <div className="flex flex-col"><span>Win %</span><span className="text-[var(--color-muted)]">{winRate.toFixed(1)}</span></div>
          <div className="flex flex-col text-right"><span>P.F.</span><span className="text-[var(--color-muted)]">{profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}</span></div>
        </div>
      </motion.div>

      {/* Daily Cumulative PnL */}
      <motion.div variants={itemVariants} className="bg-[var(--color-surface)] border border-[var(--color-border-soft)] hover:border-[var(--color-border)] transition-colors rounded-xl p-4 flex flex-col justify-between group shadow-sm">
        <div className="flex justify-between items-start mb-2">
           <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase group-hover:text-[var(--color-muted)] transition-colors">Daily Cumulative PnL</div>
           <Activity size={14} className="text-[var(--color-profit)] opacity-80" />
        </div>
        <div className={`text-2xl font-display font-semibold mb-4 tracking-tight ${latestPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
          {latestPnL >= 0 ? '+' : ''}{fmtMoney(latestPnL)}
        </div>
        <div className="h-16 w-full mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pnlData}>
              <Line type="monotone" dataKey="value" stroke="var(--color-profit)" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Drawdown */}
      <motion.div variants={itemVariants} className="bg-[var(--color-surface)] border border-[var(--color-border-soft)] hover:border-[var(--color-border)] transition-colors rounded-xl p-4 flex flex-col justify-between group shadow-sm">
         <div className="flex justify-between items-start mb-2">
           <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase group-hover:text-[var(--color-muted)] transition-colors">Drawdown</div>
           <TrendingUp size={14} className="text-[var(--color-loss)] opacity-80" />
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <div className="text-2xl font-display font-semibold text-[var(--color-loss)] tracking-tight">
            -{fmtMoney(currentDrawdown)}
          </div>
          <div className="text-xs text-[var(--color-muted)]">current</div>
        </div>
        <div className="h-16 w-full mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pnlData}>
              <Area type="monotone" dataKey="value" stroke="var(--color-loss)" fill="var(--color-loss-dim)" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </motion.div>
  )
}

