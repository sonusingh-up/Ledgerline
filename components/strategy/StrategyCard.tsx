import React from 'react'
import { fmtMoney } from '@/lib/calculations'
import { TrendingUp, Activity, BarChart2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react'
import * as motion from 'motion/react-client'

export interface StrategyCardProps {
  name: string
  tags: string[]
  pnl: number
  winRate: number
  tradesCount: number
  profitFactor: number
  risk: number
  isActive?: boolean
  variants?: any
}

export function StrategyCard({
  name,
  tags,
  pnl,
  winRate,
  tradesCount,
  profitFactor,
  risk,
  isActive = true,
  variants
}: StrategyCardProps) {
  return (
    <motion.div 
      variants={variants}
      className="bg-[var(--color-surface)] border border-[var(--color-border-soft)] hover:border-[var(--color-border)] hover:-translate-y-1 rounded-xl p-5 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-[180px] shadow-sm hover:shadow-md"
    >
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[var(--color-profit)] shadow-[0_0_8px_var(--color-profit)]' : 'bg-[var(--color-muted-dark)]'}`}></div>
            <h3 className="text-sm font-semibold text-white font-display group-hover:text-[var(--color-accent)] transition-colors">{name}</h3>
          </div>
          <ArrowUpRight size={14} className="text-[var(--color-muted-dark)] group-hover:text-[var(--color-text)] transition-colors" />
        </div>
        
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-muted)] font-mono">
           <Tag size={10} className="text-[var(--color-muted-dark)] opacity-70" />
           {tags.map((tag, i) => (
             <React.Fragment key={tag}>
               <span>{tag}</span>
               {i < tags.length - 1 && <span className="text-[var(--color-border)]">•</span>}
             </React.Fragment>
           ))}
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[var(--color-border-soft)]">
        <div>
          <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-1">PnL</div>
          <div className={`text-lg font-display font-semibold tracking-tight ${pnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
            {pnl >= 0 ? '+' : ''}{fmtMoney(pnl)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-1">Win Rate</div>
          <div className="text-lg font-display font-semibold text-white tracking-tight">
            {winRate.toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-1">Trades</div>
          <div className="text-lg font-display font-semibold text-white tracking-tight">
            {tradesCount}
          </div>
        </div>
      </div>

      {/* Footer line */}
      <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-[var(--color-muted-dark)]">
         <div>
           PF <span className="text-[var(--color-profit)] font-semibold">{profitFactor.toFixed(2)}</span>
         </div>
         <div>
           Risk <span className="text-white font-semibold">{risk}%</span>
         </div>
      </div>
    </motion.div>
  )
}
