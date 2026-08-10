'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { buildDailyTooltipData, isoDaysAgo, fmtMoney } from '@/lib/calculations'
import { Trade, Account } from '@/lib/types'

export function PnLCalendar({ 
  trades, 
  baseDate = new Date().toISOString().split('T')[0], 
  weeks = 52,
  account,
  selectedDate
}: { 
  trades: Trade[], 
  baseDate?: string, 
  weeks?: number,
  account?: Account,
  selectedDate?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dailyMap = useMemo(() => buildDailyTooltipData(trades, baseDate, weeks), [trades, baseDate, weeks])

  const totalDays = weeks * 7
  const days = Array.from({ length: totalDays }, (_, i) => isoDaysAgo(baseDate, totalDays - 1 - i))

  const gridRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({ scrollLeft: 0, scrollWidth: 1, clientWidth: 1 })
  const [hoveredData, setHoveredData] = useState<{ date: string, pnl: number, count: number, winRate: number, x: number, y: number } | null>(null)

  // Color logic
  const startBal = Number(account?.start_balance || 100000)
  const dailyLossLimitDollars = account?.daily_loss_limit_pct ? (account.daily_loss_limit_pct / 100) * startBal : (startBal * 0.02)
  const profitTargetDollars = account?.profit_target_pct ? (account.profit_target_pct / 100) * startBal : (startBal * 0.08)
  const lossThreshold = dailyLossLimitDollars > 0 ? dailyLossLimitDollars : 500
  const profitThreshold = profitTargetDollars > 0 ? (profitTargetDollars / 20) : 500

  const cellColor = (pnl?: number) => {
    if (pnl === undefined || pnl === 0) return 'var(--color-surface-alt)'
    if (pnl < 0) {
      if (Math.abs(pnl) >= lossThreshold) return 'rgba(196,97,74,0.8)'
      return 'rgba(196,97,74,0.3)'
    } else {
      if (pnl >= profitThreshold) return 'rgba(79,168,138,0.8)'
      return 'rgba(79,168,138,0.3)'
    }
  }

  // Initial scroll to end
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollLeft = gridRef.current.scrollWidth
      handleScroll()
    }
  }, [trades])

  const handleScroll = () => {
    if (!gridRef.current) return
    setScrollState({
      scrollLeft: gridRef.current.scrollLeft,
      scrollWidth: gridRef.current.scrollWidth,
      clientWidth: gridRef.current.clientWidth
    })
  }

  const handleCellClick = (date: string) => {
    const p = new URLSearchParams(Array.from(searchParams.entries()))
    if (selectedDate === date) {
      p.delete('date')
    } else {
      p.set('date', date)
    }
    router.push(`?${p.toString()}`)
  }

  const thumbWidth = Math.max(10, (scrollState.clientWidth / scrollState.scrollWidth) * 100)
  const maxScrollLeft = scrollState.scrollWidth - scrollState.clientWidth
  const scrollPct = maxScrollLeft > 0 ? scrollState.scrollLeft / maxScrollLeft : 1
  const thumbLeft = scrollPct * (100 - thumbWidth)

  return (
    <div className="flex flex-col gap-[16px] relative" onMouseLeave={() => setHoveredData(null)}>
      
      {/* TOOLTIP */}
      {hoveredData && (
        <div 
          className="absolute z-50 pointer-events-none bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] p-[12px] shadow-lg shadow-[rgba(0,0,0,0.4)] flex flex-col gap-[6px] min-w-[160px] transform -translate-x-1/2 -translate-y-full transition-all duration-75 ease-out"
          style={{ left: hoveredData.x, top: hoveredData.y - 8 }}
        >
          <div className="text-[11px] font-mono text-[var(--color-muted)] mb-[2px]">{hoveredData.date}</div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[var(--color-muted)]">Net P&L</span>
            <span className={`font-mono font-medium ${hoveredData.pnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
              {hoveredData.pnl >= 0 ? '+' : ''}{fmtMoney(hoveredData.pnl)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-[var(--color-muted)]">Trades</span>
            <span className="font-mono text-[var(--color-text)]">{hoveredData.count}</span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-[var(--color-muted)]">Winrate</span>
            <span className="font-mono text-[var(--color-text)]">{hoveredData.winRate.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* SCROLLABLE GRID */}
      <div 
        ref={gridRef}
        onScroll={handleScroll}
        className="overflow-x-auto pb-[4px] hide-scrollbar cursor-grab active:cursor-grabbing"
      >
        <div 
          className="grid grid-flow-col gap-[4px] w-max" 
          style={{ gridTemplateRows: 'repeat(7, 1fr)' }}
        >
          {days.map((d) => {
            const data = dailyMap[d]
            const pnl = data?.pnl
            const bg = cellColor(pnl)
            const isSelected = selectedDate === d
            
            return (
              <div 
                key={d} 
                onClick={() => handleCellClick(d)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const containerRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect()
                  if (containerRect && data) {
                    setHoveredData({
                      date: d,
                      pnl: data.pnl,
                      count: data.tradesCount,
                      winRate: data.winRate,
                      x: (rect.left - containerRect.left) + rect.width / 2 + (gridRef.current?.scrollLeft || 0),
                      y: rect.top - containerRect.top
                    })
                  }
                }}
                className={`w-[14px] h-[14px] rounded-[3px] border cursor-pointer transition-colors hover:border-[rgba(255,255,255,0.4)] ${isSelected ? 'border-[var(--color-accent)] shadow-[0_0_6px_var(--color-accent)] z-10' : 'border-[rgba(255,255,255,0.02)]'}`}
                style={{ background: bg }}
              />
            )
          })}
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-[8px] border-t border-[var(--color-border-soft)]">
        {/* CUSTOM SCROLLBAR */}
        <div className="w-[120px] h-[4px] bg-[rgba(255,255,255,0.05)] rounded-full relative overflow-hidden">
          <div 
            className="absolute top-0 h-full bg-[var(--color-border)] rounded-full transition-all duration-75"
            style={{ width: `${thumbWidth}%`, left: `${thumbLeft}%` }}
          />
        </div>

        {/* LEGEND */}
        <div className="flex items-center gap-[6px] text-[10px] text-[var(--color-muted-dark)] font-mono">
          <span>Less</span>
          <span className="w-[10px] h-[10px] rounded-[2px]" style={{ background: `rgba(196,97,74,0.3)` }} />
          <span className="w-[10px] h-[10px] rounded-[2px]" style={{ background: `rgba(196,97,74,0.8)` }} />
          <span className="w-[10px] h-[10px] rounded-[2px] bg-[var(--color-surface-alt)]" />
          <span className="w-[10px] h-[10px] rounded-[2px]" style={{ background: `rgba(79,168,138,0.3)` }} />
          <span className="w-[10px] h-[10px] rounded-[2px]" style={{ background: `rgba(79,168,138,0.8)` }} />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
