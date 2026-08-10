import { getAccounts } from '@/actions/accounts'
import { getTrades } from '@/actions/trades'
import { calculateAccountStats, calculatePropStatus } from '@/lib/calculations'
import { AccountSwitcher } from '@/components/accounts/AccountSwitcher'
import { DrawdownGauge } from '@/components/dashboard/DrawdownGauge'
import { Heatmap } from '@/components/dashboard/Heatmap'
import { TradeTable } from '@/components/trades/TradeTable'
import { DashboardClient } from './DashboardClient'
import { DashboardChartSection } from './DashboardChartSection'
import { StatsSidebar } from '@/components/dashboard/StatsSidebar'
import { AccordionApp } from '@/components/ui/card-split-accordion'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { JournalEditor } from '@/components/journal/JournalEditor'
import { getJournalEntry } from '@/actions/journal'
import { fmtMoney } from '@/lib/calculations'
import { TrendingUp, Target, BarChart2, DollarSign, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ accountId?: string, date?: string }> }) {
  const params = await searchParams
  const { accounts } = await getAccounts()
  
  if (!accounts || accounts.length === 0) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-screen p-6">
        <AmbientBackground />
        <div className="text-center mb-10 relative z-10">
          <h2 className="font-display text-2xl font-semibold mb-2.5 text-white">Welcome to Ledgerline</h2>
          <p className="text-sm text-[var(--color-muted)] mb-5">Create an account to get started.</p>
        </div>
        <div className="w-full max-w-[600px] relative z-10">
          <h3 className="font-display text-xs font-semibold text-center mb-3 text-[var(--color-muted-dark)] tracking-widest uppercase">How It Works</h3>
          <AccordionApp />
        </div>
      </div>
    )
  }

  const selectedAccountId = params.accountId || accounts[0].id
  const account = accounts.find((a) => a.id === selectedAccountId) || accounts[0]
  
  const { trades } = await getTrades(account.id)
  
  const selectedDate = params.date || null
  const stats = calculateAccountStats(trades || [], account as any)
  const propStatus = calculatePropStatus(account as any, stats, trades || [], selectedDate || undefined)

  const tableTrades = selectedDate ? (trades || []).filter(t => t.trade_date === selectedDate) : (trades || [])

  const today = new Date().toISOString().split('T')[0]
  const { entry: todayEntry } = await getJournalEntry(today)
  const todayTrades = (trades || []).filter(t => t.trade_date === today)

  const chartData = stats.equityCurve.map((p, i) => ({ x: i, equity: p.equity }))

  // KPI cards data
  const kpiCards = [
    {
      label: 'Winrate',
      value: `${stats.winRate.toFixed(1)}%`,
      icon: <Award size={14} />,
      iconColor: 'text-[var(--color-accent)]',
      valueColor: 'text-white',
    },
    {
      label: 'Profit Factor',
      value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2),
      icon: <Target size={14} />,
      iconColor: 'text-[var(--color-amber)]',
      valueColor: 'text-white',
    },
    {
      label: 'Total Trades',
      value: String(stats.tradesCount),
      icon: <BarChart2 size={14} />,
      iconColor: 'text-[var(--color-cyan)]',
      valueColor: 'text-white',
    },
    {
      label: 'Expectancy',
      value: fmtMoney(stats.expectancy),
      icon: <DollarSign size={14} />,
      iconColor: 'text-[var(--color-profit)]',
      valueColor: stats.expectancy >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]',
    },
    {
      label: 'Net P&L',
      value: `${stats.netPnL >= 0 ? '+' : ''}${fmtMoney(stats.netPnL)}`,
      icon: stats.netPnL >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />,
      iconColor: stats.netPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]',
      valueColor: stats.netPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]',
    },
  ]

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />

      <div className="p-4 lg:p-6 xl:p-8 flex flex-col gap-5 relative z-10">

        {/* ── Account Switcher Bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl border border-[var(--color-border-soft)] gap-3 flex-wrap bg-[var(--color-surface-alt)]/70 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <AccountSwitcher accounts={accounts as any} />
          </div>
          <DashboardClient accountId={account.id} accountType={account.account_type as 'prop' | 'retail'} />
        </div>

        {(!trades || trades.length === 0) ? (
          <div className="flex flex-col items-center pt-8">
            <div className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-dashed border-[var(--color-border)] rounded-2xl p-14 text-center w-full max-w-[800px] mb-8">
              <div className="font-display text-lg text-white mb-2 font-semibold">No trades on this account yet</div>
              <div className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed">Log your first trade to see your stats, drawdown buffer, and P&L charts.</div>
            </div>
            
            <div className="w-full max-w-[600px]">
              <h3 className="font-display text-xs font-semibold text-center mb-3 text-[var(--color-muted-dark)] tracking-widest uppercase">Understanding Metrics</h3>
              <AccordionApp />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5">

            {/* ── LEFT: Stats Sidebar ── */}
            <StatsSidebar stats={stats} trades={trades as any} propStatus={propStatus} />

            {/* ── RIGHT: Main Content ── */}
            <div className="flex-1 flex flex-col gap-5 min-w-0">
              
              {/* Chart Section */}
              <DashboardChartSection
                chartData={chartData}
                equityCurve={stats.equityCurve}
                startBalance={Number(account.start_balance || 100000)}
              />

              {/* ── KPI Summary Row ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                {kpiCards.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="group bg-[var(--color-surface-alt)]/70 backdrop-blur-md border border-[var(--color-border-soft)] hover:border-[var(--color-border)] rounded-xl px-4 py-3.5 flex flex-col gap-1.5 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className={`flex items-center gap-1.5 text-[11px] text-[var(--color-muted)] font-medium font-body`}>
                      <span className={kpi.iconColor}>{kpi.icon}</span>
                      {kpi.label}
                    </div>
                    <span className={`font-mono text-base font-bold ${kpi.valueColor} tracking-tight`}>
                      {kpi.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── Today's Journal Widget ── */}
              <JournalEditor 
                date={today} 
                initialEntry={todayEntry} 
                trades={todayTrades as any} 
              />

              {/* ── Compliance & Heatmap Row ── */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {account.account_type === 'prop' && propStatus ? (
                  <DrawdownGauge 
                    pctUsed={propStatus.pctBufferUsed} 
                    dollarsRemaining={propStatus.bufferRemaining} 
                    breach={propStatus.breach} 
                    dailyPctUsed={propStatus.dailyPctUsed} 
                    dailyLossLimitDollars={propStatus.dailyLossLimitDollars} 
                    todaysPnL={propStatus.todaysPnL} 
                    profitProgressPct={propStatus.profitProgressPct} 
                  />
                ) : (
                  <div className="bg-[var(--color-surface-alt)]/70 backdrop-blur-md border border-[var(--color-border-soft)] rounded-xl p-6 flex flex-col items-center justify-center text-xs text-[var(--color-muted-dark)] text-center min-h-[200px] shadow-sm">
                    <div className="text-base mb-1">📊</div>
                    <span>No prop-firm rules apply to this retail account.</span>
                    <span className="text-[var(--color-muted-dark)]/60 mt-1">Switch accounts to view compliance tracking.</span>
                  </div>
                )}
                
                <Heatmap 
                  trades={trades as any} 
                  weeks={24} 
                  selectedDate={selectedDate || undefined} 
                />
              </div>

              {/* ── Recent Trades Table ── */}
              <TradeTable trades={tableTrades as any} limit={12} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
