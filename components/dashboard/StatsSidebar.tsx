'use client'

import React from 'react'
import { fmtMoney } from '@/lib/calculations'
import { Trade, KPIStats, PropStatus } from '@/lib/types'
import { Wallet, Trophy, Flame, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'

export function StatsSidebar({ 
  stats, 
  trades, 
  propStatus 
}: { 
  stats: KPIStats, 
  trades: Trade[], 
  propStatus: PropStatus | null 
}) {
  // Aggregate top 3 symbols by Net PnL
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

  // Calculate week change (approx)
  const weekAgoEquity = stats.equityCurve.length > 7 
    ? stats.equityCurve[stats.equityCurve.length - 8].equity 
    : stats.equityCurve[0]?.equity || stats.endEquity
  const weekChange = stats.endEquity - weekAgoEquity
  const weekChangePct = weekAgoEquity > 0 ? (weekChange / weekAgoEquity) * 100 : 0

  // Compute real daily PnL for sparkline (last 7 days)
  const today = new Date()
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const sparkDays: { label: string; pnl: number; isToday: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayPnl = trades
      .filter((t) => t.trade_date === dateStr)
      .reduce((sum, t) => sum + Number(t.pnl || 0), 0)
    sparkDays.push({
      label: dayLabels[d.getDay()],
      pnl: dayPnl,
      isToday: i === 0,
    })
  }

  // Only show sparkline if there are 3+ days with actual trade data
  const daysWithData = sparkDays.filter((d) => d.pnl !== 0).length
  const showSparkline = daysWithData >= 3
  const maxAbsPnl = Math.max(...sparkDays.map((d) => Math.abs(d.pnl)), 1)

  const winningTradesCount = Math.round((stats.winRate / 100) * stats.tradesCount)

  return (
    <div className="w-full lg:w-[320px] xl:w-[340px] flex flex-col gap-5 shrink-0">
      
      {/* Total Account Balance Card */}
      <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] hover:border-[var(--color-accent)]/50 rounded-2xl p-5 flex flex-col gap-4 shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-muted)] flex items-center gap-1.5 font-display">
            <Wallet size={15} className="text-[var(--color-accent)]" /> Total Balance
          </span>
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
            weekChange >= 0 
              ? 'bg-[var(--color-profit)]/15 text-[var(--color-profit)] border border-[var(--color-profit)]/30' 
              : 'bg-[var(--color-loss)]/15 text-[var(--color-loss)] border border-[var(--color-loss)]/30'
          }`}>
            {weekChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {weekChangePct >= 0 ? '+' : ''}{weekChangePct.toFixed(1)}%
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-display text-2xl xl:text-3xl font-bold text-white tracking-tight">
              {fmtMoney(stats.endEquity)}
            </span>
            <span className="text-[11px] text-[var(--color-muted-dark)] mt-1 font-body">
              {weekChange >= 0 ? 'Increased' : 'Decreased'} by {fmtMoney(Math.abs(weekChange))} this period
            </span>
          </div>

          {/* Real Daily Sparkline (only if 3+ days have data) */}
          {showSparkline && (
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="flex items-end gap-1 h-12">
                {sparkDays.map((d, i) => {
                  const heightPct = Math.max(8, (Math.abs(d.pnl) / maxAbsPnl) * 100)
                  const isPositive = d.pnl >= 0
                  return (
                    <div 
                      key={i} 
                      className={`w-1.5 rounded-t-xs transition-all ${
                        d.pnl === 0
                          ? 'bg-[var(--color-muted)]/10'
                          : d.isToday
                            ? 'bg-[var(--color-accent)] shadow-[0_0_8px_rgba(110,140,250,0.6)]'
                            : isPositive
                              ? 'bg-[var(--color-profit)]/60'
                              : 'bg-[var(--color-loss)]/60'
                      }`} 
                      style={{ height: d.pnl === 0 ? '8%' : `${heightPct}%` }} 
                    />
                  )
                })}
              </div>
              <div className="flex items-center gap-1 text-[9px] text-[var(--color-muted-dark)] font-mono">
                {sparkDays.map((d, i) => (
                  <span key={i} className={d.isToday ? 'text-[var(--color-accent)] font-bold' : ''}>{d.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Winrate & Top Pairs Card */}
      <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] hover:border-[var(--color-accent)]/50 rounded-2xl p-5 flex flex-col gap-4 shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-muted)] flex items-center gap-1.5 font-display">
            <Trophy size={15} className="text-[var(--color-amber)]" /> Winrate & Pairs
          </span>
          <span className="text-xs font-mono font-bold text-white">
            {stats.winRate.toFixed(1)}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold text-white">
              {winningTradesCount}<span className="text-xs font-normal text-[var(--color-muted-dark)]"> / {stats.tradesCount}</span>
            </span>
            <span className="text-[11px] text-[var(--color-muted-dark)] mt-0.5 leading-tight font-body">
              Profitable trades logged
            </span>
          </div>

          <div className="flex flex-col gap-1.5 border-l border-[var(--color-border-soft)] pl-3">
            <span className="text-[10px] font-mono text-[var(--color-muted-dark)] font-bold">TOP PAIRS</span>
            {topSymbols.length > 0 ? (
              topSymbols.map(([sym, data]) => (
                <div key={sym} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--color-text)] font-semibold">{sym}</span>
                  <span className={data.pnl >= 0 ? 'text-[var(--color-profit)] font-semibold' : 'text-[var(--color-loss)] font-semibold'}>
                    {data.pnl >= 0 ? '+' : ''}{fmtMoney(data.pnl)}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-[11px] text-[var(--color-muted-dark)] italic">No pair data</span>
            )}
          </div>
        </div>
      </div>

      {/* Daily Performance Card */}
      <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] hover:border-[var(--color-accent)]/50 rounded-2xl p-5 flex flex-col gap-4 shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-muted)] flex items-center gap-1.5 font-display">
            <Flame size={15} className="text-[var(--color-profit)]" /> Daily Performance
          </span>
          <span className="text-[10px] font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded border border-[var(--color-accent)]/20">
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`font-display text-2xl font-bold ${propStatus && propStatus.todaysPnL < 0 ? 'text-[var(--color-loss)]' : 'text-white'}`}>
            {propStatus ? fmtMoney(propStatus.todaysPnL) : "$0.00"}
          </span>
          {propStatus && propStatus.todaysPnL !== 0 && (
            <span className={`text-xs font-mono font-semibold ${propStatus.todaysPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
              {propStatus.todaysPnL >= 0 ? '+' : ''}{((propStatus.todaysPnL / (stats.equityCurve[0]?.equity || 1)) * 100).toFixed(2)}%
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-border-soft)] font-mono text-xs">
          <div>
            <span className="text-[10px] font-body text-[var(--color-muted-dark)] block">NET P&L</span>
            <span className={`font-bold ${stats.netPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
              {stats.netPnL >= 0 ? '+' : ''}{fmtMoney(stats.netPnL)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-body text-[var(--color-muted-dark)] block">EXPECTANCY</span>
            <span className={`font-bold ${stats.expectancy >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
              {fmtMoney(stats.expectancy)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-body text-[var(--color-muted-dark)] block">TOTAL TRADES</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-bold text-white">{stats.tradesCount}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--color-profit)]/15 text-[var(--color-profit)]">W{winningTradesCount}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--color-loss)]/15 text-[var(--color-loss)]">L{stats.tradesCount - winningTradesCount}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-body text-[var(--color-muted-dark)] block">PROFIT FACTOR</span>
            <span className="font-bold text-white">
              {stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
    </div>
  )
}
