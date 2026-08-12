import React from 'react'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { StrategyCard } from '@/components/strategy/StrategyCard'
import { Search, SlidersHorizontal, ArrowUpDown, ChevronDown, Activity, DollarSign, Percent } from 'lucide-react'
import { fmtMoney } from '@/lib/calculations'
import * as motion from 'motion/react-client'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 250, damping: 20 } }
}

export default function StrategyPage() {
  // Mock data matching the screenshot
  const topStrategies = [
    { id: 1, name: 'London Open Breakout', type: 'Breakout', isActive: true },
    { id: 2, name: 'USD Macro Play', type: 'News Trading', isActive: false },
    { id: 3, name: 'EUR/USD Momentum', type: 'Trend Following', isActive: true },
    { id: 4, name: 'Asian Range Mean Reversion', type: 'Mean Reversion', isActive: true },
    { id: 5, name: 'Daily Range Reversal', type: 'Range Trading', isActive: true }
  ]

  const strategyCards = [
    {
      name: 'London Open Breakout',
      tags: ['Breakout', 'EURUSD', 'GBPUSD', 'USDJPY'],
      pnl: 3820,
      winRate: 65,
      tradesCount: 48,
      profitFactor: 2.71,
      risk: 1,
      isActive: true
    },
    {
      name: 'USD Macro Play',
      tags: ['News Trading', 'EURUSD', 'USDJPY', 'GBPUSD'],
      pnl: 2460,
      winRate: 61,
      tradesCount: 18,
      profitFactor: 3.24,
      risk: 2,
      isActive: true
    },
    {
      name: 'Asian Range Mean Reversion',
      tags: ['Mean Reversion', 'AUDUSD', 'NZDUSD'],
      pnl: -450,
      winRate: 42,
      tradesCount: 26,
      profitFactor: 0.85,
      risk: 1,
      isActive: true
    },
    {
      name: 'Daily Range Reversal',
      tags: ['Range Trading', 'XAUUSD', 'US30'],
      pnl: 5450,
      winRate: 71,
      tradesCount: 34,
      profitFactor: 2.15,
      risk: 1.5,
      isActive: true
    }
  ]

  const totalPnL = 11380
  const bestWinRate = 71.0
  const totalActive = 5

  return (
    <div className="relative min-h-screen pb-20">
      <AmbientBackground />

      <div className="p-4 lg:px-8 lg:py-6 relative z-10 max-w-[1600px] mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-display font-semibold text-white flex items-center gap-2">
            <span className="w-4 h-4 bg-[var(--color-surface-hover)] rounded flex items-center justify-center border border-[var(--color-border-soft)] shadow-sm"></span>
            Strategy
          </h1>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
           <div className="relative w-full md:w-auto flex-1 max-w-[300px] group">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-dark)] group-focus-within:text-[var(--color-accent)] transition-colors" />
             <input 
               type="text" 
               placeholder="Search strategies..." 
               className="w-full bg-[var(--color-surface)] border border-[var(--color-border-soft)] rounded-md pl-9 pr-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-muted-dark)] hover:border-[var(--color-border)] shadow-sm"
             />
           </div>
           
           <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border-soft)] hover:border-[var(--color-border)] rounded-md cursor-pointer hover:bg-[var(--color-surface-hover)] transition-all shadow-sm group">
              <span className="pl-3 pr-2 py-2 text-xs font-medium text-[var(--color-muted)] group-hover:text-white transition-colors border-r border-[var(--color-border-soft)] group-hover:border-[var(--color-border)]">All Status</span>
              <ChevronDown size={14} className="mx-2 text-[var(--color-muted-dark)] group-hover:text-white transition-colors" />
           </div>

           <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border-soft)] hover:border-[var(--color-border)] rounded-md cursor-pointer hover:bg-[var(--color-surface-hover)] transition-all shadow-sm group">
              <span className="pl-3 pr-2 py-2 text-xs font-medium text-[var(--color-muted)] group-hover:text-white transition-colors border-r border-[var(--color-border-soft)] group-hover:border-[var(--color-border)]">All Types</span>
              <ChevronDown size={14} className="mx-2 text-[var(--color-muted-dark)] group-hover:text-white transition-colors" />
           </div>

           <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border-soft)] hover:border-[var(--color-border)] rounded-md cursor-pointer hover:bg-[var(--color-surface-hover)] transition-all shadow-sm group">
              <ArrowUpDown size={12} className="ml-3 mr-1 text-[var(--color-muted-dark)] group-hover:text-white transition-colors" />
              <span className="pr-2 py-2 text-xs font-medium text-white border-r border-[var(--color-border-soft)] group-hover:border-[var(--color-border)] transition-colors">Total P&L</span>
              <ChevronDown size={14} className="mx-2 text-[var(--color-muted-dark)] group-hover:text-white transition-colors" />
           </div>
        </div>

        {/* Metrics Overview Row */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-[var(--color-surface)] border border-[var(--color-border-soft)] rounded-xl overflow-hidden mb-10 shadow-sm">
          
          <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--color-border-soft)] flex flex-col justify-between relative hover:bg-[var(--color-surface-hover)] transition-colors group">
             <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-4 flex justify-between group-hover:text-[var(--color-muted)] transition-colors">
                <span>Strategies</span>
                <Activity size={12} />
             </div>
             <div>
               <div className="text-4xl font-display font-semibold text-white mb-2 tracking-tight">8</div>
               <div className="text-xs text-[var(--color-muted)]">{totalActive} active</div>
             </div>
          </div>

          <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--color-border-soft)] flex flex-col justify-between relative hover:bg-[var(--color-surface-hover)] transition-colors group">
             <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-4 flex justify-between group-hover:text-[var(--color-muted)] transition-colors">
                <span>Total P&L</span>
                <DollarSign size={12} />
             </div>
             <div>
               <div className="text-4xl font-display font-semibold text-[var(--color-profit)] mb-2 tracking-tight">+{fmtMoney(totalPnL)}</div>
               <div className="text-xs text-[var(--color-muted)]">across all strategies</div>
             </div>
          </div>

          <div className="p-6 flex flex-col justify-between relative hover:bg-[var(--color-surface-hover)] transition-colors group">
             <div className="text-[10px] text-[var(--color-muted-dark)] font-bold tracking-widest uppercase mb-4 flex justify-between group-hover:text-[var(--color-muted)] transition-colors">
                <span>Best Win Rate</span>
                <Percent size={12} />
             </div>
             <div>
               <div className="text-4xl font-display font-semibold text-white mb-2 tracking-tight">{bestWinRate.toFixed(1)}%</div>
               <div className="text-xs text-[var(--color-muted)]">Asian Range Mean Reversion</div>
             </div>
          </div>

        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
           
           {/* Left Sidebar - Top Strategies List */}
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0">
             <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-white font-display">
                <ChevronDown size={16} className="text-[var(--color-muted-dark)]" /> Top Strategies
             </div>
             <div className="space-y-3">
               {topStrategies.map((strat, i) => (
                 <div key={strat.id} className="flex items-center gap-3 p-2 hover:bg-[var(--color-surface-hover)] rounded-md transition-colors cursor-pointer group">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-amber)]/10 text-[var(--color-amber)] text-[10px] font-bold flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.2)]">
                      {i + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                       <div className="text-sm font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors truncate">
                         {strat.name}
                       </div>
                       <div className="text-xs text-[var(--color-muted-dark)] font-mono truncate">
                         {strat.type}
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           </motion.div>

           {/* Right Grid - Strategy Cards */}
           <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {strategyCards.map(card => (
                <StrategyCard 
                  key={card.name} 
                  variants={itemVariants}
                  {...card} 
                />
              ))}
           </motion.div>
        </div>

      </div>
    </div>
  )
}
