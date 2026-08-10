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
            <div className="flex gap-[14px] flex-wrap">
              <KPICard label="Net P&L" value={fmtMoney(stats.netPnL)} tone={stats.netPnL >= 0 ? "profit" : "loss"} sub={`${stats.tradesCount} trades logged`} />
              <KPICard label="Win rate" value={`${stats.winRate.toFixed(1)}%`} sub="of closed trades" trend={winRateTrend} />
              <KPICard label="Profit factor" value={stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)} sub="gross win ÷ gross loss" />
              <KPICard label="Expectancy" value={fmtMoney(stats.expectancy)} tone={stats.expectancy >= 0 ? "profit" : "loss"} sub="avg P&L per trade" />
            </div>

            <div className="flex gap-[14px] flex-wrap">
              <EquityChart data={chartData} />

              {account.account_type === "prop" && propStatus ? (
                <div className="flex-[1_1_260px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-[18px_20px] flex flex-col items-center gap-[14px]">
                  <div className="text-[12px] text-[var(--color-muted)] self-start">MAX DRAWDOWN BUFFER</div>
                  <DrawdownGauge pctUsed={propStatus.pctBufferUsed} dollarsRemaining={propStatus.bufferRemaining} breach={propStatus.breach} />
                  <div className="w-full flex flex-col gap-[10px] mt-[4px]">
                    <div>
                      <div className="flex justify-between text-[11.5px] text-[var(--color-muted)] mb-[4px]">
                        <span>Today's P&L / Limit</span>
                        <span className="font-mono">
                          <span style={{ color: propStatus.todaysPnL >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                            {fmtMoney(propStatus.todaysPnL)}
                          </span>
                          <span className="text-[var(--color-muted-dark)]"> / -{fmtMoney(propStatus.dailyLossLimitDollars)}</span>
                        </span>
                      </div>
                      <div className="h-[5px] bg-[var(--color-border-soft)] rounded-[3px]">
                        <div 
                          className="h-[5px] rounded-[3px] transition-all duration-300" 
                          style={{ width: `${propStatus.dailyPctUsed}%`, background: propStatus.dailyPctUsed > 70 ? 'var(--color-loss)' : 'var(--color-amber)' }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11.5px] text-[var(--color-muted)] mb-[4px]">
                        <span>Profit target</span>
                        <span className="font-mono">{propStatus.profitProgressPct.toFixed(0)}%</span>
                      </div>
                      <div className="h-[5px] bg-[var(--color-border-soft)] rounded-[3px]">
                        <div 
                          className="h-[5px] rounded-[3px] transition-all duration-300 bg-[var(--color-profit)]" 
                          style={{ width: `${propStatus.profitProgressPct}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-[1_1_260px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-[18px_20px] flex items-center justify-center text-[var(--color-muted-dark)] text-[13px] text-center">
                  No prop-firm rules apply to a retail account.<br />Switch accounts to view compliance tracking.
                </div>
              )}
            </div>

            <PnLCalendar trades={trades as any} weeks={24} />
            
            <TradeTable trades={trades as any} limit={12} />
          </>
        )}
      </div>
    </>
  )
}
