import React from 'react'
import { fmtMoney } from '@/lib/calculations'
import * as motion from 'motion/react-client'

interface DashboardMetricsProps {
  dayWinRate: number
  avgWin: number
  avgLoss: number
  longPnL: number
  shortPnL: number
  bestWinStreak: number
  bestLossStreak: number
  avgDuration: string
  wins: number
  losses: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

export function DashboardMetrics({
  dayWinRate,
  avgWin,
  avgLoss,
  longPnL,
  shortPnL,
  bestWinStreak,
  bestLossStreak,
  avgDuration,
  wins,
  losses
}: DashboardMetricsProps) {
  const avgWinLoss = avgLoss === 0 ? avgWin : Math.abs(avgWin / avgLoss);
  
  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="grid grid-cols-2 lg:grid-cols-5 gap-[1px] bg-[var(--color-border-soft)] border border-[var(--color-border-soft)] rounded-xl overflow-hidden mt-6 mb-6 shadow-sm"
    >
      
      {/* Day Win % */}
      <motion.div variants={itemVariants} className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors p-5 flex flex-col justify-between group">
        <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-3 group-hover:text-[var(--color-muted)] transition-colors">Day Win %</div>
        <div>
          <div className="text-3xl font-display font-semibold text-white mb-2 tracking-tight">{dayWinRate.toFixed(1)}%</div>
          <div className="text-xs text-[var(--color-muted)] font-mono">{wins}W - {losses}L</div>
        </div>
        <div className="mt-4 flex items-center w-full h-1.5 bg-[var(--color-surface-alt)] rounded-full overflow-hidden shadow-inner">
           <div className="h-full bg-[var(--color-profit)] shadow-[0_0_10px_var(--color-profit)]" style={{ width: `${dayWinRate}%` }}></div>
           <div className="h-full bg-[var(--color-loss)] shadow-[0_0_10px_var(--color-loss)]" style={{ width: `${100 - dayWinRate}%` }}></div>
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono">
          <span className="text-[var(--color-profit)]">{wins} {wins === 1 ? 'win' : 'wins'}</span>
          <span className="text-[var(--color-loss)]">{losses} {losses === 1 ? 'loss' : 'losses'}</span>
        </div>
      </motion.div>

      {/* Win / Loss Ratio */}
      <motion.div variants={itemVariants} className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors p-5 flex flex-col justify-between group">
        <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-3 group-hover:text-[var(--color-muted)] transition-colors">Win/Loss Ratio</div>
        <div>
          <div className="text-3xl font-display font-semibold text-white mb-2 tracking-tight">{avgWinLoss.toFixed(2)}</div>
          <div className="text-xs text-[var(--color-muted)]">Reward to Risk</div>
        </div>
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <div className="w-10 h-1 bg-[var(--color-profit)] rounded-full shadow-[0_0_8px_var(--color-profit)]"></div>
              <span className="text-[var(--color-profit)]">{fmtMoney(avgWin)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
             <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-[var(--color-loss)] rounded-full shadow-[0_0_8px_var(--color-loss)]"></div>
              <span className="text-[var(--color-loss)]">{fmtMoney(Math.abs(avgLoss))}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Long vs Short */}
      <motion.div variants={itemVariants} className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors p-5 flex flex-col justify-between group">
        <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-3 group-hover:text-[var(--color-muted)] transition-colors">Long vs Short</div>
        <div>
          <div className={`text-3xl font-display font-semibold mb-2 tracking-tight ${(longPnL + shortPnL) >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
            {(longPnL + shortPnL) >= 0 ? '+' : ''}{fmtMoney(longPnL + shortPnL)}
          </div>
          <div className="text-xs text-[var(--color-muted)]">Total PnL</div>
        </div>
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-muted)]">L</span>
              <div className="w-10 h-1 bg-[var(--color-profit)] rounded-full shadow-[0_0_8px_var(--color-profit)]"></div>
            </div>
            <span className="text-[var(--color-profit)]">{(longPnL) >= 0 ? '+' : ''}{fmtMoney(longPnL)} &gt;</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
             <div className="flex items-center gap-2">
              <span className="text-[var(--color-muted)]">S</span>
              <div className="w-8 h-1 bg-[var(--color-profit)] opacity-70 rounded-full"></div>
            </div>
            <span className="text-[var(--color-profit)]">{(shortPnL) >= 0 ? '+' : ''}{fmtMoney(shortPnL)} &gt;</span>
          </div>
        </div>
      </motion.div>

      {/* Max Streaks */}
      <motion.div variants={itemVariants} className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors p-5 flex flex-col justify-between group">
        <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-3 group-hover:text-[var(--color-muted)] transition-colors">Max Streaks</div>
        <div>
          <div className="text-3xl font-display font-semibold text-[var(--color-profit)] mb-2 tracking-tight">{bestWinStreak}</div>
          <div className="text-xs text-[var(--color-muted)]">Best win streak</div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)]">
            <span>Consecutive wins</span>
            <span className="text-[var(--color-profit)] font-mono font-semibold">{bestWinStreak}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)]">
            <span>Consecutive losses</span>
            <span className="text-[var(--color-loss)] font-mono font-semibold">{bestLossStreak}</span>
          </div>
        </div>
      </motion.div>

      {/* Avg Duration */}
      <motion.div variants={itemVariants} className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors p-5 flex flex-col justify-between group col-span-2 lg:col-span-1">
        <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-3 group-hover:text-[var(--color-muted)] transition-colors">Avg Duration</div>
        <div>
          <div className="text-3xl font-display font-semibold text-[var(--color-muted-dark)] mb-2 tracking-tight">--</div>
          <div className="text-xs text-[var(--color-muted)]">Coming Soon</div>
        </div>
        <div className="mt-4 opacity-30 grayscale transition-all">
           <div className="flex gap-1 h-3 items-end">
              {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                <div key={i} className="w-1.5 bg-[var(--color-border-soft)] rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
           </div>
        </div>
      </motion.div>

    </motion.div>
  )
}
