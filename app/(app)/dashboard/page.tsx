import { getAccounts } from '@/actions/accounts'
import { getTrades } from '@/actions/trades'
import { calculateAccountStats, calculatePropStatus } from '@/lib/calculations'
import { AccountSwitcher } from '@/components/accounts/AccountSwitcher'
import { KPICard } from '@/components/dashboard/KPICard'
import { EquityChart } from '@/components/dashboard/EquityChart'
import { DrawdownGauge } from '@/components/dashboard/DrawdownGauge'
import { PnLCalendar } from '@/components/dashboard/PnLCalendar'
import { TradeTable } from '@/components/trades/TradeTable'
import { Plus } from 'lucide-react'
import { DashboardClient } from './DashboardClient'
import { fmtMoney } from '@/lib/calculations'
import { StatsSidebar } from '@/components/dashboard/StatsSidebar'

import { AccordionApp } from '@/components/ui/card-split-accordion'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ accountId?: string }> }) {
  const params = await searchParams
  const { accounts } = await getAccounts()
  
  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-center mb-[40px]">
          <h2 className="font-display text-[24px] font-semibold mb-[10px]">Welcome to Ledgerline</h2>
          <p className="text-[var(--color-muted)] mb-[20px]">Create an account to get started.</p>
        </div>
        <div className="w-full max-w-[600px]">
          <h3 className="font-display text-[16px] font-semibold text-center mb-[10px] text-[var(--color-muted)]">HOW IT WORKS</h3>
          <AccordionApp />
        </div>
      </div>
    )
  }

  const selectedAccountId = params.accountId || accounts[0].id
  const account = accounts.find((a) => a.id === selectedAccountId) || accounts[0]
  
  const { trades } = await getTrades(account.id)
  
  const stats = calculateAccountStats(trades || [], account as any)
  const propStatus = calculatePropStatus(account as any, stats, trades || [])

  const chartData = stats.equityCurve.map((p, i) => ({ x: i, equity: p.equity }))
  const winRateTrend = (trades || []).slice(-10).map((t, i, arr) => {
    const upto = arr.slice(0, i + 1)
    const w = upto.filter((x) => (x.pnl ?? 0) >= 0).length
    return (w / upto.length) * 100
  })

  return (
    <>
      <div className="flex items-center justify-between p-[16px_24px] border-b border-[var(--color-border)] gap-[12px] flex-wrap">
        <div className="flex items-center gap-[10px]">
          <AccountSwitcher accounts={accounts as any} />
        </div>
        <DashboardClient accountId={account.id} accountType={account.account_type as 'prop' | 'retail'} />
      </div>

      <div className="p-[24px] flex flex-col gap-[22px]">
        {(!trades || trades.length === 0) ? (
          <div className="flex flex-col items-center">
            <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-[10px] p-[60px_20px] text-center w-full max-w-[800px] mb-[40px]">
              <div className="font-display text-[16px] text-[var(--color-text)] mb-[6px]">No trades on this account yet</div>
              <div className="text-[13px] text-[var(--color-muted)] mb-[18px]">Log your first trade to see your stats and drawdown buffer.</div>
            </div>
            
            <div className="w-full max-w-[600px]">
              <h3 className="font-display text-[14px] font-semibold text-center mb-[4px] text-[var(--color-muted-dark)] tracking-wider">UNDERSTANDING METRICS</h3>
              <AccordionApp />
            </div>
          </div>
        ) : (
          <>
          <div className="flex flex-col lg:flex-row gap-[24px]">
            {/* LEFT COLUMN */}
            <StatsSidebar stats={stats} trades={trades as any} propStatus={propStatus} />

            {/* RIGHT COLUMN */}
            <div className="flex-1 flex flex-col gap-[24px] min-w-0">
              
              {/* TOP HEADER / FILTERS */}
              <div className="flex justify-between items-center bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] rounded-[12px] p-[6px] shadow-sm overflow-x-auto hide-scrollbar">
                <div className="flex items-center gap-[4px]">
                  {['W', 'M', 'Q', 'All', 'Custom'].map((p, i) => (
                    <button key={p} className={`px-[16px] py-[6px] rounded-[6px] text-[12.5px] font-medium border-none cursor-pointer transition-colors ${i === 3 ? 'bg-[var(--color-surface-hover)] text-[var(--color-text)]' : 'bg-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-[12px] pr-[8px]">
                  <div className="flex items-center gap-[6px] text-[12.5px] text-[var(--color-muted)]">
                    Setup <span className="text-[var(--color-text)]">Swing <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></span>
                  </div>
                  <div className="w-[1px] h-[14px] bg-[var(--color-border)] mx-[4px]" />
                  <div className="flex items-center gap-[6px] text-[12.5px] text-[var(--color-muted)]">
                    View by <span className="text-[var(--color-text)]">Auto <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></span>
                  </div>
                </div>
              </div>

              {/* EQUITY CHART & KPI ROW */}
              <div className="flex flex-col">
                <EquityChart data={chartData} />
                
                {/* INLINE KPI ROW */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-[16px] border-b border-[var(--color-border)] pb-[24px] mt-[24px]">
                  <div className="flex flex-col gap-[6px]">
                    <span className="text-[12px] text-[var(--color-muted)]">Winrate</span>
                    <span className="font-mono text-[14px] text-[var(--color-text)]">{stats.winRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <span className="text-[12px] text-[var(--color-muted)]">Profit factor</span>
                    <span className="font-mono text-[14px] text-[var(--color-text)]">{stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <span className="text-[12px] text-[var(--color-muted)]">Total trades</span>
                    <span className="font-mono text-[14px] text-[var(--color-text)]">{stats.tradesCount}</span>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <span className="text-[12px] text-[var(--color-muted)]">Expectancy</span>
                    <span className={`font-mono text-[14px] ${stats.expectancy >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>{fmtMoney(stats.expectancy)}</span>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <span className="text-[12px] text-[var(--color-muted)]">PNL</span>
                    <span className={`font-mono text-[14px] ${stats.netPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>{stats.netPnL >= 0 ? '+' : ''}{fmtMoney(stats.netPnL)} / {stats.netPnL >= 0 ? '+' : ''}{((stats.netPnL / account.start_balance) * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM SPLIT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                {account.account_type === "prop" && propStatus ? (
                  <DrawdownGauge pctUsed={propStatus.pctBufferUsed} dollarsRemaining={propStatus.bufferRemaining} breach={propStatus.breach} dailyPctUsed={propStatus.dailyPctUsed} dailyLossLimitDollars={propStatus.dailyLossLimitDollars} todaysPnL={propStatus.todaysPnL} profitProgressPct={propStatus.profitProgressPct} />
                ) : (
                  <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] rounded-[14px] p-[24px] flex flex-col items-center justify-center text-[13px] text-[var(--color-muted-dark)] text-center min-h-[220px] shadow-sm">
                    No prop-firm rules apply to this retail account.<br />Switch accounts to view compliance tracking.
                  </div>
                )}
                
                {/* CALENDAR BLOCK */}
                <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] rounded-[14px] p-[24px] shadow-sm">
                  <div className="flex justify-between items-center mb-[16px]">
                    <span className="text-[13px] font-medium text-[var(--color-text)]">Heatmap</span>
                  </div>
                  <PnLCalendar trades={trades as any} weeks={24} />
                </div>
              </div>

              <div className="mt-[10px]">
                <TradeTable trades={trades as any} limit={12} />
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </>
  )
}
