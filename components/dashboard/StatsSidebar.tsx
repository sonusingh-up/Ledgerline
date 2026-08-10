'use client'

import { fmtMoney, fmtDate } from '@/lib/calculations'
import { Trade, KPIStats, PropStatus } from '@/lib/types'

export function StatsSidebar({ 
  stats, 
  trades, 
  propStatus 
}: { 
  stats: KPIStats, 
  trades: Trade[], 
  propStatus: PropStatus | null 
}) {
  // Aggregate top 3 symbols by Winrate or PnL
  const symbolStats = trades.reduce((acc, t) => {
    if (!acc[t.symbol]) {
      acc[t.symbol] = { wins: 0, total: 0, pnl: 0 }
    }
    acc[t.symbol].total++
    if (Number(t.pnl) >= 0) acc[t.symbol].wins++
    acc[t.symbol].pnl += Number(t.pnl || 0)
    return acc
  }, {} as Record<string, { wins: number, total: number, pnl: number }>)

  const topSymbols = Object.entries(symbolStats)
    .sort((a, b) => b[1].pnl - a[1].pnl)
    .slice(0, 3)

  // Calculate week change (naive approx for UI)
  const weekAgoEquity = stats.equityCurve.length > 7 
    ? stats.equityCurve[stats.equityCurve.length - 8].equity 
    : stats.equityCurve[0].equity
  const weekChange = stats.endEquity - weekAgoEquity
  const weekChangeText = weekChange >= 0 
    ? `Your balance increased this week by about ${fmtMoney(weekChange)}` 
    : `Your balance decreased this week by about ${fmtMoney(Math.abs(weekChange))}`

  // Bar chart fake data for visual aesthetic matching reference
  const heights = [40, 60, 50, 80, 100, 30, 70]
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const winningTradesCount = Math.round((stats.winRate / 100) * stats.tradesCount)

  return (
    <div className="w-full lg:w-[320px] xl:w-[350px] flex flex-col gap-[20px] shrink-0">
      
      {/* Total Account Balance Card */}
      <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] rounded-[14px] p-[24px] flex justify-between shadow-sm">
        <div className="flex flex-col max-w-[150px]">
          <span className="text-[13px] text-[var(--color-muted)] mb-[16px]">Total account balance</span>
          <span className="font-display text-[26px] xl:text-[28px] font-bold text-white mb-[12px]">{fmtMoney(stats.endEquity)}</span>
          <span className="text-[12px] text-[var(--color-muted-dark)] leading-[1.4]">{weekChangeText}</span>
        </div>
        <div className="flex flex-col justify-end items-center gap-[6px]">
          <div className="flex items-end gap-[4px] xl:gap-[6px] h-[60px]">
            {heights.map((h, i) => (
              <div key={i} className="w-[6px] xl:w-[8px] rounded-t-[4px] opacity-20 bg-[var(--color-muted)]" style={{ height: `${h}%` }} />
            ))}
            <div className="w-[6px] xl:w-[8px] rounded-t-[4px] bg-[var(--color-accent)] shadow-[0_0_8px_rgba(110,140,250,0.5)]" style={{ height: '70%' }} />
          </div>
          <div className="flex items-center gap-[4px] xl:gap-[6px] text-[9px] xl:text-[10px] text-[var(--color-muted-dark)] font-mono">
            {days.map((d, i) => (
              <span key={i} className={i === 6 ? 'text-[var(--color-accent)] font-semibold' : ''}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Winrate Card */}
      <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] rounded-[14px] p-[24px] flex justify-between shadow-sm">
        <div className="flex flex-col max-w-[140px] xl:max-w-[150px]">
          <span className="text-[13px] text-[var(--color-muted)] mb-[16px]">Winrate</span>
          <span className="font-display text-[26px] xl:text-[28px] font-bold text-white mb-[12px]">{stats.winRate.toFixed(2)}%</span>
          <span className="text-[12px] text-[var(--color-muted-dark)] leading-[1.4]">
            {winningTradesCount} out of {stats.tradesCount} trades were profitable this period.
          </span>
        </div>
        <div className="flex flex-col gap-[12px] min-w-[90px] xl:min-w-[100px] border-l border-[var(--color-border-soft)] pl-[12px] xl:pl-[16px]">
          {topSymbols.length > 0 ? topSymbols.map(([sym, data]) => (
            <div key={sym} className="flex flex-col">
              <span className="text-[11px] text-[var(--color-muted-dark)] font-mono truncate max-w-[80px]">{sym}</span>
              <span className={`text-[12px] font-mono ${data.pnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                {fmtMoney(data.pnl)}
              </span>
            </div>
          )) : (
            <span className="text-[11px] text-[var(--color-muted-dark)]">No pair data</span>
          )}
          <a href="/trades" className="text-[11.5px] text-[var(--color-accent)] mt-[4px] hover:underline cursor-pointer">View full journal</a>
        </div>
      </div>

      {/* Daily Stats Card */}
      <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] rounded-[14px] p-[24px] flex flex-col shadow-sm">
        <div className="flex justify-between items-center mb-[16px]">
          <span className="text-[13px] text-[var(--color-muted)] flex items-center gap-[6px]">
            Daily stats <span className="w-[3px] h-[3px] rounded-full bg-[var(--color-muted-dark)]" /> <span className="text-[var(--color-accent)]">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric'})}</span>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-muted-dark)]"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </div>
        
        <div className="flex items-end gap-[10px] mb-[24px]">
          <span className={`font-display text-[26px] xl:text-[28px] font-bold ${propStatus && propStatus.todaysPnL < 0 ? 'text-[var(--color-loss)]' : 'text-white'}`}>
            {propStatus ? fmtMoney(propStatus.todaysPnL) : "$0.00"}
          </span>
          {propStatus && propStatus.todaysPnL !== 0 && (
            <span className={`text-[13px] font-mono mb-[5px] ${propStatus.todaysPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
              {propStatus.todaysPnL >= 0 ? '+' : ''}{((propStatus.todaysPnL / stats.endEquity) * 100).toFixed(2)}%
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-y-[20px] gap-x-[12px]">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[12px] text-[var(--color-muted-dark)]">Net P&L</span>
            <span className={`text-[13.5px] font-mono ${stats.netPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>{fmtMoney(stats.netPnL)}</span>
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[12px] text-[var(--color-muted-dark)]">Expectancy</span>
            <span className={`text-[13.5px] font-mono ${stats.expectancy >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>{fmtMoney(stats.expectancy)}</span>
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[12px] text-[var(--color-muted-dark)]">Total trades</span>
            <div className="flex items-center gap-[6px]">
              <span className="text-[13.5px] font-mono text-white">{stats.tradesCount}</span>
              <span className="text-[10px] px-[4px] py-[1px] bg-[rgba(79,168,138,0.15)] text-[var(--color-profit)] rounded-[4px]">W {winningTradesCount}</span>
              <span className="text-[10px] px-[4px] py-[1px] bg-[rgba(196,97,74,0.15)] text-[var(--color-loss)] rounded-[4px]">L {stats.tradesCount - winningTradesCount}</span>
            </div>
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[12px] text-[var(--color-muted-dark)]">Profit Factor</span>
            <span className="text-[13.5px] font-mono text-white">{stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
    </div>
  )
}
